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

function buildShortPagesUrl(baseUrl, basePath, shortId) {
  return buildPagesUrl(baseUrl, basePath, `s/${shortId}`);
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
  const now = entry?.updatedAt || new Date().toISOString();
  const current = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
  const nextEntry = normalizeShareEntry(entry, now);
  const merged = nextEntry
    ? [nextEntry, ...repairShareItems(current).filter((item) => !shareItemsMatch(item, nextEntry))]
    : repairShareItems(current);
  const items = dedupeShareItems(merged)
    .sort(compareShareItems);

  return {
    version: 2,
    updatedAt: now,
    items,
  };
}

function repairShareIndex(existingIndex) {
  const now = new Date().toISOString();
  const current = Array.isArray(existingIndex?.items) ? existingIndex.items : [];
  const items = dedupeShareItems(repairShareItems(current))
    .sort(compareShareItems);

  return {
    version: 2,
    updatedAt: existingIndex?.updatedAt || now,
    items,
  };
}

function shareDeleteKeys(item) {
  return [
    item?.shortId ? `short:${item.shortId}` : '',
    item?.url ? `url:${String(item.url).replace(/\/+$/g, '')}` : '',
    item?.canonicalUrl ? `canonical:${String(item.canonicalUrl).replace(/\/+$/g, '')}` : '',
    item?.sourcePathKey ? `source:${item.sourcePathKey}` : '',
    item?.slug ? `slug:${item.slug}` : '',
  ].filter(Boolean);
}

function removeShareIndexItems(existingIndex, targets) {
  const repaired = repairShareIndex(existingIndex || { items: [] });
  const targetList = Array.isArray(targets) ? targets : [targets];
  const targetKeys = new Set(targetList.flatMap(shareDeleteKeys));
  if (!targetKeys.size) {
    return {
      removed: [],
      index: repaired,
    };
  }

  const removed = [];
  const kept = [];
  for (const item of repaired.items) {
    const matches = shareDeleteKeys(item).some((key) => targetKeys.has(key));
    if (matches) {
      removed.push(item);
    } else {
      kept.push(item);
    }
  }

  return {
    removed,
    index: repairShareIndex({
      ...repaired,
      updatedAt: new Date().toISOString(),
      items: kept,
    }),
  };
}

function renderShareIndexHtml(index, options = {}) {
  const title = cleanArchiveText(options.title || '유네코 지수 통합선별공장 프로젝트', '유네코 지수 통합선별공장 프로젝트');
  const eyebrow = cleanArchiveText(options.eyebrow || '통합선별공장 Archive', '통합선별공장 Archive');
  const hasDescriptionOption = Object.prototype.hasOwnProperty.call(options, 'description');
  const description = cleanArchiveText(
    hasDescriptionOption ? options.description : '',
    '',
  );
  const metaDescription = description || title;
  const descriptionHtml = description ? `      <p class="hero-copy">${escapeHtml(description)}</p>` : '';
  const baseUrl = String(options.baseUrl || '').replace(/\/+$/g, '');
  const items = repairShareItems(Array.isArray(index?.items) ? index.items : [])
    .map((item, itemIndex) => normalizeArchiveItem(item, itemIndex, baseUrl));
  const tagCounts = new Map();
  const typeCounts = new Map();
  for (const item of items) {
    typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const preferredTypes = ['통합노트', '회의록', '보고서', '노트', '기사', '브리핑', '비교검토'];
  const typeButtons = preferredTypes
    .filter((type) => typeCounts.has(type))
    .concat([...typeCounts.keys()].filter((type) => !preferredTypes.includes(type)).sort((left, right) => left.localeCompare(right)))
    .map((type) => `<button type="button" data-filter="${escapeHtml(type)}">${escapeHtml(type)}</button>`)
    .join('');
  const tagButtons = [...tagCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10)
    .map(([tag, count]) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} ${count}</button>`)
    .join('');
  const list = items.map(renderArchiveTile).join('\n');
  const latestMonth = (items.find((item) => item.date)?.date || formatDate(index?.updatedAt)).slice(0, 7) || new Date().toISOString().slice(0, 7);
  const docsJson = safeInlineJson(items.map((item) => ({
    title: item.title,
    type: item.type,
    date: item.date,
    url: item.href,
    tags: item.tags,
  })));

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDescription)}">
<link rel="icon" href="data:,">
<style>
*{box-sizing:border-box}html,body{height:100%;background:#050507}body{margin:0;min-width:0;width:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7f8fb;background:radial-gradient(circle at 12% 0%,rgba(255,61,61,.3),transparent 32rem),radial-gradient(circle at 88% 5%,rgba(25,211,197,.22),transparent 30rem),linear-gradient(180deg,#08090d 0%,#111014 48%,#050507 100%);overflow:hidden}a{color:inherit;text-decoration:none}button,input{font:inherit}.app{width:min(1480px,100%);height:100dvh;margin:0 auto;padding:clamp(14px,2vw,28px);display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;overflow:hidden}.top{display:grid;grid-template-columns:minmax(0,1fr) minmax(190px,222px);gap:22px;align-items:start;min-height:0}.hero-panel{display:grid;align-content:start;gap:0;min-width:0;padding-top:8px}.eyebrow{margin:0 0 8px;color:#ffb020;font-size:12px;font-weight:950;letter-spacing:.16em;text-transform:uppercase}.top h1{max-width:860px;margin:0;font-size:clamp(30px,4vw,56px);line-height:1.02;letter-spacing:0;font-weight:950;text-wrap:balance}.hero-copy{max-width:820px;margin:12px 0 0;color:#c8d0dc;font-size:clamp(14px,1.18vw,17px);line-height:1.5}.calendar{width:100%;height:180px;min-height:180px;align-self:start;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.105),rgba(255,255,255,.045));box-shadow:0 14px 34px rgba(0,0,0,.24);padding:9px 10px 12px;backdrop-filter:blur(18px)}.cal-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px}.cal-title{font-size:13px;font-weight:950;letter-spacing:.02em}.cal-nav{display:flex;gap:4px}.cal-nav button{display:grid;place-items:center;width:22px;height:22px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.cal-nav button:hover{background:#ff3d3d}.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(7,1fr);gap:2px}.cal-week{color:#8d98a8;font-size:8px;font-weight:900;text-align:center}.cal-day{position:relative;display:grid;place-items:center;min-height:14px;border:0;border-radius:5px;background:transparent;color:#cfd6e4;font-size:9px;font-weight:800}.cal-day.muted{opacity:.28}.cal-day.has-doc{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important;min-height:18px!important;padding:1px 2px!important;line-height:1!important;cursor:pointer;color:#fff;background:linear-gradient(135deg,#ff3d3d,#ff9f1c);box-shadow:0 6px 12px rgba(255,80,40,.2)}.cal-day.has-doc::after{content:attr(data-type);display:block;max-width:28px;font-size:5.5px;font-weight:900;color:rgba(255,255,255,.86);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.toolbar{position:static;display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:10px;align-items:center;max-width:100%;overflow:hidden;margin-top:16px;padding:8px 0 0;background:transparent;border:0;backdrop-filter:none}.search{height:38px;min-width:0;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.08);color:#fff;padding:0 13px;outline:none}.search::placeholder{color:#8f98a8}.search:focus{border-color:#ffb020;box-shadow:0 0 0 3px rgba(255,176,32,.16)}.filters{min-width:0;max-width:100%;display:flex;flex-wrap:wrap;align-content:flex-start;gap:4px;max-height:48px;overflow:hidden;scrollbar-width:none}.filters::-webkit-scrollbar{display:none}.filters button,.tags button{border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.065);color:#dce3ef;cursor:pointer;white-space:nowrap}.filters button{height:22px;padding:0 7px;font-size:10px;line-height:1;font-weight:850}.filters button.active{border-color:#ff3d3d;background:#ff3d3d;color:#fff}.content{min-height:0;overflow:auto;padding:0 2px 28px 0;scrollbar-color:rgba(255,255,255,.26) transparent}.content::-webkit-scrollbar{width:10px}.content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:999px}.section-head{position:static;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 8px;padding:2px 0 8px;background:transparent}.section-head h2{margin:0;font-size:18px;letter-spacing:0}.section-tools{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0}.section-head span{color:#9aa4b5;font-size:12px;font-weight:800;white-space:nowrap}.sort-toggle{height:28px;padding:0 10px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.075);color:#e7edf7;cursor:pointer;font-size:11px;font-weight:900;white-space:nowrap}.sort-toggle:hover{border-color:#ffb020;background:rgba(255,176,32,.16)}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:start}.tile{container-type:inline-size;position:relative;display:grid;grid-template-columns:minmax(142px,44%) minmax(0,1fr);height:96px;min-height:0;overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.095),rgba(255,255,255,.035));box-shadow:0 16px 34px rgba(0,0,0,.28);animation:tileIn .42s ease both;animation-delay:calc(var(--i)*42ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.tile::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 34%,transparent),transparent 58%);opacity:.34;pointer-events:none}.tile:hover{transform:translateY(-4px) scale(1.01);border-color:color-mix(in srgb,var(--accent) 72%,white);box-shadow:0 24px 54px rgba(0,0,0,.42)}.poster{position:relative;min-width:0;background:#181a22;overflow:hidden;border-right:1px solid rgba(255,255,255,.08)}.poster img{width:100%;height:100%;min-height:0;object-fit:cover;display:block;transform:scale(1.01);transition:transform .25s ease,filter .25s ease}.tile:hover .poster img{transform:scale(1.05);filter:saturate(1.12)}.poster::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 48%,rgba(10,10,12,.88) 100%)}.tile-body{position:relative;min-width:0;display:flex;flex-direction:column;justify-content:center;padding:11px 34px 11px 11px}.meta-line{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px;color:#aab4c4;font-size:10px;font-weight:850}.type{color:var(--accent2);text-transform:uppercase}.tile h2{margin:0;color:#fff;font-size:clamp(13.5px,4.2cqi,17px);line-height:1.16;letter-spacing:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tile p{display:none}.tags{display:none}.tags::-webkit-scrollbar{display:none}.tags button{flex:0 0 auto;height:21px;line-height:1;padding:0 7px;font-size:10px;max-width:132px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.play{position:absolute;right:12px;bottom:12px;z-index:4;display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 10px 20px rgba(0,0,0,.26);font-size:12px}.empty{padding:18px;border:1px dashed rgba(255,255,255,.2);border-radius:8px;color:#aab4c4}.hidden{display:none!important}@keyframes tileIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@media(max-width:1280px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.tile{height:98px}}@media(max-width:980px){.app{padding:10px 12px 16px;gap:8px}.top{grid-template-columns:1fr;gap:9px}.hero-panel{padding-top:0}.eyebrow{font-size:10px;margin-bottom:5px;letter-spacing:.14em}.top h1{font-size:clamp(25px,7.4vw,32px);line-height:1.02;max-width:360px}.hero-copy{margin-top:7px;font-size:12.5px;line-height:1.42;max-width:390px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.toolbar{grid-template-columns:1fr;gap:6px;margin-top:8px;padding:0;overflow:visible}.search{height:34px;border-radius:7px;font-size:12.5px;padding:0 10px}.filters{max-height:52px;gap:4px}.filters button{height:22px;padding:0 7px;font-size:10px}.calendar{width:min(222px,100%);height:154px;min-height:154px;justify-self:end;padding:8px 9px 10px}.cal-title{font-size:12px}.cal-nav button{width:20px;height:20px}.cal-week{font-size:7.5px}.cal-day{min-height:12px;font-size:8.5px}.cal-day.has-doc{min-height:16px!important;padding:1px 2px!important}.cal-day.has-doc::after{display:none}.section-head{padding:4px 0 7px;margin-bottom:7px}.section-head h2{font-size:15px}.section-head span{font-size:11px}.section-tools{gap:6px}.sort-toggle{height:25px;padding:0 8px;font-size:10px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.tile{grid-template-columns:minmax(132px,44%) minmax(0,1fr);height:92px;min-height:0;border-radius:8px}.poster{width:auto;border:0;border-radius:0}.poster img{min-height:0;height:100%;object-fit:cover}.poster::after{background:linear-gradient(90deg,transparent 28%,rgba(10,10,12,.9) 100%)}.tile-body{padding:8px 30px 8px 10px}.meta-line{font-size:9.5px;margin-bottom:4px}.tile h2{font-size:15px;line-height:1.12;-webkit-line-clamp:2}.tile p{display:none}.play{width:24px;height:24px;right:7px;bottom:7px;font-size:10px}.tags{display:none}}@media(max-width:640px){.grid{grid-template-columns:1fr}.tile{grid-template-columns:150px minmax(0,1fr);height:86px}}@media(max-width:420px){.app{padding:9px 10px 14px}.calendar{display:none}.tile{grid-template-columns:132px minmax(0,1fr);height:78px;min-height:0}.poster img{min-height:0}.top h1{font-size:25px}.hero-copy{font-size:12px}.filters button{font-size:10px}.tile h2{font-size:14.5px}}
</style>
</head>
<body>
<div class="app">
  <header class="top">
    <div class="hero-panel">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
${descriptionHtml}
      <section class="toolbar" aria-label="검색과 필터">
        <input class="search" id="search" type="search" placeholder="문서, 현장, 회의, 태그 검색" aria-label="문서 검색">
        <div class="filters"><button class="active" type="button" data-filter="">전체</button>${typeButtons}${tagButtons}</div>
      </section>
    </div>
    <aside class="calendar" aria-label="게시 날짜 캘린더">
      <div class="cal-head"><button type="button" class="cal-title" id="calTitle" aria-label="현재 월"></button><div class="cal-nav"><button type="button" id="prevMonth" aria-label="이전 달">‹</button><button type="button" id="nextMonth" aria-label="다음 달">›</button></div></div>
      <div class="cal-grid" id="calendarGrid"></div>
    </aside>
  </header>
  <section class="content" aria-label="문서 목록 스크롤 영역">
    <div class="section-head"><h2>지금 볼 문서</h2><div class="section-tools"><button class="sort-toggle" id="sortToggle" type="button" aria-label="오래된순으로 정렬">최신순</button><span id="count">${items.length}개 표시</span></div></div>
    <main class="grid" id="items">${list || '<p class="empty">게시된 문서가 없습니다.</p>'}</main>
  </section>
</div>
<script>
const docs=${docsJson};
const initialMonth='${escapeJsString(latestMonth)}';
const search=document.getElementById('search');const count=document.getElementById('count');const grid=document.getElementById('items');const sortToggle=document.getElementById('sortToggle');const cards=[...document.querySelectorAll('.tile')];let activeType='';let activeTag='';let activeDate='';let sortDirection='desc';let calDate=new Date(Number(initialMonth.slice(0,4)),Number(initialMonth.slice(5,7))-1,1);
function compareCards(a,b){const dateCompare=String(b.dataset.date||'').localeCompare(String(a.dataset.date||''));if(dateCompare)return sortDirection==='desc'?dateCompare:-dateCompare;const updatedCompare=String(b.dataset.updated||'').localeCompare(String(a.dataset.updated||''));if(updatedCompare)return sortDirection==='desc'?updatedCompare:-updatedCompare;const orderCompare=Number(a.dataset.order||0)-Number(b.dataset.order||0);return sortDirection==='desc'?orderCompare:-orderCompare;}
function sortCards(){if(!grid||!cards.length)return;[...cards].sort(compareCards).forEach(card=>grid.append(card));if(sortToggle){sortToggle.textContent=sortDirection==='desc'?'최신순':'오래된순';sortToggle.setAttribute('aria-label',sortDirection==='desc'?'오래된순으로 정렬':'최신순으로 정렬');}}
function apply(){const q=(search.value||'').trim().toLowerCase();let n=0;for(const card of cards){const okQ=!q||card.dataset.search.includes(q);const okT=!activeType||card.dataset.type===activeType;const okTag=!activeTag||(' '+card.dataset.tags+' ').includes(' '+activeTag+' ');const okDate=!activeDate||card.dataset.date===activeDate;const show=okQ&&okT&&okTag&&okDate;card.classList.toggle('hidden',!show);if(show)n++;}count.textContent=(activeDate?activeDate+' · ':'')+n+'개 표시';}
function setActiveButton(btn){document.querySelectorAll('.filters button').forEach(b=>b.classList.toggle('active',b===btn));}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{activeType=btn.dataset.filter||'';activeTag='';activeDate='';setActiveButton(btn);apply();}));document.querySelectorAll('[data-tag]').forEach(btn=>btn.addEventListener('click',()=>{activeTag=btn.dataset.tag||'';activeType='';activeDate='';setActiveButton(btn);apply();}));search.addEventListener('input',()=>{activeDate='';apply();});
if(sortToggle){sortToggle.addEventListener('click',()=>{sortDirection=sortDirection==='desc'?'asc':'desc';sortCards();apply();});}
function docsByDate(date){return docs.filter(d=>d.date===date)}
function renderCalendar(){const y=calDate.getFullYear();const m=calDate.getMonth();const title=document.getElementById('calTitle');title.textContent=y+'.'+String(m+1).padStart(2,'0');const grid=document.getElementById('calendarGrid');grid.innerHTML='';['일','월','화','수','목','금','토'].forEach(w=>{const el=document.createElement('div');el.className='cal-week';el.textContent=w;grid.append(el);});const first=new Date(y,m,1);const days=new Date(y,m+1,0).getDate();for(let i=0;i<first.getDay();i++){const blank=document.createElement('span');blank.className='cal-day muted';grid.append(blank);}for(let d=1;d<=days;d++){const date=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const dayDocs=docsByDate(date);const button=document.createElement('button');button.type='button';button.className='cal-day'+(dayDocs.length?' has-doc':'');button.textContent=String(d);button.dataset.date=date;if(dayDocs.length){button.dataset.type=dayDocs[0].type;button.title=dayDocs.map(x=>x.title).join(String.fromCharCode(10));button.addEventListener('click',()=>{if(dayDocs.length===1){location.href=dayDocs[0].url;}else{activeDate=date;activeType='';activeTag='';setActiveButton(document.querySelector('[data-filter=""]'));apply();}});}grid.append(button);}}
document.getElementById('prevMonth').addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);renderCalendar();});document.getElementById('nextMonth').addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);renderCalendar();});document.getElementById('calTitle').addEventListener('click',()=>{calDate=new Date(Number(initialMonth.slice(0,4)),Number(initialMonth.slice(5,7))-1,1);renderCalendar();});sortCards();renderCalendar();apply();
</script>
</body>
</html>`;
}

function normalizeArchiveItem(item, itemIndex, baseUrl) {
  const tags = normalizeTags(item?.tags);
  const title = recoverShareTitle(item);
  const date = extractArchiveDate(item);
  const type = inferArchiveType(item, title, tags);
  const accents = archiveAccents(type, itemIndex);
  const href = item?.url || item?.canonicalUrl || (baseUrl ? `${baseUrl}/${encodeURIComponent(item?.slug || '')}/` : `${encodeURIComponent(item?.slug || '')}/`);
  const excerpt = cleanArchiveText(item?.excerpt || item?.sourcePath || '', '');
  const thumbnail = firstImageUrl(item) || buildArchivePosterSvg(title, type, date, accents, itemIndex);
  const searchText = [title, item?.slug, excerpt, item?.sourcePath, type, date, ...tags].filter(Boolean).join(' ').toLowerCase();
  return { title, date, type, accents, href, excerpt, tags, thumbnail, searchText, itemIndex, updatedAt: item?.updatedAt || '' };
}

function renderArchiveTile(item) {
  return `<article class="tile" data-search="${escapeHtml(item.searchText)}" data-tags="${escapeHtml(item.tags.join(' '))}" data-type="${escapeHtml(item.type)}" data-date="${escapeHtml(item.date)}" data-updated="${escapeHtml(item.updatedAt)}" data-order="${item.itemIndex}" style="--accent:${escapeHtml(item.accents[0])};--accent2:${escapeHtml(item.accents[1])};--i:${item.itemIndex}">
  <a class="poster" href="${escapeHtml(item.href)}"><img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy"></a>
  <div class="tile-body">
    <div class="meta-line"><span class="type">${escapeHtml(item.type)}</span><time>${escapeHtml(item.date)}</time></div>
    <h2><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h2>
  </div>
  <a class="play" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(item.title)} 열기">▶</a>
</article>`;
}

function extractArchiveDate(item) {
  const text = [item?.date, item?.title, item?.sourcePath, item?.slug, item?.updatedAt].filter(Boolean).join(' ');
  const match = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : (formatDate(item?.updatedAt) || '');
}

function compareShareItems(left, right) {
  const dateCompare = String(extractArchiveDate(right) || '').localeCompare(String(extractArchiveDate(left) || ''));
  if (dateCompare !== 0) {
    return dateCompare;
  }
  return String(right?.updatedAt || '').localeCompare(String(left?.updatedAt || ''));
}

function inferArchiveType(item, title, tags) {
  const text = [title, item?.sourcePath, item?.artifactType, ...tags].join(' ').toLowerCase();
  if (/공사일보|daily\s*construction/.test(text)) return '공사일보';
  if (/회의록|회의|meeting/.test(text)) return '회의록';
  if (/통합노트|프로젝트관리|통합관리|integrated/.test(text)) return '통합노트';
  if (/보고서|report|research-report|decision-memo/.test(text)) return '보고서';
  return '노트';
}

function archiveAccents(type, index) {
  const byType = {
    공사일보: ['#ff3d3d', '#ff9f1c'],
    통합노트: ['#10b981', '#84cc16'],
    회의록: ['#8b5cf6', '#06b6d4'],
    보고서: ['#f59e0b', '#ef4444'],
    노트: ['#38bdf8', '#a78bfa'],
  };
  const fallbacks = [['#38bdf8', '#a78bfa'], ['#ec4899', '#f97316'], ['#22c55e', '#14b8a6']];
  return byType[type] || fallbacks[index % fallbacks.length];
}

function firstImageUrl(item) {
  const value = item?.thumbnail || item?.thumbnailUrl || item?.image || item?.imageUrl || item?.coverUrl || '';
  const text = String(value || '').trim();
  return /^(https?:\/\/|data:image\/)/i.test(text) ? text : '';
}

function buildArchivePosterSvg(title, type, date, accents, index) {
  const safeTitle = truncateArchiveText(title, 42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${escapeHtml(safeTitle)}"><defs><linearGradient id="g${index}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${accents[0]}"/><stop offset="1" stop-color="${accents[1]}"/></linearGradient><filter id="s${index}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".32"/></filter></defs><rect width="640" height="360" rx="28" fill="#10131a"/><circle cx="520" cy="-10" r="210" fill="url(#g${index})" opacity=".9"/><circle cx="55" cy="315" r="180" fill="url(#g${index})" opacity=".42"/><path d="M60 250h520" stroke="#fff" stroke-opacity=".13" stroke-width="2"/><g filter="url(#s${index})"><rect x="58" y="60" width="116" height="116" rx="24" fill="rgba(255,255,255,.14)"/><path d="M89 132h54M89 101h92M89 162h140" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".82"/></g><text x="58" y="224" fill="#fff" font-family="system-ui, sans-serif" font-size="30" font-weight="900">${escapeHtml(type)}</text><text x="58" y="270" fill="#fff" font-family="system-ui, sans-serif" font-size="22" font-weight="800" opacity=".92">${escapeHtml(date)}</text><text x="58" y="314" fill="#fff" font-family="system-ui, sans-serif" font-size="22" font-weight="700" opacity=".82">${escapeHtml(safeTitle)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function truncateArchiveText(value, limit = 58) {
  const text = String(value || '').trim();
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

function safeInlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function escapeJsString(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeShareEntry(entry, now) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const normalized = {
    ...entry,
    schemaVersion: 2,
    updatedAt: entry.updatedAt || now || new Date().toISOString(),
  };
  normalized.sourcePathKey = normalized.sourcePathKey || buildSourcePathKey(normalized.sourcePath || '');
  normalized.title = recoverShareTitle(normalized);
  normalized.excerpt = cleanArchiveText(normalized.excerpt || '', '');
  normalized.tags = normalizeTags(normalized.tags);
  return normalized;
}

function repairShareItems(items) {
  return items
    .map((item) => normalizeShareEntry(item, item?.updatedAt))
    .filter(Boolean);
}

function dedupeShareItems(items) {
  const deduped = [];
  for (const item of items) {
    if (!deduped.some((existing) => shareItemsMatch(existing, item))) {
      deduped.push(item);
    }
  }
  return deduped;
}

function shareItemsMatch(left, right) {
  const rightKeys = new Set(shareItemKeys(right));
  return shareItemKeys(left).some((key) => rightKeys.has(key));
}

function shareItemKeys(item) {
  const keys = [];
  const shortId = cleanArchiveText(item?.shortId, '');
  if (shortId) {
    keys.push(`short:${shortId}`);
  }
  const url = normalizeUrlKey(item?.url);
  if (url) {
    keys.push(`url:${url}`);
  }
  const canonicalUrl = normalizeUrlKey(item?.canonicalUrl);
  if (canonicalUrl) {
    keys.push(`canonical:${canonicalUrl}`);
  }
  const sourcePath = buildSourcePathKey(item?.sourcePathKey || item?.sourcePath || '');
  if (sourcePath) {
    keys.push(`source:${sourcePath}`);
  }
  const slug = normalizeIndexKey(item?.slug);
  if (slug) {
    keys.push(`slug:${slug}`);
  }
  return keys;
}

function normalizeUrlKey(value) {
  return normalizeIndexKey(value).replace(/\/+$/g, '');
}

function buildSourcePathKey(value) {
  return normalizeIndexKey(value);
}

function normalizeIndexKey(value) {
  return repairMojibake(decodeArchiveComponent(value))
    .normalize('NFC')
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function recoverShareTitle(item) {
  const candidates = [
    item?.title,
    titleFromUrl(item?.canonicalUrl),
    titleFromSourcePath(item?.sourcePath),
    item?.slug,
  ];
  for (const candidate of candidates) {
    const title = normalizeTitleCandidate(candidate);
    if (title) {
      return title;
    }
  }
  return '제목 없는 HTML 산출물';
}

function titleFromUrl(value) {
  try {
    const url = new URL(String(value || ''));
    const segments = url.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    const previous = segments[segments.length - 2] || '';
    if (previous === 's') {
      return '';
    }
    return last;
  } catch {
    return '';
  }
}

function titleFromSourcePath(value) {
  const text = decodeArchiveComponent(value).split(/[\\/]/).filter(Boolean).pop() || '';
  return text.replace(/\.(md|html?)$/i, '');
}

function normalizeTitleCandidate(value) {
  const basename = decodeArchiveComponent(value).split(/[\\/]/).filter(Boolean).pop() || value;
  const cleaned = cleanArchiveText(prettifySlugTitle(String(basename || '').replace(/\.(md|html?)$/i, '')), '');
  if (isGenericShareTitle(cleaned)) {
    return '';
  }
  return cleanArchiveText(cleaned, '');
}

function isGenericShareTitle(value) {
  const text = repairMojibake(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return [
    'marktl shared html',
    'marktl archive',
    'open artifact',
    'html artifact',
  ].includes(text);
}

function prettifySlugTitle(value) {
  const text = String(value || '').trim();
  const match = /^(\d{4}-\d{2}-\d{2})-(\S.+)$/.exec(text);
  if (!match || text.includes(' ')) {
    return text;
  }
  const parts = match[2].split('-').filter(Boolean);
  if (parts.length >= 4) {
    return `${match[1]} - ${parts.slice(0, 2).join(' ')} - ${parts.slice(2).join(' ')}`;
  }
  return `${match[1]} - ${parts.join(' ')}`;
}

function decodeArchiveComponent(value) {
  let text = String(value || '');
  for (let index = 0; index < 2; index += 1) {
    try {
      const decoded = decodeURIComponent(text);
      if (decoded === text) {
        break;
      }
      text = decoded;
    } catch {
      break;
    }
  }
  return text;
}

function normalizeTags(tags) {
  const values = Array.isArray(tags) ? tags : String(tags || '').split(',');
  return [...new Set(values
    .map((tag) => cleanArchiveText(String(tag || '').replace(/^\s*-\s*/, '').replace(/^#/, '').replace(/^["']|["']$/g, '').trim(), ''))
    .filter(Boolean)
    .filter((tag) => !looksLikeMojibake(tag))
    .map(toReaderTag)
    .filter(Boolean)
    .map((tag) => tag.length > 44 ? `${tag.slice(0, 41)}...` : tag))]
    .slice(0, 8);
}

const READER_TAG_ALIASES = new Map([
  ['obsidian/project-management', '프로젝트관리'],
  ['gantt', '간트'],
  ['budget', '예산'],
  ['risk', '리스크'],
  ['function/ops', '운영'],
  ['doc/meeting', '회의록'],
  ['doc/보고서', '보고서'],
  ['state/검토중', '검토중'],
]);

const HIDDEN_READER_TAGS = new Set([
  'ai',
  'dataviewjs',
  'reforged-note',
  'obsidian/mermaid',
  'obsidian/dataviewjs',
]);

function toReaderTag(tag) {
  const normalized = String(tag || '').trim().replace(/^#/, '');
  const key = normalized.toLowerCase();
  if (!normalized || HIDDEN_READER_TAGS.has(key)) {
    return '';
  }
  if (READER_TAG_ALIASES.has(key)) {
    return READER_TAG_ALIASES.get(key);
  }
  if (/^obsidian\//i.test(normalized)) {
    return '';
  }
  if (/^(project|topic|doc|state|function|업무|회의록|프로젝트)\//i.test(normalized)) {
    return normalized.split('/').filter(Boolean).pop() || '';
  }
  return normalized;
}

function cleanArchiveText(value, fallback = '') {
  const cleaned = repairMojibake(String(value || ''))
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/<[^>]*$/g, ' ')
    .replace(/^\s*>\s*/gm, ' ')
    .replace(/\[\!(?:summary|note|info|tip|warning|important|abstract|todo|success|question|failure|danger|bug|example|quote)\][+-]?\s*/gi, ' ')
    .replace(/\[[ xX-]\]\s*/g, ' ')
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/[*_`~>#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || looksLikeMojibake(cleaned)) {
    return fallback;
  }
  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
}

function repairMojibake(value) {
  let best = String(value || '');
  let bestScore = mojibakeScore(best);
  for (let index = 0; index < 2; index++) {
    const next = Buffer.from(best, 'latin1').toString('utf8');
    const score = mojibakeScore(next);
    if (score >= bestScore) {
      break;
    }
    best = next;
    bestScore = score;
  }
  return best;
}

function looksLikeMojibake(value) {
  const text = String(value || '');
  if (!text) {
    return false;
  }
  if (text.includes('�')) {
    return true;
  }
  return mojibakeScore(text) / Math.max(text.length, 1) > 0.08;
}

function mojibakeScore(value) {
  const text = String(value || '');
  if (!text) {
    return 0;
  }
  return (text.match(/[�ÂÃìíëê¼½¾]/g) || []).length;
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
  buildShortPagesUrl,
  inferPagesBaseUrl,
  mimeTypeForPath,
  normalizePublishPath,
  parseRepo,
  repairShareIndex,
  removeShareIndexItems,
  renderShareIndexHtml,
  shareDeleteKeys,
  updateShareIndex,
};
