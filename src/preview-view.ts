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

    const renderQa = container.createDiv({ cls: 'marktl-preview-render-qa', text: 'Render QA: waiting for preview...' });

    const frame = container.createEl('iframe', {
      cls: 'marktl-preview-frame',
      attr: {
        sandbox: this.state.trusted ? 'allow-same-origin allow-scripts' : 'allow-same-origin',
      },
    });
    frame.addEventListener('load', () => {
      this.runRenderQa(frame, renderQa);
    });
    frame.srcdoc = this.state.html;
  }

  private runRenderQa(frame: HTMLIFrameElement, statusEl: HTMLElement): void {
    try {
      const doc = frame.contentDocument;
      if (!doc) {
        statusEl.setText('Render QA: unable to inspect preview document.');
        statusEl.addClass('marktl-preview-render-qa-warning');
        return;
      }

      const warnings: string[] = [];
      const bodyText = doc.body?.innerText?.trim() || '';
      if (bodyText.length < 20) {
        warnings.push('preview appears nearly empty');
      }
      if (!doc.querySelector('h1')) {
        warnings.push('no visible H1');
      }
      const brokenImages = Array.from(doc.images).filter((image) => image.complete && image.naturalWidth === 0);
      if (brokenImages.length > 0) {
        warnings.push(`${brokenImages.length} broken image(s)`);
      }
      if (this.state.trusted && !doc.querySelector('button,input,select,textarea,[contenteditable="true"]') && !doc.querySelector('script[src*="giscus.app/client.js"]')) {
        warnings.push('trusted preview has no interactive controls');
      }
      const scrollHeight = doc.scrollingElement?.scrollHeight || doc.body?.scrollHeight || 0;
      if (scrollHeight > 0 && scrollHeight < 120) {
        warnings.push('rendered content is unusually short');
      }

      statusEl.setText(warnings.length > 0
        ? `Render QA: ${warnings.join('; ')}.`
        : 'Render QA: preview loaded, content and assets look reachable.');
      statusEl.toggleClass('marktl-preview-render-qa-warning', warnings.length > 0);
    } catch (error) {
      statusEl.setText('Render QA: preview inspection was blocked by iframe security.');
      statusEl.addClass('marktl-preview-render-qa-warning');
    }
  }
}
