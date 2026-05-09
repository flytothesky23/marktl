export type AiProvider = 'none' | 'claude' | 'gemini';
export type ConversionMode = 'preserve' | 'presentation' | 'blog' | 'landing';
export type FailurePolicy = 'fallback' | 'strict';
export type PreviewSecurity = 'sanitized' | 'trusted';

export interface MarktlSettings {
  exportFolder: string;
  template: string;
  aiProvider: AiProvider;
  conversionMode: ConversionMode;
  failurePolicy: FailurePolicy;
  previewSecurity: PreviewSecurity;
  timeoutMs: number;
  claudePath: string;
  geminiPath: string;
  copyShareLinkAfterExport: boolean;
}

export interface ExportOptions {
  template: string;
  aiProvider: AiProvider;
  conversionMode: ConversionMode;
  failurePolicy: FailurePolicy;
  previewSecurity: PreviewSecurity;
  copyShareLinkAfterExport: boolean;
}

export interface PreviewState {
  html: string;
  filePath: string;
  warnings: string[];
  trusted: boolean;
}
