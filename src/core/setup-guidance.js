function buildPagesSetupChecklist(settings = {}) {
  const repo = String(settings.githubRepo || 'owner/repo').trim() || 'owner/repo';
  const branch = String(settings.githubBranch || 'main').trim() || 'main';
  const baseUrl = String(settings.githubPagesBaseUrl || '').trim() || 'https://owner.github.io/repo';
  const publishPath = String(settings.githubPublishPath || 'marktl').trim() || 'marktl';
  return [
    'MarkTL GitHub Pages setup checklist',
    '',
    `1. GitHub repository: ${repo}`,
    `2. Enable GitHub Pages for branch "${branch}" in GitHub repository Settings > Pages.`,
    '3. Pages source should publish from the same branch/folder that receives MarkTL files.',
    `4. GitHub Pages base URL: ${baseUrl}`,
    `5. Publish path: ${publishPath}`,
    `6. Expected export URL: ${baseUrl.replace(/\/+$/g, '')}/${publishPath.replace(/^\/+|\/+$/g, '')}/<slug>/`,
    '7. Open https://github.com/settings/personal-access-tokens/new and create a fine-grained token.',
    `8. Limit repository access to ${repo}.`,
    '9. Grant Contents read/write permission. No broader permissions are required for publishing files.',
    '10. Paste the token into MarkTL settings, then export one test note with Share target = GitHub Pages link.',
  ].join('\n');
}

function buildGiscusSetupChecklist(settings = {}) {
  const repo = String(settings.giscusRepo || settings.githubRepo || 'owner/repo').trim() || 'owner/repo';
  const category = String(settings.giscusCategory || 'Announcements').trim() || 'Announcements';
  return [
    'MarkTL Giscus setup checklist',
    '',
    `1. Use repository: ${repo}`,
    '2. Install the Giscus GitHub App from https://github.com/apps/giscus for this repository.',
    '3. In GitHub repository Settings, enable Discussions.',
    '4. Create or choose a discussion category, for example General or Announcements.',
    '5. Open https://giscus.app and enter the repository.',
    `6. Choose category: ${category}`,
    '7. Choose mapping: pathname',
    '8. Choose theme: preferred_color_scheme',
    '9. Copy data-repo-id and data-category-id from the generated Giscus script.',
    '10. Paste those IDs into MarkTL settings.',
    '11. Export with Preview/export = Trusted interactive preview and Reader feedback = Giscus GitHub comments.',
  ].join('\n');
}

module.exports = {
  buildGiscusSetupChecklist,
  buildPagesSetupChecklist,
};
