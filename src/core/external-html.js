const path = require('node:path');
const { slugify } = require('./html.js');

function basenameFromHtmlFileName(fileName) {
  const cleanName = String(fileName || 'uploaded-html')
    .split(/[\\/]/)
    .filter(Boolean)
    .pop() || 'uploaded-html';
  const withoutExt = cleanName.replace(/\.html?$/i, '').trim() || cleanName;
  return slugify(withoutExt);
}

function extractExternalHtmlMetadata(html, fileName = '') {
  const value = String(html || '');
  const fallbackTitle = titleCaseFromFileName(fileName || 'HTML upload');
  const title = cleanText(
    firstMatch(value, /<title\b[^>]*>([\s\S]*?)<\/title>/i)
    || firstMatch(value, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
    || fallbackTitle,
  );
  const excerpt = cleanText(stripHtml(
    firstMatch(value, /<meta\b[^>]*\bname=(["'])description\1[^>]*\bcontent=(["'])(.*?)\2[^>]*>/i, 3)
    || firstMatch(value, /<meta\b[^>]*\bcontent=(["'])(.*?)\1[^>]*\bname=(["'])description\3[^>]*>/i, 2)
    || firstMatch(value, /<main\b[^>]*>([\s\S]*?)<\/main>/i)
    || firstMatch(value, /<body\b[^>]*>([\s\S]*?)<\/body>/i)
    || value,
  )).slice(0, 180);
  return {
    title: title || fallbackTitle,
    excerpt,
    tags: [],
  };
}

function findExternalHtmlAssetWarnings(html) {
  const value = String(html || '');
  const warnings = [];
  const attributes = [
    ...collectAttributeValues(value, 'src'),
    ...collectAttributeValues(value, 'href'),
    ...collectSrcsetValues(value),
  ];
  const localRefs = [...new Set(attributes
    .map((ref) => String(ref || '').trim())
    .filter((ref) => ref && isLikelyLocalAssetReference(ref)))];
  if (localRefs.length > 0) {
    warnings.push(`HTML upload warning: ${localRefs.length} relative asset reference(s) were not bundled. Use embedded/data URLs or publish assets separately: ${localRefs.slice(0, 5).join(', ')}`);
  }
  return warnings;
}

function collectAttributeValues(html, attributeName) {
  const values = [];
  const pattern = new RegExp(`\\b${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
  for (const match of String(html || '').matchAll(pattern)) {
    values.push(match[2] || match[3] || match[4] || '');
  }
  return values;
}

function collectSrcsetValues(html) {
  return collectAttributeValues(html, 'srcset')
    .flatMap((value) => String(value || '').split(','))
    .map((item) => item.trim().split(/\s+/)[0] || '')
    .filter(Boolean);
}

function isLikelyLocalAssetReference(value) {
  const ref = String(value || '').trim();
  if (!ref || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|#|\/\/)/i.test(ref)) {
    return false;
  }
  if (ref.startsWith('{{') || ref.startsWith('<%')) {
    return false;
  }
  const ext = path.extname(ref.split(/[?#]/)[0] || '').toLowerCase();
  return ['.css', '.js', '.mjs', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.bmp', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm', '.mp3', '.wav', '.json'].includes(ext);
}

function firstMatch(value, pattern, group = 1) {
  const match = pattern.exec(String(value || ''));
  return match?.[group] || '';
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function cleanText(value) {
  return decodeHtmlEntities(String(value || ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseFromFileName(fileName) {
  return cleanText(String(fileName || 'HTML upload')
    .split(/[\\/]/)
    .filter(Boolean)
    .pop()
    ?.replace(/\.html?$/i, '')
    .replace(/[-_]+/g, ' ') || 'HTML upload');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

module.exports = {
  basenameFromHtmlFileName,
  extractExternalHtmlMetadata,
  findExternalHtmlAssetWarnings,
  isLikelyLocalAssetReference,
};
