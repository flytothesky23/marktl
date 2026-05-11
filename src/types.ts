export type AiProvider = 'none' | 'claude' | 'codex';
export type ArtifactType = 'faithful-note' | 'strategy-brief' | 'research-report' | 'decision-memo' | 'interactive-explainer' | 'slide-deck';
export type ArtifactGoal = 'read' | 'decide' | 'review' | 'compare' | 'tune' | 'explain-code' | 'publish';
export type ConversionMode = 'preserve' | 'presentation' | 'blog' | 'landing';
export type FailurePolicy = 'fallback' | 'strict';
export type PreviewSecurity = 'sanitized' | 'trusted';
export type ShareTarget = 'local-link' | 'static-bundle' | 'github-pages';
export type ContextPackMode = 'none' | 'linked-notes';
export type ReaderFeedbackMode = 'none' | 'giscus';

export interface MarktlSettings {
  exportFolder: string;
  setupCompleted: boolean;
  artifactGoal: ArtifactGoal;
  artifactType: ArtifactType;
  template: string;
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
  artifactGoal: ArtifactGoal;
  artifactType: ArtifactType;
  template: string;
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
  publicUrl?: string;
  shareHomeUrl?: string;
}

export interface PreviewState {
  html: string;
  filePath: string;
  warnings: string[];
  trusted: boolean;
}
