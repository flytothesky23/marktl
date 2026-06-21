import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { App, MarkdownRenderer, Modal, Notice, Plugin, TFile, WorkspaceLeaf, normalizePath, requestUrl } from 'obsidian';
import { MarktlExportModal } from './export-modal';
import { MarktlPublishedHtmlModal } from './published-html-modal';
import { MarktlProgressModal } from './progress-modal';
import { MarktlPreviewView, VIEW_TYPE_MARKTL_PREVIEW } from './preview-view';
import { MarktlResultModal } from './result-modal';
import { MarktlSettingTab } from './settings-tab';
import { MarktlSetupModal } from './setup-modal';
import type { ExportOptions, ExportSummary, MarktlSettings, PreviewState, ShareHomeProfile } from './types';

const { convertWithAiFallback, getProviderPrivacyNote } = require('./core/ai.js');
const { buildAssetFileName, extractMarkdownImageReferences, rewriteHtmlImageSources } = require('./core/assets.js');
const { buildContextPackMarkdown, extractMarkdownContextTargets } = require('./core/context-pack.js');
const { basenameFromHtmlFileName, externalThumbnailAssetName, externalThumbnailExtension, extractExternalHtmlMetadata, findExternalHtmlAssetWarnings, isSupportedExternalThumbnailFileName } = require('./core/external-html.js');
const { normalizeExportSelection } = require('./core/export-profiles.js');
const { injectReaderFeedback, shouldAttachReaderFeedback, validateGiscusConfig } = require('./core/feedback.js');
const { buildPagesUrl, buildPublishPath, buildShareHomeUrl, buildShortPagesUrl, inferPagesBaseUrl, normalizePublishPath, parseRepo, repairShareIndex, removeShareIndexItems, renderShareIndexHtml, shareDeleteKeys: buildShareDeleteKeys, updateShareIndex } = require('./core/github-pages.js');
const { repairObsidianSyntaxResidue } = require('./core/html-repair.js');
const { validateHtmlArtifact } = require('./core/html-qa.js');
const { injectShareHomeLink } = require('./core/share-navigation.js');
const { slugify } = require('./core/html.js');
const { migrateSettings } = require('./core/settings.js');
const { DEFAULT_SHARE_HOME_PROFILE_ID, buildDefaultShareHomeProfile, normalizeShareHomeProfiles, resolveShareHomeProfile } = require('./core/share-home-profiles.js');
const { buildShortId, injectSocialMeta } = require('./core/social.js');
const { applyPresetToOptions } = require('./core/presets.js');

const DEFAULT_SETTINGS: MarktlSettings = {
  exportFolder: 'html-exports',
  setupCompleted: false,
  activeShareHomeProfileId: DEFAULT_SHARE_HOME_PROFILE_ID,
  shareHomeProfiles: [buildDefaultShareHomeProfile({
    githubPublishPath: 'marktl',
    githubShareHomeTitle: '유네코 지수 통합선별공장 프로젝트',
  })],
  artifactGoal: 'read',
  artifactType: 'faithful-note',
  template: 'minimal',
  exportGenre: 'integrated-note',
  exportDepth: 'standard',
  exportPurpose: 'internal-share',
  referenceContextNotePath: '',
  aiProvider: 'none',
  conversionMode: 'preserve',
  failurePolicy: 'strict',
  previewSecurity: 'sanitized',
  contextPackMode: 'none',
  readerFeedbackMode: 'none',
  shareTarget: 'local-link',
  githubRepo: '',
  githubBranch: 'main',
  githubToken: '',
  githubPagesBaseUrl: '',
  githubPublishPath: 'marktl',
  githubShareHomeTitle: '유네코 지수 통합선별공장 프로젝트',
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

interface GithubPagesContext {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  pagesBaseUrl: string;
  indexPath: string;
  indexHtmlPath: string;
  shareHomeProfile: ShareHomeProfile;
}

interface PublishedShareItem {
  slug?: string;
  shortId?: string;
  title?: string;
  url?: string;
  canonicalUrl?: string;
  sourcePath?: string;
  sourcePathKey?: string;
  artifactType?: string;
  excerpt?: string;
  tags?: string[];
  thumbnailUrl?: string;
  updatedAt?: string;
  schemaVersion?: number;
  publishedByHost?: string;
}

interface PublishedShareIndex {
  version?: number;
  updatedAt?: string;
  items: PublishedShareItem[];
}

class MarktlExternalHtmlThumbnailModal extends Modal {
  private htmlFileName: string;
  private onChooseThumbnail: () => void;
  private onContinueWithoutThumbnail: () => void;

  constructor(app: App, htmlFileName: string, onChooseThumbnail: () => void, onContinueWithoutThumbnail: () => void) {
    super(app);
    this.htmlFileName = htmlFileName;
    this.onChooseThumbnail = onChooseThumbnail;
    this.onContinueWithoutThumbnail = onContinueWithoutThumbnail;
    this.modalEl.addClass('marktl-thumbnail-modal');
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('썸네일 이미지 선택');
    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: '선택한 HTML을 게시하기 전에 공유 허브 카드에 사용할 대표 이미지를 선택하세요. 썸네일 없이도 게시할 수 있습니다.',
    });

    const selected = contentEl.createDiv({ cls: 'marktl-reference-row' });
    selected.createEl('span', { text: `선택한 HTML: ${this.htmlFileName}` });

    const actions = contentEl.createDiv({ cls: 'marktl-result-actions' });
    const choose = actions.createEl('button', { text: '썸네일 이미지 선택', type: 'button' });
    choose.addClass('mod-cta');
    choose.addEventListener('click', () => {
      this.onChooseThumbnail();
      this.close();
    });

    actions.createEl('button', { text: '썸네일 없이 게시', type: 'button' })
      .addEventListener('click', () => {
        this.close();
        this.onContinueWithoutThumbnail();
      });

    actions.createEl('button', { text: '취소', type: 'button' })
      .addEventListener('click', () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

function resolveHomePath(command: string): string {
  const value = String(command || '').trim();
  if (!value) {
    return '';
  }
  if (value === '~') {
    return String(process.env.HOME || value);
  }
  if (value.startsWith('~/')) {
    const home = String(process.env.HOME || '');
    return home ? `${home}${value.slice(1)}` : value;
  }
  return value;
}

function isExecutableFile(filePath: string): boolean {
  const resolvedPath = resolveHomePath(filePath);
  try {
    const stat = statSync(resolvedPath);
    return stat.isFile() && Boolean(stat.mode & 0o111);
  } catch {
    return false;
  }
}

function isStaleCliPath(command: string): boolean {
  const value = resolveHomePath(command);
  if (!value) {
    return false;
  }
  if (value.startsWith('/Volumes/')) {
    return true;
  }
  const home = String(process.env.HOME || '');
  const match = value.match(/^\/Users\/[^/]+\//);
  return Boolean(match && home && !value.startsWith(`${home}/`));
}

function isManagedMarktlCodexPath(command: string): boolean {
  return /\/\.local\/bin\/marktl-codex$/.test(resolveHomePath(command));
}

function detectCodexCliPath(preferred = ''): string {
  const candidates = [
    preferred,
    '~/.local/bin/marktl-codex',
  ].map((value) => String(value || '').trim()).filter(Boolean);
  for (const candidate of candidates) {
    if (isManagedMarktlCodexPath(candidate) && !isStaleCliPath(candidate) && isExecutableFile(candidate)) {
      return candidate;
    }
  }
  return '';
}

function cleanPreflightOutput(value: string): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function runCliPreflight(command: string, args: string[], timeoutMs = 15000): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(resolveHomePath(command), args, {
      env: {
        ...process.env,
        PATH: [
          process.env.PATH || '',
          '/opt/homebrew/bin',
          '/usr/local/bin',
        ].filter(Boolean).join(':'),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill('SIGTERM');
      resolve({ code: -1, output: `Timed out after ${timeoutMs}ms.` });
    }, timeoutMs);
    child.stdout.on('data', (chunk) => {
      output += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += String(chunk);
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve({ code: -1, output: error.message });
    });
    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve({ code: code ?? -1, output });
    });
  });
}

export default class MarktlPlugin extends Plugin {
  settings: MarktlSettings = DEFAULT_SETTINGS;
  private publishedShareMutationQueue: Promise<unknown> = Promise.resolve();

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
      id: 'manage-published-html',
      name: 'Manage published MarkTL HTML',
      callback: () => {
        this.openPublishedHtmlManager();
      },
    });

    this.addCommand({
      id: 'repair-all-share-hub-indexes',
      name: 'Repair all MarkTL share hub indexes',
      callback: async () => {
        try {
          const result = await this.repairAllPublishedShareIndexes();
          new Notice(`MarkTL 공유 허브 ${result.repairedCount}개를 복구했습니다.`);
        } catch (error) {
          new Notice(error instanceof Error ? error.message : String(error));
        }
      },
    });

    this.addCommand({
      id: 'upload-existing-html-to-share-hub',
      name: 'Upload existing HTML to MarkTL share hub...',
      callback: () => {
        this.openExportModal();
      },
    });

    this.addCommand({
      id: 'open-marktl-setup',
      name: 'Open Flytothesky MarkTL setup wizard',
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
    const migratedSettings = migrateSettings(DEFAULT_SETTINGS, await this.loadData());
    this.settings = migratedSettings.settings;
    let shouldSave = migratedSettings.migrated;
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
    const normalizedSelection = normalizeExportSelection(this.settings);
    if (this.settings.exportGenre !== normalizedSelection.exportGenre) {
      this.settings.exportGenre = normalizedSelection.exportGenre;
      shouldSave = true;
    }
    if (this.settings.exportDepth !== normalizedSelection.exportDepth) {
      this.settings.exportDepth = normalizedSelection.exportDepth;
      shouldSave = true;
    }
    if (this.settings.exportPurpose !== normalizedSelection.exportPurpose) {
      this.settings.exportPurpose = normalizedSelection.exportPurpose;
      shouldSave = true;
    }
    if (typeof this.settings.referenceContextNotePath !== 'string') {
      this.settings.referenceContextNotePath = '';
      shouldSave = true;
    }
    if (!['none', 'linked-notes', 'reference-note'].includes(this.settings.contextPackMode as string)) {
      this.settings.contextPackMode = DEFAULT_SETTINGS.contextPackMode;
      shouldSave = true;
    }
    if (!['none', 'giscus'].includes(this.settings.readerFeedbackMode as string)) {
      this.settings.readerFeedbackMode = DEFAULT_SETTINGS.readerFeedbackMode;
      shouldSave = true;
    }
    if (!['fallback', 'strict'].includes(this.settings.failurePolicy as string)) {
      this.settings.failurePolicy = DEFAULT_SETTINGS.failurePolicy;
      shouldSave = true;
    }
    if (this.settings.shareTarget === 'github-pages' && this.settings.failurePolicy !== 'strict') {
      this.settings.failurePolicy = 'strict';
      shouldSave = true;
    }
    if (!String(this.settings.githubShareHomeTitle || '').trim() || this.settings.githubShareHomeTitle === 'MarkTL Shared HTML') {
      this.settings.githubShareHomeTitle = DEFAULT_SETTINGS.githubShareHomeTitle;
      shouldSave = true;
    }
    const shareHomeProfiles = normalizeShareHomeProfiles(this.settings.shareHomeProfiles, this.settings) as ShareHomeProfile[];
    if (JSON.stringify(this.settings.shareHomeProfiles) !== JSON.stringify(shareHomeProfiles)) {
      this.settings.shareHomeProfiles = shareHomeProfiles;
      shouldSave = true;
    }
    if (!shareHomeProfiles.some((profile) => profile.id === this.settings.activeShareHomeProfileId)) {
      this.settings.activeShareHomeProfileId = shareHomeProfiles[0]?.id || DEFAULT_SHARE_HOME_PROFILE_ID;
      shouldSave = true;
    }
    if (this.settings.aiProvider === 'codex') {
      const detectedCodex = detectCodexCliPath(this.settings.codexPath);
      const currentCodex = String(this.settings.codexPath || '').trim();
      if (
        detectedCodex
        && (
          !currentCodex
          || currentCodex === 'codex'
          || isStaleCliPath(currentCodex)
          || (currentCodex.startsWith('/') && !isManagedMarktlCodexPath(currentCodex))
          || (isManagedMarktlCodexPath(currentCodex) && !isExecutableFile(currentCodex))
        )
      ) {
        this.settings.codexPath = detectedCodex;
        shouldSave = true;
      }
    }
    if (shouldSave) {
      await this.saveSettings();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async refreshSettingsFromDisk(): Promise<void> {
    const previousSettings = this.settings;
    await this.loadSettings();
    if (!String(this.settings.githubToken || '').trim() && String(previousSettings?.githubToken || '').trim()) {
      this.settings.githubToken = previousSettings.githubToken;
    }
  }

  openSetupWizard(): void {
    new MarktlSetupModal(this.app, this).open();
  }

  openExportModal(): void {
    new MarktlExportModal(this.app, this, (options) => {
      void this.exportActiveNote(options);
    }, (options, includeThumbnail) => {
      this.chooseAndPublishExternalHtml(options, Boolean(includeThumbnail));
    }).open();
  }

  openPublishedHtmlManager(shareHomeProfileId = ''): void {
    new MarktlPublishedHtmlModal(this.app, this, shareHomeProfileId).open();
  }

  repairHtmlHead(html: string): string {
    let value = String(html || '').trim();
    if (!value) {
      return '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>MarkTL Export</title>\n</head>\n<body></body>\n</html>';
    }
    if (!/<html\b/i.test(value)) {
      value = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
${value}
</body>
</html>`;
    }
    if (!/<!doctype\s+html/i.test(value)) {
      value = `<!doctype html>\n${value}`;
    }
    value = value.replace(/<html\b([^>]*)>/i, (_match, attrs) => {
      const cleanAttrs = String(attrs || '').replace(/\s+lang=(["']).*?\1/i, '').trim();
      return `<html${cleanAttrs ? ` ${cleanAttrs}` : ''} lang="ko">`;
    });
    if (!/<head\b/i.test(value)) {
      value = value.replace(/<html\b[^>]*>/i, (match) => `${match}\n<head></head>`);
    }
    if (!/<meta\s+charset=/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}\n<meta charset="utf-8">`);
    }
    if (!/<meta\s+name=(["'])viewport\1/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}\n<meta name="viewport" content="width=device-width, initial-scale=1">`);
    }
    return value;
  }

  async renderMermaidBlocksToStaticHtml(html: string, sourcePath: string): Promise<{ html: string; rendered: number; warnings: string[] }> {
    let value = String(html || '');
    value = value.replace(/```mermaid\s*\n([\s\S]*?)```/gi, (_match, code) => `<pre class="marktl-mermaid-source"><code class="language-mermaid" data-marktl-mermaid="true">${this.escapeHtmlValue(code)}</code></pre>`);
    value = this.normalizeMermaidSourceBlocks(value);
    const pattern = /<pre\b([^>]*)>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
    let output = '';
    let lastIndex = 0;
    let rendered = 0;
    const warnings: string[] = [];
    for (const match of value.matchAll(pattern)) {
      const full = match[0];
      const attrs = `${match[1] || ''} ${match[2] || ''}`;
      if (!/language-mermaid|data-marktl-mermaid/i.test(attrs)) {
        continue;
      }
      output += value.slice(lastIndex, match.index);
      lastIndex = (match.index || 0) + full.length;
      const source = this.decodeHtmlEntities(match[3]).trim();
      if (!source) {
        output += full;
        continue;
      }
      try {
        output += await this.renderMermaidSvgFromMarkdown(source, sourcePath || '');
        rendered += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`참고: Mermaid 다이어그램 렌더링 실패, 원문 코드로 대체했습니다. ${message}`);
        output += `<details class="marktl-mermaid-source"><summary>다이어그램 원문</summary><pre><code class="language-mermaid">${this.escapeHtmlValue(source)}</code></pre></details>`;
      }
    }
    if (lastIndex === 0) {
      return { html: value, rendered: 0, warnings };
    }
    output += value.slice(lastIndex);
    return { html: output, rendered, warnings };
  }

  normalizeMermaidSourceBlocks(html: string): string {
    let value = String(html || '');
    const toMermaidPre = (code: string): string | null => {
      const normalized = this.decodeHtmlEntities(String(code || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '')).trim();
      if (!/^(gantt|graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gitGraph|pie|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|sankey-beta|xychart-beta|block-beta|packet-beta)\b/i.test(normalized)) {
        return null;
      }
      return `<pre class="marktl-mermaid-source"><code class="language-mermaid" data-marktl-mermaid="true">${this.escapeHtmlValue(normalized)}</code></pre>`;
    };
    value = value.replace(/<details\b[^>]*>\s*<summary\b[^>]*>[\s\S]*?mermaid[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi, (match, body) => {
      const pre = String(body || '').match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/i);
      if (!pre) {
        return match;
      }
      return toMermaidPre(pre[1]) || match;
    });
    value = value.replace(/<pre\b(?![^>]*marktl-mermaid-source)([^>]*)>([\s\S]*?)<\/pre>/gi, (match, _attrs, code) => {
      if (/<code\b/i.test(code)) {
        return match;
      }
      return toMermaidPre(code) || match;
    });
    return value;
  }

  async renderMermaidSvgFromMarkdown(source: string, sourcePath: string): Promise<string> {
    const renderer = MarkdownRenderer as unknown as {
      render?: (app: unknown, markdown: string, el: HTMLElement, sourcePath: string, component: MarktlPlugin) => Promise<void>;
      renderMarkdown?: (markdown: string, el: HTMLElement, sourcePath: string, component: MarktlPlugin) => Promise<void>;
    };
    if (!renderer) {
      throw new Error('Obsidian MarkdownRenderer를 찾을 수 없습니다.');
    }
    const container = document.createElement('div');
    container.classList.add('marktl-mermaid-render-host');
    container.setAttribute('style', 'position:fixed;left:-10000px;top:0;width:1200px;max-width:1200px;opacity:0;pointer-events:none;');
    document.body.appendChild(container);
    try {
      const markdown = `\`\`\`mermaid\n${source}\n\`\`\``;
      if (typeof renderer.render === 'function') {
        await renderer.render(this.app, markdown, container, sourcePath, this);
      } else if (typeof renderer.renderMarkdown === 'function') {
        await renderer.renderMarkdown(markdown, container, sourcePath, this);
      } else {
        throw new Error('지원되는 MarkdownRenderer API가 없습니다.');
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const svg = container.querySelector('svg');
      if (!svg) {
        throw new Error('렌더링된 SVG를 찾지 못했습니다.');
      }
      this.sanitizeRenderedSvg(svg);
      svg.setAttribute('role', 'img');
      svg.setAttribute('style', 'display:block;max-width:100%;height:auto;margin:0 auto;');
      return `<figure class="marktl-mermaid-rendered">${svg.outerHTML}</figure>`;
    } finally {
      container.remove();
    }
  }

  sanitizeRenderedSvg(svg: SVGElement): void {
    svg.querySelectorAll('script,foreignObject').forEach((node) => node.remove());
    svg.querySelectorAll('*').forEach((node) => {
      for (const attr of Array.from(node.attributes || [])) {
        if (/^on/i.test(attr.name)) {
          node.removeAttribute(attr.name);
        }
        if (/^(href|xlink:href)$/i.test(attr.name) && /^javascript:/i.test(attr.value || '')) {
          node.removeAttribute(attr.name);
        }
      }
    });
  }

  decodeHtmlEntities(value: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value || '');
    return textarea.value;
  }

  escapeHtmlValue(value: string): string {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async ensureAiExportReady(options: ExportOptions, progress: MarktlProgressModal): Promise<void> {
    if (options.shareTarget === 'github-pages' && options.aiProvider === 'none') {
      throw new Error('GitHub Pages 게시에는 작동 중인 AI provider가 필요합니다. Codex CLI를 선택하거나 공유 대상을 로컬 파일 링크로 바꾸세요.');
    }
    if (options.shareTarget === 'github-pages' && options.failurePolicy !== 'strict') {
      options.failurePolicy = 'strict';
      this.settings.failurePolicy = 'strict';
      await this.saveSettings();
      progress.addStep('GitHub Pages 게시를 위해 AI 실패 정책을 strict로 고정했습니다.');
    }
    if (options.aiProvider !== 'codex') {
      return;
    }

    const currentPath = String(this.settings.codexPath || '').trim();
    if (isManagedMarktlCodexPath(currentPath) && !isExecutableFile(currentPath)) {
      throw new Error(`MarkTL Codex wrapper가 없습니다: ${currentPath}. 공유 설정을 /opt/homebrew/bin/codex로 바꾸지 말고 이 Mac에 wrapper를 생성하세요.`);
    }
    const detectedPath = detectCodexCliPath(currentPath);
    const shouldRepairPath = !currentPath
      || currentPath === 'codex'
      || isStaleCliPath(currentPath)
      || (currentPath.startsWith('/') && !isManagedMarktlCodexPath(currentPath));
    if (shouldRepairPath) {
      if (!detectedPath) {
        throw new Error(`Codex CLI 경로가 유효하지 않습니다: ${currentPath || '(empty)'}. 공유 설정에 /opt/homebrew/bin/codex를 저장하지 말고 이 Mac에 ~/.local/bin/marktl-codex wrapper를 생성하세요.`);
      }
      this.settings.codexPath = detectedPath;
      await this.saveSettings();
      progress.addStep(`Codex 경로 자동 복구: ${detectedPath}`);
    }
    const command = String(this.settings.codexPath || 'codex').trim();
    let version = await runCliPreflight(command, ['--version'], 15000);
    if (version.code !== 0) {
      const fallbackPath = isManagedMarktlCodexPath(command) ? '' : detectCodexCliPath();
      if (fallbackPath && fallbackPath !== command) {
        this.settings.codexPath = fallbackPath;
        await this.saveSettings();
        version = await runCliPreflight(fallbackPath, ['--version'], 15000);
        if (version.code === 0) {
          progress.addStep(`Codex 경로 자동 복구: ${fallbackPath}`);
          progress.addStep(`Codex 사전 점검 통과: ${cleanPreflightOutput(version.output) || fallbackPath}`);
          return;
        }
      }
      throw new Error(`Codex CLI 사전 점검 실패: ${command}: ${cleanPreflightOutput(version.output) || '실행할 수 없음'}`);
    }
    progress.addStep(`Codex 사전 점검 통과: ${cleanPreflightOutput(version.output) || command}`);
  }

  async exportActiveNote(overrides: Partial<ExportOptions> = {}): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile) || file.extension !== 'md') {
      new Notice('Open a Markdown note before exporting HTML.');
      return;
    }

    const options = this.resolveExportOptions(overrides);
    const shareHomeProfile = resolveShareHomeProfile(this.settings, options.shareHomeProfileId) as ShareHomeProfile;
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Share hub: ${shareHomeProfile.title} (${shareHomeProfile.basePath || '/'})`);
    progress.addStep(`Goal: ${options.artifactGoal}`);
    progress.addStep(`Artifact: ${options.artifactType}`);
    progress.addStep(`Template: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === 'none' ? 'local fallback' : options.aiProvider}`);
    const privacyNote = getProviderPrivacyNote(options.aiProvider);
    if (privacyNote) {
      progress.addStep(`Privacy note: ${privacyNote}`);
    }
    progress.addStep(`Mode: ${options.conversionMode}; preview: ${options.previewSecurity}`);
    progress.addStep(`Timeout: ${Math.round(this.settings.timeoutMs / 1000)}s`);

    try {
      await this.ensureAiExportReady(options, progress);
      progress.addStep('Reading active Markdown note...');
      const markdown = await this.app.vault.read(file);
      const outputPlan = await this.prepareOutputPlan(file, options);
      const assetResult = await this.resolveImageAssets(markdown, file, outputPlan);
      progress.addStep(assetResult.mappings.length > 0
        ? `Resolved ${assetResult.mappings.length} local image asset(s).`
        : 'No local image assets found.');
      const contextResult = await this.resolveContextPack(markdown, file, options);
      if (contextResult.count > 0) {
        progress.addStep(options.contextPackMode === 'reference-note'
          ? `Loaded reference context note: ${options.referenceContextNotePath}`
          : `Loaded ${contextResult.count} linked context note(s).`);
      } else if (options.contextPackMode !== 'none') {
        progress.addStep(options.contextPackMode === 'reference-note'
          ? 'No reference context note loaded.'
          : 'No linked context notes found.');
      }
      progress.addStep(options.aiProvider === 'none' ? 'Running local converter...' : `Running ${options.aiProvider} CLI...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        artifactGoal: options.artifactGoal,
        artifactType: options.artifactType,
        mode: options.conversionMode,
        template: options.template,
        exportGenre: options.exportGenre,
        exportDepth: options.exportDepth,
        exportPurpose: options.exportPurpose,
        referenceContextNotePath: options.referenceContextNotePath,
        trusted: options.previewSecurity === 'trusted',
        strictAiFailures: options.failurePolicy === 'strict' || options.shareTarget === 'github-pages',
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        assetMappings: assetResult.mappings,
        contextPack: contextResult.markdown,
        cliPaths: {
          claude: this.settings.claudePath,
          codex: this.settings.codexPath,
        },
      });
      if (options.shareTarget === 'github-pages' && result.usedFallback) {
        throw new Error('GitHub Pages publishing blocked because AI conversion used local fallback.');
      }
      progress.addStep(result.usedFallback ? 'Generated local fallback HTML.' : 'Generated AI HTML.');
      const shareMetadata = this.extractShareMetadata(markdown, outputPlan.basename);
      const shortId = buildShortId(outputPlan.basename);
      const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
      const socialUrl = options.shareTarget === 'github-pages'
        ? buildShortPagesUrl(pagesBaseUrl, shareHomeProfile.basePath, shortId)
        : '';
      const shareHomeReturnUrl = options.shareTarget === 'github-pages'
        ? buildShareHomeUrl(pagesBaseUrl, shareHomeProfile.basePath)
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
      let html = this.repairHtmlHead(feedbackResult.html);
      if (feedbackResult.injected) {
        progress.addStep('Added Giscus reader feedback.');
      }
      const mermaidResult = await this.renderMermaidBlocksToStaticHtml(html, file.path);
      html = this.repairHtmlHead(mermaidResult.html);
      if (mermaidResult.rendered > 0) {
        progress.addStep(`Rendered ${mermaidResult.rendered} Mermaid diagram(s) to static HTML/SVG.`);
      }
      if (shareHomeReturnUrl) {
        html = this.repairHtmlHead(injectShareHomeLink(html, {
          homeUrl: shareHomeReturnUrl,
          label: '공유 홈',
        }));
        progress.addStep('Added share hub home link.');
      }
      const repairedHtml = repairObsidianSyntaxResidue(html);
      if (repairedHtml !== html) {
        html = this.repairHtmlHead(repairedHtml);
        progress.addStep('Cleaned residual Obsidian-only syntax before HTML QA.');
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: options.previewSecurity === 'trusted',
        artifactGoal: options.artifactGoal,
        exportGenre: options.exportGenre,
        exportDepth: options.exportDepth,
        assetMappings: assetResult.mappings,
      });
      const fatalQaWarnings = qaWarnings.filter((warning: string) => /^HTML QA fatal:/i.test(warning));
      if (options.shareTarget === 'github-pages' && fatalQaWarnings.length > 0) {
        throw new Error(`GitHub Pages publishing blocked by HTML QA: ${fatalQaWarnings[0]}`);
      }
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep('HTML QA passed basic checks.');
      }
      const warnings = [...result.warnings, ...assetResult.warnings, ...contextResult.warnings, ...feedbackResult.warnings, ...mermaidResult.warnings, ...qaWarnings];
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
        sourcePath: file.path,
        title: shareMetadata.title,
        warnings,
        trusted: options.previewSecurity === 'trusted',
        previewSecurity: options.previewSecurity,
      });

      if (options.copyShareLinkAfterExport) {
        progress.addStep(publicUrl ? 'Copying public share link...' : 'Copying local share link...');
        await this.copyShareLink(outputPath, publicUrl);
      }

      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        options,
        sourcePath: file.path,
        sourceTitle: shareMetadata.title,
        presetId: options.presetId,
        previewSecurity: options.previewSecurity,
        localPath: outputPath,
        outputPath,
        usedFallback: result.usedFallback,
        aiProvider: options.aiProvider,
        assetCount: assetResult.mappings.length,
        warnings,
        shareTarget: options.shareTarget,
        copiedShareLink: options.copyShareLinkAfterExport,
        commentsEnabled: feedbackResult.injected,
        commentsStatus: this.describeReaderFeedback(options, feedbackResult),
        shareTitle: shareMetadata.title,
        shareHomeTitle: shareHomeProfile.title,
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

  chooseAndPublishExternalHtml(overrides: Partial<ExportOptions> = {}, includeThumbnail = false): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,text/html';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) {
        return;
      }
      if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') {
        new Notice('HTML 파일만 업로드할 수 있습니다.');
        return;
      }
      if (includeThumbnail) {
        this.openExternalHtmlThumbnailPrompt(file, overrides);
        return;
      }
      void this.publishExternalHtmlFile(file, overrides);
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  }

  private openExternalHtmlThumbnailPrompt(htmlFile: File, overrides: Partial<ExportOptions>): void {
    new MarktlExternalHtmlThumbnailModal(
      this.app,
      htmlFile.name,
      () => {
        this.chooseExternalHtmlThumbnail(
          (thumbnailFile) => {
            void this.publishExternalHtmlFile(htmlFile, overrides, thumbnailFile);
          },
          () => {
            new Notice('썸네일 선택이 취소되었습니다. 다시 선택하거나 썸네일 없이 게시할 수 있습니다.');
            this.openExternalHtmlThumbnailPrompt(htmlFile, overrides);
          },
          () => {
            new Notice('썸네일은 PNG, JPG, WebP, GIF, AVIF, SVG 이미지만 업로드할 수 있습니다.');
            this.openExternalHtmlThumbnailPrompt(htmlFile, overrides);
          },
        );
      },
      () => {
        void this.publishExternalHtmlFile(htmlFile, overrides);
      },
    ).open();
  }

  private chooseExternalHtmlThumbnail(onChoose: (file: File) => void, onCancel?: () => void, onInvalid?: () => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.jpeg,.webp,.gif,.avif,.svg,image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml';
    input.style.display = 'none';
    let handled = false;
    input.addEventListener('change', () => {
      handled = true;
      const file = input.files?.[0];
      input.remove();
      if (!file) {
        onCancel?.();
        return;
      }
      if (!this.isSupportedExternalThumbnail(file)) {
        onInvalid?.();
        return;
      }
      onChoose(file);
    }, { once: true });
    input.addEventListener('cancel', () => {
      if (handled) {
        return;
      }
      handled = true;
      input.remove();
      onCancel?.();
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  }

  private isSupportedExternalThumbnail(file: File): boolean {
    if (!isSupportedExternalThumbnailFileName(file.name)) {
      return false;
    }
    return !file.type || file.type.startsWith('image/');
  }

  async publishExternalHtmlFile(file: File, overrides: Partial<ExportOptions> = {}, thumbnailFile?: File): Promise<void> {
    const options: ExportOptions = {
      ...this.resolveExportOptions(overrides),
      shareTarget: 'github-pages',
      previewSecurity: 'trusted',
      failurePolicy: 'strict',
      aiProvider: 'none',
      copyShareLinkAfterExport: true,
    };
    const shareHomeProfile = resolveShareHomeProfile(this.settings, options.shareHomeProfileId) as ShareHomeProfile;
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Share hub: ${shareHomeProfile.title} (${shareHomeProfile.basePath || '/'})`);
    progress.addStep(`HTML upload: ${file.name}`);
    if (thumbnailFile) {
      progress.addStep(`Thumbnail upload: ${thumbnailFile.name}`);
    }
    progress.addStep('AI conversion: skipped for existing HTML file.');

    try {
      progress.addStep('Reading selected HTML file...');
      const rawHtml = await file.text();
      if (!rawHtml.trim()) {
        throw new Error('선택한 HTML 파일이 비어 있습니다.');
      }

      const outputPlan = await this.prepareExternalHtmlOutputPlan(file.name);
      const sourcePath = `External HTML file: ${file.name}`;
      const metadata = extractExternalHtmlMetadata(rawHtml, file.name);
      const shortId = buildShortId(outputPlan.basename);
      const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
      const socialUrl = buildShortPagesUrl(pagesBaseUrl, shareHomeProfile.basePath, shortId);
      const shareHomeReturnUrl = buildShareHomeUrl(pagesBaseUrl, shareHomeProfile.basePath);
      const thumbnailMapping = thumbnailFile
        ? await this.writeExternalThumbnailAsset(outputPlan, thumbnailFile)
        : null;
      const assetMappings = thumbnailMapping ? [thumbnailMapping] : [];
      const thumbnailPublicUrl = thumbnailMapping
        ? `${socialUrl}assets/${encodeURIComponent(thumbnailMapping.destinationPath.split('/').pop() || 'thumbnail')}`
        : '';
      if (thumbnailMapping) {
        progress.addStep('Stored thumbnail asset for the share hub card.');
      }

      progress.addStep(`Resolved title: ${metadata.title}`);
      let html = this.repairHtmlHead(rawHtml);
      html = this.ensureHtmlTitle(html, metadata.title);
      html = injectSocialMeta(html, {
        title: metadata.title,
        description: metadata.excerpt,
        url: socialUrl,
        image: thumbnailPublicUrl,
      });
      const feedbackResult = this.applyReaderFeedback(html, options);
      html = this.repairHtmlHead(feedbackResult.html);
      if (feedbackResult.injected) {
        progress.addStep('Added Giscus reader feedback.');
      }
      html = this.repairHtmlHead(injectShareHomeLink(html, {
        homeUrl: shareHomeReturnUrl,
        label: '공유 홈',
      }));
      progress.addStep('Added share hub home link.');
      const repairedHtml = repairObsidianSyntaxResidue(html);
      if (repairedHtml !== html) {
        html = this.repairHtmlHead(repairedHtml);
        progress.addStep('Cleaned residual Obsidian-only syntax before HTML QA.');
      }

      const qaWarnings = validateHtmlArtifact(html, {
        trusted: true,
        artifactGoal: 'publish',
        externalHtml: true,
        assetMappings,
      });
      const fatalQaWarnings = qaWarnings.filter((warning: string) => /^HTML QA fatal:/i.test(warning));
      if (fatalQaWarnings.length > 0) {
        throw new Error(`GitHub Pages publishing blocked by HTML QA: ${fatalQaWarnings[0]}`);
      }
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep('HTML QA passed basic checks.');
      }

      const assetWarnings = findExternalHtmlAssetWarnings(html);
      if (assetWarnings.length > 0) {
        progress.addStep('HTML has relative asset reference warning(s).');
      }
      const warnings = [...assetWarnings, ...feedbackResult.warnings, ...qaWarnings];

      progress.addStep('Writing HTML upload bundle to vault...');
      const outputPath = await this.writeHtmlFile(outputPlan, html, options, sourcePath);

      progress.addStep('Publishing GitHub Pages HTML upload...');
      const publishResult = await this.publishGithubPages(outputPlan, assetMappings, sourcePath, '', options, shortId, metadata);
      progress.addStep(`Published: ${publishResult.publicUrl}`);

      progress.addStep('Opening internal preview pane...');
      await this.openPreview({
        html,
        filePath: outputPath,
        sourcePath,
        title: metadata.title,
        warnings,
        trusted: true,
        previewSecurity: 'trusted',
      });

      progress.addStep('Copying public share link...');
      await this.copyShareLink(outputPath, publishResult.publicUrl);

      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        options,
        sourceKind: 'html-file',
        sourcePath,
        sourceTitle: metadata.title,
        presetId: options.presetId,
        previewSecurity: 'trusted',
        localPath: outputPath,
        outputPath,
        usedFallback: false,
        aiProvider: 'none',
        assetCount: assetMappings.length,
        warnings,
        shareTarget: 'github-pages',
        copiedShareLink: true,
        commentsEnabled: feedbackResult.injected,
        commentsStatus: this.describeReaderFeedback(options, feedbackResult),
        shareTitle: metadata.title,
        shareHomeTitle: shareHomeProfile.title,
        publicUrl: publishResult.publicUrl,
        shareHomeUrl: publishResult.shareHomeUrl,
      });
      new Notice(`HTML uploaded to ${publishResult.publicUrl}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new Notice(`HTML upload failed: ${message}`);
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

  private async prepareExternalHtmlOutputPlan(fileName: string): Promise<OutputPlan> {
    const folder = normalizePath(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!(await this.app.vault.adapter.exists(folder))) {
      await this.app.vault.createFolder(folder);
    }

    const basename = basenameFromHtmlFileName(fileName);
    const outputPath = normalizePath(`${folder}/share/${basename}/index.html`);
    const assetFolder = normalizePath(`${folder}/share/${basename}/assets`);
    return {
      folder,
      basename,
      outputPath,
      assetFolder,
      assetRelativePrefix: 'assets',
    };
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

  private async writeExternalThumbnailAsset(plan: OutputPlan, file: File): Promise<ImageAssetMapping> {
    if (!this.isSupportedExternalThumbnail(file)) {
      throw new Error('썸네일은 PNG, JPG, WebP, GIF, AVIF, SVG 이미지만 업로드할 수 있습니다.');
    }
    const assetFileName = externalThumbnailAssetName(file.name);
    const destinationPath = normalizePath(`${plan.assetFolder}/${assetFileName}`);
    const relativeSrc = encodeURI(`${plan.assetRelativePrefix}/${assetFileName}`);
    const data = await file.arrayBuffer();
    await this.ensureParentFolder(destinationPath);
    await this.app.vault.adapter.writeBinary(destinationPath, data);
    return {
      original: file.name,
      sourcePath: `External thumbnail file: ${file.name}`,
      destinationPath,
      relativeSrc,
      aliases: [
        file.name,
        assetFileName,
      ],
    };
  }

  private ensureHtmlTitle(html: string, title: string): string {
    const value = String(html || '');
    if (/<title\b/i.test(value)) {
      return value;
    }
    const safeTitle = this.escapeHtmlValue(title || 'MarkTL HTML upload');
    if (/<\/head>/i.test(value)) {
      return value.replace(/<\/head>/i, `<title>${safeTitle}</title>\n</head>`);
    }
    return `<title>${safeTitle}</title>\n${value}`;
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
      presetId: overrides.presetId,
      shareHomeProfileId: overrides.shareHomeProfileId || this.settings.activeShareHomeProfileId,
      artifactGoal: overrides.artifactGoal || this.settings.artifactGoal,
      artifactType: overrides.artifactType || this.settings.artifactType,
      exportGenre: overrides.exportGenre || this.settings.exportGenre,
      exportDepth: overrides.exportDepth || this.settings.exportDepth,
      exportPurpose: overrides.exportPurpose || this.settings.exportPurpose,
      referenceContextNotePath: overrides.referenceContextNotePath ?? this.settings.referenceContextNotePath,
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
    if (!shouldAttachReaderFeedback(options)) {
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

  private describeReaderFeedback(options: ExportOptions, feedback: { warnings: string[]; injected: boolean }): string {
    if (options.readerFeedbackMode !== 'giscus') {
      return 'Reader comments disabled';
    }
    if (!shouldAttachReaderFeedback(options)) {
      return 'Reader comments skipped for local file link';
    }
    if (feedback.injected) {
      return 'Giscus GitHub comments enabled';
    }
    return feedback.warnings.length > 0
      ? `Giscus setup needed: ${feedback.warnings[0]}`
      : 'Giscus comments were not added';
  }

  private async resolveContextPack(markdown: string, source: TFile, options: ExportOptions): Promise<{ markdown: string; count: number; warnings: string[] }> {
    if (options.contextPackMode === 'reference-note') {
      const referencePath = String(options.referenceContextNotePath || '').trim();
      if (!referencePath) {
        return { markdown: '', count: 0, warnings: ['Reference context note is not selected.'] };
      }
      const linked = this.resolveMarkdownContextFile(referencePath, source);
      if (!linked) {
        return { markdown: '', count: 0, warnings: [`Reference context note not found: ${referencePath}`] };
      }
      if (linked.path === source.path) {
        return { markdown: '', count: 0, warnings: ['Reference context note is the active note; skipped duplicate context.'] };
      }
      try {
        const items = [{
          target: referencePath,
          path: linked.path,
          content: await this.app.vault.read(linked),
        }];
        return {
          markdown: buildContextPackMarkdown(items, { kind: 'reference' }),
          count: 1,
          warnings: [],
        };
      } catch {
        return { markdown: '', count: 0, warnings: [`Reference context note unreadable: ${referencePath}`] };
      }
    }

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
    const candidates = this.buildMarkdownContextTargetVariants(target);
    for (const candidate of candidates) {
      const linked = this.app.metadataCache.getFirstLinkpathDest(candidate, source.path);
      if (linked instanceof TFile && linked.extension === 'md') {
        return linked;
      }
    }

    for (const candidate of candidates) {
      const normalized = normalizePath(candidate.endsWith('.md') ? candidate : `${candidate}.md`);
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
    }

    const candidateKeys = new Set(candidates.flatMap((candidate) => {
      const noExt = candidate.replace(/\.md$/i, '');
      const withExt = candidate.endsWith('.md') ? candidate : `${candidate}.md`;
      return [
        noExt,
        noExt.normalize('NFC'),
        noExt.normalize('NFD'),
        withExt,
        withExt.normalize('NFC'),
        withExt.normalize('NFD'),
      ].map((value) => normalizePath(value));
    }));
    const byName = this.app.vault.getFiles().find((file) => {
      if (file.extension !== 'md') {
        return false;
      }
      const fileKeys = [
        file.basename,
        file.basename.normalize('NFC'),
        file.basename.normalize('NFD'),
        file.name,
        file.name.normalize('NFC'),
        file.name.normalize('NFD'),
        file.path,
        file.path.normalize('NFC'),
        file.path.normalize('NFD'),
      ].map((value) => normalizePath(value));
      return fileKeys.some((key) => candidateKeys.has(key) || [...candidateKeys].some((candidate) => key.endsWith(`/${candidate}`)));
    });
    return byName instanceof TFile ? byName : null;
  }

  private buildMarkdownContextTargetVariants(target: string): string[] {
    const raw = String(target || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
    if (!raw) {
      return [];
    }
    const withoutHash = raw.split('#')[0].trim();
    const withoutAlias = withoutHash.split('|')[0].trim();
    const values = [
      raw,
      withoutHash,
      withoutAlias,
      withoutAlias.replace(/\.md$/i, ''),
    ].filter(Boolean);
    const expanded: string[] = [];
    for (const value of values) {
      expanded.push(value, value.normalize('NFC'), value.normalize('NFD'));
      try {
        const decoded = decodeURI(value);
        expanded.push(decoded, decoded.normalize('NFC'), decoded.normalize('NFD'));
      } catch {
        // Keep the undecoded candidate when the link is not URI-encoded.
      }
    }
    return [...new Set(expanded.map((value) => normalizePath(value)).filter(Boolean))];
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

  getGithubPagesContext(shareHomeProfileId = this.settings.activeShareHomeProfileId): GithubPagesContext {
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error('GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.');
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error('GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.');
    }
    const branch = this.settings.githubBranch.trim() || 'main';
    const shareHomeProfile = resolveShareHomeProfile(this.settings, shareHomeProfileId) as ShareHomeProfile;
    const basePath = shareHomeProfile.basePath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
    return {
      ...repo,
      branch,
      basePath,
      pagesBaseUrl,
      indexPath: buildPublishPath(basePath, '', 'index.json'),
      indexHtmlPath: buildPublishPath(basePath, '', 'index.html'),
      shareHomeProfile,
    };
  }

  async loadPublishedShareIndex(shareHomeProfileId = ''): Promise<{ context: GithubPagesContext; index: PublishedShareIndex }> {
    await this.refreshSettingsFromDisk();
    const context = this.getGithubPagesContext(shareHomeProfileId || this.settings.activeShareHomeProfileId);
    const existing = await this.getGithubJson(context.owner, context.repo, context.branch, context.indexPath);
    return {
      context,
      index: repairShareIndex(existing || { items: [] }),
    };
  }

  async repairPublishedShareIndex(shareHomeProfileId = ''): Promise<PublishedShareIndex> {
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    await this.writePublishedShareIndex(context, index);
    return index;
  }

  async repairAllPublishedShareIndexes(): Promise<{ repairedCount: number; itemCount: number; results: Array<{ profileId: string; title: string; itemCount: number }> }> {
    await this.refreshSettingsFromDisk();
    const profiles = normalizeShareHomeProfiles(this.settings.shareHomeProfiles, this.settings) as ShareHomeProfile[];
    const results: Array<{ profileId: string; title: string; itemCount: number }> = [];
    let itemCount = 0;

    for (const profile of profiles) {
      const index = await this.repairPublishedShareIndex(profile.id);
      results.push({
        profileId: profile.id,
        title: profile.title,
        itemCount: index.items.length,
      });
      itemCount += index.items.length;
    }

    return {
      repairedCount: results.length,
      itemCount,
      results,
    };
  }

  async writePublishedShareIndex(context: GithubPagesContext, index: PublishedShareIndex): Promise<void> {
    const html = renderShareIndexHtml(index, {
      title: context.shareHomeProfile.title,
      eyebrow: context.shareHomeProfile.eyebrow,
      description: context.shareHomeProfile.description,
      baseUrl: buildShareHomeUrl(context.pagesBaseUrl, context.basePath).replace(/\/+$/g, ''),
    });
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexHtmlPath, html);
  }

  private enqueuePublishedShareMutation<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.publishedShareMutationQueue.then(operation, operation);
    this.publishedShareMutationQueue = next.catch(() => undefined);
    return next;
  }

  async deletePublishedShareItem(target: PublishedShareItem, shareHomeProfileId = ''): Promise<{ removedCount: number; index: PublishedShareIndex }> {
    return this.deletePublishedShareItems([target], shareHomeProfileId);
  }

  async deletePublishedShareItems(targets: PublishedShareItem[], shareHomeProfileId = ''): Promise<{ removedCount: number; index: PublishedShareIndex }> {
    return this.enqueuePublishedShareMutation(() => this.deletePublishedShareItemsNow(targets, shareHomeProfileId));
  }

  async deleteAllPublishedShareItems(shareHomeProfileId = ''): Promise<{ removedCount: number; removedPathCount: number; index: PublishedShareIndex }> {
    return this.enqueuePublishedShareMutation(async () => {
      const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
      const nextIndex = repairShareIndex({
        ...index,
        updatedAt: new Date().toISOString(),
        items: [],
      });
      const removed = [...index.items];
      await this.deletePublishedShareArtifacts(context, removed);
      const removedPathCount = await this.deleteShareHomeSubpageFolders(context);
      await this.writePublishedShareIndex(context, nextIndex);
      return { removedCount: removed.length, removedPathCount, index: nextIndex };
    });
  }

  private async deletePublishedShareItemsNow(targets: PublishedShareItem[], shareHomeProfileId = ''): Promise<{ removedCount: number; index: PublishedShareIndex }> {
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    const { removed, index: nextIndex } = removeShareIndexItems(index, targets) as { removed: PublishedShareItem[]; index: PublishedShareIndex };
    if (!removed.length) {
      throw new Error('No matching published artifact was found.');
    }
    await this.deletePublishedShareArtifacts(context, removed);
    await this.writePublishedShareIndex(context, nextIndex);
    return { removedCount: removed.length, index: nextIndex };
  }

  private async deletePublishedShareArtifacts(context: GithubPagesContext, items: PublishedShareItem[]): Promise<void> {
    const publishPaths = new Set<string>();
    for (const item of items) {
      if (item.slug) {
        publishPaths.add(buildPublishPath(context.basePath, item.slug, ''));
      }
      if (item.shortId) {
        publishPaths.add(buildPublishPath(context.basePath, `s/${item.shortId}`, ''));
      }
    }
    for (const publishPath of publishPaths) {
      await this.deleteGithubPathRecursive(context.owner, context.repo, context.branch, publishPath);
    }
  }

  private async deleteShareHomeSubpageFolders(context: GithubPagesContext): Promise<number> {
    const basePath = normalizePublishPath(context.basePath);
    if (!basePath) {
      return 0;
    }
    const token = this.settings.githubToken.trim();
    const existing = await requestUrl({
      url: `${this.githubContentsUrl(context.owner, context.repo, basePath)}?ref=${encodeURIComponent(context.branch)}`,
      method: 'GET',
      headers: this.githubHeaders(token),
      throw: false,
    });
    if (existing.status === 404) {
      return 0;
    }
    if (existing.status < 200 || existing.status >= 300) {
      const message = existing.json?.message || existing.text || `GitHub lookup failed with HTTP ${existing.status}`;
      throw new Error(`GitHub lookup failed for ${basePath}: ${message}`);
    }
    const content = existing.json;
    if (!Array.isArray(content)) {
      return 0;
    }
    let removedPathCount = 0;
    for (const child of content) {
      const name = String(child?.name || '').trim().toLowerCase();
      const path = String(child?.path || '').trim();
      if (!path || name === 'index.html' || name === 'index.json') {
        continue;
      }
      if (child?.type === 'dir') {
        await this.deleteGithubPathRecursive(context.owner, context.repo, context.branch, path);
        removedPathCount += 1;
      }
    }
    return removedPathCount;
  }

  async replacePublishedShareThumbnail(target: PublishedShareItem, file: File, shareHomeProfileId = ''): Promise<{ updatedCount: number; index: PublishedShareIndex; thumbnailUrl: string }> {
    if (!this.isSupportedExternalThumbnail(file)) {
      throw new Error('썸네일은 PNG, JPG, WebP, GIF, AVIF, SVG 이미지만 업로드할 수 있습니다.');
    }
    const extension = externalThumbnailExtension(file.name);
    const assetName = `thumbnail-${Date.now().toString(36)}${extension}`;
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    const targetKeys = this.shareDeleteKeys(target);
    const data = await file.arrayBuffer();
    const now = new Date().toISOString();
    let updatedCount = 0;
    let lastThumbnailUrl = '';

    for (const item of index.items) {
      const keys = this.shareDeleteKeys(item);
      const matches = keys.some((key) => targetKeys.includes(key));
      if (!matches) {
        continue;
      }
      if (!item.slug && !item.shortId) {
        throw new Error('선택한 게시물에 slug 또는 shortId가 없어 썸네일을 교체할 수 없습니다.');
      }
      if (item.slug) {
        await this.putGithubFile(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, item.slug, `assets/${assetName}`), data);
      }
      if (item.shortId) {
        await this.putGithubFile(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, `s/${item.shortId}`, `assets/${assetName}`), data);
      }
      const thumbnailUrl = item.shortId
        ? `${buildShortPagesUrl(context.pagesBaseUrl, context.basePath, item.shortId)}assets/${encodeURIComponent(assetName)}`
        : `${buildPagesUrl(context.pagesBaseUrl, context.basePath, item.slug || '')}assets/${encodeURIComponent(assetName)}`;
      item.thumbnailUrl = thumbnailUrl;
      item.updatedAt = now;
      item.schemaVersion = Math.max(Number(item.schemaVersion || 0), 2);
      lastThumbnailUrl = thumbnailUrl;
      updatedCount += 1;
    }

    if (!updatedCount) {
      throw new Error('No matching published artifact was found.');
    }

    const nextIndex = repairShareIndex({
      ...index,
      updatedAt: now,
      items: index.items,
    });
    await this.writePublishedShareIndex(context, nextIndex);
    return { updatedCount, index: nextIndex, thumbnailUrl: lastThumbnailUrl };
  }

  shareDeleteKeys(item: PublishedShareItem): string[] {
    return buildShareDeleteKeys(item);
  }

  private async deleteGithubPathRecursive(owner: string, repo: string, branch: string, publishPath: string): Promise<void> {
    const cleanPath = String(publishPath || '').replace(/^\/+|\/+$/g, '');
    if (!cleanPath) {
      return;
    }
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, cleanPath);
    const existing = await requestUrl({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: 'GET',
      headers: this.githubHeaders(token),
      throw: false,
    });
    if (existing.status === 404) {
      return;
    }
    if (existing.status < 200 || existing.status >= 300) {
      const message = existing.json?.message || existing.text || `GitHub lookup failed with HTTP ${existing.status}`;
      throw new Error(`GitHub lookup failed for ${cleanPath}: ${message}`);
    }
    const content = existing.json;
    if (Array.isArray(content)) {
      for (const child of content) {
        if (child?.path) {
          await this.deleteGithubPathRecursive(owner, repo, branch, child.path);
        }
      }
      return;
    }
    await this.deleteGithubFile(owner, repo, branch, cleanPath, content?.sha);
  }

  private async deleteGithubFile(owner: string, repo: string, branch: string, publishPath: string, sha?: string): Promise<void> {
    if (!sha) {
      return;
    }
    const token = this.settings.githubToken.trim();
    const response = await requestUrl({
      url: this.githubContentsUrl(owner, repo, publishPath),
      method: 'DELETE',
      headers: {
        ...this.githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete MarkTL export ${publishPath}`,
        sha,
        branch,
      }),
      throw: false,
    });
    if (response.status === 404) {
      return;
    }
    if (response.status < 200 || response.status >= 300) {
      const message = response.json?.message || response.text || `GitHub delete failed with HTTP ${response.status}`;
      throw new Error(`GitHub delete failed for ${publishPath}: ${message}`);
    }
  }

  private async publishGithubPages(plan: OutputPlan, mappings: ImageAssetMapping[], sourcePath: string, markdown: string, options: ExportOptions, shortId = buildShortId(plan.basename), metadata = this.extractShareMetadata(markdown, plan.basename)): Promise<{ publicUrl: string; shareHomeUrl: string }> {
    await this.refreshSettingsFromDisk();
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error('GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.');
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error('GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.');
    }

    const branch = this.settings.githubBranch.trim() || 'main';
    const shareHomeProfile = resolveShareHomeProfile(this.settings, options.shareHomeProfileId) as ShareHomeProfile;
    const basePath = shareHomeProfile.basePath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
    const canonicalUrl = buildPagesUrl(pagesBaseUrl, basePath, plan.basename);
    const publicUrl = buildShortPagesUrl(pagesBaseUrl, basePath, shortId);
    const shareHomeUrl = buildShareHomeUrl(pagesBaseUrl, basePath);
    const thumbnailAssetName = mappings.find((mapping) => /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(mapping.destinationPath))?.destinationPath.split('/').pop() || '';
    const thumbnailUrl = thumbnailAssetName ? `${publicUrl}assets/${encodeURIComponent(thumbnailAssetName)}` : '';
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
      sourcePathKey: sourcePath.normalize('NFC').replace(/\\/g, '/').trim().toLowerCase(),
      artifactType: options.artifactType,
      thumbnailUrl,
      schemaVersion: 2,
      publishedByHost: String((typeof process !== 'undefined' && process.env && process.env.HOSTNAME) || ''),
      ...metadata,
    }, pagesBaseUrl, shareHomeProfile);

    return { publicUrl, shareHomeUrl };
  }

  private extractShareMetadata(markdown: string, fallbackTitle: string): { title: string; excerpt: string; tags: string[] } {
    const value = String(markdown || '');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(value)?.[1] || '';
    const cleanScalar = (text: string) => String(text || '').trim().replace(/^["']|["']$/g, '');
    const title = cleanScalar(/^title:[ \t]*(.+?)[ \t]*$/m.exec(frontmatter)?.[1]
      || /^#\s+(.+)$/m.exec(value)?.[1]
      || fallbackTitle);
    const tagLine = /^tags:[ \t]*(.+)$/m.exec(frontmatter)?.[1] || '';
    const inlineTags = tagLine
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(cleanScalar)
      .filter(Boolean);
    const tagBlock = /^tags:\s*\n((?:\s+-\s*.+(?:\n|$))*)/m.exec(frontmatter);
    const yamlListTags = tagBlock
      ? [...tagBlock[1].matchAll(/^\s*-\s*(.+?)\s*$/gm)].map((match) => cleanScalar(match[1]))
      : [];
    const readerTagMap: Record<string, string> = {
      'project/지수통합선별공장': '지수통합선별공장',
      'topic/지수통합선별공장': '지수통합선별공장',
      'construction/daily-report': '공사일보',
      'construction/착공': '착공',
      'construction/콘크리트철거': '콘크리트철거',
      'construction/옹벽기초': '옹벽기초',
      'risk/준공검사': '준공리스크',
      'risk/방수': '방수배수',
      'obsidian/project-management': '프로젝트관리',
      'obsidian/dataviewjs': '',
      'obsidian/mermaid': '',
      dataviewjs: '',
      gantt: '일정관리',
      budget: '예산',
      risk: '리스크',
      'function/ops': '운영관리',
      'doc/보고서': '보고서',
      'doc/meeting': '회의록',
    };
    const toReaderTag = (tag: string): string => {
      const raw = String(tag || '').replace(/^#/, '').trim();
      if (!raw) {
        return '';
      }
      if (Object.prototype.hasOwnProperty.call(readerTagMap, raw)) {
        return readerTagMap[raw];
      }
      const last = raw.includes('/') ? raw.split('/').filter(Boolean).pop() || '' : raw;
      return /[가-힣]/.test(last)
        ? last.replace(/^업무\//, '').replace(/^프로젝트\//, '').slice(0, 18)
        : '';
    };
    const body = value
      .replace(/^---\n[\s\S]*?\n---\s*/, '')
      .replace(/```(?:dataviewjs|dataview|mermaid|gantt)?[\s\S]*?```/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<![^>]*>/g, ' ')
      .replace(/^#\s+.+$/m, '')
      .replace(/\[!abstract]\+?/gi, ' ')
      .replace(/한 줄\s*(요약|브리프)/g, ' ')
      .replace(/!\[\[[^\]]+]]/g, '')
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[#*_`>~-]/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ');

    return {
      title: title.trim(),
      excerpt: body.slice(0, 180),
      tags: [...new Set([...inlineTags, ...yamlListTags].map(toReaderTag).filter(Boolean))].slice(0, 8),
    };
  }

  private async publishShareIndex(owner: string, repo: string, branch: string, basePath: string, entry: PublishedShareItem & { slug: string; title: string; url: string; sourcePath: string }, pagesBaseUrl: string, shareHomeProfile: ShareHomeProfile): Promise<void> {
    const indexPath = buildPublishPath(basePath, '', 'index.json');
    const existing = await this.getGithubJson(owner, repo, branch, indexPath);
    const index = updateShareIndex(existing, entry);
    const html = renderShareIndexHtml(index, {
      title: shareHomeProfile.title,
      eyebrow: shareHomeProfile.eyebrow,
      description: shareHomeProfile.description,
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
    new MarktlResultModal(
      this.app,
      summary,
      (outputPath, preferredLink) => this.copyShareLink(outputPath, preferredLink),
      (presetId) => {
        void this.exportActiveNote(applyPresetToOptions(summary.options, presetId));
      },
    ).open();
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
