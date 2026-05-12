import { App, Modal, Notice } from 'obsidian';
import type { ExportSummary } from './types';

export class MarktlResultModal extends Modal {
  private summary: ExportSummary;
  private copyLink: (outputPath: string, preferredLink?: string) => Promise<string>;
  private regenerate: (presetId: string) => void;

  constructor(app: App, summary: ExportSummary, copyLink: (outputPath: string, preferredLink?: string) => Promise<string>, regenerate: (presetId: string) => void) {
    super(app);
    this.summary = summary;
    this.copyLink = copyLink;
    this.regenerate = regenerate;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('HTML export ready');

    if (this.summary.publicUrl) {
      const shareCard = contentEl.createDiv({ cls: 'marktl-share-card' });
      shareCard.createEl('span', { cls: 'marktl-share-eyebrow', text: 'Share this page' });
      const link = shareCard.createEl('a', {
        cls: 'marktl-share-link',
        href: this.summary.publicUrl,
        text: this.summary.publicUrl,
      });
      link.setAttr('target', '_blank');
      link.setAttr('rel', 'noopener noreferrer');
      shareCard.createEl('p', {
        text: this.summary.commentsEnabled
          ? 'Readers can open this link and comment with GitHub through Giscus.'
          : 'Readers can open this link. Comments need Giscus settings before they appear.',
      });
    }

    const facts = contentEl.createDiv({ cls: 'marktl-summary-grid' });
    this.addFact(facts, 'Output', this.summary.outputPath);
    this.addFact(facts, 'Preview', this.summary.previewSecurity === 'trusted' ? 'Trusted interactive' : 'Sanitized static');
    this.addFact(facts, 'AI', this.summary.aiProvider === 'none'
      ? 'Local converter'
      : this.summary.usedFallback ? `${this.summary.aiProvider} failed; local fallback used` : `${this.summary.aiProvider} generated HTML`);
    this.addFact(facts, 'Images', `${this.summary.assetCount} bundled local image(s)`);
    this.addFact(facts, 'Share target', this.describeShareTarget());
    this.addFact(facts, 'Comments', this.summary.commentsStatus);
    if (this.summary.publicUrl) {
      this.addFact(facts, 'Public URL', this.summary.publicUrl);
    }
    if (this.summary.shareHomeUrl) {
      this.addFact(facts, 'Share home', this.summary.shareHomeUrl);
    }

    if (this.summary.warnings.length > 0) {
      contentEl.createEl('h3', { text: 'Warnings' });
      const list = contentEl.createEl('ul', { cls: 'marktl-summary-warnings' });
      for (const warning of this.summary.warnings) {
        list.createEl('li', { text: warning });
      }
    }

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: this.summary.publicUrl
        ? 'This public URL is ready to share with other people.'
        : this.summary.shareTarget === 'static-bundle'
        ? 'This folder is ready for a static host. Public upload is intentionally a separate step.'
        : 'This link opens the generated file on this computer. Public share links require a static host.',
    });

    const actions = contentEl.createDiv({ cls: 'marktl-result-actions' });
    this.addActionButton(actions, this.summary.publicUrl ? 'Copy public link' : 'Copy local link', async () => {
      const link = await this.copyLink(this.summary.outputPath, this.summary.publicUrl);
      new Notice(`Copied: ${link}`);
    });
    if (this.summary.publicUrl) {
      this.addActionButton(actions, 'Copy share text', async () => {
        const text = [this.summary.shareTitle, this.summary.publicUrl].filter(Boolean).join('\n');
        await navigator.clipboard.writeText(text);
        new Notice('Copied share text.');
      });
      this.addActionButton(actions, 'Open page', () => {
        window.open(this.summary.publicUrl, '_blank', 'noopener,noreferrer');
      });
    }
    if (this.summary.shareHomeUrl) {
      this.addActionButton(actions, 'Open archive', () => {
        window.open(this.summary.shareHomeUrl, '_blank', 'noopener,noreferrer');
      });
    }
    this.addActionButton(actions, 'Copy AI handoff', async () => {
      await navigator.clipboard.writeText(this.buildAiHandoffPrompt());
      new Notice('Copied AI handoff prompt.');
    });
    this.addActionButton(actions, 'Regenerate slides', () => {
      this.close();
      this.regenerate('presentation');
    });
    this.addActionButton(actions, 'Regenerate interactive', () => {
      this.close();
      this.regenerate('interactive-report');
    });
    this.addActionButton(actions, 'Close', () => this.close(), true);
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private addFact(container: HTMLElement, label: string, value: string): void {
    const item = container.createDiv({ cls: 'marktl-summary-item' });
    item.createEl('span', { cls: 'marktl-summary-label', text: label });
    item.createEl('strong', { text: value });
  }

  private addActionButton(container: HTMLElement, label: string, onClick: () => void | Promise<void>, cta = false): void {
    const button = container.createEl('button', {
      cls: cta ? 'mod-cta' : '',
      text: label,
    });
    button.addEventListener('click', () => {
      void onClick();
    });
  }

  private describeShareTarget(): string {
    if (this.summary.shareTarget === 'github-pages') {
      return 'GitHub Pages link';
    }
    return this.summary.shareTarget === 'static-bundle' ? 'Static hosting bundle' : 'Local file link';
  }

  private buildAiHandoffPrompt(): string {
    return [
      'Use this MarkTL HTML artifact as context for the next iteration.',
      '',
      `Source note: ${this.summary.sourcePath || this.summary.sourceTitle || 'Unknown source note'}`,
      `HTML output: ${this.summary.publicUrl || this.summary.localPath || this.summary.outputPath}`,
      `Preview security: ${this.summary.previewSecurity}`,
      `Share target: ${this.describeShareTarget()}`,
      this.summary.publicUrl ? `Public URL: ${this.summary.publicUrl}` : '',
      '',
      'Task:',
      '- Review the artifact as a visual HTML output, not just as Markdown text.',
      '- Identify what should be clearer, more visual, or more interactive.',
      '- Suggest the next concrete revision.',
    ].filter(Boolean).join('\n');
  }
}
