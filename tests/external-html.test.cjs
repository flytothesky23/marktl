const test = require('node:test');
const assert = require('node:assert/strict');

const {
  basenameFromHtmlFileName,
  externalThumbnailAssetName,
  externalThumbnailExtension,
  extractExternalHtmlMetadata,
  findExternalHtmlAssetWarnings,
  isSupportedExternalThumbnailFileName,
  isLikelyLocalAssetReference,
} = require('../src/core/external-html.js');
const { validateHtmlArtifact } = require('../src/core/html-qa.js');

test('builds a stable slug from uploaded HTML file names', () => {
  assert.equal(basenameFromHtmlFileName('MCP와_API_입문.html'), 'mcp와-api-입문');
  assert.equal(basenameFromHtmlFileName('/tmp/My Research Page.htm'), 'my-research-page');
});

test('extracts metadata from an existing HTML document', () => {
  const metadata = extractExternalHtmlMetadata(`<!doctype html>
<html><head><title>MCP와 API</title><meta name="description" content="AI 에이전트 입문"></head>
<body><h1>Fallback</h1><main><p>본문 설명입니다.</p></main></body></html>`, 'fallback.html');

  assert.equal(metadata.title, 'MCP와 API');
  assert.equal(metadata.excerpt, 'AI 에이전트 입문');
  assert.deepEqual(metadata.tags, []);
});

test('warns for relative assets that direct HTML upload cannot bundle', () => {
  assert.equal(isLikelyLocalAssetReference('assets/app.css'), true);
  assert.equal(isLikelyLocalAssetReference('https://example.com/app.css'), false);
  assert.equal(isLikelyLocalAssetReference('data:image/png;base64,abc'), false);

  const warnings = findExternalHtmlAssetWarnings('<link rel="stylesheet" href="assets/app.css"><img src="./photo.png"><script src="https://example.com/app.js"></script>');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /2 relative asset reference/);
  assert.match(warnings[0], /assets\/app\.css/);
  assert.match(warnings[0], /\.\/photo\.png/);
});

test('normalizes direct HTML upload thumbnails to a stable card asset name', () => {
  assert.equal(externalThumbnailAssetName('현장 대표 컷.JPG'), 'thumbnail.jpg');
  assert.equal(externalThumbnailAssetName('/tmp/cover.image.webp?cache=1'), 'thumbnail.webp');
  assert.equal(externalThumbnailExtension('cover.AVIF'), '.avif');
  assert.equal(isSupportedExternalThumbnailFileName('diagram.svg'), true);
  assert.equal(isSupportedExternalThumbnailFileName('notes.pdf'), false);
  assert.equal(externalThumbnailAssetName('no-extension'), '');
});

test('external HTML QA keeps fatal checks but skips generated-interactive expectations', () => {
  const warnings = validateHtmlArtifact('<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{}</style></head><body><h1>완성 HTML</h1></body></html>', {
    trusted: true,
    artifactGoal: 'publish',
    exportGenre: 'integrated-note',
    exportDepth: 'deep',
    externalHtml: true,
  });
  assert.deepEqual(warnings, []);

  const fatal = validateHtmlArtifact('<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{}</style></head><body><h1>x</h1>[[Raw Link]]</body></html>', {
    trusted: true,
    externalHtml: true,
  });
  assert.ok(fatal.some((warning) => /^HTML QA fatal:/i.test(warning)));
});
