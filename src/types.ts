export type AiProvider = 'none' | 'codex' | 'claude' | 'gemini';
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
  codexPath: string;
  claudePath: string;
  geminiPath: string;
}

export interface PreviewState {
  html: string;
  filePath: string;
  warnings: string[];
  trusted: boolean;
}
