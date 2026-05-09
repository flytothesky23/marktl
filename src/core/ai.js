const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { convertMarkdownToHtml } = require('./converter.js');
const { looksLikeHtmlDocument, sanitizeHtml } = require('./sanitizer.js');

const execFileAsync = promisify(execFile);

const providerCommands = {
  codex: { command: 'codex', args: ['exec', '--skip-git-repo-check', '-'] },
  claude: { command: 'claude', args: ['-p'] },
  gemini: { command: 'gemini', args: ['-p'] },
};

const loginShellPath = '/bin/zsh';
const cliPath = [
  '/opt/homebrew/bin',
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
  '/usr/sbin',
  '/sbin',
].join(':');

async function convertWithAiFallback(markdown, options = {}) {
  if (!options.provider || options.provider === 'none') {
    return {
      html: convertMarkdownToHtml(markdown, options),
      usedFallback: true,
      warnings: ['AI provider is disabled; used local conversion.'],
    };
  }

  const runProvider = options.runProvider || runCliProvider;

  try {
    const aiHtml = extractHtmlFromAiOutput(await runProvider(markdown, options));
    if (!looksLikeHtmlDocument(aiHtml)) {
      throw new Error('AI provider returned invalid HTML');
    }
    return {
      html: sanitizeHtml(aiHtml, { trusted: Boolean(options.trusted) }),
      usedFallback: false,
      warnings: [],
    };
  } catch (error) {
    if (options.strictAiFailures) {
      throw error;
    }

    return {
      html: convertMarkdownToHtml(markdown, options),
      usedFallback: true,
      warnings: [`AI conversion failed: ${error.message}. Used local fallback.`],
    };
  }
}

async function runCliProvider(markdown, options = {}) {
  const provider = providerCommands[options.provider];
  if (!provider) {
    throw new Error(`Unsupported AI provider: ${options.provider}`);
  }

  const prompt = buildPrompt(markdown, options);
  const timeout = Number(options.timeoutMs || 60_000);
  const command = options.cliPaths && options.cliPaths[options.provider]
    ? options.cliPaths[options.provider]
    : provider.command;
  const shellCommand = [command, ...provider.args].map(shellQuote).join(' ');
  const { stdout } = await execFileAsync(loginShellPath, ['-lc', shellCommand], {
    input: prompt,
    timeout,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      PATH: mergePath(process.env.PATH),
    },
  });

  return stdout;
}

function buildPrompt(markdown, options = {}) {
  const modeInstruction = {
    preserve: 'Preserve the source content. Improve semantic HTML, visual hierarchy, typography, spacing, and responsive styling. Do not summarize or remove content.',
    presentation: 'Create a premium presentation-style HTML document with section cards, strong visual rhythm, concise slide-like grouping, summaries, and visual emphasis.',
    blog: 'Create a polished editorial blog-style HTML article with refined typography, pull quotes, section rhythm, and light restructuring.',
    landing: 'Create a landing-page-style HTML document with strong hero treatment, benefit sections, emphasis copy, and deliberate visual hierarchy.',
  }[options.mode || 'preserve'];
  const dynamicInstruction = options.trusted
    ? 'Trusted mode is enabled: you may include small inline JavaScript for useful interactions, animations, toggles, table-of-contents behavior, or reveal effects. Keep it self-contained and do not load remote resources.'
    : 'Sanitized mode is enabled: do not use JavaScript, iframes, external CSS, external scripts, or remote assets. Use rich CSS-only layout and interactions instead.';

  return `Convert this Obsidian Markdown note to a complete standalone HTML document.
Template: ${options.template || 'minimal'}
Mode: ${options.mode || 'preserve'}
Instruction: ${modeInstruction}
Design standard: produce a refined, modern, visually designed HTML page rather than plain Markdown-looking output. Use responsive CSS, strong spacing, tasteful color, cards/sections where helpful, and readable Korean typography if the content is Korean.
Dynamic policy: ${dynamicInstruction}
Return only HTML. Do not wrap it in Markdown fences.

${markdown}`;
}

function extractHtmlFromAiOutput(output) {
  const value = String(output || '').trim();
  if (!value) {
    return '';
  }

  const fenced = /```(?:html)?\s*([\s\S]*?)```/i.exec(value);
  const candidate = fenced ? fenced[1].trim() : value;

  const documentMatch = /(?:<!doctype\s+html[^>]*>\s*)?<html\b[\s\S]*<\/html>/i.exec(candidate);
  if (documentMatch) {
    return documentMatch[0].trim();
  }

  const bodyMatch = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(candidate);
  if (bodyMatch) {
    return `<!doctype html><html><body>${bodyMatch[1].trim()}</body></html>`;
  }

  const firstTag = candidate.search(/<[a-z][\s\S]*?>/i);
  const lastTag = Math.max(candidate.lastIndexOf('>'), candidate.lastIndexOf('/>'));
  if (firstTag !== -1 && lastTag > firstTag) {
    return candidate.slice(firstTag, lastTag + 1).trim();
  }

  return candidate;
}

function mergePath(existingPath = '') {
  const seen = new Set();
  return [...cliPath.split(':'), ...String(existingPath).split(':')]
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }
      seen.add(entry);
      return true;
    })
    .join(':');
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

module.exports = {
  buildPrompt,
  convertWithAiFallback,
  extractHtmlFromAiOutput,
  mergePath,
  runCliProvider,
  shellQuote,
};
