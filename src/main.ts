import { Notice, Plugin, TFile, WorkspaceLeaf, normalizePath, requestUrl } from 'obsidian';
import { MarktlExportModal } from './export-modal';
import { MarktlProgressModal } from './progress-modal';
import { MarktlPreviewView, VIEW_TYPE_MARKTL_PREVIEW } from './preview-view';
import { MarktlResultModal } from './result-modal';
import { MarktlSettingTab } from './settings-tab';
import { MarktlSetupModal } from './setup-modal';
import type { ExportOptions, ExportSummary, MarktlSettings, PreviewState } from './types';

const { convertWithAiFallback } = require('./core/ai.js');
const { buildAssetFileName, extractMarkdownImageReferences, rewriteHtmlImageSources } = require('./core/assets.js');
const { buildContextPackMarkdown, extractMarkdownContextTargets } = require('./core/context-pack.js');
const { injectReaderFeedback, validateGiscusConfig } = require('./core/feedback.js');
const { buildPagesUrl, buildPublishPath, buildShareHomeUrl, buildShortPagesUrl, inferPagesBaseUrl, parseRepo, renderShareIndexHtml, updateShareIndex } = require('./core/github-pages.js');
const { validateHtmlArtifact } = require('./core/html-qa.js');
const { slugify } = require('./core/html.js');
const { buildShortId, injectSocialMeta } = require('./core/social.js');

const DEFAULT_SETTINGS: MarktlSettings = {
  exportFolder: 'html-exports',
  setupCompleted: false,
  artifactGoal: 'read',
  artifactType: 'faithful-note',
  template: 'minimal',
  aiProvider: 'none',
  conversionMode: 'preserve',
  failurePolicy: 'fallback',
  previewSecurity: 'sanitized',
  contextPackMode: 'none',
  readerFeedbackMode: 'none',
  shareTarget: 'local-link',
  githubRepo: '',
  githubBranch: 'main',
  githubToken: '',
  githubPagesBaseUrl: '',
  githubPublishPath: 'marktl',
  githubShareHomeTitle: 'MarkTL Shared HTML',
  giscusRepo: '',
  giscusRepoId: '',
  giscusCategory: 'Announcements',
  giscusCategoryId: '',
  giscusMapping: 'pathname',
  giscusTheme: 'preferred_color_scheme',
  timeoutMs: 900000,
  claudePath: '',
  codexPath: '',
  geminiPath: '',
  copyShareLinkAfterExport: false,
};

interface OutputPlan {
  folder: string;
  basename: string;
  outputPath: string;
  assetFolder: string;
  assetRelativePrefix: string;
}

interface ImageAssetMapping {
  original: string;
  sourcePath: string;
  destinationPath: string;
  relativeSrc: string;
  aliases: string[];
}

export default class MarktlPlugin extends Plugin {
  settings: MarktlSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_MARKTL_PREVIEW,
      (leaf: WorkspaceLeaf) => new MarktlPreviewView(leaf),
    );

    this.addRibbonIcon('file-code-2', 'Export current note to HTML', () => {
      this.openExportModal();
    });

    this.addCommand({
      id: 'export-active-note-to-html',
      name: 'Export active note to HTML...',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const canRun = file instanceof TFile && file.extension === 'md';
        if (canRun && !checking) {
          this.openExportModal();
        }
        return canRun;
      },
    });

    this.addCommand({
      id: 'quick-export-active-note-to-html',
      name: 'Quick export active note to HTML',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const canRun = file instanceof TFile && file.extension === 'md';
        if (canRun && !checking) {
          void this.exportActiveNote();
        }
        return canRun;
      },
    });

    this.addCommand({
      id: 'open-marktl-setup',
      name: 'Open MarkTL setup wizard',
      callback: () => {
        this.openSetupWizard();
      },
    });

    this.addCommand({
      id: 'check-claude-cli',
      name: 'Check Claude Code CLI setup',
      callback: () => {
        this.openSetupWizard();
      },
    });

    this.addSettingTab(new MarktlSettingTab(this.app, this));

    if (!this.settings.setupCompleted) {
      window.setTimeout(() => this.openSetupWizard(), 800);
    }
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    let shouldSave = false;
    if (['gemini'].includes(this.settings.aiProvider as string)) {
      this.settings.aiProvider = 'none';
      shouldSave = true;
    }
    if (!['read', 'decide', 'review', 'compare', 'tune', 'explain-code', 'publish'].includes(this.settings.artifactGoal as string)) {
      this.settings.artifactGoal = DEFAULT_SETTINGS.artifactGoal;
      shouldSave = true;
    }
    if (!Number.isFinite(this.settings.timeoutMs) || this.settings.timeoutMs <= 300000) {
      this.settings.timeoutMs = DEFAULT_SETTINGS.timeoutMs;
      shouldSave = true;
    }
    if (!['none', 'linked-notes'].includes(this.settings.contextPackMode as string)) {
      this.settings.contextPackMode = DEFAULT_SETTINGS.contextPackMode;
      shouldSave = true;
    }
    if (!['none', 'giscus'].includes(this.settings.readerFeedbackMode as string)) {
      this.settings.readerFeedbackMode = DEFAULT_SETTINGS.readerFeedbackMode;
      shouldSave = true;
    }
    if (shouldSave) {
      await this.saveSettings();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  openSetupWizard(): void {
    new MarktlSetupModal(this.app, this).open();
  }

  openExportModal(): void {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile) || file.extension !== 'md') {
      new Notice('Open a Markdown note before exporting HTML.');
      return;
    }

    new MarktlExportModal(this.app, this, (options) => {
      void this.exportActiveNote(options);
    }).open();
  }

  async exportActiveNote(overrides: Partial<ExportOptions> = {}): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile) || file.extension !== 'md') {
      new Notice('Open a Markdown note before exporting HTML.');
      return;
    }

    const options = this.resolveExportOptions(overrides);
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Goal: ${options.artifactGoal}`);
    progress.addStep(`Artifact: ${options.artifactType}`);
    progress.addStep(`Template: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === 'none' ? 'local fallback' : options.aiProvider}`);
    progress.addStep(`Mode: ${options.conversionMode}; preview: ${options.previewSecurity}`);
    progress.addStep(`Timeout: ${Math.round(this.settings.timeoutMs / 1000)}s`);

    try {
      progress.addStep('Reading active Markdown note...');
      const markdown = await this.app.vault.read(file);
      const outputPlan = await this.prepareOutputPlan(file, options);
      const assetResult = await this.resolveImageAssets(markdown, file, outputPlan);
      progress.addStep(assetResult.mappings.length > 0
        ? `Resolved ${assetResult.mappings.length} local image asset(s).`
        : 'No local image assets found.');
      const contextResult = await this.resolveContextPack(markdown, file, options);
      if (contextResult.count > 0) {
        progress.addStep(`Loaded ${contextResult.count} linked context note(s).`);
      } else if (options.contextPackMode !== 'none') {
        progress.addStep('No linked context notes found.');
      }
      progress.addStep(options.aiProvider === 'none' ? 'Running local converter...' : `Running ${options.aiProvider} CLI...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        artifactGoal: options.artifactGoal,
        artifactType: options.artifactType,
        mode: options.conversionMode,
        template: options.template,
        trusted: options.previewSecurity === 'trusted',
        strictAiFailures: options.failurePolicy === 'strict',
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        assetMappings: assetResult.mappings,
        contextPack: contextResult.markdown,
        cliPaths: {
          claude: this.settings.claudePath,
          codex: this.settings.codexPath,
        },
      });
      progress.addStep(result.usedFallback ? 'Generated local fallback HTML.' : 'Generated AI HTML.');
      const shareMetadata = this.extractShareMetadata(markdown, outputPlan.basename);
      const shortId = buildShortId(outputPlan.basename);
      const socialUrl = options.shareTarget === 'github-pages'
        ? buildShortPagesUrl(this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo), this.settings.githubPublishPath, shortId)
        : '';
      const socialImage = options.shareTarget === 'github-pages' && assetResult.mappings[0]
        ? `${socialUrl}assets/${assetResult.mappings[0].destinationPath.split('/').pop() || ''}`
        : '';
      const socialHtml = injectSocialMeta(result.html, {
        title: shareMetadata.title,
        description: shareMetadata.excerpt,
        url: socialUrl,
        image: socialImage,
      });
      const imageRewrittenHtml = rewriteHtmlImageSources(socialHtml, assetResult.mappings);
      const feedbackResult = this.applyReaderFeedback(imageRewrittenHtml, options);
      const html = feedbackResult.html;
      if (feedbackResult.injected) {
        progress.addStep('Added Giscus reader feedback.');
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: options.previewSecurity === 'trusted',
        assetMappings: assetResult.mappings,
      });
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep('HTML QA passed basic checks.');
      }
      const warnings = [...result.warnings, ...assetResult.warnings, ...contextResult.warnings, ...feedbackResult.warnings, ...qaWarnings];
      let publicUrl = '';
      let shareHomeUrl = '';

      progress.addStep('Writing HTML file to vault...');
      await this.copyImageAssets(assetResult.mappings);
      const outputPath = await this.writeHtmlFile(outputPlan, html, options, file.path);
      if (options.shareTarget === 'github-pages') {
        progress.addStep('Publishing GitHub Pages bundle...');
        const publishResult = await this.publishGithubPages(outputPlan, assetResult.mappings, file.path, markdown, options, shortId, shareMetadata);
        publicUrl = publishResult.publicUrl;
        shareHomeUrl = publishResult.shareHomeUrl;
        progress.addStep(`Published: ${publicUrl}`);
      }
      progress.addStep('Opening internal preview pane...');
      await this.openPreview({
        html,
        filePath: outputPath,
        warnings,
        trusted: options.previewSecurity === 'trusted',
      });

      if (options.copyShareLinkAfterExport) {
        progress.addStep(publicUrl ? 'Copying public share link...' : 'Copying local share link...');
        await this.copyShareLink(outputPath, publicUrl);
      }

      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        outputPath,
        usedFallback: result.usedFallback,
        aiProvider: options.aiProvider,
        assetCount: assetResult.mappings.length,
        warnings,
        shareTarget: options.shareTarget,
        copiedShareLink: options.copyShareLinkAfterExport,
        publicUrl,
        shareHomeUrl,
      });
      if (result.usedFallback && options.aiProvider !== 'none') {
        new Notice('AI conversion failed; local fallback HTML was generated.');
      } else {
        new Notice(`HTML exported to ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new Notice(`HTML export failed: ${message}`);
    }
  }

  private async prepareOutputPlan(source: TFile, options: ExportOptions): Promise<OutputPlan> {
    const folder = normalizePath(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!(await this.app.vault.adapter.exists(folder))) {
      await this.app.vault.createFolder(folder);
    }

    const basename = slugify(source.basename);
    const bundled = options.shareTarget === 'static-bundle' || options.shareTarget === 'github-pages';
    const outputPath = bundled
      ? normalizePath(`${folder}/share/${basename}/index.html`)
      : normalizePath(`${folder}/${basename}.html`);
    const assetFolder = bundled
      ? normalizePath(`${folder}/share/${basename}/assets`)
      : normalizePath(`${folder}/${basename}-assets`);
    const assetRelativePrefix = bundled
      ? 'assets'
      : `${basename}-assets`;

    return { folder, basename, outputPath, assetFolder, assetRelativePrefix };
  }

  private async writeHtmlFile(plan: OutputPlan, html: string, options: ExportOptions, sourcePath: string): Promise<string> {
    await this.ensureParentFolder(plan.outputPath);
    await this.app.vault.adapter.write(plan.outputPath, html);
    if (options.shareTarget === 'static-bundle' || options.shareTarget === 'github-pages') {
      await this.writeShareReadme(plan.folder, plan.basename, sourcePath, options);
    }
    return plan.outputPath;
  }

  private async resolveImageAssets(markdown: string, source: TFile, plan: OutputPlan): Promise<{ mappings: ImageAssetMapping[]; warnings: string[] }> {
    const references = extractMarkdownImageReferences(markdown);
    const warnings: string[] = [];
    const mappings: ImageAssetMapping[] = [];
    const usedNames = new Set<string>();

    for (const reference of references) {
      const target = String(reference.target || '');
      const imageFile = this.resolveImageFile(target, source);
      if (!imageFile) {
        warnings.push(`Image asset not found: ${target}`);
        continue;
      }

      const assetFileName = buildAssetFileName(imageFile.path, mappings.length + 1, usedNames);
      const destinationPath = normalizePath(`${plan.assetFolder}/${assetFileName}`);
      const relativeSrc = encodeURI(`${plan.assetRelativePrefix}/${assetFileName}`);

      mappings.push({
        original: target,
        sourcePath: imageFile.path,
        destinationPath,
        relativeSrc,
        aliases: [
          target,
          String(reference.raw || ''),
          imageFile.path,
          imageFile.name,
          normalizePath(target),
        ],
      });
    }

    return { mappings, warnings };
  }

  private resolveImageFile(target: string, source: TFile): TFile | null {
    const linked = this.app.metadataCache.getFirstLinkpathDest(target, source.path);
    if (linked instanceof TFile) {
      return linked;
    }

    const normalized = normalizePath(target);
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof TFile) {
      return direct;
    }

    if (source.parent?.path) {
      const relative = this.app.vault.getAbstractFileByPath(normalizePath(`${source.parent.path}/${target}`));
      if (relative instanceof TFile) {
        return relative;
      }
    }

    const byName = this.app.vault.getFiles().find((file) => file.name === target || file.path.endsWith(`/${target}`));
    return byName instanceof TFile ? byName : null;
  }

  private async copyImageAssets(mappings: ImageAssetMapping[]): Promise<void> {
    const copied = new Set<string>();
    for (const mapping of mappings) {
      if (copied.has(mapping.destinationPath)) {
        continue;
      }
      copied.add(mapping.destinationPath);
      await this.ensureParentFolder(mapping.destinationPath);
      const data = await this.app.vault.adapter.readBinary(mapping.sourcePath);
      await this.app.vault.adapter.writeBinary(mapping.destinationPath, data);
    }
  }

  private resolveExportOptions(overrides: Partial<ExportOptions>): ExportOptions {
    return {
      template: overrides.template || this.settings.template,
      artifactGoal: overrides.artifactGoal || this.settings.artifactGoal,
      artifactType: overrides.artifactType || this.settings.artifactType,
      aiProvider: overrides.aiProvider || this.settings.aiProvider,
      conversionMode: overrides.conversionMode || this.settings.conversionMode,
      failurePolicy: overrides.failurePolicy || this.settings.failurePolicy,
      previewSecurity: overrides.previewSecurity || this.settings.previewSecurity,
      contextPackMode: overrides.contextPackMode || this.settings.contextPackMode,
      readerFeedbackMode: overrides.readerFeedbackMode || this.settings.readerFeedbackMode,
      shareTarget: overrides.shareTarget || this.settings.shareTarget,
      copyShareLinkAfterExport: overrides.copyShareLinkAfterExport ?? this.settings.copyShareLinkAfterExport,
    };
  }

  private applyReaderFeedback(html: string, options: ExportOptions): { html: string; warnings: string[]; injected: boolean } {
    if (options.readerFeedbackMode !== 'giscus') {
      return { html, warnings: [], injected: false };
    }

    if (options.previewSecurity !== 'trusted') {
      return {
        html,
        warnings: ['Giscus feedback requires Trusted preview/export because it loads an external comments script.'],
        injected: false,
      };
    }

    const giscusConfig = {
      repo: this.settings.giscusRepo,
      repoId: this.settings.giscusRepoId,
      category: this.settings.giscusCategory,
      categoryId: this.settings.giscusCategoryId,
      mapping: this.settings.giscusMapping,
      theme: this.settings.giscusTheme,
      lang: 'ko',
    };
    const warnings = validateGiscusConfig(giscusConfig);
    if (warnings.length > 0) {
      return { html, warnings, injected: false };
    }

    return {
      html: injectReaderFeedback(html, giscusConfig),
      warnings: [],
      injected: true,
    };
  }

  private async resolveContextPack(markdown: string, source: TFile, options: ExportOptions): Promise<{ markdown: string; count: number; warnings: string[] }> {
    if (options.contextPackMode !== 'linked-notes') {
      return { markdown: '', count: 0, warnings: [] };
    }

    const warnings: string[] = [];
    const items = [];
    for (const target of extractMarkdownContextTargets(markdown)) {
      const linked = this.resolveMarkdownContextFile(target, source);
      if (!linked) {
        warnings.push(`Context note not found: ${target}`);
        continue;
      }
      if (linked.path === source.path) {
        continue;
      }
      try {
        items.push({
          target,
          path: linked.path,
          content: await this.app.vault.read(linked),
        });
      } catch (error) {
        warnings.push(`Context note unreadable: ${target}`);
      }
    }

    return {
      markdown: buildContextPackMarkdown(items),
      count: items.length,
      warnings,
    };
  }

  private resolveMarkdownContextFile(target: string, source: TFile): TFile | null {
    const linked = this.app.metadataCache.getFirstLinkpathDest(target, source.path);
    if (linked instanceof TFile && linked.extension === 'md') {
      return linked;
    }

    const normalized = normalizePath(target.endsWith('.md') ? target : `${target}.md`);
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof TFile && direct.extension === 'md') {
      return direct;
    }

    if (source.parent?.path) {
      const relative = this.app.vault.getAbstractFileByPath(normalizePath(`${source.parent.path}/${normalized}`));
      if (relative instanceof TFile && relative.extension === 'md') {
        return relative;
      }
    }

    const byName = this.app.vault.getFiles().find((file) => file.extension === 'md' && (file.basename === target || file.name === target || file.path.endsWith(`/${normalized}`)));
    return byName instanceof TFile ? byName : null;
  }

  private async ensureParentFolder(filePath: string): Promise<void> {
    const parts = filePath.split('/');
    parts.pop();
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  private async writeShareReadme(folder: string, basename: string, sourcePath: string, options: ExportOptions): Promise<void> {
    const readmePath = normalizePath(`${folder}/share/${basename}/README.md`);
    const content = [
      `# ${basename}`,
      '',
      'This folder is a static MarkTL HTML export bundle.',
      '',
      `- Source note: ${sourcePath}`,
      `- Artifact goal: ${options.artifactGoal}`,
      `- Artifact type: ${options.artifactType}`,
      `- Template: ${options.template}`,
      `- Preview security: ${options.previewSecurity}`,
      '',
      'Publish this folder with GitHub Pages, S3/R2, Netlify, Vercel, or any static host.',
      'Do not publish it if the source note contains private vault content.',
      '',
    ].join('\n');
    await this.app.vault.adapter.write(readmePath, content);
  }

  private async publishGithubPages(plan: OutputPlan, mappings: ImageAssetMapping[], sourcePath: string, markdown: string, options: ExportOptions, shortId = buildShortId(plan.basename), metadata = this.extractShareMetadata(markdown, plan.basename)): Promise<{ publicUrl: string; shareHomeUrl: string }> {
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error('GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.');
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error('GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.');
    }

    const branch = this.settings.githubBranch.trim() || 'main';
    const basePath = this.settings.githubPublishPath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
    const canonicalUrl = buildPagesUrl(pagesBaseUrl, basePath, plan.basename);
    const publicUrl = buildShortPagesUrl(pagesBaseUrl, basePath, shortId);
    const shareHomeUrl = buildShareHomeUrl(pagesBaseUrl, basePath);
    const canonicalFiles = [
      { localPath: plan.outputPath, publishPath: buildPublishPath(basePath, plan.basename, 'index.html') },
      { localPath: normalizePath(`${plan.folder}/share/${plan.basename}/README.md`), publishPath: buildPublishPath(basePath, plan.basename, 'README.md') },
      ...mappings.map((mapping) => ({
        localPath: mapping.destinationPath,
        publishPath: buildPublishPath(basePath, plan.basename, `assets/${mapping.destinationPath.split('/').pop() || 'asset'}`),
      })),
    ];
    const shortFiles = canonicalFiles.map((file) => ({
      localPath: file.localPath,
      publishPath: file.publishPath.replace(buildPublishPath(basePath, plan.basename, ''), buildPublishPath(basePath, `s/${shortId}`, '')),
    }));
    const files = [...canonicalFiles, ...shortFiles];

    for (const file of files) {
      const binary = await this.app.vault.adapter.readBinary(file.localPath);
      await this.putGithubFile(repo.owner, repo.repo, branch, file.publishPath, binary);
    }

    await this.publishShareIndex(repo.owner, repo.repo, branch, basePath, {
      slug: plan.basename,
      shortId,
      url: publicUrl,
      canonicalUrl,
      sourcePath,
      artifactType: options.artifactType,
      ...metadata,
    }, pagesBaseUrl);

    return { publicUrl, shareHomeUrl };
  }

  private extractShareMetadata(markdown: string, fallbackTitle: string): { title: string; excerpt: string; tags: string[] } {
    const value = String(markdown || '');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(value)?.[1] || '';
    const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter)?.[1]
      || /^#\s+(.+)$/m.exec(value)?.[1]
      || fallbackTitle;
    const tagLine = /^tags:\s*(.+)$/m.exec(frontmatter)?.[1] || '';
    const yamlListTags = [...frontmatter.matchAll(/^\s*-\s*["']?([^"'\n]+)["']?\s*$/gm)].map((match) => match[1]);
    const inlineTags = tagLine
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
    const body = value
      .replace(/^---\n[\s\S]*?\n---\s*/, '')
      .replace(/^#\s+.+$/m, '')
      .replace(/!\[\[[^\]]+]]/g, '')
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
      .replace(/[#*_`>~-]/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ');

    return {
      title: title.trim(),
      excerpt: body.slice(0, 180),
      tags: [...new Set([...inlineTags, ...yamlListTags].map((tag) => tag.replace(/^#/, '').trim()).filter(Boolean))].slice(0, 8),
    };
  }

  private async publishShareIndex(owner: string, repo: string, branch: string, basePath: string, entry: { slug: string; title: string; url: string; sourcePath: string; shortId?: string; canonicalUrl?: string; artifactType?: string; excerpt?: string; tags?: string[] }, pagesBaseUrl: string): Promise<void> {
    const indexPath = buildPublishPath(basePath, '', 'index.json');
    const existing = await this.getGithubJson(owner, repo, branch, indexPath);
    const index = updateShareIndex(existing, entry);
    const html = renderShareIndexHtml(index, {
      title: this.settings.githubShareHomeTitle || 'MarkTL Shared HTML',
      baseUrl: buildShareHomeUrl(pagesBaseUrl, basePath).replace(/\/+$/g, ''),
    });
    await this.putGithubTextFile(owner, repo, branch, indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(owner, repo, branch, buildPublishPath(basePath, '', 'index.html'), html);
  }

  private async getGithubJson(owner: string, repo: string, branch: string, publishPath: string): Promise<unknown> {
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, publishPath);
    const response = await requestUrl({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: 'GET',
      headers: this.githubHeaders(token),
      throw: false,
    });
    if (response.status < 200 || response.status >= 300) {
      return null;
    }
    try {
      return JSON.parse(this.base64ToText(response.json?.content || ''));
    } catch {
      return null;
    }
  }

  private async putGithubTextFile(owner: string, repo: string, branch: string, publishPath: string, text: string): Promise<void> {
    const encoded = new TextEncoder().encode(text);
    await this.putGithubFile(owner, repo, branch, publishPath, encoded.buffer);
  }

  private async putGithubFile(owner: string, repo: string, branch: string, publishPath: string, data: ArrayBuffer): Promise<void> {
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, publishPath);
    const existing = await requestUrl({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: 'GET',
      headers: this.githubHeaders(token),
      throw: false,
    });
    const existingJson = existing.status >= 200 && existing.status < 300 ? existing.json : null;
    const response = await requestUrl({
      url,
      method: 'PUT',
      headers: {
        ...this.githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Publish MarkTL export ${publishPath}`,
        content: this.arrayBufferToBase64(data),
        branch,
        sha: existingJson?.sha,
      }),
      throw: false,
    });
    if (response.status < 200 || response.status >= 300) {
      const message = response.json?.message || response.text || `GitHub upload failed with HTTP ${response.status}`;
      throw new Error(`GitHub upload failed for ${publishPath}: ${message}`);
    }
  }

  private githubContentsUrl(owner: string, repo: string, publishPath: string): string {
    return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${publishPath.split('/').filter(Boolean).map(encodeURIComponent).join('/')}`;
  }

  private githubHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private arrayBufferToBase64(data: ArrayBuffer): string {
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary);
  }

  private base64ToText(value: string): string {
    return atob(String(value || '').replace(/\s/g, ''));
  }

  private openResultSummary(summary: ExportSummary): void {
    new MarktlResultModal(this.app, summary, (outputPath, preferredLink) => this.copyShareLink(outputPath, preferredLink)).open();
  }

  async copyShareLink(outputPath: string, preferredLink = ''): Promise<string> {
    if (preferredLink) {
      await navigator.clipboard.writeText(preferredLink);
      new Notice('HTML share link copied.');
      return preferredLink;
    }
    const adapter = this.app.vault.adapter as typeof this.app.vault.adapter & {
      getFullPath?: (path: string) => string;
    };
    const fullPath = adapter.getFullPath ? adapter.getFullPath(outputPath) : outputPath;
    const link = fullPath.startsWith('/')
      ? `file://${encodeURI(fullPath)}`
      : outputPath;

    await navigator.clipboard.writeText(link);
    new Notice('HTML share link copied.');
    return link;
  }

  private async openPreview(state: PreviewState): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW)[0];
    if (!leaf) {
      leaf = this.app.workspace.getLeaf('split', 'vertical');
      await leaf.setViewState({ type: VIEW_TYPE_MARKTL_PREVIEW, active: true });
    }

    const view = leaf.view;
    if (view instanceof MarktlPreviewView) {
      view.setPreview(state);
    }
    this.app.workspace.revealLeaf(leaf);
  }
}
