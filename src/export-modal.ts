import { App, Modal, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import { listArtifactGoals } from './core/artifact-goals.js';
import { getProviderPrivacyNote } from './core/ai.js';
import { listExportPresets, findExportPreset, findPresetForOptions } from './core/presets.js';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ArtifactGoal, ArtifactType, ContextPackMode, ConversionMode, ExportOptions, FailurePolicy, PreviewSecurity, ReaderFeedbackMode, ShareTarget } from './types';

export class MarktlExportModal extends Modal {
  private options: ExportOptions;
  private plugin: MarktlPlugin;
  private onSubmit: (options: ExportOptions) => void;
  private selectedPreset = 'custom';
  private showAdvanced = false;

  constructor(app: App, plugin: MarktlPlugin, onSubmit: (options: ExportOptions) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.options = {
      presetId: 'custom',
      template: plugin.settings.template,
      artifactGoal: plugin.settings.artifactGoal,
      artifactType: plugin.settings.artifactType,
      aiProvider: plugin.settings.aiProvider,
      conversionMode: plugin.settings.conversionMode,
      failurePolicy: plugin.settings.failurePolicy,
      previewSecurity: plugin.settings.previewSecurity,
      contextPackMode: plugin.settings.contextPackMode,
      readerFeedbackMode: plugin.settings.readerFeedbackMode,
      shareTarget: plugin.settings.shareTarget,
      copyShareLinkAfterExport: plugin.settings.copyShareLinkAfterExport,
    };
    this.selectedPreset = findPresetForOptions(this.options);
    this.options.presetId = this.selectedPreset;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('Export note to HTML');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Choose what the HTML should do, then choose the visual style. MarkTL works best when the artifact has a job.',
    });

    this.renderPresetCards(contentEl);

    new Setting(contentEl)
      .setName('Advanced')
      .setDesc('Adjust provider, security, sharing, and exact artifact settings.')
      .addButton((button) => button
        .setButtonText(this.showAdvanced ? 'Hide advanced' : 'Show advanced')
        .onClick(() => {
          this.showAdvanced = !this.showAdvanced;
          this.onOpen();
        }));

    if (!this.showAdvanced) {
      this.renderActions(contentEl);
      return;
    }

    new Setting(contentEl)
      .setName('HTML preset')
      .setDesc('Applies sensible defaults. You can still adjust individual fields below.')
      .addDropdown((dropdown) => {
        dropdown.addOption('custom', 'Custom');
        for (const preset of listExportPresets()) {
          dropdown.addOption(preset.id, preset.name);
        }
        dropdown.setValue(this.selectedPreset).onChange((value) => {
          this.applyPreset(value);
        });
      });

    new Setting(contentEl)
      .setName('Artifact goal')
      .setDesc('The job of the HTML artifact: read, decide, review, compare, tune, explain code, or publish.')
      .addDropdown((dropdown) => {
        for (const goal of listArtifactGoals()) {
          dropdown.addOption(goal.id, goal.name);
        }
        dropdown.setValue(this.options.artifactGoal).onChange((value) => {
          this.selectedPreset = 'custom';
          this.options.presetId = 'custom';
          this.options.artifactGoal = value as ArtifactGoal;
        });
      });

    new Setting(contentEl)
      .setName('Artifact type')
      .setDesc('Defines the information architecture, not just the visual skin.')
      .addDropdown((dropdown) => dropdown
        .addOption('faithful-note', 'Faithful Note')
        .addOption('strategy-brief', 'Strategy Brief')
        .addOption('research-report', 'Research Report')
        .addOption('decision-memo', 'Decision Memo')
        .addOption('interactive-explainer', 'Interactive Explainer')
        .addOption('slide-deck', 'Slide Deck')
        .setValue(this.options.artifactType)
        .onChange((value) => {
          this.selectedPreset = 'custom';
          this.options.presetId = 'custom';
          this.options.artifactType = value as ArtifactType;
        }));

    new Setting(contentEl)
      .setName('Template')
      .setDesc('Controls the visual direction and local fallback style.')
      .addDropdown((dropdown) => {
        for (const template of listTemplates()) {
          dropdown.addOption(template.id, template.name);
        }
        dropdown.setValue(this.options.template).onChange((value) => {
          this.selectedPreset = 'custom';
          this.options.presetId = 'custom';
          this.options.template = value;
        });
      });

    new Setting(contentEl)
      .setName('AI CLI')
      .setDesc(getProviderPrivacyNote(this.options.aiProvider) || 'Only providers that passed live plugin-style execution are shown.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'None / local fallback')
        .addOption('claude', 'Claude Code CLI')
        .addOption('codex', 'Codex CLI')
        .setValue(this.options.aiProvider)
        .onChange((value) => {
          this.options.aiProvider = value as AiProvider;
          this.onOpen();
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
          this.selectedPreset = 'custom';
          this.options.presetId = 'custom';
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
          this.selectedPreset = 'custom';
          this.options.presetId = 'custom';
          this.options.previewSecurity = value as PreviewSecurity;
        }));

    new Setting(contentEl)
      .setName('Context pack')
      .setDesc('Optionally lets AI read linked Markdown notes as supporting context.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'Active note only')
        .addOption('linked-notes', 'Include linked notes')
        .setValue(this.options.contextPackMode)
        .onChange((value) => {
          this.options.contextPackMode = value as ContextPackMode;
        }));

    new Setting(contentEl)
      .setName('Reader feedback')
      .setDesc('Giscus adds GitHub login, reactions, and public comments to trusted exports.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'No reader comments')
        .addOption('giscus', 'Giscus GitHub comments')
        .setValue(this.options.readerFeedbackMode)
        .onChange((value) => {
          this.options.readerFeedbackMode = value as ReaderFeedbackMode;
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
      .setName('Share target')
      .setDesc('GitHub Pages publishes share/<slug>/index.html and copies a public URL.')
      .addDropdown((dropdown) => dropdown
        .addOption('local-link', 'Local file link')
        .addOption('static-bundle', 'Static hosting bundle')
        .addOption('github-pages', 'GitHub Pages link')
        .setValue(this.options.shareTarget)
        .onChange((value) => {
          this.options.shareTarget = value as ShareTarget;
          if (value === 'github-pages') {
            this.options.previewSecurity = 'trusted';
            this.options.readerFeedbackMode = 'giscus';
            this.options.copyShareLinkAfterExport = true;
          }
        }));

    new Setting(contentEl)
      .setName('Copy share link')
      .setDesc('Copies the public Pages URL after publish, or a local file:// link for local exports.')
      .addToggle((toggle) => toggle
        .setValue(this.options.copyShareLinkAfterExport)
        .onChange((value) => {
          this.options.copyShareLinkAfterExport = value;
        }));

    this.renderActions(contentEl);
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private renderPresetCards(container: HTMLElement): void {
    const cards = container.createDiv({ cls: 'marktl-purpose-cards' });
    const labels: Record<string, string> = {
      'readable-note': 'Read better',
      presentation: 'Present it',
      'interactive-report': 'Review it',
      'compare-options': 'Compare options',
      'shareable-article': 'Publish/share',
      playground: 'Work with AI again',
    };
    const order = ['readable-note', 'presentation', 'interactive-report', 'compare-options', 'shareable-article', 'playground'];
    for (const id of order) {
      const preset = findExportPreset(id);
      if (!preset) {
        continue;
      }
      const card = cards.createDiv({
        cls: `marktl-purpose-card${this.selectedPreset === id ? ' is-selected' : ''}`,
      });
      card.createEl('h3', { text: labels[id] || preset.name });
      card.createEl('p', { text: preset.description });
      card.createEl('span', {
        cls: 'marktl-purpose-meta',
        text: preset.previewSecurity === 'trusted' ? 'Interactive HTML' : 'Safe static HTML',
      });
      card.addEventListener('click', () => this.applyPreset(id));
    }
  }

  private applyPreset(id: string): void {
    const preset = findExportPreset(id);
    if (!preset) {
      this.selectedPreset = 'custom';
      this.options.presetId = 'custom';
      this.onOpen();
      return;
    }
    this.selectedPreset = preset.id;
    this.options.presetId = preset.id;
    this.options.artifactGoal = preset.artifactGoal as ArtifactGoal;
    this.options.artifactType = preset.artifactType as ArtifactType;
    this.options.template = preset.template;
    this.options.conversionMode = preset.mode as ConversionMode;
    this.options.previewSecurity = preset.previewSecurity as PreviewSecurity;
    this.onOpen();
  }

  private renderActions(container: HTMLElement): void {
    new Setting(container)
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
          const { presetId: _presetId, ...settings } = this.options;
          Object.assign(this.plugin.settings, settings);
          await this.plugin.saveSettings();
          this.close();
          this.onSubmit(this.options);
        }));
  }
}
