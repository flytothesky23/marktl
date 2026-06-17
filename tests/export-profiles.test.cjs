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
    exportGenre: 'construction-daily',
    exportDepth: 'standard',
    exportPurpose: 'field-review',
  });
  const brief = getExecutionProfile({
    exportGenre: 'construction-daily',
    exportDepth: 'brief',
    exportPurpose: 'internal-share',
  });
  const milestone = getExecutionProfile({
    exportGenre: 'construction-daily',
    exportDepth: 'milestone',
    exportPurpose: 'external-report',
  });

  assert.equal(listExportGenres().find((item) => item.id === 'construction-daily').label, '공사일보');
  assert.deepEqual(listExportDepths().map((item) => item.id), ['brief', 'standard', 'milestone']);
  assert.ok(listExportPurposes().some((item) => item.id === 'field-review'));
  assert.equal(standard.artifactGoal, 'review');
  assert.equal(standard.template, 'construction-daily');
  assert.equal(brief.artifactGoal, 'read');
  assert.equal(brief.conversionMode, 'preserve');
  assert.equal(milestone.artifactType, 'strategy-brief');
  assert.equal(milestone.previewSecurity, 'trusted');
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

test('builds construction daily prompt contracts for all depth levels', () => {
  const brief = buildSelectionPrompt({
    exportGenre: 'construction-daily',
    exportDepth: 'brief',
    exportPurpose: 'internal-share',
  });
  const standard = buildSelectionPrompt({
    exportGenre: 'construction-daily',
    exportDepth: 'standard',
    exportPurpose: 'field-review',
    referenceContextNotePath: 'Projects/2026-06-11 공사일보.md',
  });
  const milestone = buildSelectionPrompt({
    exportGenre: 'construction-daily',
    exportDepth: 'milestone',
    exportPurpose: 'external-report',
    referenceContextNotePath: 'Projects/2026-06-11 공사일보.md',
  });

  assert.match(brief, /Do not force Gantt/);
  assert.match(standard, /active note is the source of today\/current facts/i);
  assert.match(standard, /기준 대비 변경\/확인 필요/);
  assert.match(milestone, /plan-versus-actual/);
  assert.match(milestone, /Mermaid\/Gantt/);
});
