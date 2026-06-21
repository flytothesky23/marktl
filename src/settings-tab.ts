import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type MarktlPlugin from './main';
import { listArtifactGoals } from './core/artifact-goals.js';
import { applySelectionProfile, listExportDepths, listExportGenres, listExportPurposes } from './core/export-profiles.js';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ArtifactGoal, ArtifactType, ContextPackMode, ConversionMode, ExportDepth, ExportGenre, ExportPurpose, FailurePolicy, PreviewSecurity, ReaderFeedbackMode, ShareHomeProfile, ShareTarget } from './types';

const { inferPagesBaseUrl } = require('./core/github-pages.js');
const { buildGiscusSetupChecklist, buildPagesSetupChecklist } = require('./core/setup-guidance.js');
const { createShareHomeProfile, describeShareHomeProfile, normalizeShareHomeProfiles, resolveShareHomeProfile } = require('./core/share-home-profiles.js');

export class MarktlSettingTab extends PluginSettingTab {
  plugin: MarktlPlugin;

  constructor(app: App, plugin: MarktlPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Flytothesky MarkTL HTML Exporter' });

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

    this.renderShareHomeSettings(containerEl);

    containerEl.createEl('h3', { text: 'Note to HTML 기본 선택' });
    containerEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Export modal 첫 화면의 장르, 깊이, 목적, 기준 맥락 노트 기본값입니다.',
    });

    new Setting(containerEl)
      .setName('문서 장르')
      .setDesc('기본 HTML 장르입니다.')
      .addDropdown((dropdown) => {
        for (const genre of listExportGenres()) {
          dropdown.addOption(genre.id, genre.label);
        }
        dropdown.setValue(this.plugin.settings.exportGenre).onChange(async (value) => {
          await this.applyDefaultSelection({ exportGenre: value as ExportGenre });
        });
      });

    new Setting(containerEl)
      .setName('작성 깊이')
      .setDesc('결과물의 밀도와 시각화 강도를 정합니다.')
      .addDropdown((dropdown) => {
        for (const depth of listExportDepths()) {
          dropdown.addOption(depth.id, depth.label);
        }
        dropdown.setValue(this.plugin.settings.exportDepth).onChange(async (value) => {
          await this.applyDefaultSelection({ exportDepth: value as ExportDepth });
        });
      });

    new Setting(containerEl)
      .setName('사용 목적')
      .setDesc('독자와 문체, 다음 행동을 정합니다.')
      .addDropdown((dropdown) => {
        for (const purpose of listExportPurposes()) {
          dropdown.addOption(purpose.id, purpose.label);
        }
        dropdown.setValue(this.plugin.settings.exportPurpose).onChange(async (value) => {
          await this.applyDefaultSelection({ exportPurpose: value as ExportPurpose });
        });
      });

    new Setting(containerEl)
      .setName('기준 맥락 노트 경로')
      .setDesc('선택 사항입니다. 비워두면 현재 노트만 사용합니다.')
      .addText((text) => text
        .setPlaceholder('예: 프로젝트/기준 회의록 또는 이전 종합노트.md')
        .setValue(this.plugin.settings.referenceContextNotePath)
        .onChange(async (value) => {
          this.plugin.settings.referenceContextNotePath = value.trim();
          this.plugin.settings.contextPackMode = this.plugin.settings.referenceContextNotePath ? 'reference-note' : 'none';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Artifact goal')
      .setDesc('Default job for the HTML artifact: read, decide, review, compare, tune, explain code, or publish.')
      .addDropdown((dropdown) => {
        for (const goal of listArtifactGoals()) {
          dropdown.addOption(goal.id, goal.name);
        }
        dropdown
          .setValue(this.plugin.settings.artifactGoal)
          .onChange(async (value) => {
            this.plugin.settings.artifactGoal = value as ArtifactGoal;
            await this.plugin.saveSettings();
          });
      });

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
        .addOption('codex', 'Codex CLI')
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
      .setDesc('Reference note mode gives AI the user-selected baseline context. Linked notes remains for compatibility.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', 'Active note only')
        .addOption('reference-note', 'Use selected reference note')
        .addOption('linked-notes', 'Include linked notes')
        .setValue(this.plugin.settings.contextPackMode)
        .onChange(async (value) => {
          this.plugin.settings.contextPackMode = value as ContextPackMode;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('AI failure policy')
      .setDesc('Fallback creates local HTML with a warning. Strict stops generation. GitHub Pages always requires strict AI success.')
      .addDropdown((dropdown) => dropdown
        .addOption('fallback', 'Fallback with warning')
        .addOption('strict', 'Stop on AI failure')
        .setValue(this.plugin.settings.failurePolicy)
        .onChange(async (value) => {
          this.plugin.settings.failurePolicy = this.plugin.settings.shareTarget === 'github-pages' && value === 'fallback'
            ? 'strict'
            : value as FailurePolicy;
          await this.plugin.saveSettings();
          if (this.plugin.settings.shareTarget === 'github-pages' && value === 'fallback') {
            new Notice('GitHub Pages export requires strict AI success. Fallback was not enabled.');
            this.display();
          }
        }));

    new Setting(containerEl)
      .setName('CLI timeout')
      .setDesc('Maximum AI CLI runtime in milliseconds. Rich HTML artifacts can take 5-15 minutes on long notes.')
      .addText((text) => text
        .setPlaceholder('900000')
        .setValue(String(this.plugin.settings.timeoutMs))
        .onChange(async (value) => {
          const parsed = Number(value);
          this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 900000;
          await this.plugin.saveSettings();
        }));

    this.addCliPathSetting(containerEl, 'Claude Code CLI path', 'claudePath', 'claude');
    this.addCliPathSetting(containerEl, 'Codex CLI path', 'codexPath', 'codex');

    new Setting(containerEl)
      .setName('Share target')
      .setDesc('GitHub Pages publishes only after successful AI conversion. Fallback HTML is never published.')
      .addDropdown((dropdown) => dropdown
        .addOption('local-link', 'Local file link')
        .addOption('static-bundle', 'Static hosting bundle')
        .addOption('github-pages', 'GitHub Pages link')
        .setValue(this.plugin.settings.shareTarget)
        .onChange(async (value) => {
          this.plugin.settings.shareTarget = value as ShareTarget;
          if (value === 'github-pages' && this.plugin.settings.failurePolicy !== 'strict') {
            this.plugin.settings.failurePolicy = 'strict';
            new Notice('GitHub Pages export now uses strict AI failure policy.');
          }
          await this.plugin.saveSettings();
          if (value === 'github-pages') {
            this.display();
          }
        }));

    containerEl.createEl('h3', { text: 'Reader feedback' });
    containerEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'Giscus uses GitHub Discussions for public comments. It requires trusted exports because it loads the Giscus script.',
    });

    new Setting(containerEl)
      .setName('Giscus setup helper')
      .setDesc('Install the Giscus GitHub App first, then use giscus.app to get repository ID and category ID.')
      .addButton((button) => button
        .setButtonText('Install Giscus app')
        .onClick(() => {
          window.open('https://github.com/apps/giscus', '_blank', 'noopener,noreferrer');
        }))
      .addButton((button) => button
        .setButtonText('Open giscus.app')
        .onClick(() => {
          window.open('https://giscus.app', '_blank', 'noopener,noreferrer');
        }))
      .addButton((button) => button
        .setButtonText('Copy checklist')
        .onClick(async () => {
          await navigator.clipboard.writeText(buildGiscusSetupChecklist(this.plugin.settings));
          new Notice('Giscus setup checklist copied.');
        }));

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

    new Setting(containerEl)
      .setName('GitHub Pages setup helper')
      .setDesc('For owner/repo, the usual Pages URL is https://owner.github.io/repo. The final page becomes <base>/<publish path>/<slug>/.')
      .addButton((button) => button
        .setButtonText('Create token')
        .onClick(() => {
          window.open('https://github.com/settings/personal-access-tokens/new', '_blank', 'noopener,noreferrer');
        }))
      .addButton((button) => button
        .setButtonText('Fill base URL')
        .onClick(async () => {
          const inferred = inferPagesBaseUrl(this.plugin.settings.githubRepo);
          if (!inferred) {
            new Notice('Enter GitHub repository as owner/repo first.');
            return;
          }
          this.plugin.settings.githubPagesBaseUrl = inferred;
          await this.plugin.saveSettings();
          this.display();
          new Notice(`GitHub Pages base URL set to ${inferred}`);
        }))
      .addButton((button) => button
        .setButtonText('Copy checklist')
        .onClick(async () => {
          await navigator.clipboard.writeText(buildPagesSetupChecklist(this.plugin.settings));
          new Notice('GitHub Pages setup checklist copied.');
        }));

    this.addTextSetting(containerEl, 'GitHub repository', 'owner/repo for the Pages repository.', 'githubRepo', 'reallygood83/marktl-shares');
    this.addTextSetting(containerEl, 'GitHub branch', 'Branch to write files to.', 'githubBranch', 'main');
    this.addTextSetting(containerEl, 'GitHub Pages base URL', 'Public Pages root URL. Leave blank to infer https://owner.github.io/repo.', 'githubPagesBaseUrl', 'https://reallygood83.github.io/marktl-shares');
    this.addTextSetting(containerEl, 'GitHub token', 'Fine-grained token with Contents read/write permission for the repository.', 'githubToken', 'github_pat_...', true);

    new Setting(containerEl)
      .setName('Copy share link by default')
      .setDesc('Copies the public GitHub Pages URL after publish, or a local file:// link for local exports.')
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.copyShareLinkAfterExport)
        .onChange(async (value) => {
          this.plugin.settings.copyShareLinkAfterExport = value;
          await this.plugin.saveSettings();
        }));
  }

  private renderShareHomeSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: '공유 허브' });
    containerEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: '허브는 공유 메인페이지입니다. 내보내기 첫 화면에서 허브를 먼저 고르면, 생성된 HTML은 선택한 허브의 서브페이지와 인덱스에 등록됩니다.',
    });

    const profiles = normalizeShareHomeProfiles(this.plugin.settings.shareHomeProfiles, this.plugin.settings) as ShareHomeProfile[];
    const activeProfile = resolveShareHomeProfile(this.plugin.settings, this.plugin.settings.activeShareHomeProfileId) as ShareHomeProfile;
    this.plugin.settings.shareHomeProfiles = profiles;
    this.plugin.settings.activeShareHomeProfileId = activeProfile.id;

    new Setting(containerEl)
      .setName('기본 공유 허브')
      .setDesc('Export modal에서 처음 선택되어 있을 허브입니다.')
      .addDropdown((dropdown) => {
        for (const profile of profiles) {
          dropdown.addOption(profile.id, profile.title);
        }
        dropdown.setValue(activeProfile.id).onChange(async (value) => {
          await this.setActiveShareHomeProfile(value);
        });
      })
      .addButton((button) => button
        .setButtonText('새 허브 추가')
        .onClick(async () => {
          const next = createShareHomeProfile(profiles) as ShareHomeProfile;
          this.plugin.settings.shareHomeProfiles = [...profiles, next];
          await this.setActiveShareHomeProfile(next.id);
          new Notice('새 공유 허브를 추가했습니다. 명칭과 게시 경로를 수정하세요.');
        }));

    const description = describeShareHomeProfile(activeProfile, this.plugin.settings);
    const card = containerEl.createDiv({ cls: 'marktl-settings-card' });
    card.createEl('h4', { text: `선택 허브: ${activeProfile.title}` });
    card.createEl('p', {
      cls: 'marktl-settings-muted',
      text: description.homeUrl
        ? `게시 홈: ${description.homeUrl}`
        : `게시 경로: ${description.pathLabel}`,
    });

    this.addShareHomeProfileText(card, '허브 명칭', '메인페이지 H1과 선택 카드에 표시됩니다.', 'title', activeProfile);
    this.addShareHomeProfileText(card, '게시 경로', 'GitHub Pages 저장소 안의 폴더입니다. 예: marktl/jisu, marktl/work, marktl/research', 'basePath', activeProfile);
    this.addShareHomeProfileText(card, '상단 배지', '메인페이지 왼쪽 위 작은 분류명입니다.', 'eyebrow', activeProfile);
    this.addShareHomeProfileText(card, '허브 설명', '메인페이지 H1 아래 설명문입니다.', 'description', activeProfile);

    new Setting(card)
      .setName('선택 허브 삭제')
      .setDesc('최소 하나의 허브는 남겨야 합니다. 삭제해도 이미 GitHub Pages에 올라간 파일은 자동 삭제되지 않습니다.')
      .addButton((button) => {
        button.setButtonText('삭제');
        if (profiles.length <= 1) {
          button.setDisabled(true);
        }
        button.onClick(async () => {
          if (profiles.length <= 1) {
            return;
          }
          const remaining = profiles.filter((profile) => profile.id !== activeProfile.id);
          this.plugin.settings.shareHomeProfiles = remaining;
          this.plugin.settings.activeShareHomeProfileId = remaining[0]?.id || '';
          await this.plugin.saveSettings();
          this.display();
          new Notice('공유 허브를 삭제했습니다.');
        });
      });
  }

  private async setActiveShareHomeProfile(profileId: string, refresh = true): Promise<void> {
    const profiles = normalizeShareHomeProfiles(this.plugin.settings.shareHomeProfiles, this.plugin.settings) as ShareHomeProfile[];
    const active = profiles.find((profile) => profile.id === profileId) || profiles[0];
    this.plugin.settings.shareHomeProfiles = profiles;
    this.plugin.settings.activeShareHomeProfileId = active?.id || '';
    if (active) {
      this.plugin.settings.githubPublishPath = active.basePath;
      this.plugin.settings.githubShareHomeTitle = active.title;
    }
    await this.plugin.saveSettings();
    if (refresh) {
      this.display();
    }
  }

  private addShareHomeProfileText(containerEl: HTMLElement, name: string, description: string, key: 'title' | 'basePath' | 'eyebrow' | 'description', activeProfile: ShareHomeProfile): void {
    new Setting(containerEl)
      .setName(name)
      .setDesc(description)
      .addText((text) => text
        .setValue(activeProfile[key])
        .onChange(async (value) => {
          await this.patchActiveShareHomeProfile({ [key]: value.trim() } as Partial<ShareHomeProfile>);
        }));
  }

  private async patchActiveShareHomeProfile(patch: Partial<ShareHomeProfile>): Promise<void> {
    const profiles = normalizeShareHomeProfiles(this.plugin.settings.shareHomeProfiles, this.plugin.settings) as ShareHomeProfile[];
    const activeId = this.plugin.settings.activeShareHomeProfileId || profiles[0]?.id || '';
    const index = profiles.findIndex((profile) => profile.id === activeId);
    if (index < 0) {
      return;
    }
    const nextProfiles = profiles.slice();
    nextProfiles[index] = {
      ...nextProfiles[index],
      ...patch,
    };
    const normalized = normalizeShareHomeProfiles(nextProfiles, this.plugin.settings) as ShareHomeProfile[];
    const active = normalized.find((profile) => profile.id === activeId) || normalized[index] || normalized[0];
    this.plugin.settings.shareHomeProfiles = normalized;
    this.plugin.settings.activeShareHomeProfileId = active?.id || '';
    if (active) {
      this.plugin.settings.githubPublishPath = active.basePath;
      this.plugin.settings.githubShareHomeTitle = active.title;
    }
    await this.plugin.saveSettings();
  }

  private async applyDefaultSelection(partial: Partial<{ exportGenre: ExportGenre; exportDepth: ExportDepth; exportPurpose: ExportPurpose }>): Promise<void> {
    const next = applySelectionProfile({
      ...this.plugin.settings,
      ...partial,
    }, {
      ...this.plugin.settings,
      ...partial,
    });
    Object.assign(this.plugin.settings, next);
    await this.plugin.saveSettings();
    this.display();
  }

  private addCliPathSetting(containerEl: HTMLElement, name: string, key: 'claudePath' | 'codexPath', placeholder: string): void {
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
