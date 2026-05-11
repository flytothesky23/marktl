const { spawn } = require('node:child_process');
const { mergePath } = require('./ai.js');

async function checkClaudeProvider(options = {}) {
  return checkTextProvider({
    ...options,
    command: options.command || 'claude',
    name: 'Claude Code CLI',
    versionArgs: ['--version'],
    probeArgs: ['-p', 'Return only this exact text: MARKTL_OK'],
    readyMessage: 'Claude Code CLI is installed, logged in, and ready.',
    missingMessage: 'Claude Code CLI was not found or did not start.',
    failedMessage: 'Claude Code CLI is installed, but the login probe failed.',
  });
}

async function checkCodexProvider(options = {}) {
  return checkTextProvider({
    ...options,
    command: options.command || 'codex',
    name: 'Codex CLI',
    versionArgs: ['--version'],
    probeArgs: ['exec', '--json', '--sandbox', 'read-only', '--skip-git-repo-check', '-'],
    probeInput: 'Return only this exact text: MARKTL_OK',
    readyMessage: 'Codex CLI is installed, logged in, and ready.',
    missingMessage: 'Codex CLI was not found or did not start.',
    failedMessage: 'Codex CLI is installed, but the probe failed.',
  });
}

async function checkTextProvider(options = {}) {
  const command = options.command || 'claude';
  const timeoutMs = Number(options.timeoutMs || 15_000);
  const runner = options.runCommand || runCommand;

  const version = await runner(command, options.versionArgs || ['--version'], timeoutMs);
  if (version.code !== 0) {
    return {
      ok: false,
      status: 'missing',
      message: cleanDoctorOutput(version.output) || options.missingMessage || `${options.name || 'Provider'} was not found or did not start.`,
      version: '',
    };
  }

  const probe = await runner(command, options.probeArgs, timeoutMs, options.probeInput);
  if (probe.code !== 0) {
    const output = cleanDoctorOutput(probe.output);
    return {
      ok: false,
      status: output.toLowerCase().includes('not logged in') ? 'not-logged-in' : 'probe-failed',
      message: output || options.failedMessage || `${options.name || 'Provider'} is installed, but the probe failed.`,
      version: cleanDoctorOutput(version.output),
    };
  }

  return {
    ok: /MARKTL_OK/i.test(probe.output),
    status: /MARKTL_OK/i.test(probe.output) ? 'ready' : 'unexpected-output',
    message: /MARKTL_OK/i.test(probe.output)
      ? options.readyMessage || `${options.name || 'Provider'} is installed, logged in, and ready.`
      : cleanDoctorOutput(probe.output) || `${options.name || 'Provider'} responded, but not with the expected probe text.`,
    version: cleanDoctorOutput(version.output),
  };
}

function runCommand(command, args, timeoutMs, input = '') {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: {
        ...process.env,
        PATH: mergePath(process.env.PATH),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let output = '';
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill('SIGTERM');
      resolve({ code: -1, output: `Provider doctor timed out after ${timeoutMs}ms.` });
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve({ code: -1, output: error.message });
    });
    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve({ code: code || 0, output });
    });
  });
}

function cleanDoctorOutput(value = '') {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join('\n');
}

module.exports = {
  checkCodexProvider,
  checkClaudeProvider,
  cleanDoctorOutput,
  runCommand,
};
