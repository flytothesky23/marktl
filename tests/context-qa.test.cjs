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

\`\`\`dataviewjs
dv.pages();
\`\`\`

\`\`\`mermaid
gantt
  title 공정 일정
  section 옹벽
  기초 :done, 2026-06-11, 2d
\`\`\`

Important linked note details.
`,
    },
  ], { kind: 'reference' });

  assert.match(context, /Reference context note is available/);
  assert.match(context, /notes\/Context\.md/);
  assert.match(context, /Important linked note details/);
  assert.match(context, /```mermaid/);
  assert.match(context, /공정 일정/);
  assert.match(context, /\[dataview query omitted]/);
  assert.doesNotMatch(context, /dv\.pages/);
  assert.match(compactMarkdownForContext('a'.repeat(2000), 20), /\[truncated]/);
});

test('validates generated HTML artifact basics and asset references', () => {
  const warnings = validateHtmlArtifact('<html><head></head><body><h1>x</h1><img src="missing.png"></body></html>', {
    trusted: true,
    artifactGoal: 'review',
    assetMappings: [{ relativeSrc: 'assets/chart.png' }],
  });

  assert.match(warnings.join('\n'), /missing <!doctype html>/);
  assert.match(warnings.join('\n'), /missing responsive viewport/);
  assert.match(warnings.join('\n'), /trusted interactive mode produced no script/);
  assert.match(warnings.join('\n'), /review artifact has no obvious/);
  assert.match(warnings.join('\n'), /assets\/chart\.png/);
  assert.match(warnings.join('\n'), /missing alt text/);
});

test('flags raw Obsidian syntax as fatal HTML QA', () => {
  const warnings = validateHtmlArtifact('<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{}</style></head><body><h1>공사일보</h1><p>dataviewjs</p></body></html>', {
    exportGenre: 'construction-daily',
    exportDepth: 'standard',
  });

  assert.match(warnings.join('\n'), /HTML QA fatal/);
});

test('does not require interactive controls for trusted read artifacts', () => {
  const warnings = validateHtmlArtifact('<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{}</style><script></script></head><body><h1>x</h1></body></html>', {
    trusted: true,
    artifactGoal: 'read',
  });

  assert.doesNotMatch(warnings.join('\n'), /no obvious copy-back/);
});
