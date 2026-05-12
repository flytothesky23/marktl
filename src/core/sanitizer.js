function sanitizeHtml(html, options = {}) {
  if (options.trusted) {
    return html;
  }

  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<math\b[^>]*>[\s\S]*?<\/math>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+srcset\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|action|formaction|poster|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (match, _name, value) => {
      const cleaned = String(value || '').replace(/^['"]|['"]$/g, '').trim().toLowerCase();
      return /^(javascript:|data:text\/html|https?:\/\/)/i.test(cleaned) ? '' : match;
    });
}

function looksLikeHtmlDocument(html) {
  const value = String(html || '').trim();
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

module.exports = {
  looksLikeHtmlDocument,
  sanitizeHtml,
};
