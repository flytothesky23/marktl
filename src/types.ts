export type AiProvider = 'none' | 'claude' | 'codex';
export type ArtifactType = 'faithful-note' | 'strategy-brief' | 'research-report' | 'decision-memo' | 'interactive-explainer' | 'slide-deck';
export type ArtifactGoal = 'read' | 'decide' | 'review' | 'compare' | 'tune' | 'explain-code' | 'publish';
export type ConversionMode = 'preserve' | 'presentation' | 'blog' | 'landing';
export type FailurePolicy = 'fallback' | 'strict';
export type PreviewSecurity = 'sanitized' | 'trusted';
export type ShareTarget = 'local-link' | 'static-bundle' | 'github-pages';
export type ContextPackMode = 'none' | 'linked-notes' | 'reference-note';
export type ReaderFeedbackMode = 'none' | 'giscus';
export type ExportGenre = 'construction-daily' | 'meeting-notes' | 'integrated-note' | 'report' | 'general-note' | 'compare-review' | 'presentation' | 'share-article';
export type ExportDepth = 'brief' | 'standard' | 'milestone';
export type ExportPurpose = 'internal-share' | 'field-review' | 'external-report' | 'public-archive' | 'presentation' | 'ai-rework';

export interface ShareHomeProfile {
  id: string;
  title: string;
  basePath: string;
  eyebrow: string;
  description: string;
}

export interface MarktlSettings {
  exportFolder: string;
  setupCompleted: boolean;
  activeShareHomeProfileId: string;
  shareHomeProfiles: ShareHomeProfile[];
  artifactGoal: ArtifactGoal;
  artifactType: ArtifactType;
  template: string;
  exportGenre: ExportGenre;
  exportDepth: ExportDepth;
  exportPurpose: ExportPurpose;
  referenceContextNotePath: string;
  aiProvider: AiProvider;
  conversionMode: ConversionMode;
  failurePolicy: FailurePolicy;
  previewSecurity: PreviewSecurity;
  contextPackMode: ContextPackMode;
  readerFeedbackMode: ReaderFeedbackMode;
  shareTarget: ShareTarget;
  githubRepo: string;
  githubBranch: string;
  githubToken: string;
  githubPagesBaseUrl: string;
  githubPublishPath: string;
  githubShareHomeTitle: string;
  giscusRepo: string;
  giscusRepoId: string;
  giscusCategory: string;
  giscusCategoryId: string;
  giscusMapping: string;
  giscusTheme: string;
  timeoutMs: number;
  claudePath: string;
  codexPath: string;
  geminiPath: string;
  copyShareLinkAfterExport: boolean;
}

export interface ExportOptions {
  presetId?: string;
  shareHomeProfileId: string;
  artifactGoal: ArtifactGoal;
  artifactType: ArtifactType;
  template: string;
  exportGenre: ExportGenre;
  exportDepth: ExportDepth;
  exportPurpose: ExportPurpose;
  referenceContextNotePath: string;
  aiProvider: AiProvider;
  conversionMode: ConversionMode;
  failurePolicy: FailurePolicy;
  previewSecurity: PreviewSecurity;
  contextPackMode: ContextPackMode;
  readerFeedbackMode: ReaderFeedbackMode;
  shareTarget: ShareTarget;
  copyShareLinkAfterExport: boolean;
}

export interface ExportSummary {
  options: ExportOptions;
  sourcePath?: string;
  sourceTitle?: string;
  presetId?: string;
  previewSecurity: PreviewSecurity;
  localPath: string;
  outputPath: string;
  usedFallback: boolean;
  aiProvider: AiProvider;
  assetCount: number;
  warnings: string[];
  shareTarget: ShareTarget;
  copiedShareLink: boolean;
  commentsEnabled: boolean;
  commentsStatus: string;
  shareTitle?: string;
  shareHomeTitle?: string;
  publicUrl?: string;
  shareHomeUrl?: string;
}

export interface PreviewState {
  html: string;
  filePath: string;
  sourcePath?: string;
  title?: string;
  warnings: string[];
  trusted: boolean;
  previewSecurity: PreviewSecurity;
}
