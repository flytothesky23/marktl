const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildGiscusFeedbackSection,
  injectReaderFeedback,
  shouldAttachReaderFeedback,
  validateGiscusConfig,
} = require('../src/core/feedback.js');

const giscus = {
  repo: 'reallygood83/moondoc',
  repoId: 'R_kgDOdemo',
  category: 'Announcements',
  categoryId: 'DIC_kwDOdemo',
  mapping: 'pathname',
  theme: 'preferred_color_scheme',
};

test('builds giscus reader feedback section with GitHub login guidance', () => {
  const html = buildGiscusFeedbackSection(giscus);

  assert.match(html, /Reader feedback/);
  assert.match(html, /Sign in with GitHub/);
  assert.match(html, /https:\/\/github\.com\/login/);
  assert.match(html, /After sign-in, use the Giscus comment box below/);
  assert.match(html, /https:\/\/giscus\.app\/client\.js/);
  assert.match(html, /data-repo="reallygood83\/moondoc"/);
  assert.match(html, /data-mapping="pathname"/);
});

test('injects giscus feedback before closing main', () => {
  const html = injectReaderFeedback('<main><article><h1>Doc</h1></article></main>', giscus);

  assert.match(html, /<section class="marktl-reader-feedback"/);
  assert.match(html, /<\/section>\n<\/main>/);
});

test('validates required giscus configuration fields', () => {
  const warnings = validateGiscusConfig({ repo: 'owner/repo' });

  assert.match(warnings.join('\n'), /repository ID/);
  assert.match(warnings.join('\n'), /discussion category/);
  assert.match(warnings.join('\n'), /discussion category ID/);
});

test('skips giscus feedback for local file exports', () => {
  assert.equal(shouldAttachReaderFeedback({
    readerFeedbackMode: 'giscus',
    shareTarget: 'local-link',
  }), false);
  assert.equal(shouldAttachReaderFeedback({
    readerFeedbackMode: 'giscus',
    shareTarget: 'static-bundle',
  }), true);
  assert.equal(shouldAttachReaderFeedback({
    readerFeedbackMode: 'none',
    shareTarget: 'github-pages',
  }), false);
});
