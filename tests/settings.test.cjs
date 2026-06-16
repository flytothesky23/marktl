const test = require('node:test');
const assert = require('node:assert/strict');

const { migrateSettings } = require('../src/core/settings.js');

const defaults = {
  githubRepo: '',
  githubPublishPath: 'marktl',
  githubShareHomeTitle: '유네코 지수 통합선별공장 프로젝트',
  shareTarget: 'local-link',
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
});

test('keeps current GitHub Pages setting names over legacy aliases', () => {
  const { settings, migrated } = migrateSettings(defaults, {
    githubRepo: 'reallygood83/current',
    githubRepository: 'reallygood83/legacy',
    githubPublishPath: 'current-path',
    publishPath: 'legacy-path',
  });

  assert.equal(migrated, false);
  assert.equal(settings.githubRepo, 'reallygood83/current');
  assert.equal(settings.githubPublishPath, 'current-path');
});
