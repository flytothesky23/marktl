const path = require('node:path');

function parseRepo(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/^https:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const [owner, repo] = cleaned.split('/');
  if (!owner || !repo) {
    return null;
  }
  return { owner, repo };
}

function normalizePublishPath(value) {
  return String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/');
}

function buildPublishPath(basePath, slug, filePath) {
  return [normalizePublishPath(basePath), slug, filePath]
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/');
}

function buildPagesUrl(baseUrl, basePath, slug) {
  const root = String(baseUrl || '').trim().replace(/\/+$/g, '');
  if (!root) {
    return '';
  }
  const suffix = [normalizePublishPath(basePath), slug]
    .filter(Boolean)
    .map((part) => encodePathPart(part))
    .join('/');
  return `${root}/${suffix ? `${suffix}/` : ''}`;
}

function buildShareHomeUrl(baseUrl, basePath) {
  const root = String(baseUrl || '').trim().replace(/\/+$/g, '');
  if (!root) {
    return '';
  }
  const suffix = normalizePublishPath(basePath);
  return `${root}/${suffix ? `${encodePathPart(suffix)}/` : ''}`;
}

function encodePathPart(value) {
  return String(value || '')
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function inferPagesBaseUrl(repoValue) {
  const repo = parseRepo(repoValue);
  if (!repo) {
    return '';
  }
  if (repo.repo.toLowerCase() === `${repo.owner.toLowerCase()}.github.io`) {
    return `https://${repo.repo}`;
  }
  return `https://${repo.owner}.github.io/${repo.repo}`;
}

function mimeTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
  }[extension] || 'application/octet-stream';
}

function updateShareIndex(existingIndex, entry) {
  const now = entry.updatedAt || new Date().toISOString();
  const current = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
  const items = [
    {
      ...entry,
      updatedAt: now,
    },
    ...current.filter((item) => item && item.slug !== entry.slug),
  ].sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')));

  return {
    version: 1,
    updatedAt: now,
    items,
  };
}

function renderShareIndexHtml(index, options = {}) {
  const title = options.title || 'MarkTL Shared HTML';
  const baseUrl = String(options.baseUrl || '').replace(/\/+$/g, '');
  const items = Array.isArray(index?.items) ? index.items : [];
  const tagCounts = new Map();
  for (const item of items) {
    for (const tag of normalizeTags(item.tags)) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const tagButtons = [...tagCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([tag, count]) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} <span>${count}</span></button>`)
    .join('');
  const list = items.map((item) => {
    const href = item.url || (baseUrl ? `${baseUrl}/${encodeURIComponent(item.slug)}/` : `${encodeURIComponent(item.slug)}/`);
    const tags = normalizeTags(item.tags);
    const searchText = [
      item.title,
      item.slug,
      item.excerpt,
      item.sourcePath,
      item.artifactType,
      ...tags,
    ].filter(Boolean).join(' ').toLowerCase();
    return `<article class="item" data-search="${escapeHtml(searchText)}" data-tags="${escapeHtml(tags.join(' '))}">
<div class="item-top"><a href="${escapeHtml(href)}">${escapeHtml(item.title || item.slug)}</a><span>${escapeHtml(formatDate(item.updatedAt))}</span></div>
<p>${escapeHtml(item.excerpt || item.sourcePath || '')}</p>
<div class="item-meta"><span>${escapeHtml(item.artifactType || 'HTML artifact')}</span><span>${escapeHtml(item.sourcePath || '')}</span></div>
${tags.length ? `<div class="tags">${tags.map((tag) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join('')}</div>` : ''}
</article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f4;color:#172033}
main{max-width:1120px;margin:0 auto;padding:44px 22px 72px}
.hero{display:grid;gap:14px;margin-bottom:22px}.eyebrow{color:#8a4b64;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.08em}
h1{font-size:clamp(34px,6vw,72px);line-height:.98;margin:0}.meta{color:#68737d;margin:0;font-size:18px}
.toolbar{position:sticky;top:0;z-index:2;display:grid;gap:12px;background:rgba(246,247,244,.94);backdrop-filter:blur(12px);border-bottom:1px solid #dde2e6;padding:14px 0;margin-bottom:18px}
.toolbar input{width:100%;border:1px solid #cfd8e5;border-radius:8px;padding:12px 14px;font-size:16px;background:#fff;color:#172033}
.tagbar{display:flex;flex-wrap:wrap;gap:8px}.tagbar button,.tags button{border:1px solid #d6dfeb;background:#fff;color:#33506d;border-radius:999px;padding:6px 10px;cursor:pointer}.tagbar button.active,.tags button:hover{background:#174ea6;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.item{display:flex;min-height:210px;flex-direction:column;gap:12px;background:#fff;border:1px solid #dde2e6;border-radius:8px;padding:18px;box-shadow:0 12px 32px rgba(23,32,51,.05)}
.item-top{display:grid;gap:8px}.item a{color:#174ea6;font-size:20px;font-weight:800;line-height:1.2;text-decoration:none}.item a:hover{text-decoration:underline}
.item-top span,.item-meta{color:#68737d;font-size:13px}.item p{color:#344054;line-height:1.55;margin:0;flex:1}.item-meta{display:grid;gap:4px}.tags{display:flex;flex-wrap:wrap;gap:6px}
.empty{background:#fff;border:1px dashed #cfd8e5;border-radius:8px;padding:24px;color:#68737d}
</style>
</head>
<body><main>
<section class="hero"><div class="eyebrow">MarkTL Archive</div><h1>${escapeHtml(title)}</h1><p class="meta"><span id="count">${items.length}</span> published document(s). Search, filter, and open any shared HTML artifact.</p></section>
<section class="toolbar" aria-label="Archive controls"><input id="search" type="search" placeholder="Search documents, tags, sources..." aria-label="Search documents"><div class="tagbar"><button type="button" data-tag="">All</button>${tagButtons}</div></section>
<section class="grid" id="items">${list || '<p class="empty">No published documents yet.</p>'}</section>
</main>
<script>
const search = document.getElementById('search');
const count = document.getElementById('count');
const cards = [...document.querySelectorAll('.item')];
let activeTag = '';
function applyFilters(){
  const query = (search.value || '').trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const matchesQuery = !query || card.dataset.search.includes(query);
    const matchesTag = !activeTag || (' ' + card.dataset.tags + ' ').includes(' ' + activeTag + ' ');
    const show = matchesQuery && matchesTag;
    card.hidden = !show;
    if (show) visible++;
  }
  count.textContent = String(visible);
}
document.querySelectorAll('[data-tag]').forEach((button) => {
  button.addEventListener('click', () => {
    activeTag = button.dataset.tag || '';
    document.querySelectorAll('.tagbar [data-tag]').forEach((node) => node.classList.toggle('active', node.dataset.tag === activeTag));
    applyFilters();
  });
});
search.addEventListener('input', applyFilters);
applyFilters();
</script>
</body>
</html>`;
}

function normalizeTags(tags) {
  const values = Array.isArray(tags) ? tags : String(tags || '').split(',');
  return values
    .map((tag) => String(tag || '').replace(/^#/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  buildPagesUrl,
  buildPublishPath,
  buildShareHomeUrl,
  inferPagesBaseUrl,
  mimeTypeForPath,
  normalizePublishPath,
  parseRepo,
  renderShareIndexHtml,
  updateShareIndex,
};
