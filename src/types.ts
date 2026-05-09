export type AiProvider = 'none' | 'claude' | 'gemini';
export type ArtifactType = 'faithful-note' | 'strategy-brief' | 'research-report' | 'decision-memo' | 'interactive-explainer' | 'slide-deck';
export type ConversionMode = 'preserve' | 'presentation' | 'blog' | 'landing';
export type FailurePolicy = 'fallback' | 'strict';
export type PreviewSecurity = 'sanitized' | 'trusted';
export type ShareTarget = 'local-link' | 'static-bundle';

export interface MarktlSettings {
  exportFolder: string;
  artifactType: ArtifactType;
  template: string;
  aiProvider: AiProvider;
  conversionMode: ConversionMode;
  failurePolicy: FailurePolicy;
  previewSecurity: PreviewSecurity;
  shareTarget: ShareTarget;
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
  shareTarget: ShareTarget;
  copyShareLinkAfterExport: boolean;
}

export interface PreviewState {
  html: string;
  filePath: string;
  warnings: string[];
  trusted: boolean;
}
