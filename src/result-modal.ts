import { App, Modal, Notice, Setting } from 'obsidian';
import type { ExportSummary } from './types';

export class MarktlResultModal extends Modal {
  private summary: ExportSummary;
  private copyLink: (outputPath: string, preferredLink?: string) => Promise<string>;

  constructor(app: App, summary: ExportSummary, copyLink: (outputPath: string, preferredLink?: string) => Promise<string>) {
    super(app);
    this.summary = summary;
    this.copyLink = copyLink;
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

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText(this.summary.publicUrl ? 'Copy public link' : 'Copy local link')
        .onClick(async () => {
          const link = await this.copyLink(this.summary.outputPath, this.summary.publicUrl);
          new Notice(`Copied: ${link}`);
        }))
      .addButton((button) => {
        button
          .setButtonText('Copy share text')
          .setDisabled(!this.summary.publicUrl)
          .onClick(async () => {
            if (!this.summary.publicUrl) {
              return;
            }
            const text = [this.summary.shareTitle, this.summary.publicUrl].filter(Boolean).join('\n');
            await navigator.clipboard.writeText(text);
            new Notice('Copied share text.');
          });
      })
      .addButton((button) => {
        button
          .setButtonText('Open page')
          .setDisabled(!this.summary.publicUrl)
          .onClick(() => {
            if (this.summary.publicUrl) {
              window.open(this.summary.publicUrl, '_blank', 'noopener,noreferrer');
            }
          });
      })
      .addButton((button) => {
        button
          .setButtonText('Open archive')
          .setDisabled(!this.summary.shareHomeUrl)
          .onClick(() => {
            if (this.summary.shareHomeUrl) {
              window.open(this.summary.shareHomeUrl, '_blank', 'noopener,noreferrer');
            }
          });
      })
      .addButton((button) => button
        .setButtonText('Close')
        .setCta()
        .onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private addFact(container: HTMLElement, label: string, value: string): void {
    const item = container.createDiv({ cls: 'marktl-summary-item' });
    item.createEl('span', { cls: 'marktl-summary-label', text: label });
    item.createEl('strong', { text: value });
  }

  private describeShareTarget(): string {
    if (this.summary.shareTarget === 'github-pages') {
      return 'GitHub Pages link';
    }
    return this.summary.shareTarget === 'static-bundle' ? 'Static hosting bundle' : 'Local file link';
  }
}
