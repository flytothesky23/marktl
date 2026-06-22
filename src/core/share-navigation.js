function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureBlankFavicon(html) {
  if (/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\b(?:shortcut\s+)?icon\b[^"']*["'])/i.test(html)) {
    return html;
  }
  const link = '<link rel="icon" href="data:,">';
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b([^>]*)>/i, `<head$1>\n${link}`);
  }
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${link}\n</head>`);
  }
  return `${link}\n${html}`;
}

function preferLightTheme(html) {
  let value = String(html || '');
  value = value.replace(/<html\b([^>]*)>/i, (match, attrs) => {
    if (/\bdata-theme\s*=/i.test(attrs)) {
      return `<html${attrs.replace(/\sdata-theme\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, ' data-theme="light"')}>`;
    }
    return `<html${attrs} data-theme="light">`;
  });
  value = value.replace(/(<button\b[^>]*\bid\s*=\s*["']themeToggle["'][^>]*>)([^<]*)(<\/button>)/i, '$1다크 전환$3');
  return ensureBlankFavicon(value);
}

function injectStyle(html, style) {
  if (/data-marktl-share-home-style\b/i.test(html)) {
    return html;
  }
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${style}\n</head>`);
  }
  return `${style}\n${html}`;
}

function injectIntoHeroActions(html, link) {
  return html.replace(
    /(<(?:div|nav|section)\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bhero-actions\b[^"']*["'])[^>]*>)([\s\S]*?)(<\/(?:div|nav|section)>)/i,
    (_match, open, body, close) => `${open}${body}\n          ${link}${close}`,
  );
}

function injectShareHomeLink(html, options = {}) {
  const homeUrl = String(options.homeUrl || '').trim();
  let value = preferLightTheme(html);
  if (!homeUrl || !/^https?:\/\//i.test(homeUrl)) {
    return value;
  }
  if (/data-marktl-share-home\b/i.test(value)) {
    return value;
  }

  const label = escapeHtml(options.label || '공유 홈');
  const safeUrl = escapeHtml(homeUrl);
  const style = `
<style data-marktl-share-home-style>
  .marktl-share-home-button,
  .marktl-share-home-inline {
    z-index: 2147483000;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, .42);
    background: rgba(255, 255, 255, .88);
    color: #0f172a;
    box-shadow: 0 12px 34px rgba(15, 23, 42, .16);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    font: 700 13px/1.1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    text-decoration: none;
    white-space: nowrap;
  }
  .marktl-share-home-button {
    position: fixed;
    top: max(14px, env(safe-area-inset-top));
    right: max(14px, env(safe-area-inset-right));
  }
  .marktl-share-home-inline {
    position: relative;
  }
  .marktl-share-home-button:hover,
  .marktl-share-home-inline:hover { transform: translateY(-1px); box-shadow: 0 16px 38px rgba(15, 23, 42, .2); }
  .marktl-share-home-button:focus-visible,
  .marktl-share-home-inline:focus-visible { outline: 3px solid rgba(59, 130, 246, .45); outline-offset: 3px; }
  @media (prefers-color-scheme: dark) {
    .marktl-share-home-button {
      background: rgba(15, 23, 42, .86);
      color: #f8fafc;
      border-color: rgba(148, 163, 184, .36);
    }
  }
  @media print { .marktl-share-home-button, .marktl-share-home-inline { display: none !important; } }
</style>`;
  const inlineLink = `<a class="btn marktl-share-home-inline" data-marktl-share-home href="${safeUrl}" rel="home">${label}</a>`;
  const fixedLink = `<a class="marktl-share-home-button" data-marktl-share-home href="${safeUrl}" rel="home">${label}</a>`;

  value = injectStyle(value, style);
  if (/\bclass\s*=\s*["'][^"']*\bhero-actions\b/i.test(value)) {
    return injectIntoHeroActions(value, inlineLink);
  }
  if (/<body\b([^>]*)>/i.test(value)) {
    return value.replace(/<body\b([^>]*)>/i, `<body$1>\n${fixedLink}`);
  }
  return `${fixedLink}\n${value}`;
}

module.exports = {
  injectShareHomeLink,
};
