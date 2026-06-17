function repairObsidianSyntaxResidue(html) {
  let value = String(html || '');
  if (!value) {
    return value;
  }

  value = removeRawDataviewBlocks(value);
  value = removeFrontmatterResidue(value);
  value = value
    .replace(/<p>\s*---\s*<\/p>/gi, '<hr>')
    .replace(/(^|\n)\s*---\s*(?=\n|$)/g, '$1<hr>')
    .replace(/\[![-\w]+][+-]?/gi, '')
    .replace(/!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?]]/g, (_match, target, label) => cleanWikiLabel(label || target))
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?]]/g, (_match, target, label) => cleanWikiLabel(label || target))
    .replace(/<blockquote>\s*<\/blockquote>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '');

  return value;
}

function removeRawDataviewBlocks(value) {
  return String(value || '')
    .replace(/```(?:dataviewjs|dataview)\b[\s\S]*?```/gi, '')
    .replace(/<pre\b[^>]*>\s*<code\b[^>]*class=["'][^"']*\blanguage-(?:dataviewjs|dataview)\b[^"']*["'][^>]*>[\s\S]*?<\/code>\s*<\/pre>/gi, '')
    .replace(/<pre\b[^>]*>\s*<code\b[^>]*>\s*(?:dataviewjs|dataview)\b[\s\S]*?<\/code>\s*<\/pre>/gi, '')
    .replace(/<code\b[^>]*class=["'][^"']*\blanguage-(?:dataviewjs|dataview)\b[^"']*["'][^>]*>[\s\S]*?<\/code>/gi, '')
    .replace(/<code\b[^>]*>\s*(?:dataviewjs|dataview)\b[\s\S]*?<\/code>/gi, '');
}

function removeFrontmatterResidue(value) {
  return String(value || '')
    .replace(/(<body\b[^>]*>\s*)---\s*\n[\s\S]{0,2000}?\n---\s*(?=\n|<)/i, '$1')
    .replace(/(^|\n)---\s*\n(?:[A-Za-z0-9_-]+\s*:[^\n]*\n){1,40}---\s*(?=\n|$)/g, '$1');
}

function cleanWikiLabel(value) {
  return String(value || '')
    .split('/')
    .pop()
    .replace(/\.(md|markdown)$/i, '')
    .trim();
}

module.exports = {
  repairObsidianSyntaxResidue,
};
