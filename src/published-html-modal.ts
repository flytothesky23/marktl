import { App, Modal, Notice, Setting } from 'obsidian';
import type MarktlPlugin from './main';

interface PublishedShareItem {
  title?: string;
  slug?: string;
  url?: string;
  canonicalUrl?: string;
  sourcePath?: string;
  sourcePathKey?: string;
  shortId?: string;
  thumbnailUrl?: string;
  updatedAt?: string;
}

export class MarktlPublishedHtmlModal extends Modal {
  private plugin: MarktlPlugin;
  private shareHomeProfileId: string;

  constructor(app: App, plugin: MarktlPlugin, shareHomeProfileId = '') {
    super(app);
    this.plugin = plugin;
    this.shareHomeProfileId = shareHomeProfileId;
  }

  onOpen(): void {
    void this.render();
  }

  private async render(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '게시된 MarkTL HTML' });
    const description = contentEl.createEl('p', {
      text: '현재 선택된 공유 허브의 게시물을 관리합니다. 잘못 올린 서브페이지는 완전 삭제하고, 카드 썸네일은 게시 후에도 교체할 수 있습니다.',
    });
    description.addClass('setting-item-description');

    const statusEl = contentEl.createEl('div');
    const controls = contentEl.createDiv();
    new Setting(controls)
      .addButton((button) => button
        .setButtonText('새로고침')
        .onClick(() => void this.render()))
      .addButton((button) => button
        .setButtonText('인덱스 메타데이터 복구')
        .setCta()
        .onClick(async () => {
          statusEl.setText('공개 인덱스를 복구하는 중...');
          try {
            const index = await this.plugin.repairPublishedShareIndex(this.shareHomeProfileId);
            new Notice(`MarkTL 인덱스를 복구했습니다: ${index.items.length}개 항목.`);
            await this.render();
          } catch (error) {
            statusEl.setText(error instanceof Error ? error.message : String(error));
          }
        }));

    const listEl = contentEl.createDiv();
    statusEl.setText('게시 인덱스를 불러오는 중...');
    try {
      const { index } = await this.plugin.loadPublishedShareIndex(this.shareHomeProfileId);
      statusEl.setText(`게시 항목 ${index.items.length}개.`);
      if (!index.items.length) {
        listEl.createEl('p', { text: '게시된 문서가 없습니다.' });
        return;
      }
      for (const item of index.items) {
        this.renderItem(listEl, item);
      }
    } catch (error) {
      statusEl.setText(error instanceof Error ? error.message : String(error));
    }
  }

  private renderItem(container: HTMLElement, item: PublishedShareItem): void {
    const card = container.createDiv({ cls: 'marktl-published-item' });
    const title = this.cleanPublishedText(item.title || item.slug || '', '제목 없는 HTML 산출물', 96);
    const url = String(item.url || item.canonicalUrl || '');
    new Setting(card)
      .setName(title)
      .setDesc(this.formatPublishedItemDescription(item, url))
      .addButton((button) => button
        .setButtonText('열기')
        .onClick(() => {
          if (url) {
            window.open(url);
          }
        }))
      .addButton((button) => button
        .setButtonText('URL 복사')
        .onClick(async () => {
          if (url) {
            await navigator.clipboard.writeText(url);
            new Notice('MarkTL URL을 복사했습니다.');
          }
        }))
      .addButton((button) => button
        .setButtonText('썸네일 교체')
        .onClick(() => {
          this.chooseReplacementThumbnail(item);
        }))
      .addButton((button) => button
        .setButtonText('완전 삭제')
        .setWarning()
        .onClick(async () => {
          const confirmed = window.confirm(`게시된 MarkTL 산출물을 삭제하고 아카이브에서도 제거할까요?\n\n${title}`);
          if (!confirmed) {
            return;
          }
          try {
            const result = await this.plugin.deletePublishedShareItem(item, this.shareHomeProfileId);
            new Notice(`아카이브 항목 ${result.removedCount}개를 삭제했습니다.`);
            await this.render();
          } catch (error) {
            new Notice(error instanceof Error ? error.message : String(error));
          }
        }));
  }

  private formatPublishedItemDescription(item: PublishedShareItem, url: string): string {
    const parts = [
      item.updatedAt ? `갱신일: ${String(item.updatedAt).slice(0, 10)}` : '',
      this.formatSourcePath(item.sourcePath),
      item.shortId ? `shortId: ${this.cleanPublishedText(item.shortId, '', 24)}` : '',
      this.cleanPublishedText(url, '', 128),
    ].filter(Boolean);
    return parts.join(' · ');
  }

  private formatSourcePath(value?: string): string {
    const raw = String(value || '').trim();
    if (!raw || this.isNoisyPublishedMeta(raw)) {
      return '';
    }
    const externalPrefix = 'External HTML file:';
    if (raw.startsWith(externalPrefix)) {
      const name = this.cleanPublishedText(raw.slice(externalPrefix.length).trim(), '', 80);
      return name ? `출처: ${name}` : '';
    }
    const normalized = raw.replace(/\\/g, '/');
    const display = normalized.length > 120
      ? normalized.split('/').filter(Boolean).pop() || ''
      : normalized;
    return this.cleanPublishedText(display, '', 96)
      ? `출처: ${this.cleanPublishedText(display, '', 96)}`
      : '';
  }

  private cleanPublishedText(value: unknown, fallback: string, maxLength: number): string {
    const raw = String(value || '').replace(/<[^>]*>/g, ' ');
    if (!raw.trim() || this.isNoisyPublishedMeta(raw)) {
      return fallback;
    }
    const text = raw.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
  }

  private isNoisyPublishedMeta(value: string): boolean {
    const text = String(value || '');
    if (/<\/?(html|head|body|script|style|meta|div|section|article)\b/i.test(text)) {
      return true;
    }
    const noisyCount = Array.from(text).filter((char) => char === 'Â' || char === 'Ã' || char === '�').length;
    if (noisyCount >= 8 || (text.length > 0 && noisyCount / text.length > 0.12)) {
      return true;
    }
    return text.length > 260 && !/[./\\]/.test(text);
  }

  private chooseReplacementThumbnail(item: PublishedShareItem): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      try {
        const result = await this.plugin.replacePublishedShareThumbnail(item, file, this.shareHomeProfileId);
        new Notice(`썸네일을 교체했습니다: ${result.updatedCount}개 항목.`);
        await this.render();
      } catch (error) {
        new Notice(error instanceof Error ? error.message : String(error));
      }
    };
    input.click();
  }
}
