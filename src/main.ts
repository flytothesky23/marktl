import { Notice, Plugin, TFile, WorkspaceLeaf, normalizePath } from 'obsidian';
import { MarktlPreviewView, VIEW_TYPE_MARKTL_PREVIEW } from './preview-view';
import { MarktlSettingTab } from './settings-tab';
import type { MarktlSettings, PreviewState } from './types';

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
  codexPath: '',
  claudePath: '',
  geminiPath: '',
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
      void this.exportActiveNote();
    });

    this.addCommand({
      id: 'export-active-note-to-html',
      name: 'Export active note to HTML',
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
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async exportActiveNote(): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile) || file.extension !== 'md') {
      new Notice('Open a Markdown note before exporting HTML.');
      return;
    }

    try {
      const markdown = await this.app.vault.read(file);
      const result = await convertWithAiFallback(markdown, {
        provider: this.settings.aiProvider,
        mode: this.settings.conversionMode,
        template: this.settings.template,
        trusted: this.settings.previewSecurity === 'trusted',
        strictAiFailures: this.settings.failurePolicy === 'strict',
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        cliPaths: {
          codex: this.settings.codexPath,
          claude: this.settings.claudePath,
          gemini: this.settings.geminiPath,
        },
      });

      const outputPath = await this.writeHtmlFile(file, result.html);
      await this.openPreview({
        html: result.html,
        filePath: outputPath,
        warnings: result.warnings,
        trusted: this.settings.previewSecurity === 'trusted',
      });

      if (result.usedFallback && this.settings.aiProvider !== 'none') {
        new Notice('AI conversion failed; local fallback HTML was generated.');
      } else {
        new Notice(`HTML exported to ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
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
