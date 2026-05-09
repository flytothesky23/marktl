import { App, PluginSettingTab, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ArtifactType, ConversionMode, FailurePolicy, PreviewSecurity, ShareTarget } from './types';

export class MarktlSettingTab extends PluginSettingTab {
  plugin: MarktlPlugin;

  constructor(app: App, plugin: MarktlPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'MarkTL HTML Exporter' });

    new Setting(containerEl)
      .setName('Export folder')
      .setDesc('Vault-relative folder for generated HTML files.')
      .addText((text) => text
        .setPlaceholder('html-exports')
        .setValue(this.plugin.settings.exportFolder)
        .onChange(async (value) => {
          this.plugin.settings.exportFolder = value.trim() || 'html-exports';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Artifact type')
      .setDesc('Default information architecture for AI exports.')
      .addDropdown((dropdown) => dropdown
        .addOption('faithful-note', 'Faithful Note')
        .addOption('strategy-brief', 'Strategy Brief')
        .addOption('research-report', 'Research Report')
        .addOption('decision-memo', 'Decision Memo')
        .addOption('interactive-explainer', 'Interactive Explainer')
        .addOption('slide-deck', 'Slide Deck')
        .setValue(this.plugin.settings.artifactType)
        .onChange(async (value) => {
          this.plugin.settings.artifactType = value as ArtifactType;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Template')
      .setDesc('Default HTML style template.')
      .addDropdown((dropdown) => {
        for (const template of listTemplates()) {
          dropdown.addOption(template.id, template.name);
        }
        dropdown
          .setValue(this.plugin.settings.template)
          .onChange(async (value) => {
            this.plugin.settings.template = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('AI provider')
      .setDesc('Optional CLI provider for high-quality AI conversion.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'None / local fallback')
        .addOption('claude', 'Claude Code CLI')
        .addOption('gemini', 'Gemini CLI')
        .setValue(this.plugin.settings.aiProvider)
        .onChange(async (value) => {
          this.plugin.settings.aiProvider = value as AiProvider;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Conversion mode')
      .setDesc('Preserve mode keeps the note faithful. Other modes allow AI restructuring.')
      .addDropdown((dropdown) => dropdown
        .addOption('preserve', 'Preserve content')
        .addOption('presentation', 'Presentation')
        .addOption('blog', 'Blog article')
        .addOption('landing', 'Landing page')
        .setValue(this.plugin.settings.conversionMode)
        .onChange(async (value) => {
          this.plugin.settings.conversionMode = value as ConversionMode;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Preview security')
      .setDesc('Sanitized mode blocks scripts, iframes, external assets, and event handlers.')
      .addDropdown((dropdown) => dropdown
        .addOption('sanitized', 'Sanitized static preview')
        .addOption('trusted', 'Trusted preview/export')
        .setValue(this.plugin.settings.previewSecurity)
        .onChange(async (value) => {
          this.plugin.settings.previewSecurity = value as PreviewSecurity;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('AI failure policy')
      .setDesc('Fallback creates local HTML with a warning. Strict stops generation.')
      .addDropdown((dropdown) => dropdown
        .addOption('fallback', 'Fallback with warning')
        .addOption('strict', 'Stop on AI failure')
        .setValue(this.plugin.settings.failurePolicy)
        .onChange(async (value) => {
          this.plugin.settings.failurePolicy = value as FailurePolicy;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('CLI timeout')
      .setDesc('Maximum AI CLI runtime in milliseconds.')
      .addText((text) => text
        .setPlaceholder('60000')
        .setValue(String(this.plugin.settings.timeoutMs))
        .onChange(async (value) => {
          const parsed = Number(value);
          this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 60000;
          await this.plugin.saveSettings();
        }));

    this.addCliPathSetting(containerEl, 'Claude Code CLI path', 'claudePath', 'claude');
    this.addCliPathSetting(containerEl, 'Gemini CLI path', 'geminiPath', 'gemini');

    new Setting(containerEl)
      .setName('Share target')
      .setDesc('Local link copies the export file. Static bundle writes share/<slug>/index.html for hosting.')
      .addDropdown((dropdown) => dropdown
        .addOption('local-link', 'Local file link')
        .addOption('static-bundle', 'Static hosting bundle')
        .setValue(this.plugin.settings.shareTarget)
        .onChange(async (value) => {
          this.plugin.settings.shareTarget = value as ShareTarget;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Copy share link by default')
      .setDesc('Copies a local file:// link after export. Public hosting is planned separately.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.copyShareLinkAfterExport)
        .onChange(async (value) => {
          this.plugin.settings.copyShareLinkAfterExport = value;
          await this.plugin.saveSettings();
        }));
  }

  private addCliPathSetting(containerEl: HTMLElement, name: string, key: 'claudePath' | 'geminiPath', placeholder: string): void {
    new Setting(containerEl)
      .setName(name)
      .setDesc('Leave blank to use the command from PATH.')
      .addText((text) => text
        .setPlaceholder(placeholder)
        .setValue(this.plugin.settings[key])
        .onChange(async (value) => {
          this.plugin.settings[key] = value.trim();
          await this.plugin.saveSettings();
        }));
  }
}
