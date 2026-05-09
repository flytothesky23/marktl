import { App, Modal, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ConversionMode, ExportOptions, FailurePolicy, PreviewSecurity } from './types';

export class MarktlExportModal extends Modal {
  private options: ExportOptions;
  private plugin: MarktlPlugin;
  private onSubmit: (options: ExportOptions) => void;

  constructor(app: App, plugin: MarktlPlugin, onSubmit: (options: ExportOptions) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.options = {
      template: plugin.settings.template,
      aiProvider: plugin.settings.aiProvider,
      conversionMode: plugin.settings.conversionMode,
      failurePolicy: plugin.settings.failurePolicy,
      previewSecurity: plugin.settings.previewSecurity,
      copyShareLinkAfterExport: plugin.settings.copyShareLinkAfterExport,
    };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('Export note to HTML');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Choose a template, AI CLI, and preview mode for this export.',
    });

    new Setting(contentEl)
      .setName('Template')
      .setDesc('Controls the visual direction and local fallback style.')
      .addDropdown((dropdown) => {
        for (const template of listTemplates()) {
          dropdown.addOption(template.id, template.name);
        }
        dropdown.setValue(this.options.template).onChange((value) => {
          this.options.template = value;
        });
      });

    new Setting(contentEl)
      .setName('AI CLI')
      .setDesc('Only providers that passed live plugin-style execution are shown.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'None / local fallback')
        .addOption('claude', 'Claude Code CLI')
        .addOption('gemini', 'Gemini CLI')
        .setValue(this.options.aiProvider)
        .onChange((value) => {
          this.options.aiProvider = value as AiProvider;
        }));

    new Setting(contentEl)
      .setName('Mode')
      .setDesc('Preserve keeps content faithful; other modes allow AI restructuring.')
      .addDropdown((dropdown) => dropdown
        .addOption('preserve', 'Preserve content')
        .addOption('presentation', 'Presentation')
        .addOption('blog', 'Blog article')
        .addOption('landing', 'Landing page')
        .setValue(this.options.conversionMode)
        .onChange((value) => {
          this.options.conversionMode = value as ConversionMode;
        }));

    new Setting(contentEl)
      .setName('Preview security')
      .setDesc('Trusted mode allows inline JavaScript for interactive HTML.')
      .addDropdown((dropdown) => dropdown
        .addOption('sanitized', 'Sanitized static preview')
        .addOption('trusted', 'Trusted interactive preview')
        .setValue(this.options.previewSecurity)
        .onChange((value) => {
          this.options.previewSecurity = value as PreviewSecurity;
        }));

    new Setting(contentEl)
      .setName('AI failure')
      .setDesc('Fallback keeps exporting; strict stops when the CLI fails.')
      .addDropdown((dropdown) => dropdown
        .addOption('fallback', 'Fallback with warning')
        .addOption('strict', 'Stop on AI failure')
        .setValue(this.options.failurePolicy)
        .onChange((value) => {
          this.options.failurePolicy = value as FailurePolicy;
        }));

    new Setting(contentEl)
      .setName('Copy share link')
      .setDesc('Copies a local file:// link for the generated self-contained HTML.')
      .addToggle((toggle) => toggle
        .setValue(this.options.copyShareLinkAfterExport)
        .onChange((value) => {
          this.options.copyShareLinkAfterExport = value;
        }));

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText('Export')
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.options);
        }))
      .addButton((button) => button
        .setButtonText('Save as defaults')
        .onClick(async () => {
          Object.assign(this.plugin.settings, this.options);
          await this.plugin.saveSettings();
          this.close();
          this.onSubmit(this.options);
        }));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
