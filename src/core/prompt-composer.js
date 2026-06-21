const {
  findExportDepth,
  findExportGenre,
  findExportPurpose,
  normalizeExportSelection,
} = require('./export-profiles.js');

function buildSelectionPrompt(options = {}) {
  const selection = normalizeExportSelection(options);
  const referencePath = String(options.referenceContextNotePath || '').trim();
  const blocks = [
    'Selection-driven generation contract:',
    `- Document genre: ${findExportGenre(selection.exportGenre).label}`,
    `- Writing depth: ${findExportDepth(selection.exportDepth).label}`,
    `- Reader purpose: ${findExportPurpose(selection.exportPurpose).label}`,
    `Genre instruction: ${getGenreInstruction(selection.exportGenre)}`,
    `Depth instruction: ${getDepthInstruction(selection.exportDepth)}`,
    `Audience instruction: ${getPurposeInstruction(selection.exportPurpose)}`,
    `Context instruction: ${getContextInstruction(referencePath)}`,
    `Design system instruction: ${getDesignSystemInstruction(selection.exportGenre, selection.exportDepth)}`,
    `Quality contract: ${getQualityContract(selection.exportGenre, selection.exportDepth)}`,
  ];
  return blocks.join('\n');
}

function getGenreInstruction(genre) {
  return {
    'integrated-note': 'Create an integrated note artifact that connects multiple flows, decisions, evidence, risks, and next actions into one coherent reader path. Use dashboard-like sections only when the source note contains multiple streams or metrics.',
    'general-note': 'Create a faithful readable note. Preserve the author\'s structure and meaning, improve typography and scan flow, and avoid turning the note into a different genre.',
    'meeting-notes': 'Create a meeting note artifact with agenda, key discussion, decisions, unresolved questions, owners, deadlines, and follow-up actions.',
    report: 'Create a structured business report with executive summary, evidence, analysis, implications, risks, and next actions.',
    'compare-review': 'Create a comparison review with alternatives, criteria, scorecard or matrix, tradeoffs, risks, and a clearly separated recommendation.',
    presentation: 'Create a presentation-ready artifact with concise slide-like sections, strong visual rhythm, and one main idea per section.',
    'research-paper': 'Create a research-paper or technical memo style artifact with thesis, method, evidence, citations or source notes when present, limitations, and conclusion.',
    'share-article': 'Create a polished public-facing article with a strong headline, summary deck, body sections, pull quotes or callouts when useful, and share-friendly framing.',
    newspaper: 'Create a newsletter/newspaper layout with headline, dek, short sections, sidebars, issue-style hierarchy, and reader-friendly summaries.',
    'social-feed': 'Create a social-feed style artifact with short cards, timeline/feed rhythm, post-ready snippets, tags, and a compact share summary.',
    'community-blog': 'Create a community blog artifact with context, practical lessons, examples, open questions, and discussion-friendly framing.',
  }[genre] || 'Create a useful HTML artifact from the note.';
}

function getDepthInstruction(depth) {
  return {
    brief: 'Keep the artifact compact. Use the smallest number of sections needed to make the note useful, and do not pad missing context.',
    standard: 'Create a balanced artifact with summary, main sections, supporting evidence, and next actions. Prefer clarity over visual density.',
    deep: 'Create a deep artifact with background, reasoning, implications, risks, alternatives, and decision-ready next steps. Separate facts from interpretation.',
    visual: 'Use a visual-first structure when the source supports it: cards, tables, timelines, diagrams, charts, comparison grids, or annotated media. Do not invent data just to fill a visualization.',
  }[depth] || 'Use a balanced level of detail.';
}

function getPurposeInstruction(purpose) {
  return {
    'internal-share': 'Write for internal teammates. Be concise, operational, and explicit about next actions.',
    review: 'Write for review. Make evidence, assumptions, risks, blockers, decisions, and requested feedback easy to inspect.',
    'external-report': 'Write for external stakeholders. Use polished Korean, avoid internal shorthand, and separate confirmed facts from assumptions.',
    'public-archive': 'Write for a searchable public archive. Include a concise card-ready summary, reader-friendly tags, and stable section titles.',
    presentation: 'Write for live presentation. Use short sections, strong headings, and visual hierarchy that can be scanned from a screen.',
    'executive-brief': 'Write for leadership. Lead with judgment, numbers, decision points, and consequences. Keep background subordinate.',
    'community-share': 'Write for a community audience. Preserve useful nuance, add context for outsiders, and surface discussion questions without becoming promotional.',
    'ai-rework': 'Write for iterative AI review. Include copy-ready review notes, improvement prompts, and clear assumptions that can be brought into a next prompt.',
  }[purpose] || 'Make the intended reader action obvious.';
}

function getContextInstruction(referencePath) {
  if (!referencePath) {
    return 'Use only the active note. Do not invent missing context. If the note is brief, produce a compact artifact instead of padding it.';
  }
  return [
    `A user-selected reference note is attached: ${referencePath}.`,
    'Use it only for background, definitions, prior decisions, terminology, recurring risks, and baseline context.',
    'The active note remains the primary source of current facts.',
    'If the active note conflicts with the reference note, follow the active note and label the difference as a context change or item needing confirmation.',
    'Do not fabricate progress, quantities, decisions, dates, or outcomes that are not present in either note.',
  ].join(' ');
}

function getDesignSystemInstruction(genre, depth) {
  const visualBias = depth === 'visual'
    ? 'Because visual depth is selected, use stronger spatial hierarchy and visualization where the source contains structured material.'
    : 'Use visuals only when they clarify the source material.';
  return [
    'Build a self-contained HTML document with semantic sections, responsive layout, and CSS custom properties for design tokens.',
    'Use modern, stable CSS patterns such as grid, flex, container-aware sizing, sticky local navigation, and accessible focus states when appropriate.',
    'Pick a visual language that matches the selected genre; do not reuse one fixed project-report layout for every note.',
    'For dashboards or SaaS-like views, use dense but readable cards and tables. For articles, prioritize editorial hierarchy. For feeds, use compact repeated cards.',
    genre === 'research-paper' ? 'For research artifacts, prioritize footnote/source clarity and restrained typography over decorative cards.' : '',
    visualBias,
  ].filter(Boolean).join(' ');
}

function getQualityContract(genre, depth) {
  const common = [
    'Never show raw Obsidian-only syntax such as frontmatter, dataviewjs, [!callout] markers, wiki links, or code that exists only to render inside Obsidian.',
    'Keep Korean documents in Korean.',
    'Do not make up data, citations, dates, names, or measurements.',
    'Keep controls self-contained and local-only; no remote scripts, trackers, or external assets unless the source note already provides them.',
    'Every visual element must be explainable from the note content.',
  ].join(' ');
  const byDepth = {
    brief: 'Brief output must include a clear title, compact summary, and one obvious next action or conclusion when present.',
    standard: 'Standard output must include a title, summary, main body, evidence or source-derived details, and next actions or conclusion.',
    deep: 'Deep output must include context, reasoning, evidence, risks or limitations, and a decision-ready ending.',
    visual: 'Visual output must include textual fallbacks or labels for visual sections so the page remains understandable without inspecting graphics.',
  };
  const byGenre = {
    'social-feed': 'Do not turn the feed into a long report; keep repeated cards short and scannable.',
    newspaper: 'Use article hierarchy and section rhythm, not a dashboard grid for every section.',
    'compare-review': 'Always expose comparison criteria before presenting a recommendation.',
  };
  return [byDepth[depth], byGenre[genre], common].filter(Boolean).join(' ');
}

module.exports = {
  buildSelectionPrompt,
  getContextInstruction,
  getDepthInstruction,
  getDesignSystemInstruction,
  getGenreInstruction,
  getPurposeInstruction,
  getQualityContract,
};
