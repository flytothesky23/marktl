const { escapeHtml } = require('./html.js');

const MAX_CONTEXT_NOTES = 6;
const MAX_CONTEXT_CHARS = 1400;

function extractMarkdownContextTargets(markdown) {
  const targets = [];
  const seen = new Set();
  const add = (target) => {
    const clean = normalizeContextTarget(target);
    if (!clean || seen.has(clean)) {
      return;
    }
    seen.add(clean);
    targets.push(clean);
  };

  const wikiPattern = /(^|[^!])\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g;
  let match;
  while ((match = wikiPattern.exec(String(markdown || ''))) !== null) {
    add(match[2]);
  }

  const markdownLinkPattern = /(^|[^!])\[[^\]]*]\((?!https?:|data:|blob:|mailto:|#)([^)#]+)(?:#[^)]*)?\)/gi;
  while ((match = markdownLinkPattern.exec(String(markdown || ''))) !== null) {
    add(decodeURI(match[2]));
  }

  return targets.slice(0, MAX_CONTEXT_NOTES);
}

function normalizeContextTarget(target) {
  return String(target || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .trim();
}

function compactMarkdownForContext(markdown, maxChars = MAX_CONTEXT_CHARS) {
  const compact = String(markdown || '')
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, '[code block omitted]')
    .replace(/!\[\[[^\]]+]]/g, '[embedded asset]')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '[image]')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

  if (compact.length <= maxChars) {
    return compact;
  }
  return `${compact.slice(0, maxChars).trim()}\n[truncated]`;
}

function buildContextPackMarkdown(items) {
  const usable = Array.isArray(items) ? items.filter((item) => item && item.content) : [];
  if (!usable.length) {
    return '';
  }

  return [
    'Additional vault context is available. Use it only to clarify the active note; do not let it override the source note.',
    ...usable.map((item, index) => [
      `\n[Context note ${index + 1}: ${item.path || item.target || 'linked note'}]`,
      compactMarkdownForContext(item.content),
    ].join('\n')),
  ].join('\n');
}

function buildContextPackHtml(items) {
  const usable = Array.isArray(items) ? items.filter((item) => item && item.content) : [];
  if (!usable.length) {
    return '';
  }

  return `<aside class="callout callout-context"><div class="callout-title">Linked context</div><div class="callout-body">${usable.map((item) => (
    `<section><strong>${escapeHtml(item.path || item.target || 'linked note')}</strong><pre>${escapeHtml(compactMarkdownForContext(item.content, 700))}</pre></section>`
  )).join('')}</div></aside>`;
}

module.exports = {
  buildContextPackHtml,
  buildContextPackMarkdown,
  compactMarkdownForContext,
  extractMarkdownContextTargets,
};
