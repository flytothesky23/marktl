const exportPresets = [
  {
    id: 'readable-note',
    name: 'Readable Note',
    description: 'Faithful, clean reading view with better typography.',
    artifactGoal: 'read',
    artifactType: 'faithful-note',
    template: 'editorial',
    mode: 'preserve',
    previewSecurity: 'sanitized',
  },
  {
    id: 'interactive-report',
    name: 'Interactive Report',
    description: 'HTML-native controls: table of contents, collapsible sections, copy buttons.',
    artifactGoal: 'review',
    artifactType: 'interactive-explainer',
    template: 'interactive-report',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Slide-like sections for reviewing or presenting a note.',
    artifactGoal: 'read',
    artifactType: 'slide-deck',
    template: 'deck',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
  {
    id: 'decision-memo',
    name: 'Decision Room',
    description: 'Options, tradeoffs, risks, recommendation, decision log, and copy-back prompts.',
    artifactGoal: 'decide',
    artifactType: 'decision-memo',
    template: 'research-memo',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
  {
    id: 'shareable-article',
    name: 'Shareable Article',
    description: 'Polished article layout with bundled images and static-hosting-ready output.',
    artifactGoal: 'publish',
    artifactType: 'research-report',
    template: 'editorial',
    mode: 'blog',
    previewSecurity: 'sanitized',
  },
  {
    id: 'playground',
    name: 'Prompt Playground',
    description: 'Editable working surface with sliders and copyable state.',
    artifactGoal: 'tune',
    artifactType: 'interactive-explainer',
    template: 'playground',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
  {
    id: 'compare-options',
    name: 'Compare Options',
    description: 'Side-by-side options, scorecards, filters, and tradeoff summaries.',
    artifactGoal: 'compare',
    artifactType: 'decision-memo',
    template: 'dashboard',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
  {
    id: 'pr-explainer',
    name: 'PR / Code Explainer',
    description: 'Annotated technical explainer for code, diffs, plans, and review risks.',
    artifactGoal: 'explain-code',
    artifactType: 'research-report',
    template: 'research-memo',
    mode: 'presentation',
    previewSecurity: 'trusted',
  },
];

function listExportPresets() {
  return exportPresets.slice();
}

function findExportPreset(id) {
  return exportPresets.find((preset) => preset.id === id) || null;
}

function applyPresetToOptions(baseOptions, presetId) {
  const preset = findExportPreset(presetId);
  if (!preset) {
    return { ...baseOptions };
  }
  return {
    ...baseOptions,
    presetId: preset.id,
    artifactGoal: preset.artifactGoal,
    artifactType: preset.artifactType,
    template: preset.template,
    conversionMode: preset.mode,
    previewSecurity: preset.previewSecurity,
  };
}

function findPresetForOptions(options = {}) {
  const preset = exportPresets.find((item) => (
    item.artifactGoal === options.artifactGoal
    && item.artifactType === options.artifactType
    && item.template === options.template
    && item.mode === options.conversionMode
    && item.previewSecurity === options.previewSecurity
  ));
  return preset ? preset.id : 'custom';
}

module.exports = {
  applyPresetToOptions,
  findExportPreset,
  findPresetForOptions,
  listExportPresets,
};
