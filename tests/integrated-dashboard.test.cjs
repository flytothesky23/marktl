const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CANONICAL_SECTIONS,
  normalizeIntegratedDashboardHtml,
  shouldNormalizeIntegratedDashboard,
} = require('../src/core/integrated-dashboard.js');
const { convertWithAiFallback } = require('../src/core/ai.js');

test('normalizes integrated-note output into the approved dashboard skeleton', () => {
  const source = `<!doctype html><html><head><title>지수통합선별공장 프로젝트관리표 통합노트</title></head><body>
<h1>지수통합선별공장 프로젝트관리표 통합노트</h1>
<h3>집행 상태</h3><p>기준 상태와 현장 검토 포인트를 확인합니다.</p>
<h3>일정/게이트</h3><p>주요 게이트와 실행 순서를 정리합니다.</p>
<h3>자금/자원 또는 공정 증빙</h3><p>핵심 금액 축과 증빙 카드.</p>
<h3>리스크·의사결정</h3><p>핵심 리스크와 의사결정 로그.</p>
<h3>업데이트 로그</h3><p>현장 공정 기록.</p>
</body></html>`;

  const html = normalizeIntegratedDashboardHtml(source, {
    template: 'integrated-dashboard',
    exportGenre: 'integrated-note',
    exportDepth: 'milestone',
    trusted: true,
  });

  assert.match(html, /class="project-hero"/);
  assert.match(html, /class="dashboard-layout"/);
  assert.match(html, /marktl-integrated-dashboard-theme/);
  for (const section of CANONICAL_SECTIONS) {
    assert.match(html, new RegExp(`<section class="dashboard-section(?: is-empty)?" id="${section.id}">`));
    assert.match(html, new RegExp(`<h2>${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h2>`));
  }
  assert.ok(html.indexOf('문서 지도') < html.indexOf('빠른 현황'));
  assert.ok(html.indexOf('빠른 현황') < html.indexOf('핵심 관리 흐름'));
  assert.ok(html.indexOf('① 통합간트차트') < html.indexOf('④ 리스크·의사결정'));
});

test('AI conversion post-processes integrated dashboard output instead of trusting arbitrary structure', async () => {
  const result = await convertWithAiFallback('# 통합노트', {
    provider: 'codex',
    template: 'integrated-dashboard',
    exportGenre: 'integrated-note',
    exportDepth: 'milestone',
    trusted: true,
    runProvider: async () => '<!doctype html><html><body><h1>통합노트</h1><h2>요약</h2><p>현황</p><h3>리스크</h3><p>확인 필요</p></body></html>',
  });

  assert.equal(result.usedFallback, false);
  assert.match(result.html, /class="dashboard-sidebar"/);
  assert.match(result.html, /<h2>문서 지도<\/h2>/);
  assert.match(result.html, /<h2>⑤ 마일스톤요약<\/h2>/);
});

test('normalizer only runs for integrated dashboard profiles', () => {
  assert.equal(shouldNormalizeIntegratedDashboard({ template: 'minimal', exportGenre: 'general-note' }), false);
  assert.equal(shouldNormalizeIntegratedDashboard({ template: 'integrated-dashboard' }), true);
  assert.equal(shouldNormalizeIntegratedDashboard({ exportGenre: 'construction-daily', exportDepth: 'milestone' }), true);
});
