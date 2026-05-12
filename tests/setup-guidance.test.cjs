const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildGiscusSetupChecklist,
  buildPagesSetupChecklist,
} = require('../src/core/setup-guidance.js');

test('builds concrete GitHub Pages setup checklist from settings', () => {
  const checklist = buildPagesSetupChecklist({
    githubRepo: 'reallygood83/moondoc',
    githubBranch: 'main',
    githubPagesBaseUrl: 'https://reallygood83.github.io/moondoc',
    githubPublishPath: 'marktl',
  });

  assert.match(checklist, /reallygood83\/moondoc/);
  assert.match(checklist, /Settings > Pages/);
  assert.match(checklist, /personal-access-tokens\/new/);
  assert.match(checklist, /Contents read\/write/);
  assert.match(checklist, /https:\/\/reallygood83\.github\.io\/moondoc\/marktl\/<slug>\//);
});

test('builds concrete Giscus setup checklist from settings', () => {
  const checklist = buildGiscusSetupChecklist({
    giscusRepo: 'reallygood83/moondoc',
    giscusCategory: 'Announcements',
  });

  assert.match(checklist, /reallygood83\/moondoc/);
  assert.match(checklist, /github\.com\/apps\/giscus/);
  assert.match(checklist, /https:\/\/giscus\.app/);
  assert.match(checklist, /data-repo-id/);
  assert.match(checklist, /Trusted interactive preview/);
});
