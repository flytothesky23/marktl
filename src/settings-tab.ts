import { App, PluginSettingTab, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ArtifactType, ContextPackMode, ConversionMode, FailurePolicy, PreviewSecurity, ReaderFeedbackMode, ShareTarget } from './types';

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
      .setName('Setup wizard')
      .setDesc('Guided setup for local export, Claude AI conversion, and share-ready bundles.')
      .addButton((button) => button
        .setButtonText('Open setup')
        .setCta()
        .onClick(() => {
          this.plugin.openSetupWizard();
        }));

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
      .setName('Context pack')
      .setDesc('Linked notes mode gives AI extra vault context from Markdown links and wikilinks.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'Active note only')
        .addOption('linked-notes', 'Include linked notes')
        .setValue(this.plugin.settings.contextPackMode)
        .onChange(async (value) => {
          this.plugin.settings.contextPackMode = value as ContextPackMode;
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
      .setDesc('Maximum AI CLI runtime in milliseconds. Rich HTML artifacts can take 2-5 minutes.')
      .addText((text) => text
        .setPlaceholder('300000')
        .setValue(String(this.plugin.settings.timeoutMs))
        .onChange(async (value) => {
          const parsed = Number(value);
          this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 300000;
          await this.plugin.saveSettings();
        }));

    this.addCliPathSetting(containerEl, 'Claude Code CLI path', 'claudePath', 'claude');

    new Setting(containerEl)
      .setName('Share target')
      .setDesc('GitHub Pages publishes the generated bundle and copies a public URL.')
      .addDropdown((dropdown) => dropdown
        .addOption('local-link', 'Local file link')
        .addOption('static-bundle', 'Static hosting bundle')
        .addOption('github-pages', 'GitHub Pages link')
        .setValue(this.plugin.settings.shareTarget)
        .onChange(async (value) => {
          this.plugin.settings.shareTarget = value as ShareTarget;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h3', { text: 'Reader feedback' });
    containerEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Giscus uses GitHub Discussions for public comments. It requires trusted exports because it loads the Giscus script.',
    });

    new Setting(containerEl)
      .setName('Reader feedback mode')
      .setDesc('Adds a GitHub login/comment box to exported HTML when configured.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'None')
        .addOption('giscus', 'Giscus GitHub comments')
        .setValue(this.plugin.settings.readerFeedbackMode)
        .onChange(async (value) => {
          this.plugin.settings.readerFeedbackMode = value as ReaderFeedbackMode;
          await this.plugin.saveSettings();
        }));

    this.addTextSetting(containerEl, 'Giscus repository', 'owner/repo where GitHub Discussions are enabled.', 'giscusRepo', 'reallygood83/moondoc');
    this.addTextSetting(containerEl, 'Giscus repository ID', 'Repository ID from giscus.app.', 'giscusRepoId', 'R_...');
    this.addTextSetting(containerEl, 'Giscus category', 'Discussion category name, for example Announcements or General.', 'giscusCategory', 'Announcements');
    this.addTextSetting(containerEl, 'Giscus category ID', 'Discussion category ID from giscus.app.', 'giscusCategoryId', 'DIC_...');
    this.addTextSetting(containerEl, 'Giscus mapping', 'Discussion mapping strategy. Usually pathname for GitHub Pages.', 'giscusMapping', 'pathname');
    this.addTextSetting(containerEl, 'Giscus theme', 'Theme name such as preferred_color_scheme, light, dark.', 'giscusTheme', 'preferred_color_scheme');

    containerEl.createEl('h3', { text: 'GitHub Pages publishing' });
    containerEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Used only when Share target is GitHub Pages link. Tokens are stored in this plugin data file, so use a fine-grained token limited to the share repository.',
    });

    this.addTextSetting(containerEl, 'GitHub repository', 'owner/repo for the Pages repository.', 'githubRepo', 'reallygood83/marktl-shares');
    this.addTextSetting(containerEl, 'GitHub branch', 'Branch to write files to.', 'githubBranch', 'main');
    this.addTextSetting(containerEl, 'GitHub Pages base URL', 'Public Pages root URL. Leave blank to infer https://owner.github.io/repo.', 'githubPagesBaseUrl', 'https://reallygood83.github.io/marktl-shares');
    this.addTextSetting(containerEl, 'Publish path', 'Folder path inside the repository. Exports go to <path>/<slug>/index.html.', 'githubPublishPath', 'marktl');
    this.addTextSetting(containerEl, 'Share home title', 'Title for the generated index page that lists published exports.', 'githubShareHomeTitle', 'MarkTL Shared HTML');
    this.addTextSetting(containerEl, 'GitHub token', 'Fine-grained token with Contents read/write permission for the repository.', 'githubToken', 'github_pat_...', true);

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

  private addCliPathSetting(containerEl: HTMLElement, name: string, key: 'claudePath', placeholder: string): void {
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

  private addTextSetting(
    containerEl: HTMLElement,
    name: string,
    description: string,
    key: 'githubRepo' | 'githubBranch' | 'githubPagesBaseUrl' | 'githubPublishPath' | 'githubShareHomeTitle' | 'githubToken' | 'giscusRepo' | 'giscusRepoId' | 'giscusCategory' | 'giscusCategoryId' | 'giscusMapping' | 'giscusTheme',
    placeholder: string,
    password = false,
  ): void {
    new Setting(containerEl)
      .setName(name)
      .setDesc(description)
      .addText((text) => {
        text
          .setPlaceholder(placeholder)
          .setValue(this.plugin.settings[key])
          .onChange(async (value) => {
            this.plugin.settings[key] = value.trim();
            await this.plugin.saveSettings();
          });
        if (password) {
          text.inputEl.type = 'password';
        }
      });
  }
}
