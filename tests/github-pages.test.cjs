const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPagesUrl,
  buildPublishPath,
  buildShareHomeUrl,
  buildShortPagesUrl,
  inferPagesBaseUrl,
  mimeTypeForPath,
  normalizePublishPath,
  parseRepo,
  renderShareIndexHtml,
  updateShareIndex,
} = require('../src/core/github-pages.js');

test('parses GitHub repository settings', () => {
  assert.deepEqual(parseRepo('reallygood83/marktl-shares'), { owner: 'reallygood83', repo: 'marktl-shares' });
  assert.deepEqual(parseRepo('https://github.com/reallygood83/marktl-shares.git'), { owner: 'reallygood83', repo: 'marktl-shares' });
  assert.equal(parseRepo('missing'), null);
});

test('builds stable GitHub Pages paths and URLs', () => {
  assert.equal(normalizePublishPath('/exports//marktl/'), 'exports/marktl');
  assert.equal(buildPublishPath('/exports/', 'my-note', 'assets/chart.png'), 'exports/my-note/assets/chart.png');
  assert.equal(buildPagesUrl('https://reallygood83.github.io/marktl-shares/', 'exports', 'my note'), 'https://reallygood83.github.io/marktl-shares/exports/my%20note/');
  assert.equal(buildShortPagesUrl('https://reallygood83.github.io/marktl-shares/', 'exports', 'abc123'), 'https://reallygood83.github.io/marktl-shares/exports/s/abc123/');
  assert.equal(buildShareHomeUrl('https://reallygood83.github.io/marktl-shares/', 'exports'), 'https://reallygood83.github.io/marktl-shares/exports/');
  assert.equal(inferPagesBaseUrl('reallygood83/marktl-shares'), 'https://reallygood83.github.io/marktl-shares');
  assert.equal(inferPagesBaseUrl('reallygood83/reallygood83.github.io'), 'https://reallygood83.github.io');
});

test('returns MIME types for publishable files', () => {
  assert.equal(mimeTypeForPath('index.html'), 'text/html; charset=utf-8');
  assert.equal(mimeTypeForPath('assets/chart.webp'), 'image/webp');
  assert.equal(mimeTypeForPath('unknown.bin'), 'application/octet-stream');
});

test('updates share index by slug and newest first', () => {
  const first = updateShareIndex(null, {
    slug: 'alpha',
    title: 'Alpha',
    url: 'https://example.com/alpha/',
    sourcePath: 'A.md',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });
  const second = updateShareIndex(first, {
    slug: 'beta',
    title: 'Beta',
    url: 'https://example.com/beta/',
    sourcePath: 'B.md',
    updatedAt: '2026-01-02T00:00:00.000Z',
  });
  const updated = updateShareIndex(second, {
    slug: 'alpha',
    title: 'Alpha 2',
    url: 'https://example.com/alpha/',
    sourcePath: 'A2.md',
    updatedAt: '2026-01-03T00:00:00.000Z',
  });

  assert.deepEqual(updated.items.map((item) => item.slug), ['alpha', 'beta']);
  assert.equal(updated.items[0].title, 'Alpha 2');
  assert.equal(updated.items.length, 2);
});

test('renders share home page with published links', () => {
  const html = renderShareIndexHtml({
    items: [
      { slug: 'alpha', title: '2026-06-11 지수통합선별공장 공사일보 1일차', url: 'https://example.com/alpha/', sourcePath: 'A.md', updatedAt: '2026-06-11', excerpt: 'First note', artifactType: 'faithful-note', tags: ['ai', 'strategy', '공사일보'] },
      { slug: 'broken', title: 'dell-aiìë²', url: 'https://example.com/broken/', sourcePath: 'Bad.md', updatedAt: '2026-01-02', excerpt: '<iframe src="https://example.com"', artifactType: 'HTML artifact', tags: ['- newsletter', 'newsletter', 'Yozm IT - 바이브 코딩의 진짜 시작은 이제부터다', 'project/지수통합선별공장', 'obsidian/project-management', 'dataviewjs', 'function/ops', 'doc/meeting', 'state/검토중'] },
      { slug: 'mojibake', title: 'ë°ì´ë¸ ì½ë©ì ì¢ë§', url: 'https://example.com/mojibake/', sourcePath: 'B.md', updatedAt: '2026-01-03', excerpt: 'ð§ Voice Briefing', artifactType: 'research-report', tags: ['ë°ì´ë¸ì½ë©'] },
    ],
  }, {
    title: 'My Shares',
  });

  assert.match(html, /My Shares/);
  assert.match(html, /https:\/\/example\.com\/alpha\//);
  assert.match(html, /a\.md/);
  assert.match(html, /통합선별공장 Archive/);
  assert.match(html, /지금 볼 문서/);
  assert.match(html, /class="calendar"/);
  assert.match(html, /id="calendarGrid"/);
  assert.match(html, /height:300px/);
  assert.match(html, /padding:16px 16px 22px/);
  assert.match(html, /class="tile"/);
  assert.match(html, /tile\[data-type="공사일보"]/);
  assert.match(html, /data-type="공사일보"/);
  assert.match(html, /문서, 현장, 회의, 태그 검색/);
  assert.match(html, /#strategy/);
  assert.match(html, /#지수통합선별공장/);
  assert.match(html, /#프로젝트관리/);
  assert.match(html, /#운영/);
  assert.match(html, /#회의록/);
  assert.match(html, /#검토중/);
  assert.match(html, /data-search=/);
  assert.doesNotMatch(html, /Open artifact/);
  assert.match(html, /dell-ai서버/);
  assert.match(html, /바이브 코딩의 종말/);
  assert.match(html, /#바이브코딩/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /&lt;iframe/);
  assert.doesNotMatch(html, /dell-aiì/);
  assert.doesNotMatch(html, /ë°ì/);
  assert.doesNotMatch(html, /#- newsletter/);
  assert.doesNotMatch(html, /newsletter newsletter/);
  assert.doesNotMatch(html, /#dataviewjs/);
  assert.doesNotMatch(html, /#project\//);
  assert.doesNotMatch(html, /#obsidian\//);
  assert.doesNotMatch(html, /#function\//);
  assert.doesNotMatch(html, /#doc\//);
});
