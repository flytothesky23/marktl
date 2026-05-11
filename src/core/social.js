const { escapeHtml } = require('./html.js');

function buildShortId(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36).slice(0, 7) || 'doc';
}

function injectSocialMeta(html, options = {}) {
  const title = options.title || 'MarkTL HTML artifact';
  const description = options.description || 'A shared HTML document generated with MarkTL.';
  const url = options.url || '';
  const image = options.image || '';
  const tags = [
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    url ? `<meta property="og:url" content="${escapeAttr(url)}">` : '',
    image ? `<meta property="og:image" content="${escapeAttr(image)}">` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeAttr(title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(description)}">`,
    image ? `<meta name="twitter:image" content="${escapeAttr(image)}">` : '',
    url ? `<link rel="canonical" href="${escapeAttr(url)}">` : '',
  ].filter(Boolean).join('\n');

  const value = String(html || '');
  if (/<\/head>/i.test(value)) {
    return value.replace(/<\/head>/i, `${tags}\n</head>`);
  }
  return `${tags}\n${value}`;
}

function escapeAttr(value) {
  return escapeHtml(String(value || '')).replace(/"/g, '&quot;');
}

module.exports = {
  buildShortId,
  injectSocialMeta,
};
