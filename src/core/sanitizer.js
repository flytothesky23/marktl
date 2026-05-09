function sanitizeHtml(html, options = {}) {
  if (options.trusted) {
    return html;
  }

  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s+(href|src)\s*=\s*("|')\s*https?:\/\/[^"']*\2/gi, '');
}

function looksLikeHtmlDocument(html) {
  const value = String(html || '').trim();
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

module.exports = {
  looksLikeHtmlDocument,
  sanitizeHtml,
};
