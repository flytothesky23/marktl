import { App, Modal, Notice, Setting } from 'obsidian';
import type MarktlPlugin from './main';

interface PublishedShareItem {
  title?: string;
  slug?: string;
  url?: string;
  canonicalUrl?: string;
  sourcePath?: string;
  shortId?: string;
  updatedAt?: string;
}

export class MarktlPublishedHtmlModal extends Modal {
  private plugin: MarktlPlugin;

  constructor(app: App, plugin: MarktlPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    void this.render();
  }

  private async render(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '게시된 MarkTL HTML' });
    const description = contentEl.createEl('p', {
      text: 'GitHub Pages 인덱스 메타데이터를 여기서 복구합니다. 중복 카드는 공개 아카이브와 내보낸 폴더에서 함께 제거할 수 있습니다.',
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
            const index = await this.plugin.repairPublishedShareIndex();
            new Notice(`MarkTL 인덱스를 복구했습니다: ${index.items.length}개 항목.`);
            await this.render();
          } catch (error) {
            statusEl.setText(error instanceof Error ? error.message : String(error));
          }
        }));

    const listEl = contentEl.createDiv();
    statusEl.setText('게시 인덱스를 불러오는 중...');
    try {
      const { index } = await this.plugin.loadPublishedShareIndex();
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
    const title = String(item.title || item.slug || '제목 없는 HTML 산출물');
    const url = String(item.url || item.canonicalUrl || '');
    new Setting(card)
      .setName(title)
      .setDesc([
        item.updatedAt ? `갱신일: ${String(item.updatedAt).slice(0, 10)}` : '',
        item.sourcePath || '',
        item.shortId ? `shortId: ${item.shortId}` : '',
        url,
      ].filter(Boolean).join('\n'))
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
        .setButtonText('완전 삭제')
        .setWarning()
        .onClick(async () => {
          const confirmed = window.confirm(`게시된 MarkTL 산출물을 삭제하고 아카이브에서도 제거할까요?\n\n${title}`);
          if (!confirmed) {
            return;
          }
          try {
            const result = await this.plugin.deletePublishedShareItem(item);
            new Notice(`아카이브 항목 ${result.removedCount}개를 삭제했습니다.`);
            await this.render();
          } catch (error) {
            new Notice(error instanceof Error ? error.message : String(error));
          }
        }));
  }
}
