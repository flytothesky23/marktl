import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { PreviewState } from './types';

export const VIEW_TYPE_MARKTL_PREVIEW = 'marktl-html-preview';

const emptyState: PreviewState = {
  html: '<!doctype html><html><body><p>No preview loaded.</p></body></html>',
  filePath: '',
  warnings: [],
  trusted: false,
};

export class MarktlPreviewView extends ItemView {
  private state: PreviewState = emptyState;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_MARKTL_PREVIEW;
  }

  getDisplayText(): string {
    return 'HTML Preview';
  }

  getIcon(): string {
    return 'file-code-2';
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  setPreview(state: PreviewState): void {
    this.state = state;
    this.render();
  }

  private render(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass('marktl-preview-container');

    const header = container.createDiv({ cls: 'marktl-preview-header' });
    header.createEl('strong', { text: this.state.filePath || 'HTML Preview' });
    if (this.state.trusted) {
      header.createSpan({ cls: 'marktl-preview-trusted', text: 'Trusted' });
    }

    for (const warning of this.state.warnings) {
      container.createDiv({ cls: 'marktl-preview-warning', text: warning });
    }

    const frame = container.createEl('iframe', {
      cls: 'marktl-preview-frame',
      attr: {
        sandbox: this.state.trusted ? 'allow-same-origin allow-scripts' : '',
      },
    });
    frame.srcdoc = this.state.html;
  }
}
