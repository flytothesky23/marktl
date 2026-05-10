function validateHtmlArtifact(html, options = {}) {
  const warnings = [];
  const value = String(html || '');

  if (!/<!doctype\s+html/i.test(value)) {
    warnings.push('HTML QA: missing <!doctype html>.');
  }
  if (!/<meta\s+name=["']viewport["']/i.test(value)) {
    warnings.push('HTML QA: missing responsive viewport meta tag.');
  }
  if (!/<style\b/i.test(value)) {
    warnings.push('HTML QA: no inline CSS found; output may be too plain.');
  }
  if (!/<h1\b/i.test(value)) {
    warnings.push('HTML QA: no H1 heading found.');
  }

  const trusted = Boolean(options.trusted);
  if (trusted && !/<script\b/i.test(value)) {
    warnings.push('HTML QA: trusted interactive mode produced no script; artifact may be static.');
  }
  if (!trusted && /<script\b|<iframe\b|\son[a-z]+\s*=/i.test(value)) {
    warnings.push('HTML QA: sanitized mode output still contains dynamic markup.');
  }

  const expectedAssets = Array.isArray(options.assetMappings)
    ? options.assetMappings.map((mapping) => mapping.relativeSrc).filter(Boolean)
    : [];
  for (const src of expectedAssets) {
    if (!value.includes(src)) {
      warnings.push(`HTML QA: bundled image is not referenced in final HTML: ${src}`);
    }
  }

  if (/<img\b/i.test(value) && !/<img\b[^>]*\balt\s*=/i.test(value)) {
    warnings.push('HTML QA: at least one image is missing alt text.');
  }

  return warnings;
}

module.exports = {
  validateHtmlArtifact,
};
