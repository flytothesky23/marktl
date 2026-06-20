const path = require('node:path');
const { escapeHtml } = require('./html.js');
const { wrapWithTemplate } = require('./templates.js');
const { shouldUseIntegratedDashboardStandard } = require('./prompt-composer.js');

const CANONICAL_SECTIONS = [
  {
    id: 'document-map',
    title: '문서 지도',
    empty: '생성된 운영 섹션을 기준으로 빠르게 이동합니다.',
    patterns: [/문서\s*지도/i, /project\s*navigation/i, /navigation/i, /운영\s*체크/i, /리뷰\s*포커스/i],
  },
  {
    id: 'status',
    title: '빠른 현황',
    empty: '현재 노트에서 확인 가능한 상태 요약이 부족합니다.',
    patterns: [/빠른\s*현황/i, /집행\s*상태/i, /현재\s*상태/i, /기준\s*상태/i, /현장\s*검토\s*포인트/i, /요약/i],
  },
  {
    id: 'flow',
    title: '핵심 관리 흐름',
    empty: '공정 흐름 또는 관리 원칙은 기준 맥락 노트를 지정하면 보강됩니다.',
    patterns: [/핵심\s*관리\s*흐름/i, /관리\s*원칙/i, /합의된\s*판단/i, /실행\s*순서/i, /프로젝트\s*관리/i],
  },
  {
    id: 'schedule',
    title: '① 통합간트차트',
    empty: '일정·간트·실행 게이트 정보가 확인되지 않습니다.',
    patterns: [/통합\s*간트/i, /일정/i, /간트/i, /gantt/i, /게이트/i, /timeline/i, /master\s*plan/i, /인허가/i],
  },
  {
    id: 'budget',
    title: '② 자금스케줄',
    empty: '자금·예산·자원 정보가 확인되지 않습니다.',
    patterns: [/자금/i, /예산/i, /비용/i, /금액/i, /자원/i, /집행/i],
  },
  {
    id: 'inventory',
    title: '③ 재고관리계획',
    empty: '재고 또는 자재 관리 정보가 확인되지 않습니다.',
    patterns: [/재고/i, /자재/i, /설비/i, /증빙/i, /공정\s*증빙/i],
  },
  {
    id: 'risk',
    title: '④ 리스크·의사결정',
    empty: '리스크·결정·확인 필요 사항이 확인되지 않습니다.',
    patterns: [/리스크/i, /risk/i, /의사결정/i, /결정/i, /판단/i, /확인\s*필요/i],
  },
  {
    id: 'milestone',
    title: '⑤ 마일스톤요약',
    empty: '마일스톤 또는 다음 게이트 정보가 확인되지 않습니다.',
    patterns: [/마일스톤/i, /milestone/i, /다음/i, /후속/i, /차주/i, /next/i],
  },
  {
    id: 'log',
    title: '⑥ 업데이트로그',
    empty: '업데이트 로그 또는 일자별 변경 내용이 확인되지 않습니다.',
    patterns: [/업데이트/i, /로그/i, /공사일보/i, /현장\s*진행/i, /현장\s*공정/i, /기록/i],
  },
  {
    id: 'review',
    title: '리뷰 룸',
    empty: '검토 메모와 피드백 항목은 생성 후 보완할 수 있습니다.',
    patterns: [/리뷰/i, /review/i, /feedback/i, /피드백/i, /reader/i, /보조\s*메모/i],
  },
  {
    id: 'source',
    title: '원문 보존 메모',
    empty: '원문 보존 메모가 별도로 감지되지 않았습니다.',
    patterns: [/원문/i, /보존/i, /source/i, /memo/i],
  },
];

function shouldNormalizeIntegratedDashboard(options = {}) {
  return options.template === 'integrated-dashboard'
    || shouldUseIntegratedDashboardStandard(options.exportGenre, options.exportDepth);
}

function normalizeIntegratedDashboardHtml(html, options = {}) {
  if (!shouldNormalizeIntegratedDashboard(options)) {
    return html;
  }
  const body = extractBody(html);
  const title = inferDocumentTitle(html, body, options.sourcePath);
  const buckets = bucketSections(body);
  const sections = CANONICAL_SECTIONS.map((section) => ({
    ...section,
    content: buckets.get(section.id) || '',
  }));
  const period = inferPeriod([title, body].join(' '));
  const dashboardBody = [
    renderHero(title, period),
    '<section class="dashboard-layout">',
    renderSidebar(sections),
    '<div class="dashboard-main">',
    sections.map(renderCanonicalSection).join('\n'),
    '</div>',
    '</section>',
  ].join('\n');

  return wrapWithTemplate(dashboardBody, {
    template: 'integrated-dashboard',
    title,
    trusted: Boolean(options.trusted),
  });
}

function extractBody(html) {
  const value = String(html || '');
  return (/<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(value)?.[1] || value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[^>]*class=(["'])marktl-generated-map\1[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<\/?(?:main|article)\b[^>]*>/gi, ' ')
    .trim();
}

function inferDocumentTitle(html, body, sourcePath) {
  const titleCandidates = [
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(body)?.[1],
    /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1],
    sourcePath ? path.basename(String(sourcePath), path.extname(String(sourcePath))) : '',
  ];
  for (const candidate of titleCandidates) {
    const title = cleanText(candidate);
    if (title) {
      return title;
    }
  }
  return '통합노트';
}

function bucketSections(body) {
  const buckets = new Map();
  const headings = [...String(body || '').matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  if (!headings.length) {
    addBucket(buckets, 'status', body);
    return buckets;
  }

  const leading = body.slice(0, headings[0].index || 0).trim();
  if (leading) {
    addBucket(buckets, 'status', leading);
  }

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const level = Number(heading[1]);
    const title = cleanText(heading[2]);
    const nextStart = index + 1 < headings.length ? headings[index + 1].index || body.length : body.length;
    const content = body.slice((heading.index || 0) + heading[0].length, nextStart).trim();
    if (level === 1 && index === 0) {
      if (content && !looksLikeDuplicateTitle(title, content)) {
        addBucket(buckets, 'status', content);
      }
      continue;
    }
    const bucket = findBucketForHeading(title);
    const block = `<section class="dashboard-source-block"><h3>${escapeHtml(title)}</h3>${content}</section>`;
    addBucket(buckets, bucket, block);
  }
  return buckets;
}

function findBucketForHeading(title) {
  const text = String(title || '');
  for (const section of CANONICAL_SECTIONS) {
    if (section.patterns.some((pattern) => pattern.test(text))) {
      return section.id;
    }
  }
  return 'flow';
}

function addBucket(buckets, key, html) {
  const value = String(html || '').trim();
  if (!value) {
    return;
  }
  buckets.set(key, [buckets.get(key), value].filter(Boolean).join('\n'));
}

function renderHero(title, period) {
  return `<header class="project-hero">
  <p class="dashboard-eyebrow">Integrated Project Dashboard</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="dashboard-lead">프로젝트 상태, 일정, 공정 흐름, 리스크, 마일스톤을 하나의 운영 화면에서 검토합니다.</p>
  <div class="dashboard-meta-row">
    <span>표준: 2026-05-19 통합노트 대시보드</span>
    <span>${period ? `기간/일자: ${escapeHtml(period)}` : '기간/일자: 확인 필요'}</span>
  </div>
</header>`;
}

function renderSidebar(sections) {
  const links = sections
    .filter((section) => section.id !== 'source')
    .map((section) => `<a href="#${section.id}">${escapeHtml(section.title)}</a>`)
    .join('');
  return `<aside class="dashboard-sidebar">
  <section class="dashboard-panel">
    <h3>문서 지도</h3>
    <nav class="dashboard-nav">${links}</nav>
  </section>
  <section class="dashboard-panel">
    <h3>운영 체크리스트</h3>
    <ul>
      <li>오늘 사실과 기준 맥락이 구분되어 있는가</li>
      <li>일정·공정·리스크의 변경점이 보이는가</li>
      <li>다음 실행 게이트가 확인 가능한가</li>
    </ul>
  </section>
  <section class="dashboard-panel">
    <h3>리뷰 포커스</h3>
    <p>부족한 값은 임의 생성하지 않고 확인 필요로 남깁니다.</p>
  </section>
</aside>`;
}

function renderCanonicalSection(section) {
  const content = String(section.content || '').trim()
    || `<p class="dashboard-empty">${escapeHtml(section.empty)}</p>`;
  const extraClass = section.content ? '' : ' is-empty';
  return `<section class="dashboard-section${extraClass}" id="${section.id}">
  <h2>${escapeHtml(section.title)}</h2>
  <div class="dashboard-section-body">
    ${content}
  </div>
</section>`;
}

function cleanText(value) {
  return String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeDuplicateTitle(title, content) {
  const text = cleanText(content);
  return title && text.startsWith(title) && text.length < title.length + 20;
}

function inferPeriod(value) {
  const dates = [...String(value || '').matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map((match) => match[1]);
  const unique = [...new Set(dates)];
  if (unique.length >= 2) {
    return `${unique[0]} ~ ${unique[unique.length - 1]}`;
  }
  return unique[0] || '';
}

module.exports = {
  CANONICAL_SECTIONS,
  normalizeIntegratedDashboardHtml,
  shouldNormalizeIntegratedDashboard,
};
