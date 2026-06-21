const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applySelectionProfile,
  getExecutionProfile,
  listExportDepths,
  listExportGenres,
  listExportPurposes,
} = require('../src/core/export-profiles.js');
const { buildSelectionPrompt } = require('../src/core/prompt-composer.js');

test('maps visible selection axes to internal execution profiles', () => {
  const standard = getExecutionProfile({
    exportGenre: 'integrated-note',
    exportDepth: 'standard',
    exportPurpose: 'review',
  });
  const brief = getExecutionProfile({
    exportGenre: 'general-note',
    exportDepth: 'brief',
    exportPurpose: 'internal-share',
  });
  const visualPaper = getExecutionProfile({
    exportGenre: 'research-paper',
    exportDepth: 'visual',
    exportPurpose: 'external-report',
  });
  const legacy = getExecutionProfile({
    exportGenre: 'construction-daily',
    exportDepth: 'milestone',
    exportPurpose: 'field-review',
  });

  assert.deepEqual(listExportDepths().map((item) => item.id), ['brief', 'standard', 'deep', 'visual']);
  assert.ok(listExportGenres().some((item) => item.id === 'newspaper'));
  assert.ok(listExportGenres().some((item) => item.id === 'social-feed'));
  assert.ok(listExportPurposes().some((item) => item.id === 'executive-brief'));
  assert.equal(standard.artifactGoal, 'review');
  assert.equal(standard.template, 'dashboard');
  assert.equal(brief.artifactGoal, 'read');
  assert.equal(brief.conversionMode, 'preserve');
  assert.equal(visualPaper.template, 'saas-brief');
  assert.equal(visualPaper.previewSecurity, 'trusted');
  assert.equal(legacy.exportGenre, 'integrated-note');
  assert.equal(legacy.exportDepth, 'deep');
  assert.equal(legacy.exportPurpose, 'review');
});

test('preserves operational settings while applying selected execution profile', () => {
  const options = applySelectionProfile({
    aiProvider: 'codex',
    shareTarget: 'github-pages',
    copyShareLinkAfterExport: true,
  }, {
    exportGenre: 'compare-review',
    exportDepth: 'standard',
    exportPurpose: 'internal-share',
  });

  assert.equal(options.artifactGoal, 'compare');
  assert.equal(options.artifactType, 'decision-memo');
  assert.equal(options.aiProvider, 'codex');
  assert.equal(options.shareTarget, 'github-pages');
  assert.equal(options.copyShareLinkAfterExport, true);
});

test('builds generalized prompt contracts for all selection axes', () => {
  const brief = buildSelectionPrompt({
    exportGenre: 'general-note',
    exportDepth: 'brief',
    exportPurpose: 'internal-share',
  });
  const visual = buildSelectionPrompt({
    exportGenre: 'social-feed',
    exportDepth: 'visual',
    exportPurpose: 'community-share',
  });
  const reference = buildSelectionPrompt({
    exportGenre: 'integrated-note',
    exportDepth: 'deep',
    exportPurpose: 'review',
    referenceContextNotePath: 'Projects/Baseline.md',
  });

  assert.match(brief, /faithful readable note/i);
  assert.match(visual, /social-feed style artifact/i);
  assert.match(visual, /visual-first structure/i);
  assert.match(reference, /active note remains the primary source of current facts/i);
  assert.match(reference, /context change or item needing confirmation/i);
  assert.match(reference, /Design system instruction/);
  assert.doesNotMatch(reference, /Mermaid\/Gantt|plan-versus-actual|today\/current facts/);
});
