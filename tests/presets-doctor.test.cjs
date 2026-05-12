const test = require('node:test');
const assert = require('node:assert/strict');

const { applyPresetToOptions, findPresetForOptions, listExportPresets, findExportPreset } = require('../src/core/presets.js');
const { getProviderPrivacyNote } = require('../src/core/ai.js');
const { getArtifactGoalInstruction, listArtifactGoals } = require('../src/core/artifact-goals.js');
const { checkClaudeProvider, checkCodexProvider, cleanDoctorOutput } = require('../src/core/provider-doctor.js');

test('ships beginner-facing HTML value presets', () => {
  const presets = listExportPresets();
  const ids = presets.map((preset) => preset.id);

  assert.deepEqual(ids, [
    'readable-note',
    'interactive-report',
    'presentation',
    'decision-memo',
    'shareable-article',
    'playground',
    'compare-options',
    'pr-explainer',
  ]);
  assert.equal(findExportPreset('interactive-report').previewSecurity, 'trusted');
  assert.equal(findExportPreset('shareable-article').mode, 'blog');
  assert.equal(findExportPreset('decision-memo').artifactGoal, 'decide');
  assert.equal(findExportPreset('playground').template, 'playground');
  assert.equal(findExportPreset('compare-options').artifactGoal, 'compare');
  assert.equal(findExportPreset('pr-explainer').artifactGoal, 'explain-code');
  assert.equal(findExportPreset('missing'), null);
});

test('regeneration preset keeps previous export side-effect settings', () => {
  const base = {
    aiProvider: 'none',
    contextPackMode: 'none',
    failurePolicy: 'fallback',
    readerFeedbackMode: 'none',
    shareTarget: 'local-link',
    copyShareLinkAfterExport: false,
  };

  const options = applyPresetToOptions(base, 'presentation');

  assert.equal(options.presetId, 'presentation');
  assert.equal(options.artifactType, 'slide-deck');
  assert.equal(options.shareTarget, 'local-link');
  assert.equal(options.copyShareLinkAfterExport, false);
  assert.equal(options.aiProvider, 'none');
});

test('finds the visible preset that matches current export settings', () => {
  assert.equal(findPresetForOptions({
    artifactGoal: 'read',
    artifactType: 'slide-deck',
    template: 'deck',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  }), 'presentation');

  assert.equal(findPresetForOptions({
    artifactGoal: 'read',
    artifactType: 'slide-deck',
    template: 'minimal',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  }), 'custom');
});

test('documents Claude prompt privacy tradeoff', () => {
  assert.match(getProviderPrivacyNote('claude'), /command-line argument/);
  assert.equal(getProviderPrivacyNote('codex'), '');
});

test('artifact goals describe what the HTML should do', () => {
  const goals = listArtifactGoals();

  assert.deepEqual(
    goals.map((goal) => goal.id),
    ['read', 'decide', 'review', 'compare', 'tune', 'explain-code', 'publish'],
  );
  assert.match(getArtifactGoalInstruction('decide'), /decision room/);
  assert.match(getArtifactGoalInstruction('review'), /copy-feedback-to-AI/);
  assert.match(getArtifactGoalInstruction('tune'), /copy-as-prompt/);
});

test('doctor output is concise for modal display', () => {
  const cleaned = cleanDoctorOutput('\nline 1\n\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\n');

  assert.equal(cleaned, 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6');
});

test('Claude doctor reports missing CLI', async () => {
  const result = await checkClaudeProvider({
    runCommand: async () => ({ code: -1, output: 'spawn claude ENOENT' }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 'missing');
  assert.match(result.message, /ENOENT/);
});

test('Claude doctor reports login failures from probe output', async () => {
  const calls = [];
  const result = await checkClaudeProvider({
    runCommand: async (_command, args) => {
      calls.push(args.join(' '));
      return calls.length === 1
        ? { code: 0, output: '2.1.138 (Claude Code)' }
        : { code: 1, output: 'Not logged in · Please run /login' };
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 'not-logged-in');
  assert.match(result.message, /\/login/);
  assert.equal(result.version, '2.1.138 (Claude Code)');
});

test('Claude doctor reports ready and unexpected-output states', async () => {
  const ready = await checkClaudeProvider({
    runCommand: async (_command, args) => args.includes('--version')
      ? { code: 0, output: '2.1.138 (Claude Code)' }
      : { code: 0, output: 'MARKTL_OK' },
  });
  const unexpected = await checkClaudeProvider({
    runCommand: async (_command, args) => args.includes('--version')
      ? { code: 0, output: '2.1.138 (Claude Code)' }
      : { code: 0, output: 'hello' },
  });

  assert.equal(ready.ok, true);
  assert.equal(ready.status, 'ready');
  assert.equal(unexpected.ok, false);
  assert.equal(unexpected.status, 'unexpected-output');
});

test('Codex doctor probes JSON exec through stdin', async () => {
  const calls = [];
  const ready = await checkCodexProvider({
    runCommand: async (_command, args, _timeoutMs, input) => {
      calls.push({ args, input });
      return args.includes('--version')
        ? { code: 0, output: 'codex 1.2.3' }
        : { code: 0, output: '{"type":"item.completed","item":{"type":"agent_message","text":"MARKTL_OK"}}' };
    },
  });

  assert.equal(ready.ok, true);
  assert.equal(ready.status, 'ready');
  assert.deepEqual(calls[1].args, ['exec', '--json', '--sandbox', 'read-only', '--skip-git-repo-check', '-']);
  assert.match(calls[1].input, /MARKTL_OK/);
});

test('Codex doctor reports probe failures', async () => {
  const result = await checkCodexProvider({
    runCommand: async (_command, args) => args.includes('--version')
      ? { code: 0, output: 'codex 1.2.3' }
      : { code: 1, output: 'not authenticated' },
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 'probe-failed');
  assert.match(result.message, /not authenticated/);
});
