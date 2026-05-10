export type AiProvider = 'none' | 'claude';
export type ArtifactType = 'faithful-note' | 'strategy-brief' | 'research-report' | 'decision-memo' | 'interactive-explainer' | 'slide-deck';
export type ConversionMode = 'preserve' | 'presentation' | 'blog' | 'landing';
export type FailurePolicy = 'fallback' | 'strict';
export type PreviewSecurity = 'sanitized' | 'trusted';
export type ShareTarget = 'local-link' | 'static-bundle' | 'github-pages';
export type ContextPackMode = 'none' | 'linked-notes';
export type ReaderFeedbackMode = 'none' | 'giscus';

export interface MarktlSettings {
  exportFolder: string;
  setupCompleted: boolean;
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
  geminiPath: string;
  copyShareLinkAfterExport: boolean;
}

export interface ExportOptions {
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
  publicUrl?: string;
  shareHomeUrl?: string;
}

export interface PreviewState {
  html: string;
  filePath: string;
  warnings: string[];
  trusted: boolean;
}
