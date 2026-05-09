const test = require('node:test');
const assert = require('node:assert/strict');

const { convertMarkdownToHtml } = require('../src/core/converter.js');
const { sanitizeHtml } = require('../src/core/sanitizer.js');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { buildPrompt, cleanProviderError, convertWithAiFallback, discoverUserCliPaths, extractHtmlFromAiOutput, mergePath, parseProviderOutput } = require('../src/core/ai.js');

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

test('AI prompt asks for designed output and gates dynamic HTML by trusted mode', () => {
  const sanitizedPrompt = buildPrompt('# Note', {
    mode: 'presentation',
    template: 'deck',
    trusted: false,
  });
  const trustedPrompt = buildPrompt('# Note', {
    mode: 'presentation',
    template: 'deck',
    trusted: true,
  });

  assert.match(sanitizedPrompt, /refined, modern, visually designed HTML page/);
  assert.match(sanitizedPrompt, /do not use JavaScript/);
  assert.match(trustedPrompt, /you may include small inline JavaScript/);
  assert.match(trustedPrompt, /do not load remote resources/);
});

test('AI conversion accepts fenced or explained HTML responses by extracting the document', async () => {
  const aiOutput = `Here is the generated page:

\`\`\`html
<!doctype html>
<html>
<head><title>Designed</title></head>
<body><main><h1>Designed Note</h1></main></body>
</html>
\`\`\`
`;

  assert.match(extractHtmlFromAiOutput(aiOutput), /<h1>Designed Note<\/h1>/);

  const result = await convertWithAiFallback('# Source', {
    provider: 'codex',
    mode: 'presentation',
    template: 'deck',
    strictAiFailures: false,
    runProvider: async () => aiOutput,
  });

  assert.equal(result.usedFallback, false);
  assert.match(result.html, /Designed Note/);
});

test('Codex JSON event output is parsed from the final agent message', () => {
  const stdout = [
    'Reading additional input from stdin...',
    '{"type":"thread.started","thread_id":"abc"}',
    '{"type":"item.completed","item":{"id":"1","type":"agent_message","text":"<html><body><h1>First</h1></body></html>"}}',
    '{"type":"item.completed","item":{"id":"2","type":"agent_message","text":"<!doctype html><html><body><h1>Final</h1></body></html>"}}',
  ].join('\n');

  const parsed = parseProviderOutput(stdout, { parser: 'codex-json' });

  assert.match(parsed, /<h1>Final<\/h1>/);
  assert.equal(parsed.includes('Reading additional input'), false);
});

test('Codex JSON error event fails instead of being treated as HTML output', () => {
  const stdout = [
    '{"type":"thread.started","thread_id":"abc"}',
    '{"type":"item.completed","item":{"id":"1","type":"error","message":"config is invalid"}}',
    '{"type":"turn.completed"}',
  ].join('\n');

  assert.throws(() => parseProviderOutput(stdout, { parser: 'codex-json' }), /config is invalid/);
});

test('Codex prompt can be passed as an argument instead of stdin-only dash mode', () => {
  const prompt = buildPrompt('# Arg Mode', {
    mode: 'preserve',
    template: 'minimal',
    trusted: false,
  });

  assert.match(prompt, /Arg Mode/);
  assert.equal(prompt.includes('Return only HTML'), true);
});

test('CLI path helper prepends common Node locations', () => {
  const mergedPath = mergePath('/custom/bin:/opt/homebrew/bin', { homeDir: '' });
  assert.equal(mergedPath.split(':')[0], '/opt/homebrew/bin');
  assert.equal(mergedPath.includes('/usr/local/bin'), true);
  assert.equal(mergedPath.includes('/custom/bin'), true);
});

test('provider errors do not leak the full Markdown prompt', () => {
  const raw = `Command failed: /bin/zsh -lic 'claude' '-p' 'Convert this Obsidian Markdown note to a complete standalone HTML document. ${'x'.repeat(1000)}'
Error: Input must be provided`;

  const cleaned = cleanProviderError(raw);

  assert.equal(cleaned.includes('Convert this Obsidian Markdown note'), false);
  assert.equal(cleaned.length < 400, true);
});

test('CLI path discovery includes nvm and volta bins for Obsidian app launches', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'marktl-home-'));
  try {
    const nodeBin = path.join(home, '.nvm/versions/node/v24.14.0/bin');
    fs.mkdirSync(nodeBin, { recursive: true });
    fs.writeFileSync(path.join(nodeBin, 'node'), '');

    const paths = discoverUserCliPaths(home);

    assert.equal(paths.includes(path.join(home, '.volta/bin')), true);
    assert.equal(paths.includes(nodeBin), true);
  } finally {
    fs.rmSync(home, { force: true, recursive: true });
  }
});
