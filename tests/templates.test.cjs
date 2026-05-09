const test = require('node:test');
const assert = require('node:assert/strict');

const { getTemplate, listTemplates } = require('../src/core/templates.js');

test('ships multiple selectable templates for advanced conversion', () => {
  const templates = listTemplates();

  assert.deepEqual(
    templates.map((template) => template.id),
    ['minimal', 'editorial', 'deck'],
  );
  assert.equal(getTemplate('missing').id, 'minimal');
});
