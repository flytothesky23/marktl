import { App, Modal, Notice, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import type { ArtifactGoal, ArtifactType, ConversionMode, PreviewSecurity } from './types';

const { checkClaudeProvider } = require('./core/provider-doctor.js');

export class MarktlSetupModal extends Modal {
  private plugin: MarktlPlugin;
  private doctorEl: HTMLElement | null = null;

  constructor(app: App, plugin: MarktlPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('MarkTL setup');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Choose the simplest setup that matches how you want to use HTML exports.',
    });

    const cards = contentEl.createDiv({ cls: 'marktl-setup-cards' });
    this.addSetupCard(cards, {
      title: 'Start simple',
      body: 'Local HTML export, bundled images, safe preview. No AI setup required.',
      button: 'Use local export',
      apply: () => this.applySimpleDefaults(),
    });
    this.addSetupCard(cards, {
      title: 'Use Claude',
      body: 'Use Claude Code CLI for more designed reports and interactive artifacts.',
      button: 'Use Claude mode',
      apply: () => this.applyClaudeDefaults(),
    });
    this.addSetupCard(cards, {
      title: 'Prepare sharing',
      body: 'Create GitHub Pages-ready folders and publish public links after settings are filled.',
      button: 'Use Pages mode',
      apply: () => this.applyBundleDefaults(),
    });

    this.doctorEl = contentEl.createDiv({ cls: 'marktl-doctor-box' });
    this.renderDoctorIdle();

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText('Check Claude CLI')
        .onClick(() => {
          void this.runDoctor();
        }))
      .addButton((button) => button
        .setButtonText('Finish setup')
        .setCta()
        .onClick(async () => {
          this.plugin.settings.setupCompleted = true;
          await this.plugin.saveSettings();
          this.close();
          new Notice('MarkTL setup saved.');
        }));
  }

  onClose(): void {
    this.contentEl.empty();
    this.doctorEl = null;
  }

  private addSetupCard(container: HTMLElement, options: { title: string; body: string; button: string; apply: () => Promise<void> }): void {
    const card = container.createDiv({ cls: 'marktl-setup-card' });
    card.createEl('h3', { text: options.title });
    card.createEl('p', { text: options.body });
    new Setting(card)
      .addButton((button) => button
        .setButtonText(options.button)
        .onClick(async () => {
          await options.apply();
          new Notice(`${options.title} defaults applied.`);
        }));
  }

  private async applySimpleDefaults(): Promise<void> {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: 'none',
      artifactGoal: 'read' as ArtifactGoal,
      artifactType: 'faithful-note' as ArtifactType,
      template: 'editorial',
      conversionMode: 'preserve' as ConversionMode,
      previewSecurity: 'sanitized' as PreviewSecurity,
      shareTarget: 'local-link',
    });
    await this.plugin.saveSettings();
  }

  private async applyClaudeDefaults(): Promise<void> {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: 'claude',
      artifactGoal: 'review' as ArtifactGoal,
      artifactType: 'interactive-explainer' as ArtifactType,
      template: 'interactive-report',
      conversionMode: 'presentation' as ConversionMode,
      previewSecurity: 'trusted' as PreviewSecurity,
      shareTarget: 'local-link',
    });
    await this.plugin.saveSettings();
    await this.runDoctor();
  }

  private async applyBundleDefaults(): Promise<void> {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: this.plugin.settings.aiProvider,
      artifactGoal: 'publish' as ArtifactGoal,
      artifactType: 'research-report' as ArtifactType,
      template: 'editorial',
      conversionMode: 'blog' as ConversionMode,
      previewSecurity: 'sanitized' as PreviewSecurity,
      shareTarget: 'github-pages',
      copyShareLinkAfterExport: true,
    });
    await this.plugin.saveSettings();
  }

  private renderDoctorIdle(): void {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl('strong', { text: 'Claude doctor' });
    this.doctorEl.createEl('p', {
      text: 'Optional. Checks whether Claude Code CLI is installed and logged in.',
    });
  }

  private async runDoctor(): Promise<void> {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl('strong', { text: 'Checking Claude CLI...' });
    const result = await checkClaudeProvider({
      command: this.plugin.settings.claudePath || 'claude',
      timeoutMs: 15000,
    });
    this.doctorEl.empty();
    this.doctorEl.toggleClass('marktl-doctor-ok', result.ok);
    this.doctorEl.toggleClass('marktl-doctor-error', !result.ok);
    this.doctorEl.createEl('strong', {
      text: result.ok ? 'Claude is ready' : 'Claude needs attention',
    });
    this.doctorEl.createEl('p', { text: result.message });
    if (result.version) {
      this.doctorEl.createEl('code', { text: result.version });
    }
  }
}
