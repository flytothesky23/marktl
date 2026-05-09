const test = require('node:test');
const assert = require('node:assert/strict');

const { getTemplate, listTemplates, wrapWithTemplate } = require('../src/core/templates.js');

test('ships multiple selectable templates for advanced conversion', () => {
  const templates = listTemplates();

  assert.deepEqual(
    templates.map((template) => template.id),
    ['minimal', 'editorial', 'deck', 'dashboard', 'investor-brief', 'research-memo', 'interactive-report'],
  );
  assert.equal(getTemplate('missing').id, 'minimal');
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
});
