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
  repairShareIndex,
  removeShareIndexItems,
  renderShareIndexHtml,
  shareDeleteKeys,
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

test('sorts share index by document date before publish update time', () => {
  const first = updateShareIndex(null, {
    slug: '2026-06-16-report',
    title: '2026-06-16 지수통합선별공장 공사일보',
    url: 'https://example.com/16/',
    sourcePath: 'Reports/2026-06-16 지수통합선별공장 공사일보.md',
    updatedAt: '2026-06-16T11:36:55.012Z',
  });
  const second = updateShareIndex(first, {
    slug: '2026-06-15-report',
    title: '2026-06-15 지수통합선별공장 공사일보',
    url: 'https://example.com/15/',
    sourcePath: 'Reports/2026-06-15 지수통합선별공장 공사일보.md',
    updatedAt: '2026-06-16T23:56:13.802Z',
  });

  assert.deepEqual(second.items.map((item) => item.slug), ['2026-06-16-report', '2026-06-15-report']);
});

test('repairs legacy share index metadata and duplicate entries', () => {
  const repaired = repairShareIndex({
    updatedAt: '2026-06-17T00:00:00.000Z',
    items: [
      {
        slug: 'alpha',
        title: 'MarkTL Shared HTML',
        shortId: '18e806n',
        url: 'https://example.com/marktl/s/18e806n/',
        sourcePath: 'Projects/2026-06-16 지수통합선별공장 공사일보.md',
        updatedAt: '2026-06-16T00:00:00.000Z',
        tags: ['dataviewjs', 'project/지수통합선별공장', 'doc/meeting', 'state/검토중'],
      },
      {
        slug: 'alpha',
        title: '',
        shortId: '18e806n',
        url: 'https://example.com/marktl/s/18e806n',
        sourcePath: 'projects/2026-06-16 지수통합선별공장 공사일보.md',
        updatedAt: '2026-06-15T00:00:00.000Z',
      },
      {
        slug: 'beta',
        title: '',
        sourcePath: 'Reports/2026-06-17 Weekly Report.md',
        updatedAt: '2026-06-17T00:00:00.000Z',
      },
    ],
  });

  assert.equal(repaired.version, 2);
  assert.equal(repaired.updatedAt, '2026-06-17T00:00:00.000Z');
  assert.deepEqual(repaired.items.map((item) => item.slug), ['beta', 'alpha']);

  const alpha = repaired.items.find((item) => item.slug === 'alpha');
  assert.equal(alpha.title, '2026-06-16 지수통합선별공장 공사일보');
  assert.equal(alpha.date, '2026-06-16');
  assert.equal(alpha.sourcePathKey, 'projects/2026-06-16 지수통합선별공장 공사일보.md');
  assert.deepEqual(alpha.tags, ['지수통합선별공장', '회의록', '검토중']);
});

test('compacts oversized damaged share index metadata', () => {
  const damaged = 'ÃÂ'.repeat(120000);
  const repaired = repairShareIndex({
    updatedAt: '2026-06-22T00:00:00.000Z',
    items: [{
      slug: 'jisu-integrated-2026-06-19',
      shortId: '1d2oul5',
      title: '2026-06-19 지수통합선별공장 프로젝트관리표 통합노트',
      url: 'https://example.com/marktl/s/1d2oul5/',
      canonicalUrl: 'https://example.com/marktl/jisu-integrated-2026-06-19/',
      sourcePath: damaged,
      sourcePathKey: damaged,
      artifactType: damaged,
      thumbnailUrl: 'data:image/png;base64,' + damaged,
      imageUrl: 'https://example.com/thumb.png',
      excerpt: '정상 설명',
      tags: ['project/지수통합선별공장'],
      updatedAt: '2026-06-22T00:00:00.000Z',
    }],
  });

  const text = JSON.stringify(repaired);
  assert.ok(Buffer.byteLength(text) < 5000);
  assert.equal(repaired.items.length, 1);
  assert.equal(repaired.items[0].sourcePath, undefined);
  assert.equal(repaired.items[0].sourcePathKey, undefined);
  assert.equal(repaired.items[0].artifactType, undefined);
  assert.equal(repaired.items[0].date, '2026-06-19');
  assert.equal(repaired.items[0].thumbnailUrl, undefined);
  assert.equal(repaired.items[0].imageUrl, 'https://example.com/thumb.png');
  assert.deepEqual(repaired.items[0].tags, ['지수통합선별공장']);
});

test('removes multiple share index items by stable delete keys', () => {
  const index = repairShareIndex({
    updatedAt: '2026-06-21T00:00:00.000Z',
    items: [
      {
        slug: 'alpha',
        shortId: 'a1',
        title: 'Alpha',
        url: 'https://example.com/marktl/s/a1/',
        canonicalUrl: 'https://example.com/marktl/alpha/',
        sourcePathKey: 'notes/alpha.md',
        updatedAt: '2026-06-19T00:00:00.000Z',
      },
      {
        slug: 'beta',
        shortId: 'b2',
        title: 'Beta',
        url: 'https://example.com/marktl/s/b2/',
        canonicalUrl: 'https://example.com/marktl/beta/',
        sourcePathKey: 'notes/beta.md',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      {
        slug: 'gamma',
        shortId: 'g3',
        title: 'Gamma',
        url: 'https://example.com/marktl/s/g3/',
        canonicalUrl: 'https://example.com/marktl/gamma/',
        sourcePathKey: 'notes/gamma.md',
        updatedAt: '2026-06-17T00:00:00.000Z',
      },
    ],
  });

  const result = removeShareIndexItems(index, [
    { shortId: 'a1' },
    { canonicalUrl: 'https://example.com/marktl/beta' },
  ]);

  assert.deepEqual(result.removed.map((item) => item.slug).sort(), ['alpha', 'beta']);
  assert.deepEqual(result.index.items.map((item) => item.slug), ['gamma']);
  assert.deepEqual(shareDeleteKeys(index.items[0]), [
    'short:a1',
    'url:https://example.com/marktl/s/a1',
    'canonical:https://example.com/marktl/alpha',
    'source:notes/alpha.md',
    'slug:alpha',
  ]);
});

test('renders share home page with published links', () => {
  const html = renderShareIndexHtml({
    items: [
      { slug: 'alpha', title: '2026-06-11 지수통합선별공장 공사일보 1일차', url: 'https://example.com/alpha/', sourcePath: 'A.md', updatedAt: '2026-06-11', excerpt: 'First note', artifactType: 'faithful-note', tags: ['ai', 'strategy', '공사일보', '프로젝트관리'] },
      { slug: 'integrated', title: '2026-06-11 지수통합선별공장 프로젝트관리표 통합노트', url: 'https://example.com/integrated/', sourcePath: 'B.md', updatedAt: '2026-06-11', excerpt: 'Integrated note', artifactType: 'faithful-note', tags: ['통합노트', '프로젝트관리'] },
      { slug: 'broken', title: 'dell-aiìë²', url: 'https://example.com/broken/', sourcePath: 'Bad.md', updatedAt: '2026-01-02', excerpt: '<iframe src="https://example.com"', artifactType: 'HTML artifact', tags: ['- newsletter', 'newsletter', 'Yozm IT - 바이브 코딩의 진짜 시작은 이제부터다', 'project/지수통합선별공장', 'obsidian/project-management', 'dataviewjs', 'function/ops', 'doc/meeting', 'state/검토중'] },
      { slug: 'mojibake', title: 'ë°ì´ë¸ ì½ë©ì ì¢ë§', url: 'https://example.com/mojibake/', sourcePath: 'B.md', updatedAt: '2026-01-03', excerpt: 'ð§ Voice Briefing', artifactType: 'research-report', tags: ['ë°ì´ë¸ì½ë©'] },
      { slug: 'callout', title: 'MCP와 API', url: 'https://example.com/callout/', sourcePath: 'C.md', updatedAt: '2026-01-04', excerpt: '> [!summary] 한 줄 결론 API는 소프트웨어 기능으로 들어가는 문이고, MCP는 외부 도구를 연결합니다.', artifactType: 'note', tags: ['업무자동화'] },
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
  assert.match(html, /height:206px/);
  assert.match(html, /padding:9px 10px 12px/);
  assert.match(html, /minmax\(190px,222px\)/);
  assert.match(html, /grid-template-rows:repeat\(7,minmax\(0,1fr\)\)/);
  assert.match(html, /width:min\(222px,100%\);height:178px;min-height:178px/);
  assert.match(html, /function calendarTypes/);
  assert.match(html, /function calendarClass/);
  assert.match(html, /type-mixed/);
  assert.match(html, /\.cal-dot\.daily/);
  assert.match(html, /\.cal-dot\.integrated/);
  assert.match(html, /'cal-dot '\+calendarToken\(type\)/);
  assert.match(html, /calendarLabel\(types,dayDocs\.length\)/);
  assert.match(html, /복합/);
  assert.match(html, /class="tile"/);
  assert.match(html, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(html, /grid-template-columns:minmax\(142px,44%\) minmax\(0,1fr\);height:96px;min-height:0/);
  assert.match(html, /@media\(max-width:1280px\).*repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(html, /@media\(max-width:640px\).*grid-template-columns:1fr/);
  assert.match(html, /height:100%;min-height:0;object-fit:cover/);
  assert.doesNotMatch(html, /class="tags"/);
  assert.doesNotMatch(html, /tile\[data-type="공사일보"]/);
  assert.match(html, /border-right:1px solid rgba\(255,255,255,\.08\)/);
  assert.doesNotMatch(html, /object-fit:contain/);
  assert.match(html, /data-type="공사일보"/);
  assert.match(html, /문서, 현장, 회의, 태그 검색/);
  assert.match(html, /#strategy/);
  assert.match(html, /#지수통합선별공장/);
  assert.match(html, /#프로젝트관리/);
  assert.match(html, /#운영/);
  assert.match(html, /data-search=/);
  assert.match(html, /data-tags="[^"]*회의록[^"]*검토중/);
  assert.doesNotMatch(html, /Open artifact/);
  assert.match(html, /dell-ai서버/);
  assert.match(html, /바이브 코딩의 종말/);
  assert.match(html, /#바이브코딩/);
  assert.match(html, /한 줄 결론 api는 소프트웨어 기능으로 들어가는 문이고, mcp는 외부 도구를 연결합니다\./);
  assert.doesNotMatch(html, /\[!summary\]/i);
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

test('renders share home page with custom hub identity', () => {
  const html = renderShareIndexHtml({
    items: [],
  }, {
    title: '리서치 아카이브',
    eyebrow: 'Research Hub',
    description: '관심 분야별 HTML을 모아두는 공개 허브입니다.',
  });

  assert.match(html, /리서치 아카이브/);
  assert.match(html, /Research Hub/);
  assert.match(html, /관심 분야별 HTML을 모아두는 공개 허브입니다\./);
  assert.match(html, /<meta name="description" content="관심 분야별 HTML을 모아두는 공개 허브입니다\.">/);
  assert.match(html, /<link rel="icon" href="data:,">/);
});

test('renders a share home date sort toggle', () => {
  const html = renderShareIndexHtml({
    items: [
      { title: '2026-06-18 문서', slug: 'new', url: 'https://example.com/new/', updatedAt: '2026-06-18T00:00:00.000Z' },
      { title: '2026-06-11 문서', slug: 'old', url: 'https://example.com/old/', updatedAt: '2026-06-11T00:00:00.000Z' },
    ],
  });

  assert.match(html, /id="sortToggle"/);
  assert.match(html, /최신순/);
  assert.match(html, /오래된순/);
  assert.match(html, /data-updated="2026-06-18T00:00:00\.000Z"/);
  assert.match(html, /sortDirection='desc'/);
});

test('omits visible share home description when description is intentionally blank', () => {
  const html = renderShareIndexHtml({
    items: [],
  }, {
    title: '유네코 지수 통합선별공장 프로젝트',
    eyebrow: '통합선별공장 Archive',
    description: '',
  });

  assert.doesNotMatch(html, /class="hero-copy"/);
  assert.doesNotMatch(html, /MarkTL 공유 아카이브/);
  assert.match(html, /<meta name="description" content="유네코 지수 통합선별공장 프로젝트">/);
});

test('omits visible share home description by default', () => {
  const html = renderShareIndexHtml({
    items: [],
  });

  assert.doesNotMatch(html, /class="hero-copy"/);
  assert.doesNotMatch(html, /MarkTL 공유 아카이브/);
  assert.match(html, /<meta name="description" content="유네코 지수 통합선별공장 프로젝트">/);
});
