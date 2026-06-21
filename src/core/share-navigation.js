function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectShareHomeLink(html, options = {}) {
  const homeUrl = String(options.homeUrl || '').trim();
  if (!homeUrl || !/^https?:\/\//i.test(homeUrl)) {
    return String(html || '');
  }
  let value = String(html || '');
  if (/data-marktl-share-home\b/i.test(value)) {
    return value;
  }

  const label = escapeHtml(options.label || '공유 홈');
  const safeUrl = escapeHtml(homeUrl);
  const style = `
<style data-marktl-share-home-style>
  .marktl-share-home-button {
    position: fixed;
    top: max(14px, env(safe-area-inset-top));
    right: max(14px, env(safe-area-inset-right));
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
  }
  .marktl-share-home-button:hover { transform: translateY(-1px); box-shadow: 0 16px 38px rgba(15, 23, 42, .2); }
  .marktl-share-home-button:focus-visible { outline: 3px solid rgba(59, 130, 246, .45); outline-offset: 3px; }
  @media (prefers-color-scheme: dark) {
    .marktl-share-home-button {
      background: rgba(15, 23, 42, .86);
      color: #f8fafc;
      border-color: rgba(148, 163, 184, .36);
    }
  }
  @media print { .marktl-share-home-button { display: none !important; } }
</style>`;
  const link = `<a class="marktl-share-home-button" data-marktl-share-home href="${safeUrl}" rel="home">← ${label}</a>`;

  if (/<\/head>/i.test(value)) {
    value = value.replace(/<\/head>/i, `${style}\n</head>`);
  } else {
    value = `${style}\n${value}`;
  }
  if (/<body\b([^>]*)>/i.test(value)) {
    return value.replace(/<body\b([^>]*)>/i, `<body$1>\n${link}`);
  }
  return `${link}\n${value}`;
}

module.exports = {
  injectShareHomeLink,
};
