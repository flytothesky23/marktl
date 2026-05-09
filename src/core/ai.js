const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { convertMarkdownToHtml } = require('./converter.js');
const { looksLikeHtmlDocument, sanitizeHtml } = require('./sanitizer.js');

const providerCommands = {
  claude: { command: 'claude', args: ['-p'], promptAsArgument: true },
  gemini: { command: 'gemini', args: ['-p'], promptAsArgument: true },
};

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
  const args = provider.promptAsArgument ? [...provider.args, prompt] : provider.args;
  const execOptions = {
    timeout,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      PATH: mergePath(process.env.PATH),
    },
  };
  if (!provider.promptAsArgument) {
    execOptions.input = prompt;
  }

  try {
    const { stdout, stderr } = await runProcess(command, args, execOptions);

    const output = parseProviderOutput(stdout, provider);
    if (!String(output || '').trim()) {
      throw new Error(`AI provider returned empty output${stderr ? `: ${cleanProviderError(stderr)}` : ''}`);
    }
    return output;
  } catch (error) {
    const details = [
      cleanProviderError(error.stderr),
      parseProviderErrorOutput(error.stdout, provider),
      cleanProviderError(error.message),
    ]
      .filter(Boolean)
      .join('\n');
    throw new Error(details || String(error));
  }
}

function runProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill('SIGTERM');
      const error = new Error(`Provider timed out after ${options.timeout}ms`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    }, options.timeout);

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.length > options.maxBuffer) {
        child.kill('SIGTERM');
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      if (stderr.length > options.maxBuffer) {
        child.kill('SIGTERM');
      }
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
    child.on('close', (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const error = new Error(`Provider exited with ${signal || code}`);
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

function buildPrompt(markdown, options = {}) {
  const artifactInstruction = getArtifactInstruction(options.artifactType || 'faithful-note');
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
Artifact type: ${options.artifactType || 'faithful-note'}
Template: ${options.template || 'minimal'}
Mode: ${options.mode || 'preserve'}
Artifact instruction: ${artifactInstruction}
Instruction: ${modeInstruction}
Design standard: produce a refined, modern, visually designed HTML page rather than plain Markdown-looking output. Use responsive CSS, strong spacing, tasteful color, cards/sections where helpful, and readable Korean typography if the content is Korean.
Dynamic policy: ${dynamicInstruction}
Interaction standard: when trusted mode is enabled, include useful local-only controls such as generated table of contents, section collapse, copy as prompt/markdown/summary buttons, annotations, or lightweight filters when they fit the artifact type. Keep everything self-contained.
Return only HTML. Do not wrap it in Markdown fences.

${markdown}`;
}

function getArtifactInstruction(artifactType) {
  return {
    'faithful-note': 'Render the note faithfully with better readability, visual hierarchy, and navigation. Do not substantially reorder or summarize unless the source already does.',
    'strategy-brief': 'Create an executive strategy brief with TL;DR, decision context, options, tradeoffs, risks, recommendation, and next actions.',
    'research-report': 'Create a research report with abstract, key findings, evidence sections, source notes, diagrams or tables where useful, and implications.',
    'decision-memo': 'Create a decision memo optimized for choosing: question, criteria, options, comparison matrix, recommendation, dissenting view, and decision log.',
    'interactive-explainer': 'Create an interactive explainer with progressive disclosure, visual examples, generated TOC, copy buttons, and self-contained controls in trusted mode.',
    'slide-deck': 'Create a slide-like artifact with concise sections, strong headings, visual rhythm, and one idea per section while preserving source meaning.',
  }[artifactType] || 'Render a readable, useful HTML artifact from the note.';
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

function mergePath(existingPath = '', options = {}) {
  const seen = new Set();
  return [
    ...cliPath.split(':'),
    ...discoverUserCliPaths(options.homeDir),
    ...String(existingPath).split(':'),
  ]
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

function discoverUserCliPaths(homeDir = os.homedir()) {
  const paths = [];
  if (!homeDir) {
    return paths;
  }

  paths.push(path.join(homeDir, '.local/bin'));
  paths.push(path.join(homeDir, '.volta/bin'));

  const nvmVersions = path.join(homeDir, '.nvm/versions/node');
  try {
    const versions = fs.readdirSync(nvmVersions)
      .filter((entry) => fs.existsSync(path.join(nvmVersions, entry, 'bin/node')))
      .sort(compareNodeVersionsDesc);
    for (const version of versions) {
      paths.push(path.join(nvmVersions, version, 'bin'));
    }
  } catch {
    // nvm is optional.
  }

  return paths;
}

function compareNodeVersionsDesc(a, b) {
  const parse = (value) => value.replace(/^v/, '').split('.').map((part) => Number(part) || 0);
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (right[index] || 0) - (left[index] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return b.localeCompare(a);
}

function parseProviderOutput(stdout, provider = {}) {
  if (provider.parser !== 'codex-json') {
    return stdout;
  }

  let lastMessage = '';
  let lastError = '';
  for (const line of String(stdout || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) {
      continue;
    }
    try {
      const event = JSON.parse(trimmed);
      if (event.type === 'item.completed' && event.item && event.item.type === 'agent_message') {
        lastMessage = event.item.text || '';
      }
      if (event.type === 'item.completed' && event.item && event.item.type === 'error') {
        lastError = event.item.message || '';
      }
    } catch {
      // Codex can emit non-JSON diagnostic lines in the same stream.
    }
  }
  if (!lastMessage && lastError) {
    throw new Error(lastError);
  }
  return lastMessage || stdout;
}

function parseProviderErrorOutput(stdout, provider = {}) {
  if (!stdout) {
    return '';
  }
  try {
    parseProviderOutput(stdout, provider);
  } catch (error) {
    return cleanProviderError(error.message);
  }
  return '';
}

function cleanProviderError(value = '') {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  return text
    .replace(/Command failed:[\s\S]*?(?=\n[A-Z][a-z]+:|\nError:|\nWarning:|$)/g, '')
    .replace(/Convert this Obsidian Markdown note[\s\S]*$/g, 'Provider command failed while processing the prompt.')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join('\n');
}

module.exports = {
  buildPrompt,
  getArtifactInstruction,
  convertWithAiFallback,
  extractHtmlFromAiOutput,
  discoverUserCliPaths,
  mergePath,
  parseProviderOutput,
  runCliProvider,
  cleanProviderError,
};
