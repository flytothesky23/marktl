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
  const artifactGoal = String(options.artifactGoal || '');
  if (trusted && !/<script\b/i.test(value)) {
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

  if (/\bdataviewjs\b|\bdataview\b|\[![-\w]+]|\n---\s*(?:\n|$)/i.test(value)) {
    warnings.push('HTML QA fatal: raw Obsidian-only syntax remains in the HTML.');
  }

  if (options.exportGenre === 'construction-daily') {
    const depth = options.exportDepth || 'standard';
    const text = value.replace(/<[^>]+>/g, ' ');
    if (!/(공사일보|공사 일보|daily)/i.test(text)) {
      warnings.push('HTML QA: construction daily output does not clearly identify itself as a construction daily report.');
    }
    if (depth === 'brief') {
      if (!/(오늘|당일|작업|공정|사진|증빙)/.test(text)) {
        warnings.push('HTML QA: brief construction daily should include today work or evidence.');
      }
    }
    if (depth === 'standard') {
      if (!/(리스크|위험|이슈|다음|후속|예정|계획|공정|일정)/.test(text)) {
        warnings.push('HTML QA: standard construction daily should include risk/next-work or schedule context.');
      }
    }
    if (depth === 'milestone') {
      if (!/(간트|gantt|mermaid|실행\s*게이트|계획\s*대비|공정\s*흐름|마일스톤)/i.test(text)) {
        warnings.push('HTML QA: milestone construction daily should include schedule/process or plan-versus-actual context.');
      }
    }
  }

  return warnings;
}

module.exports = {
  validateHtmlArtifact,
};
