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
  const externalHtml = Boolean(options.externalHtml);
  const artifactGoal = String(options.artifactGoal || '');
  if (trusted && !externalHtml && !/<script\b/i.test(value)) {
    warnings.push('HTML QA: trusted interactive mode produced no script; artifact may be static.');
  }
  if (!trusted && /<script\b|<iframe\b|\son[a-z]+\s*=/i.test(value)) {
    warnings.push('HTML QA: sanitized mode output still contains dynamic markup.');
  }
  if (trusted && ['review', 'compare', 'tune'].includes(artifactGoal) && !/<button\b|<input\b|<select\b|<textarea\b|contenteditable=/i.test(value)) {
    warnings.push(`HTML QA: ${artifactGoal} artifact has no obvious copy-back or interactive controls.`);
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

  if (/```(?:dataviewjs|dataview)\b|<code\b[^>]*>\s*(?:dataviewjs|dataview)\b|\[![-\w]+][+-]?|\[\[[^\]]+]]|(?:^|\n)\s*---\s*(?:\n|$)/i.test(value)) {
    warnings.push('HTML QA fatal: raw Obsidian-only syntax remains in the HTML.');
  }

  if (!externalHtml) {
    const depth = String(options.exportDepth || 'standard');
    const text = value.replace(/<[^>]+>/g, ' ');
    if (depth === 'deep' && !/(리스크|위험|한계|대안|시사점|implication|risk|limitation|alternative)/i.test(text)) {
      warnings.push('HTML QA: deep output should expose risks, limitations, alternatives, or implications when source material supports them.');
    }
    if (depth === 'visual' && !/(<table\b|<svg\b|class=["'][^"']*(?:card|grid|chart|timeline|matrix)|mermaid|diagram|차트|표|타임라인|매트릭스)/i.test(value)) {
      warnings.push('HTML QA: visual output has no obvious visual structure.');
    }
  }

  return warnings;
}

module.exports = {
  validateHtmlArtifact,
};
