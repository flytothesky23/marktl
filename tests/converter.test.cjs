const test = require('node:test');
const assert = require('node:assert/strict');

const { convertMarkdownToHtml } = require('../src/core/converter.js');
const { sanitizeHtml } = require('../src/core/sanitizer.js');
const { convertWithAiFallback } = require('../src/core/ai.js');

test('local conversion renders frontmatter, callouts, embeds, and Markdown content', () => {
  const markdown = `---
title: Launch Note
tags: [demo]
---

# Launch Plan

Intro paragraph with [docs](https://example.com).

> [!NOTE] Remember
> Keep the launch small.

![[diagram.png]]

| A | B |
| - | - |
| 1 | 2 |
`;

  const html = convertMarkdownToHtml(markdown, {
    template: 'editorial',
    sourcePath: 'notes/Launch Plan.md',
  });

  assert.match(html, /<h1>Launch Plan<\/h1>/);
  assert.match(html, /class="frontmatter"/);
  assert.match(html, /title: Launch Note/);
  assert.match(html, /class="callout callout-note"/);
  assert.match(html, /Keep the launch small\./);
  assert.match(html, /<img src="diagram\.png" alt="diagram\.png">/);
  assert.match(html, /<table>/);
});

test('sanitized preview removes dynamic and external execution risks', () => {
  const unsafe = `<h1 onclick="steal()">Hi</h1><script>alert(1)</script><iframe src="x"></iframe><link rel="stylesheet" href="https://x"><img src="https://remote.test/a.png" onerror="x()">`;

  const html = sanitizeHtml(unsafe, { trusted: false });

  assert.equal(html.includes('<script'), false);
  assert.equal(html.includes('<iframe'), false);
  assert.equal(html.includes('onclick='), false);
  assert.equal(html.includes('onerror='), false);
  assert.equal(html.includes('<link'), false);
  assert.equal(html.includes('https://remote.test'), false);
});

test('AI conversion falls back by default and stops in strict mode', async () => {
  const markdown = '# Fallback Works';
  const failingProvider = async () => {
    throw new Error('missing CLI');
  };

  const fallback = await convertWithAiFallback(markdown, {
    provider: 'codex',
    mode: 'preserve',
    template: 'minimal',
    strictAiFailures: false,
    runProvider: failingProvider,
  });

  assert.equal(fallback.usedFallback, true);
  assert.equal(fallback.warnings.length, 1);
  assert.match(fallback.html, /Fallback Works/);

  await assert.rejects(
    () => convertWithAiFallback(markdown, {
      provider: 'codex',
      mode: 'preserve',
      template: 'minimal',
      strictAiFailures: true,
      runProvider: failingProvider,
    }),
    /missing CLI/,
  );
});
