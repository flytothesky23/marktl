const { escapeHtml } = require('./html.js');

function buildGiscusFeedbackSection(options = {}) {
  const config = normalizeGiscusConfig(options);
  if (!config.ready) {
    return '';
  }

  return `<section class="marktl-reader-feedback" aria-label="Reader feedback">
<style>
.marktl-reader-feedback { margin: 40px auto 0; padding: 0; }
.marktl-reader-feedback h2 { margin: 0 0 8px; font: 800 22px/1.25 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.marktl-reader-feedback p { margin: 0 0 14px; color: #526173; font: 500 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.marktl-reader-feedback .giscus, .marktl-reader-feedback .giscus-frame { width: 100%; }
</style>
<h2>Reader feedback</h2>
<p>Leave a public GitHub comment or reaction below.</p>
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

function shouldAttachReaderFeedback(options = {}) {
  return options.readerFeedbackMode === 'giscus' && options.shareTarget !== 'local-link';
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
  shouldAttachReaderFeedback,
  validateGiscusConfig,
};
