import { Notice, Plugin, TFile, WorkspaceLeaf, normalizePath } from 'obsidian';
import { MarktlExportModal } from './export-modal';
import { MarktlProgressModal } from './progress-modal';
import { MarktlPreviewView, VIEW_TYPE_MARKTL_PREVIEW } from './preview-view';
import { MarktlSettingTab } from './settings-tab';
import type { ExportOptions, MarktlSettings, PreviewState } from './types';

const { convertWithAiFallback } = require('./core/ai.js');
const { slugify } = require('./core/html.js');

const DEFAULT_SETTINGS: MarktlSettings = {
  exportFolder: 'html-exports',
  template: 'minimal',
  aiProvider: 'none',
  conversionMode: 'preserve',
  failurePolicy: 'fallback',
  previewSecurity: 'sanitized',
  timeoutMs: 60000,
  claudePath: '',
  geminiPath: '',
  copyShareLinkAfterExport: false,
};

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

    this.addSettingTab(new MarktlSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if ((this.settings.aiProvider as string) === 'codex') {
      this.settings.aiProvider = 'none';
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
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
    progress.addStep(`Template: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === 'none' ? 'local fallback' : options.aiProvider}`);
    progress.addStep(`Mode: ${options.conversionMode}; preview: ${options.previewSecurity}`);

    try {
      progress.addStep('Reading active Markdown note...');
      const markdown = await this.app.vault.read(file);
      progress.addStep(options.aiProvider === 'none' ? 'Running local converter...' : `Running ${options.aiProvider} CLI...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        mode: options.conversionMode,
        template: options.template,
        trusted: options.previewSecurity === 'trusted',
        strictAiFailures: options.failurePolicy === 'strict',
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        cliPaths: {
          claude: this.settings.claudePath,
          gemini: this.settings.geminiPath,
        },
      });
      progress.addStep(result.usedFallback ? 'Generated local fallback HTML.' : 'Generated AI HTML.');

      progress.addStep('Writing HTML file to vault...');
      const outputPath = await this.writeHtmlFile(file, result.html);
      progress.addStep('Opening internal preview pane...');
      await this.openPreview({
        html: result.html,
        filePath: outputPath,
        warnings: result.warnings,
        trusted: options.previewSecurity === 'trusted',
      });

      if (options.copyShareLinkAfterExport) {
        progress.addStep('Copying local share link...');
        await this.copyShareLink(outputPath);
      }

      progress.complete(`Done: ${outputPath}`);
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

  private async writeHtmlFile(source: TFile, html: string): Promise<string> {
    const folder = normalizePath(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!(await this.app.vault.adapter.exists(folder))) {
      await this.app.vault.createFolder(folder);
    }

    const basename = slugify(source.basename);
    const outputPath = normalizePath(`${folder}/${basename}.html`);
    await this.app.vault.adapter.write(outputPath, html);
    return outputPath;
  }

  private resolveExportOptions(overrides: Partial<ExportOptions>): ExportOptions {
    return {
      template: overrides.template || this.settings.template,
      aiProvider: overrides.aiProvider || this.settings.aiProvider,
      conversionMode: overrides.conversionMode || this.settings.conversionMode,
      failurePolicy: overrides.failurePolicy || this.settings.failurePolicy,
      previewSecurity: overrides.previewSecurity || this.settings.previewSecurity,
      copyShareLinkAfterExport: overrides.copyShareLinkAfterExport ?? this.settings.copyShareLinkAfterExport,
    };
  }

  private async copyShareLink(outputPath: string): Promise<void> {
    const adapter = this.app.vault.adapter as typeof this.app.vault.adapter & {
      getFullPath?: (path: string) => string;
    };
    const fullPath = adapter.getFullPath ? adapter.getFullPath(outputPath) : outputPath;
    const link = fullPath.startsWith('/')
      ? `file://${encodeURI(fullPath)}`
      : outputPath;

    await navigator.clipboard.writeText(link);
    new Notice('HTML share link copied.');
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
