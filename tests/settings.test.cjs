const test = require('node:test');
const assert = require('node:assert/strict');

const { migrateSettings } = require('../src/core/settings.js');

const defaults = {
  githubRepo: '',
  githubPublishPath: 'marktl',
  githubShareHomeTitle: '유네코 지수 통합선별공장 프로젝트',
  activeShareHomeProfileId: '',
  shareHomeProfiles: [],
  shareTarget: 'local-link',
  exportGenre: 'integrated-note',
  exportDepth: 'standard',
  exportPurpose: 'internal-share',
  referenceContextNotePath: '',
  codexPath: '',
  giscusRepo: '',
};

test('migrates legacy GitHub Pages setting names', () => {
  const { settings, migrated } = migrateSettings(defaults, {
    githubRepository: 'https://github.com/reallygood83/moondoc',
    publishPath: 'marktl',
    shareHomeTitle: 'MoonDoc Archive',
  });

  assert.equal(migrated, true);
  assert.equal(settings.githubRepo, 'https://github.com/reallygood83/moondoc');
  assert.equal(settings.githubPublishPath, 'marktl');
  assert.equal(settings.githubShareHomeTitle, 'MoonDoc Archive');
  assert.equal(settings.activeShareHomeProfileId, 'jisu-construction');
  assert.equal(settings.shareHomeProfiles[0].title, 'MoonDoc Archive');
  assert.equal(settings.shareHomeProfiles[0].basePath, 'marktl');
});

test('normalizes retired selection ids while preserving operational settings', () => {
  const { settings, migrated } = migrateSettings(defaults, {
    exportGenre: 'construction-daily',
    exportDepth: 'milestone',
    exportPurpose: 'external-report',
    referenceContextNotePath: 'Projects/2026-06-11 공사일보.md',
    codexPath: '~/.local/bin/marktl-codex',
    giscusRepo: 'flytothesky23/marktl-shares',
  });

  assert.equal(migrated, true);
  assert.equal(settings.exportGenre, 'integrated-note');
  assert.equal(settings.exportDepth, 'deep');
  assert.equal(settings.exportPurpose, 'external-report');
  assert.equal(settings.referenceContextNotePath, 'Projects/2026-06-11 공사일보.md');
  assert.equal(settings.codexPath, '~/.local/bin/marktl-codex');
  assert.equal(settings.giscusRepo, 'flytothesky23/marktl-shares');
});

test('normalizes share hub profiles while preserving existing operational settings', () => {
  const { settings, migrated } = migrateSettings(defaults, {
    activeShareHomeProfileId: 'research',
    shareHomeProfiles: [
      { id: 'jisu', title: '지수 허브', basePath: '/marktl/jisu/', eyebrow: 'JISU', description: '공사일보' },
      { id: 'research', title: '리서치 허브', basePath: 'marktl/research', eyebrow: 'Research', description: '관심 분야' },
    ],
    codexPath: '~/.local/bin/marktl-codex',
    giscusRepo: 'flytothesky23/marktl-shares',
  });

  assert.equal(migrated, true);
  assert.equal(settings.activeShareHomeProfileId, 'research');
  assert.deepEqual(settings.shareHomeProfiles.map((profile) => profile.basePath), ['marktl/jisu', 'marktl/research']);
  assert.equal(settings.codexPath, '~/.local/bin/marktl-codex');
  assert.equal(settings.giscusRepo, 'flytothesky23/marktl-shares');
});

test('keeps current GitHub Pages setting names over legacy aliases', () => {
  const { settings, migrated } = migrateSettings(defaults, {
    githubRepo: 'reallygood83/current',
    githubRepository: 'reallygood83/legacy',
    githubPublishPath: 'current-path',
    publishPath: 'legacy-path',
  });

  assert.equal(migrated, true);
  assert.equal(settings.githubRepo, 'reallygood83/current');
  assert.equal(settings.githubPublishPath, 'current-path');
});
