import { App, FuzzySuggestModal, Modal, Notice, Setting, TFile } from 'obsidian';
import type MarktlPlugin from './main';
import { listArtifactGoals } from './core/artifact-goals.js';
import { getProviderPrivacyNote } from './core/ai.js';
import { applySelectionProfile, describeExecutionProfile, listExportDepths, listExportGenres, listExportPurposes } from './core/export-profiles.js';
import { listTemplates } from './core/templates.js';
import type { AiProvider, ArtifactGoal, ArtifactType, ContextPackMode, ConversionMode, ExportDepth, ExportGenre, ExportOptions, ExportPurpose, FailurePolicy, PreviewSecurity, ReaderFeedbackMode, ShareHomeProfile, ShareTarget } from './types';

const { createShareHomeProfile, describeShareHomeProfile, normalizeShareHomeProfiles, resolveShareHomeProfile } = require('./core/share-home-profiles.js');

type ChoiceItem = {
  id: string;
  label: string;
  description: string;
};

class ReferenceNoteSuggestModal extends FuzzySuggestModal<TFile> {
  private onChoose: (file: TFile) => void;

  constructor(app: App, onChoose: (file: TFile) => void) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder('기준 맥락으로 사용할 Markdown 노트를 선택하세요');
    this.emptyStateText = '선택할 Markdown 노트가 없습니다.';
  }

  getItems(): TFile[] {
    return this.app.vault.getMarkdownFiles()
      .slice()
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  onChooseItem(item: TFile): void {
    this.onChoose(item);
  }
}

class ShareHomeProfileEditModal extends Modal {
  private draft: ShareHomeProfile;
  private mode: 'create' | 'edit';
  private onSave: (profile: ShareHomeProfile) => void;
  private profiles: ShareHomeProfile[];

  constructor(app: App, mode: 'create' | 'edit', profile: ShareHomeProfile, profiles: ShareHomeProfile[], onSave: (profile: ShareHomeProfile) => void) {
    super(app);
    this.mode = mode;
    this.draft = { ...profile };
    this.profiles = profiles;
    this.onSave = onSave;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle(this.mode === 'create' ? '공유 허브 만들기' : '공유 허브 수정');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: '허브는 공유 메인페이지입니다. 게시 경로가 다르면 프로젝트나 업무 분야별로 별도의 메인페이지와 서브페이지 묶음을 운영할 수 있습니다.',
    });

    new Setting(contentEl)
      .setName('허브 명칭')
      .setDesc('선택 카드와 메인페이지 제목에 표시됩니다.')
      .addText((text) => text
        .setPlaceholder('예: 유네코 지수 통합선별공장 프로젝트')
        .setValue(this.draft.title)
        .onChange((value) => {
          this.draft.title = value;
        }));

    new Setting(contentEl)
      .setName('게시 경로')
      .setDesc('GitHub Pages 저장소 안의 폴더입니다. 예: marktl, marktl/work, marktl/research')
      .addText((text) => text
        .setPlaceholder('marktl/project')
        .setValue(this.draft.basePath)
        .onChange((value) => {
          this.draft.basePath = value;
        }));

    new Setting(contentEl)
      .setName('상단 배지')
      .setDesc('메인페이지 왼쪽 위 작은 분류명입니다.')
      .addText((text) => text
        .setPlaceholder('예: Project Archive')
        .setValue(this.draft.eyebrow)
        .onChange((value) => {
          this.draft.eyebrow = value;
        }));

    new Setting(contentEl)
      .setName('허브 설명')
      .setDesc('메인페이지 H1 아래 설명문입니다.')
      .addTextArea((text) => {
        text.inputEl.rows = 3;
        text
          .setPlaceholder('이 허브에서 관리할 문서 범위와 목적을 적어주세요.')
          .setValue(this.draft.description)
          .onChange((value) => {
            this.draft.description = value;
          });
      });

    new Setting(contentEl)
      .addButton((button) => button
        .setButtonText('취소')
        .onClick(() => this.close()))
      .addButton((button) => button
        .setButtonText(this.mode === 'create' ? '허브 만들기' : '수정 저장')
        .setCta()
        .onClick(() => this.save()));
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private save(): void {
    if (!this.draft.title.trim()) {
      new Notice('공유 허브 명칭을 입력하세요.');
      return;
    }

    const [candidate] = normalizeShareHomeProfiles([this.draft], {}) as ShareHomeProfile[];
    const hasDuplicatePath = this.profiles.some((profile) => {
      if (profile.id === candidate.id) {
        return false;
      }
      const [normalized] = normalizeShareHomeProfiles([profile], {}) as ShareHomeProfile[];
      return normalized.basePath === candidate.basePath;
    });

    if (hasDuplicatePath) {
      new Notice('같은 게시 경로를 사용하는 공유 허브가 이미 있습니다.');
      return;
    }

    this.onSave(candidate);
    this.close();
  }
}

export class MarktlExportModal extends Modal {
  private options: ExportOptions;
  private plugin: MarktlPlugin;
  private onSubmit: (options: ExportOptions) => void;
  private onUploadHtml: (options: ExportOptions, includeThumbnail?: boolean) => void;
  private showAdvanced = false;

  constructor(app: App, plugin: MarktlPlugin, onSubmit: (options: ExportOptions) => void, onUploadHtml: (options: ExportOptions, includeThumbnail?: boolean) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.onUploadHtml = onUploadHtml;
    this.modalEl.addClass('marktl-export-modal');
    const baseOptions: ExportOptions = {
      presetId: 'custom',
      shareHomeProfileId: plugin.settings.activeShareHomeProfileId,
      template: plugin.settings.template,
      artifactGoal: plugin.settings.artifactGoal,
      artifactType: plugin.settings.artifactType,
      exportGenre: plugin.settings.exportGenre,
      exportDepth: plugin.settings.exportDepth,
      exportPurpose: plugin.settings.exportPurpose,
      referenceContextNotePath: plugin.settings.referenceContextNotePath,
      aiProvider: plugin.settings.aiProvider,
      conversionMode: plugin.settings.conversionMode,
      failurePolicy: plugin.settings.failurePolicy,
      previewSecurity: plugin.settings.previewSecurity,
      contextPackMode: plugin.settings.contextPackMode,
      readerFeedbackMode: plugin.settings.readerFeedbackMode,
      shareTarget: plugin.settings.shareTarget,
      copyShareLinkAfterExport: plugin.settings.copyShareLinkAfterExport,
    };
    this.options = applySelectionProfile(baseOptions, baseOptions) as ExportOptions;
    this.options.presetId = 'custom';
    this.options.referenceContextNotePath = baseOptions.referenceContextNotePath;
    this.options.contextPackMode = baseOptions.contextPackMode === 'reference-note' && baseOptions.referenceContextNotePath
      ? 'reference-note'
      : baseOptions.contextPackMode === 'linked-notes'
        ? 'linked-notes'
        : 'none';
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle('노트를 HTML로 내보내기');

    contentEl.createEl('p', {
      cls: 'marktl-modal-intro',
      text: 'HTML 품질에 직접 영향을 주는 선택만 먼저 정합니다. 세부 실행·공유 옵션은 기타 설정에서 조정할 수 있습니다.',
    });

    this.renderShareHomeSelector(contentEl);
    this.renderDirectHtmlUpload(contentEl);
    this.renderDecisionRail(contentEl);
    this.renderContextSelector(contentEl);
    this.renderExecutionSummary(contentEl);

    new Setting(contentEl)
      .setName('기타 설정')
      .setDesc('AI CLI, 실패 처리, 보안, 댓글, 공유 대상처럼 자주 바꾸지 않는 실행 옵션입니다.')
      .addButton((button) => button
        .setButtonText(this.showAdvanced ? '기타 설정 숨기기' : '기타 설정 열기')
        .onClick(() => {
          this.showAdvanced = !this.showAdvanced;
          this.onOpen();
        }));

    if (this.showAdvanced) {
      this.renderAdvanced(contentEl);
    }

    this.renderActions(contentEl);
  }

  private renderDirectHtmlUpload(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'marktl-choice-section marktl-html-upload-section' });
    const header = section.createDiv({ cls: 'marktl-choice-header' });
    header.createEl('span', { cls: 'marktl-choice-step marktl-choice-step-hub', text: 'HTML' });
    const copy = header.createDiv();
    copy.createEl('h3', { text: '완성 HTML 바로 업로드' });
    copy.createEl('p', { text: '이미 만든 HTML 파일을 선택한 공유 허브의 서브페이지로 바로 게시합니다. 노트 변환과 AI 실행은 건너뜁니다.' });

    const actions = section.createDiv({ cls: 'marktl-reference-row marktl-html-upload-row' });
    actions.createEl('span', {
      text: '단일 HTML 파일 기준입니다. 대표 썸네일은 허브 카드에만 쓰이며, HTML 안의 상대 경로 이미지·CSS·JS는 함께 묶이지 않습니다.',
    });
    actions.createEl('button', { text: 'HTML만 업로드', type: 'button' })
      .addEventListener('click', () => {
        this.close();
        this.onUploadHtml(this.options, false);
      });
    actions.createEl('button', { text: 'HTML + 썸네일 업로드', type: 'button' })
      .addEventListener('click', () => {
        this.close();
        this.onUploadHtml(this.options, true);
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private renderDecisionRail(container: HTMLElement): void {
    const rail = container.createDiv({ cls: 'marktl-decision-rail' });
    this.renderChoiceGroup(rail, '1', '문서 장르', '노트의 큰 성격을 정합니다.', listExportGenres(), this.options.exportGenre, (value) => {
      this.applyPrimarySelection({ exportGenre: value as ExportGenre });
    });
    this.renderChoiceGroup(rail, '2', '작성 깊이', '결과물의 밀도와 필수 섹션을 정합니다.', listExportDepths(), this.options.exportDepth, (value) => {
      this.applyPrimarySelection({ exportDepth: value as ExportDepth });
    });
    this.renderChoiceGroup(rail, '3', '사용 목적', '독자와 문체, 다음 행동을 정합니다.', listExportPurposes(), this.options.exportPurpose, (value) => {
      this.applyPrimarySelection({ exportPurpose: value as ExportPurpose });
    });
  }

  private renderShareHomeSelector(container: HTMLElement): void {
    const profiles = normalizeShareHomeProfiles(this.plugin.settings.shareHomeProfiles, this.plugin.settings) as ShareHomeProfile[];
    const selectedProfile = resolveShareHomeProfile({
      ...this.plugin.settings,
      shareHomeProfiles: profiles,
      activeShareHomeProfileId: this.options.shareHomeProfileId,
    }, this.options.shareHomeProfileId) as ShareHomeProfile;
    this.options.shareHomeProfileId = selectedProfile.id;

    const section = container.createDiv({ cls: 'marktl-choice-section marktl-hub-section' });
    const header = section.createDiv({ cls: 'marktl-choice-header' });
    header.createEl('span', { cls: 'marktl-choice-step marktl-choice-step-hub', text: '허브' });
    const copy = header.createDiv();
    copy.createEl('h3', { text: '공유 허브' });
    copy.createEl('p', { text: '이번 HTML이 어느 메인페이지의 서브페이지로 들어갈지 먼저 정합니다.' });

    const grid = section.createDiv({ cls: 'marktl-choice-grid marktl-hub-grid' });
    for (const profile of profiles) {
      const isSelected = selectedProfile.id === profile.id;
      const description = describeShareHomeProfile(profile, this.plugin.settings);
      const button = grid.createEl('button', {
        cls: `marktl-choice-card marktl-hub-card${isSelected ? ' is-selected' : ''}`,
        type: 'button',
      });
      button.setAttr('aria-pressed', String(isSelected));
      button.setAttr('title', `${profile.title}: ${description.pathLabel}`);
      button.createEl('strong', { text: profile.title });
      button.createEl('span', { text: `${description.pathLabel} · ${profile.description}` });
      button.addEventListener('click', () => {
        this.options.shareHomeProfileId = profile.id;
        this.onOpen();
      });
    }

    const selected = section.createDiv({ cls: 'marktl-reference-row marktl-hub-summary' });
    const description = describeShareHomeProfile(selectedProfile, this.plugin.settings);
    selected.createEl('span', {
      text: description.homeUrl
        ? `선택된 허브: ${selectedProfile.title} · ${description.homeUrl}`
        : `선택된 허브: ${selectedProfile.title} · 게시 경로 ${description.pathLabel}`,
    });

    const actions = section.createDiv({ cls: 'marktl-hub-actions' });
    actions.createEl('button', { text: '새 허브', type: 'button' })
      .addEventListener('click', () => this.openShareHomeCreateModal(profiles));
    actions.createEl('button', { text: '선택 허브 수정', type: 'button' })
      .addEventListener('click', () => this.openShareHomeEditModal(selectedProfile, profiles));
    actions.createEl('button', { text: '게시물 관리', type: 'button' })
      .addEventListener('click', () => {
        this.close();
        this.plugin.openPublishedHtmlManager(selectedProfile.id);
      });
    const deleteButton = actions.createEl('button', {
      cls: 'marktl-danger-button',
      text: '선택 허브 삭제',
      type: 'button',
    });
    deleteButton.toggleAttribute('disabled', profiles.length <= 1);
    deleteButton.addEventListener('click', () => {
      void this.deleteShareHomeProfile(selectedProfile, profiles);
    });
  }

  private renderChoiceGroup(container: HTMLElement, step: string, title: string, desc: string, choices: ChoiceItem[], selected: string, onChoose: (value: string) => void): void {
    const section = container.createDiv({ cls: 'marktl-choice-section' });
    const header = section.createDiv({ cls: 'marktl-choice-header' });
    header.createEl('span', { cls: 'marktl-choice-step', text: step });
    const copy = header.createDiv();
    copy.createEl('h3', { text: title });
    copy.createEl('p', { text: desc });

    const grid = section.createDiv({ cls: 'marktl-choice-grid' });
    for (const choice of choices) {
      const isSelected = selected === choice.id;
      const button = grid.createEl('button', {
        cls: `marktl-choice-card${isSelected ? ' is-selected' : ''}`,
        type: 'button',
      });
      button.setAttr('aria-pressed', String(isSelected));
      button.setAttr('title', `${choice.label}: ${choice.description}`);
      button.createEl('strong', { text: choice.label });
      button.createEl('span', { text: choice.description });
      button.addEventListener('click', () => onChoose(choice.id));
    }
  }

  private renderContextSelector(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'marktl-choice-section marktl-context-section' });
    const header = section.createDiv({ cls: 'marktl-choice-header' });
    header.createEl('span', { cls: 'marktl-choice-step', text: '4' });
    const copy = header.createDiv();
    copy.createEl('h3', { text: '기준 맥락 노트' });
    copy.createEl('p', { text: '현재 노트만 사용할지, 사용자가 지정한 기준 노트의 배경·결정·용어·맥락을 함께 사용할지 정합니다.' });

    const modeGrid = section.createDiv({ cls: 'marktl-choice-grid marktl-context-grid' });
    const activeOnly = modeGrid.createEl('button', {
      cls: `marktl-choice-card${this.options.contextPackMode !== 'reference-note' ? ' is-selected' : ''}`,
      type: 'button',
    });
    activeOnly.setAttr('aria-pressed', String(this.options.contextPackMode !== 'reference-note'));
    activeOnly.setAttr('title', '현재 노트만 사용: 현재 노트의 내용만으로 HTML을 만듭니다.');
    activeOnly.createEl('strong', { text: '현재 노트만 사용' });
    activeOnly.createEl('span', { text: '현재 노트의 내용만으로 HTML을 만듭니다.' });
    activeOnly.addEventListener('click', () => {
      this.options.contextPackMode = 'none';
      this.onOpen();
    });

    const reference = modeGrid.createEl('button', {
      cls: `marktl-choice-card${this.options.contextPackMode === 'reference-note' ? ' is-selected' : ''}`,
      type: 'button',
    });
    reference.setAttr('aria-pressed', String(this.options.contextPackMode === 'reference-note'));
    reference.setAttr('title', '지정 기준 노트 사용: 선택한 노트의 배경, 결정, 용어, 기준 맥락을 참고합니다.');
    reference.createEl('strong', { text: '지정 기준 노트 사용' });
    reference.createEl('span', { text: '선택한 노트의 배경, 결정, 용어, 기준 맥락을 참고합니다.' });
    reference.addEventListener('click', () => {
      this.options.contextPackMode = 'reference-note';
      if (!this.options.referenceContextNotePath) {
        this.openReferencePicker();
        return;
      }
      this.onOpen();
    });

    const selected = section.createDiv({ cls: 'marktl-reference-row' });
    selected.createEl('span', {
      text: this.options.referenceContextNotePath
        ? `선택된 기준 노트: ${this.options.referenceContextNotePath}`
        : '선택된 기준 노트가 없습니다.',
    });
    selected.createEl('button', { text: this.options.referenceContextNotePath ? '기준 노트 변경' : '기준 노트 선택', type: 'button' })
      .addEventListener('click', () => this.openReferencePicker());
    if (this.options.referenceContextNotePath) {
      selected.createEl('button', { text: '해제', type: 'button' })
        .addEventListener('click', () => {
          this.options.referenceContextNotePath = '';
          this.options.contextPackMode = 'none';
          this.onOpen();
        });
    }
  }

  private renderExecutionSummary(container: HTMLElement): void {
    const summary = container.createDiv({ cls: 'marktl-execution-summary' });
    summary.createEl('strong', { text: describeExecutionProfile(this.options) });
    summary.createEl('span', {
      text: [
        `실행 프로필: ${this.options.artifactGoal}`,
        this.options.artifactType,
        this.options.template,
        this.options.conversionMode,
        this.options.previewSecurity,
      ].join(' · '),
    });
  }

  private renderAdvanced(container: HTMLElement): void {
    new Setting(container)
      .setName('독자 작업')
      .setDesc('내부 실행 프로필입니다. 일반적으로 위 1-3단계 선택만 사용하세요.')
      .addDropdown((dropdown) => {
        for (const goal of listArtifactGoals()) {
          dropdown.addOption(goal.id, goal.name);
        }
        dropdown.setValue(this.options.artifactGoal).onChange((value) => {
          this.options.presetId = 'custom';
          this.options.artifactGoal = value as ArtifactGoal;
        });
      });

    new Setting(container)
      .setName('내용 구조')
      .setDesc('정보 배열 방식입니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('faithful-note', '원문 충실 노트')
        .addOption('strategy-brief', '전략 브리프')
        .addOption('research-report', '리포트')
        .addOption('decision-memo', '의사결정 메모')
        .addOption('interactive-explainer', '인터랙티브 설명서')
        .addOption('slide-deck', '발표 슬라이드')
        .setValue(this.options.artifactType)
        .onChange((value) => {
          this.options.presetId = 'custom';
          this.options.artifactType = value as ArtifactType;
        }));

    new Setting(container)
      .setName('화면 스타일')
      .setDesc('시각 방향과 로컬 fallback 스타일입니다.')
      .addDropdown((dropdown) => {
        for (const template of listTemplates()) {
          dropdown.addOption(template.id, template.name);
        }
        dropdown.setValue(this.options.template).onChange((value) => {
          this.options.presetId = 'custom';
          this.options.template = value;
        });
      });

    new Setting(container)
      .setName('AI CLI')
      .setDesc(getProviderPrivacyNote(this.options.aiProvider) || '검증된 provider만 표시합니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', '사용 안 함 / 로컬 변환')
        .addOption('claude', 'Claude Code CLI')
        .addOption('codex', 'Codex CLI')
        .setValue(this.options.aiProvider)
        .onChange((value) => {
          this.options.aiProvider = value as AiProvider;
          this.onOpen();
        }));

    new Setting(container)
      .setName('재구성 강도')
      .setDesc('보존은 원문에 충실하고, 발표/기사형은 AI가 구조를 더 재배치합니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('preserve', '원문 보존')
        .addOption('presentation', '발표형 재구성')
        .addOption('blog', '기사형 재구성')
        .addOption('landing', '랜딩형 재구성')
        .setValue(this.options.conversionMode)
        .onChange((value) => {
          this.options.presetId = 'custom';
          this.options.conversionMode = value as ConversionMode;
        }));

    new Setting(container)
      .setName('인터랙션 허용')
      .setDesc('신뢰 모드는 HTML 안의 로컬 JavaScript를 허용합니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('sanitized', '안전한 정적 미리보기')
        .addOption('trusted', '신뢰 인터랙티브 미리보기')
        .setValue(this.options.previewSecurity)
        .onChange((value) => {
          this.options.presetId = 'custom';
          this.options.previewSecurity = value as PreviewSecurity;
        }));

    new Setting(container)
      .setName('맥락 처리')
      .setDesc('기본 화면의 기준 노트 선택을 우선 사용합니다. 연결 노트 포함은 기존 호환 옵션입니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', '현재 노트만')
        .addOption('reference-note', '지정 기준 노트')
        .addOption('linked-notes', '연결 노트 포함')
        .setValue(this.options.contextPackMode)
        .onChange((value) => {
          this.options.contextPackMode = value as ContextPackMode;
        }));

    new Setting(container)
      .setName('독자 피드백')
      .setDesc('Giscus는 GitHub 댓글/반응을 붙입니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('none', '댓글 없음')
        .addOption('giscus', 'Giscus GitHub 댓글')
        .setValue(this.options.readerFeedbackMode)
        .onChange((value) => {
          this.options.readerFeedbackMode = value as ReaderFeedbackMode;
        }));

    new Setting(container)
      .setName('AI 실패 처리')
      .setDesc('GitHub Pages 게시에서는 strict가 강제됩니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('fallback', '경고 후 로컬 fallback')
        .addOption('strict', '실패 시 중단')
        .setValue(this.options.failurePolicy)
        .onChange((value) => {
          this.options.failurePolicy = value as FailurePolicy;
        }));

    new Setting(container)
      .setName('공유 대상')
      .setDesc('GitHub Pages는 성공한 AI HTML만 게시합니다.')
      .addDropdown((dropdown) => dropdown
        .addOption('local-link', '로컬 파일 링크')
        .addOption('static-bundle', '정적 호스팅 번들')
        .addOption('github-pages', 'GitHub Pages 링크')
        .setValue(this.options.shareTarget)
        .onChange((value) => {
          this.options.shareTarget = value as ShareTarget;
          if (value === 'github-pages') {
            this.options.previewSecurity = 'trusted';
            this.options.readerFeedbackMode = 'giscus';
            this.options.copyShareLinkAfterExport = true;
          }
        }));

    new Setting(container)
      .setName('공유 링크 복사')
      .setDesc('내보내기 후 공개 URL 또는 로컬 링크를 클립보드에 복사합니다.')
      .addToggle((toggle) => toggle
        .setValue(this.options.copyShareLinkAfterExport)
        .onChange((value) => {
          this.options.copyShareLinkAfterExport = value;
        }));
  }

  private applyPrimarySelection(partial: Partial<Pick<ExportOptions, 'exportGenre' | 'exportDepth' | 'exportPurpose'>>): void {
    const next = {
      ...this.options,
      ...partial,
    };
    this.options = applySelectionProfile(next, next) as ExportOptions;
    this.options.presetId = 'custom';
    this.onOpen();
  }

  private openReferencePicker(): void {
    new ReferenceNoteSuggestModal(this.app, (file) => {
      this.options.referenceContextNotePath = file.path;
      this.options.contextPackMode = 'reference-note';
      this.onOpen();
    }).open();
  }

  private openShareHomeCreateModal(profiles: ShareHomeProfile[]): void {
    const next = createShareHomeProfile(profiles) as ShareHomeProfile;
    new ShareHomeProfileEditModal(this.app, 'create', next, profiles, (profile) => {
      void this.persistShareHomeProfiles([...profiles, profile], profile.id);
    }).open();
  }

  private openShareHomeEditModal(profile: ShareHomeProfile, profiles: ShareHomeProfile[]): void {
    new ShareHomeProfileEditModal(this.app, 'edit', profile, profiles, (updatedProfile) => {
      const nextProfiles = profiles.map((candidate) => (candidate.id === profile.id ? updatedProfile : candidate));
      void this.persistShareHomeProfiles(nextProfiles, updatedProfile.id);
    }).open();
  }

  private async deleteShareHomeProfile(profile: ShareHomeProfile, profiles: ShareHomeProfile[]): Promise<void> {
    if (profiles.length <= 1) {
      return;
    }
    const confirmed = window.confirm(`공유 허브 "${profile.title}"을 삭제할까요?\n이미 GitHub Pages에 올라간 파일은 자동 삭제되지 않습니다.`);
    if (!confirmed) {
      return;
    }
    const remaining = profiles.filter((candidate) => candidate.id !== profile.id);
    await this.persistShareHomeProfiles(remaining, remaining[0]?.id || '');
    new Notice('공유 허브를 삭제했습니다.');
  }

  private async persistShareHomeProfiles(profiles: ShareHomeProfile[], activeProfileId: string): Promise<void> {
    const normalized = normalizeShareHomeProfiles(profiles, this.plugin.settings) as ShareHomeProfile[];
    const activeProfile = normalized.find((profile) => profile.id === activeProfileId) || normalized[0];
    this.plugin.settings.shareHomeProfiles = normalized;
    this.plugin.settings.activeShareHomeProfileId = activeProfile?.id || '';
    if (activeProfile) {
      this.plugin.settings.githubPublishPath = activeProfile.basePath;
      this.plugin.settings.githubShareHomeTitle = activeProfile.title;
      this.options.shareHomeProfileId = activeProfile.id;
    }
    await this.plugin.saveSettings();
    new Notice('공유 허브 설정을 저장했습니다.');
    this.onOpen();
  }

  private renderActions(container: HTMLElement): void {
    new Setting(container)
      .addButton((button) => button
        .setButtonText('내보내기')
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.options);
        }))
      .addButton((button) => button
        .setButtonText('기본값으로 저장')
        .onClick(async () => {
          const { presetId: _presetId, shareHomeProfileId, ...settings } = this.options;
          Object.assign(this.plugin.settings, settings);
          this.plugin.settings.activeShareHomeProfileId = shareHomeProfileId;
          const activeProfile = resolveShareHomeProfile(this.plugin.settings, shareHomeProfileId) as ShareHomeProfile;
          if (activeProfile) {
            this.plugin.settings.githubPublishPath = activeProfile.basePath;
            this.plugin.settings.githubShareHomeTitle = activeProfile.title;
          }
          await this.plugin.saveSettings();
          this.close();
          this.onSubmit(this.options);
        }));
  }
}
