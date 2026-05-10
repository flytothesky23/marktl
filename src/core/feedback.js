const { escapeHtml } = require('./html.js');

function buildGiscusFeedbackSection(options = {}) {
  const config = normalizeGiscusConfig(options);
  if (!config.ready) {
    return '';
  }

  return `<section class="marktl-reader-feedback" aria-label="Reader feedback">
<style>
.marktl-reader-feedback { margin: 48px auto 0; padding: 24px; border: 1px solid #d8e2ef; border-radius: 8px; background: #ffffff; }
.marktl-reader-feedback h2 { margin-top: 0; }
.marktl-reader-feedback p { color: #526173; }
.marktl-github-login-note { display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 18px; padding: 10px 12px; border-radius: 6px; background: #f2f5f9; color: #243b53; font-weight: 700; }
</style>
<h2>Reader feedback</h2>
<p>Sign in with GitHub in the comment box below to leave a public comment or reaction.</p>
<div class="marktl-github-login-note">GitHub login is handled by Giscus.</div>
<script src="https://giscus.app/client.js"
        data-repo="${escapeAttr(config.repo)}"
        data-repo-id="${escapeAttr(config.repoId)}"
        data-category="${escapeAttr(config.category)}"
        data-category-id="${escapeAttr(config.categoryId)}"
        data-mapping="${escapeAttr(config.mapping)}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="${escapeAttr(config.theme)}"
        data-lang="${escapeAttr(config.lang)}"
        crossorigin="anonymous"
        async>
</script>
</section>`;
}

function injectReaderFeedback(html, options = {}) {
  const section = buildGiscusFeedbackSection(options);
  if (!section) {
    return String(html || '');
  }

  const value = String(html || '');
  if (/<\/main>/i.test(value)) {
    return value.replace(/<\/main>/i, `${section}\n</main>`);
  }
  if (/<\/body>/i.test(value)) {
    return value.replace(/<\/body>/i, `${section}\n</body>`);
  }
  return `${value}\n${section}`;
}

function validateGiscusConfig(options = {}) {
  const config = normalizeGiscusConfig(options);
  const warnings = [];
  if (!config.repo) warnings.push('Giscus feedback is missing repository.');
  if (!config.repoId) warnings.push('Giscus feedback is missing repository ID.');
  if (!config.category) warnings.push('Giscus feedback is missing discussion category.');
  if (!config.categoryId) warnings.push('Giscus feedback is missing discussion category ID.');
  return warnings;
}

function normalizeGiscusConfig(options = {}) {
  const config = {
    repo: String(options.repo || '').trim(),
    repoId: String(options.repoId || '').trim(),
    category: String(options.category || '').trim(),
    categoryId: String(options.categoryId || '').trim(),
    mapping: String(options.mapping || 'pathname').trim() || 'pathname',
    theme: String(options.theme || 'preferred_color_scheme').trim() || 'preferred_color_scheme',
    lang: String(options.lang || 'ko').trim() || 'ko',
  };
  return {
    ...config,
    ready: Boolean(config.repo && config.repoId && config.category && config.categoryId),
  };
}

function escapeAttr(value) {
  return escapeHtml(String(value || '')).replace(/"/g, '&quot;');
}

module.exports = {
  buildGiscusFeedbackSection,
  injectReaderFeedback,
  validateGiscusConfig,
};
