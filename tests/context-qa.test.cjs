const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildContextPackMarkdown,
  compactMarkdownForContext,
  extractMarkdownContextTargets,
} = require('../src/core/context-pack.js');
const { validateHtmlArtifact } = require('../src/core/html-qa.js');

test('extracts linked Markdown context targets without remote links', () => {
  const targets = extractMarkdownContextTargets(`
See [[Decision Memo#Options]] and [[Research/Market|market]].
Also [local](notes/local.md), [remote](https://example.com), and ![[diagram.png]].
`);

  assert.deepEqual(targets, ['Decision Memo', 'Research/Market', 'notes/local.md']);
});

test('builds compact context pack instructions for AI prompts', () => {
  const context = buildContextPackMarkdown([
    {
      path: 'notes/Context.md',
      content: `---
title: Context
---

# Context

\`\`\`js
secret();
\`\`\`

Important linked note details.
`,
    },
  ]);

  assert.match(context, /Additional vault context is available/);
  assert.match(context, /notes\/Context\.md/);
  assert.match(context, /Important linked note details/);
  assert.match(compactMarkdownForContext('a'.repeat(2000), 20), /\[truncated]/);
});

test('validates generated HTML artifact basics and asset references', () => {
  const warnings = validateHtmlArtifact('<html><head></head><body><h1>x</h1><img src="missing.png"></body></html>', {
    trusted: true,
    assetMappings: [{ relativeSrc: 'assets/chart.png' }],
  });

  assert.match(warnings.join('\n'), /missing <!doctype html>/);
  assert.match(warnings.join('\n'), /missing responsive viewport/);
  assert.match(warnings.join('\n'), /trusted interactive mode produced no script/);
  assert.match(warnings.join('\n'), /assets\/chart\.png/);
  assert.match(warnings.join('\n'), /missing alt text/);
});
