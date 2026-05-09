const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { convertMarkdownToHtml } = require('./converter.js');
const { looksLikeHtmlDocument, sanitizeHtml } = require('./sanitizer.js');

const execFileAsync = promisify(execFile);

const providerCommands = {
  codex: { command: 'codex', args: ['exec', '--ask-for-approval', 'never', '-'] },
  claude: { command: 'claude', args: ['-p'] },
  gemini: { command: 'gemini', args: ['-p'] },
};

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
    const aiHtml = await runProvider(markdown, options);
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
  const { stdout } = await execFileAsync(command, provider.args, {
    input: prompt,
    timeout,
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout;
}

function buildPrompt(markdown, options = {}) {
  const modeInstruction = {
    preserve: 'Preserve the source content. Improve only HTML structure, semantics, and styling.',
    presentation: 'Create a presentation-style HTML document. Summaries and visual emphasis are allowed.',
    blog: 'Create a polished blog-style HTML article. Light restructuring is allowed.',
    landing: 'Create a landing-page-style HTML document. Strong restructuring and emphasis copy are allowed.',
  }[options.mode || 'preserve'];

  return `Convert this Obsidian Markdown note to a complete standalone HTML document.
Template: ${options.template || 'minimal'}
Mode: ${options.mode || 'preserve'}
Instruction: ${modeInstruction}
Return only HTML. Do not wrap it in Markdown fences.

${markdown}`;
}

module.exports = {
  buildPrompt,
  convertWithAiFallback,
  runCliProvider,
};
