const test = require('node:test');
const assert = require('node:assert/strict');

const { injectShareHomeLink } = require('../src/core/share-navigation.js');

test('injects a share hub home link into generated HTML', () => {
  const html = injectShareHomeLink('<!doctype html><html><head><title>x</title></head><body><main>Body</main></body></html>', {
    homeUrl: 'https://example.com/marktl/',
    label: '공유 홈',
  });

  assert.match(html, /data-marktl-share-home-style/);
  assert.match(html, /data-marktl-share-home/);
  assert.match(html, /href="https:\/\/example\.com\/marktl\/"/);
  assert.match(html, /← 공유 홈/);
});

test('keeps share hub home link injection safe and idempotent', () => {
  const unsafe = injectShareHomeLink('<html><body>x</body></html>', { homeUrl: 'file:///tmp/index.html' });
  const once = injectShareHomeLink('<html><body>x</body></html>', { homeUrl: 'https://example.com/' });
  const twice = injectShareHomeLink(once, { homeUrl: 'https://example.com/' });

  assert.equal(unsafe, '<html><body>x</body></html>');
  assert.equal(twice, once);
});
