import { App, Modal } from 'obsidian';

export class MarktlProgressModal extends Modal {
  private listEl: HTMLElement | null = null;

  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.empty();
    this.setTitle('Export progress');
    this.contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'MarkTL is converting this note to HTML.',
    });
    this.listEl = this.contentEl.createEl('ol', { cls: 'marktl-progress-list' });
  }

  addStep(text: string): void {
    if (!this.listEl) {
      return;
    }
    this.listEl.createEl('li', { text });
  }

  complete(text: string): void {
    this.addStep(text);
    this.contentEl.createEl('p', {
      cls: 'marktl-progress-done',
      text: 'You can close this window.',
    });
  }

  fail(text: string): void {
    this.addStep(text);
    this.contentEl.createEl('p', {
      cls: 'marktl-progress-error',
      text: 'Export stopped. Check the message above.',
    });
  }

  onClose(): void {
    this.contentEl.empty();
    this.listEl = null;
  }
}
