import { App, Modal } from 'obsidian';

export class MarktlProgressModal extends Modal {
  private listEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private barEl: HTMLElement | null = null;
  private steps: HTMLElement[] = [];

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
    const visualEl = this.contentEl.createDiv({ cls: 'marktl-progress-visual' });
    this.statusEl = visualEl.createDiv({
      cls: 'marktl-progress-status',
      text: 'Preparing export...',
    });
    const trackEl = visualEl.createDiv({ cls: 'marktl-progress-track' });
    this.barEl = trackEl.createDiv({ cls: 'marktl-progress-bar' });
    this.listEl = this.contentEl.createEl('ol', { cls: 'marktl-progress-list' });
  }

  addStep(text: string): void {
    if (!this.listEl) {
      return;
    }
    const previous = this.steps[this.steps.length - 1];
    if (previous) {
      previous.removeClass('marktl-progress-step-active');
      previous.addClass('marktl-progress-step-done');
    }
    const item = this.listEl.createEl('li', {
      cls: 'marktl-progress-step marktl-progress-step-active',
      text,
    });
    this.steps.push(item);
    this.updateVisual(text);
  }

  complete(text: string): void {
    this.addStep(text);
    const current = this.steps[this.steps.length - 1];
    if (current) {
      current.removeClass('marktl-progress-step-active');
      current.addClass('marktl-progress-step-done');
    }
    if (this.statusEl) {
      this.statusEl.setText('Export complete.');
      this.statusEl.removeClass('marktl-progress-status-error');
      this.statusEl.addClass('marktl-progress-status-done');
    }
    if (this.barEl) {
      this.barEl.setAttr('style', 'width: 100%;');
    }
    this.contentEl.createEl('p', {
      cls: 'marktl-progress-done',
      text: 'You can close this window.',
    });
  }

  fail(text: string): void {
    this.addStep(text);
    const current = this.steps[this.steps.length - 1];
    if (current) {
      current.removeClass('marktl-progress-step-active');
      current.addClass('marktl-progress-step-error');
    }
    if (this.statusEl) {
      this.statusEl.setText('Export stopped.');
      this.statusEl.removeClass('marktl-progress-status-done');
      this.statusEl.addClass('marktl-progress-status-error');
    }
    this.contentEl.createEl('p', {
      cls: 'marktl-progress-error',
      text: 'Export stopped. Check the message above.',
    });
  }

  onClose(): void {
    this.contentEl.empty();
    this.listEl = null;
    this.statusEl = null;
    this.barEl = null;
    this.steps = [];
  }

  private updateVisual(text: string): void {
    if (this.statusEl) {
      this.statusEl.setText(text);
      this.statusEl.removeClass('marktl-progress-status-done');
      this.statusEl.removeClass('marktl-progress-status-error');
    }
    if (this.barEl) {
      const pct = Math.min(92, 8 + this.steps.length * 7);
      this.barEl.setAttr('style', `width: ${pct}%;`);
    }
  }
}
