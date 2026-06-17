import { App, Modal, Notice, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import type { ArtifactGoal, ArtifactType, ConversionMode, FailurePolicy, PreviewSecurity, ReaderFeedbackMode } from './types';

const { checkClaudeProvider, checkCodexProvider } = require('./core/provider-doctor.js');

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
    this.setTitle('Flytothesky MarkTL setup');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Choose the outcome you want from your HTML artifacts. Provider setup stays optional until you need richer AI-generated output.',
    });

    const cards = contentEl.createDiv({ cls: 'marktl-setup-cards' });
    this.addSetupCard(cards, {
      title: 'Start with safe local HTML',
      body: 'Turn notes into readable local HTML with bundled images and sanitized preview. No AI setup required.',
      button: 'Use local export',
      apply: () => this.applySimpleDefaults(),
    });
    this.addSetupCard(cards, {
      title: 'Make visual AI artifacts',
      body: 'Use Claude Code CLI to reshape long notes into designed reports, explainers, and slide-like pages.',
      button: 'Use Claude',
      apply: () => this.applyClaudeDefaults(),
    });
    this.addSetupCard(cards, {
      title: 'Create interactive review surfaces',
      body: 'Use Codex CLI for HTML artifacts with review prompts, copy-back controls, and local interactivity.',
      button: 'Use Codex',
      apply: () => this.applyCodexDefaults(),
    });
    this.addSetupCard(cards, {
      title: 'Publish public links',
      body: 'Prepare GitHub Pages-ready bundles with share links and optional Giscus reader feedback.',
      button: 'Prepare sharing',
      apply: () => this.applyBundleDefaults(),
    });

    this.doctorEl = contentEl.createDiv({ cls: 'marktl-doctor-box' });
    this.renderDoctorIdle();

    const agentBox = contentEl.createDiv({ cls: 'marktl-agent-setup-box' });
    agentBox.createEl('h3', { text: 'Agent-assisted setup' });
    agentBox.createEl('p', {
      text: 'If you use Codex or Claude Code, copy a setup prompt and let your coding agent configure BRAT, MarkTL, GitHub Pages, and Giscus with you.',
    });
    new Setting(agentBox)
      .addButton((button) => button
        .setButtonText('Copy Codex setup prompt')
        .onClick(() => this.copyAgentPrompt('codex')))
      .addButton((button) => button
        .setButtonText('Copy Claude setup prompt')
        .onClick(() => this.copyAgentPrompt('claude')));

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText('Check Claude CLI')
        .onClick(() => {
          void this.runDoctor('claude');
        }))
      .addButton((button) => button
        .setButtonText('Check Codex CLI')
        .onClick(() => {
          void this.runDoctor('codex');
        }))
      .addButton((button) => button
        .setButtonText('Finish setup')
        .setCta()
        .onClick(async () => {
          this.plugin.settings.setupCompleted = true;
          await this.plugin.saveSettings();
          this.close();
          new Notice('Flytothesky MarkTL setup saved.');
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
    await this.runDoctor('claude');
  }

  private async applyCodexDefaults(): Promise<void> {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: 'codex',
      artifactGoal: 'review' as ArtifactGoal,
      artifactType: 'interactive-explainer' as ArtifactType,
      template: 'interactive-report',
      conversionMode: 'presentation' as ConversionMode,
      previewSecurity: 'trusted' as PreviewSecurity,
      shareTarget: 'local-link',
    });
    await this.plugin.saveSettings();
    await this.runDoctor('codex');
  }

  private async applyBundleDefaults(): Promise<void> {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: this.plugin.settings.aiProvider,
      artifactGoal: 'publish' as ArtifactGoal,
      artifactType: 'research-report' as ArtifactType,
      template: 'editorial',
      conversionMode: 'blog' as ConversionMode,
      failurePolicy: 'strict' as FailurePolicy,
      previewSecurity: 'trusted' as PreviewSecurity,
      readerFeedbackMode: 'giscus' as ReaderFeedbackMode,
      shareTarget: 'github-pages',
      copyShareLinkAfterExport: true,
    });
    await this.plugin.saveSettings();
  }

  private async copyAgentPrompt(agent: 'codex' | 'claude'): Promise<void> {
    const prompt = buildAgentSetupPrompt(agent);
    await navigator.clipboard.writeText(prompt);
    new Notice(`${agent === 'codex' ? 'Codex' : 'Claude'} setup prompt copied.`);
  }

  private renderDoctorIdle(): void {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl('strong', { text: 'AI CLI doctor' });
    this.doctorEl.createEl('p', {
      text: 'Optional. Checks whether Claude Code CLI or Codex CLI is installed and logged in.',
    });
  }

  private async runDoctor(provider: 'claude' | 'codex' = 'claude'): Promise<void> {
    if (!this.doctorEl) {
      return;
    }
    const label = provider === 'codex' ? 'Codex CLI' : 'Claude CLI';
    this.doctorEl.empty();
    this.doctorEl.createEl('strong', { text: `Checking ${label}...` });
    const result = provider === 'codex' ? await checkCodexProvider({
      command: this.plugin.settings.codexPath || 'codex',
      timeoutMs: 15000,
    }) : await checkClaudeProvider({
      command: this.plugin.settings.claudePath || 'claude',
      timeoutMs: 15000,
    });
    this.doctorEl.empty();
    this.doctorEl.toggleClass('marktl-doctor-ok', result.ok);
    this.doctorEl.toggleClass('marktl-doctor-error', !result.ok);
    this.doctorEl.createEl('strong', {
      text: result.ok ? `${label} is ready` : `${label} needs attention`,
    });
    this.doctorEl.createEl('p', { text: result.message });
    if (result.version) {
      this.doctorEl.createEl('code', { text: result.version });
    }
  }
}

function buildAgentSetupPrompt(agent: 'codex' | 'claude'): string {
  const agentName = agent === 'codex' ? 'Codex' : 'Claude Code';
  return [
    `You are helping me set up the MarkTL Obsidian plugin using ${agentName}.`,
    '',
    'Goal:',
    '- Install Flytothesky MarkTL through BRAT from https://github.com/flytothesky23/marktl.',
    '- Configure MarkTL so an Obsidian Markdown note can be exported to a GitHub Pages HTML link.',
    '- Make the exported page comment-ready with Giscus GitHub comments.',
    '',
    'Please guide me step by step. Do not ask for secrets unless needed, and never print my GitHub token back to me.',
    '',
    'Target MarkTL settings:',
    '- Share target: GitHub Pages link',
    '- Preview/export: Trusted interactive preview',
    '- Reader feedback: Giscus GitHub comments',
    '- Copy share link by default: enabled',
    '- GitHub repository: owner/repo for my Pages repository',
    '- GitHub branch: main',
    '- GitHub Pages base URL: https://owner.github.io/repo',
    '- Publish path: marktl',
    '- GitHub token: fine-grained token limited to the Pages repo with Contents read/write',
    '- Giscus repository: owner/repo with Discussions enabled',
    '- Giscus category: Announcements or General',
    '- Giscus repo ID and category ID: values from https://giscus.app',
    '',
    'Checklist:',
    '1. Confirm BRAT has installed and enabled MarkTL.',
    '2. Confirm the Pages repository exists and GitHub Pages is enabled for the target branch.',
    '3. Confirm the token has Contents read/write only for that repository.',
    '4. Confirm Giscus is enabled and the repo/category IDs are filled.',
    '5. Export one test note with GitHub Pages link selected.',
    '6. Verify the result modal shows a short public link and archive link.',
    '7. Open the public link and verify the Sign in with GitHub button and Giscus comment box appear.',
    '',
    'If anything fails, diagnose the exact missing setting instead of guessing.',
  ].join('\n');
}
