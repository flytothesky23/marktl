const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createShareHomeProfile,
  describeShareHomeProfile,
  normalizeShareHomeProfiles,
  normalizeShareHomeSettings,
  resolveShareHomeProfile,
} = require('../src/core/share-home-profiles.js');

test('seeds a share hub profile from legacy GitHub Pages settings', () => {
  const settings = {
    githubRepo: 'flytothesky23/marktl-shares',
    githubPagesBaseUrl: 'https://flytothesky23.github.io/marktl-shares',
    githubPublishPath: 'marktl',
    githubShareHomeTitle: '유네코 지수 통합선별공장 프로젝트',
  };

  const normalized = normalizeShareHomeSettings(settings);

  assert.equal(normalized.activeShareHomeProfileId, 'jisu-construction');
  assert.equal(normalized.shareHomeProfiles[0].title, '유네코 지수 통합선별공장 프로젝트');
  assert.equal(normalized.shareHomeProfiles[0].basePath, 'marktl');
  assert.equal(normalized.shareHomeProfiles[0].description, '');
});

test('normalizes multiple share hubs and resolves the active hub', () => {
  const settings = {
    activeShareHomeProfileId: 'research',
    shareHomeProfiles: [
      { id: 'jisu', title: '지수 통합선별', basePath: '/marktl/jisu/', eyebrow: 'JISU', description: '공사일보 허브' },
      { id: 'research', title: '리서치 아카이브', basePath: 'marktl/research', eyebrow: 'Research', description: '관심 분야 정리' },
    ],
  };

  const profiles = normalizeShareHomeProfiles(settings.shareHomeProfiles, settings);
  const active = resolveShareHomeProfile({ ...settings, shareHomeProfiles: profiles });

  assert.deepEqual(profiles.map((profile) => profile.basePath), ['marktl/jisu', 'marktl/research']);
  assert.equal(active.title, '리서치 아카이브');
});

test('preserves an intentionally blank share hub description', () => {
  const profiles = normalizeShareHomeProfiles([
    { id: 'jisu', title: '지수 통합선별', basePath: '/marktl/', eyebrow: 'JISU', description: '' },
  ]);

  assert.equal(profiles[0].description, '');
});

test('creates a new share hub without colliding with existing ids', () => {
  const next = createShareHomeProfile([
    { id: 'share-hub-2', title: 'Existing', basePath: 'marktl/existing', eyebrow: 'Archive', description: 'Existing' },
  ]);

  assert.equal(next.id, 'share-hub-2-2');
  assert.equal(next.basePath, 'marktl/hub-2');
});

test('describes a share hub using the public Pages base URL', () => {
  const description = describeShareHomeProfile({
    id: 'research',
    title: '리서치 아카이브',
    basePath: 'marktl/research',
    eyebrow: 'Research',
    description: '관심 분야 정리',
  }, {
    githubPagesBaseUrl: 'https://flytothesky23.github.io/marktl-shares',
  });

  assert.equal(description.pathLabel, '/marktl/research/');
  assert.equal(description.homeUrl, 'https://flytothesky23.github.io/marktl-shares/marktl/research/');
});
