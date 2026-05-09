const path = require('node:path');
const { escapeHtml } = require('./html.js');
const { sanitizeHtml } = require('./sanitizer.js');
const { wrapWithTemplate } = require('./templates.js');

function convertMarkdownToHtml(markdown, options = {}) {
  const parsed = splitFrontmatter(markdown);
  const bodyHtml = blocksToHtml(parsed.body, options);
  const frontmatterHtml = parsed.frontmatter
    ? `<pre class="frontmatter">${escapeHtml(parsed.frontmatter)}</pre>\n`
    : '';
  const title = inferTitle(parsed.body, options.sourcePath);
  const html = wrapWithTemplate(`${frontmatterHtml}${bodyHtml}`, {
    template: options.template,
    title,
    trusted: Boolean(options.trusted),
  });

  return sanitizeHtml(html, { trusted: Boolean(options.trusted) });
}

function splitFrontmatter(markdown) {
  const normalized = String(markdown || '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: '', body: normalized };
  }

  const closeIndex = normalized.indexOf('\n---\n', 4);
  if (closeIndex === -1) {
    return { frontmatter: '', body: normalized };
  }

  return {
    frontmatter: normalized.slice(4, closeIndex).trim(),
    body: normalized.slice(closeIndex + 5).trimStart(),
  };
}

function inferTitle(markdown, sourcePath) {
  const heading = String(markdown || '').split('\n').find((line) => /^#\s+/.test(line));
  if (heading) {
    return heading.replace(/^#\s+/, '').trim();
  }
  if (sourcePath) {
    return path.basename(sourcePath, path.extname(sourcePath));
  }
  return 'Exported note';
}

function blocksToHtml(markdown, options) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```/, '').trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const callout = readCallout(lines, index);
    if (callout) {
      blocks.push(callout.html);
      index = callout.nextIndex;
      continue;
    }

    const table = readTable(lines, index);
    if (table) {
      blocks.push(table.html);
      index = table.nextIndex;
      continue;
    }

    const list = readList(lines, index);
    if (list) {
      blocks.push(list.html);
      index = list.nextIndex;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2], options)}</h${level}>`);
      index += 1;
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${inlineMarkdown(paragraph.join(' '), options)}</p>`);
  }

  return blocks.join('\n');
}

function isBlockStart(line) {
  return /^(```|#{1,6}\s+|>\s+\[!|\s*[-*]\s+|\s*\d+\.\s+)/.test(line) || readTable([line, '| - |'], 0);
}

function readCallout(lines, start) {
  const match = /^>\s+\[!(\w+)]\s*(.*)$/.exec(lines[start]);
  if (!match) {
    return null;
  }

  const type = match[1].toLowerCase();
  const title = match[2].trim() || match[1].toUpperCase();
  const body = [];
  let index = start + 1;
  while (index < lines.length && /^>/.test(lines[index])) {
    body.push(lines[index].replace(/^>\s?/, ''));
    index += 1;
  }

  return {
    html: `<aside class="callout callout-${escapeHtml(type)}"><div class="callout-title">${escapeHtml(title)}</div><div class="callout-body">${blocksToHtml(body.join('\n'), {})}</div></aside>`,
    nextIndex: index,
  };
}

function readTable(lines, start) {
  if (!/^\s*\|.+\|\s*$/.test(lines[start] || '') || !/^\s*\|[\s:-]+\|/.test(lines[start + 1] || '')) {
    return null;
  }

  const rows = [];
  let index = start;
  while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  const header = rows[0];
  const body = rows.slice(2);
  const headerHtml = `<thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell, {})}</th>`).join('')}</tr></thead>`;
  const bodyHtml = `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell, {})}</td>`).join('')}</tr>`).join('')}</tbody>`;

  return {
    html: `<table>${headerHtml}${bodyHtml}</table>`,
    nextIndex: index,
  };
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function readList(lines, start) {
  const ordered = /^\s*\d+\.\s+/.test(lines[start]);
  const unordered = /^\s*[-*]\s+/.test(lines[start]);
  if (!ordered && !unordered) {
    return null;
  }

  const items = [];
  let index = start;
  const matcher = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
  while (index < lines.length && matcher.test(lines[index])) {
    items.push(lines[index].replace(matcher, '').trim());
    index += 1;
  }

  const tag = ordered ? 'ol' : 'ul';
  return {
    html: `<${tag}>${items.map((item) => `<li>${inlineMarkdown(item, {})}</li>`).join('')}</${tag}>`,
    nextIndex: index,
  };
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/!\[\[([^\]]+)]]/g, (_match, target) => `<img src="${escapeHtml(target)}" alt="${escapeHtml(target)}">`)
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_match, alt, src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`)
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

module.exports = {
  convertMarkdownToHtml,
  inferTitle,
  splitFrontmatter,
};
