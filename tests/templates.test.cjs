const test = require('node:test');
const assert = require('node:assert/strict');

const { getTemplate, listTemplates, wrapWithTemplate } = require('../src/core/templates.js');

test('ships multiple selectable templates for advanced conversion', () => {
  const templates = listTemplates();

  assert.deepEqual(
    templates.map((template) => template.id),
    ['minimal', 'editorial', 'deck', 'dashboard', 'integrated-dashboard', 'investor-brief', 'research-memo', 'interactive-report', 'construction-daily', 'playground'],
  );
  assert.match(getTemplate('construction-daily').description, /Field-report/);
  assert.match(getTemplate('integrated-dashboard').description, /dark\/light theme toggle/);
  assert.equal(getTemplate('missing').id, 'minimal');
});

test('playground template provides editable controls and copyable state in trusted mode', () => {
  const html = wrapWithTemplate('<h1>Play</h1><h2>Option</h2>', {
    template: 'playground',
    trusted: true,
  });

  assert.match(html, /contenteditable="true"/);
  assert.match(html, /type="range"/);
  assert.match(html, /Copy state JSON/);
  assert.match(html, /Copy prompt/);
});

test('integrated dashboard template provides theme and document-map affordances', () => {
  const html = wrapWithTemplate('<h1>통합노트</h1><h2>빠른 현황</h2><p>상태</p><h2>리스크</h2>', {
    template: 'integrated-dashboard',
    trusted: true,
  });

  assert.match(html, /marktl-integrated-dashboard-theme/);
  assert.match(html, /marktl-theme-toggle/);
  assert.match(html, /marktl-generated-map/);
  assert.match(html, /data-theme/);
});

test('interactive scripts are included only for trusted template exports', () => {
  const sanitized = wrapWithTemplate('<h1>Report</h1>', {
    template: 'interactive-report',
    trusted: false,
  });
  const trusted = wrapWithTemplate('<h1>Report</h1>', {
    template: 'interactive-report',
    trusted: true,
  });

  assert.equal(sanitized.includes('<script>'), false);
  assert.equal(trusted.includes('<script>'), true);
  assert.match(trusted, /querySelectorAll\('article h2'\)/);
  assert.match(trusted, /Copy as prompt/);
  assert.match(trusted, /Copy summary/);
  assert.match(trusted, /Filter sections/);
  assert.match(trusted, /Copy outline JSON/);
  assert.match(trusted, /Expand all/);
});
