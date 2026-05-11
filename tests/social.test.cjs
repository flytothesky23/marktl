const test = require('node:test');
const assert = require('node:assert/strict');

const { buildShortPagesUrl } = require('../src/core/github-pages.js');
const { buildShortId, injectSocialMeta } = require('../src/core/social.js');

test('builds stable short share URLs', () => {
  const id = buildShortId('긴-문서-제목-2026');

  assert.equal(id, buildShortId('긴-문서-제목-2026'));
  assert.ok(id.length <= 7);
  assert.equal(buildShortPagesUrl('https://reallygood83.github.io/moondoc', 'marktl', id), `https://reallygood83.github.io/moondoc/marktl/s/${id}/`);
});

test('injects Open Graph and Twitter metadata into HTML head', () => {
  const html = injectSocialMeta('<!doctype html><html><head><title>Old</title></head><body></body></html>', {
    title: 'Readable Title',
    description: 'Short description',
    url: 'https://example.com/s/abc123/',
    image: 'https://example.com/s/abc123/assets/cover.jpg',
  });

  assert.match(html, /property="og:title" content="Readable Title"/);
  assert.match(html, /property="og:description" content="Short description"/);
  assert.match(html, /property="og:image" content="https:\/\/example\.com\/s\/abc123\/assets\/cover\.jpg"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /rel="canonical" href="https:\/\/example\.com\/s\/abc123\/"/);
});
