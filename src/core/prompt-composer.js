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
    `Depth instruction: ${getDepthInstruction(selection.exportGenre, selection.exportDepth)}`,
    `Audience instruction: ${getPurposeInstruction(selection.exportPurpose)}`,
    `Context instruction: ${getContextInstruction(selection.exportGenre, selection.exportDepth, referencePath)}`,
    `Layout instruction: ${getLayoutInstruction(selection.exportGenre, selection.exportDepth)}`,
    `Quality contract: ${getQualityContract(selection.exportGenre, selection.exportDepth)}`,
  ];
  return blocks.join('\n');
}

function getGenreInstruction(genre) {
  return {
    'construction-daily': 'Create a Korean construction daily HTML report. The reader must quickly understand what happened today, where the work sits in the project sequence, what evidence exists, what risks remain, and what should happen next.',
    'meeting-notes': 'Create a Korean meeting note artifact with agenda, attendees if available, decisions, unresolved questions, owners, and next actions.',
    'integrated-note': 'Create a Korean integrated project dashboard that connects status, context, decisions, risks, schedule, execution gates, logs, and next steps. It must feel like an operations control board, not a generic article or loose strategy memo.',
    report: 'Create a structured report with executive summary, evidence, analysis, implications, and next actions.',
    'general-note': 'Create a faithful readable note. Preserve the original meaning and avoid unnecessary restructuring.',
    'compare-review': 'Create a comparison review with criteria, alternatives, pros and cons, risks, and a clear comparison matrix.',
    presentation: 'Create a presentation-ready artifact with strong section rhythm, concise slide-like grouping, and one main idea per section.',
    'share-article': 'Create a polished public-facing article with clear title, summary, body sections, and share-friendly framing.',
  }[genre] || 'Create a useful HTML artifact from the note.';
}

function getDepthInstruction(genre, depth) {
  if (genre === 'construction-daily') {
    return {
      brief: 'Use a compact daily log structure. Prioritize date, location/work area, today work, image evidence, short comments, and next step. Do not force Gantt, Mermaid, or large baseline sections when the active note does not need them.',
      standard: 'Use a standard daily report structure. Include today work, image evidence, project context from the reference note when available, risks or blockers, next work, and a compact plan-versus-actual view. Include baseline Gantt/Mermaid only when the reference context provides enough material.',
      milestone: 'Use a full milestone report structure. Strongly integrate the reference note schedule, Mermaid/Gantt/process flow, plan-versus-actual status, major risks, decisions, and forward gates. Keep today facts visibly separated from continuing baseline context.',
    }[depth];
  }
  return {
    brief: 'Keep the artifact compact. Summarize only enough structure to make the note easy to scan.',
    standard: 'Create a balanced artifact with summary, main sections, evidence, and next actions.',
    milestone: 'Create a full artifact with context, detailed sections, schedule/process view, implications, risks, decisions, and next-step gates.',
  }[depth] || 'Use a balanced level of detail.';
}

function getPurposeInstruction(purpose) {
  return {
    'internal-share': 'Write for internal teammates. Be concise, operational, and explicit about next actions.',
    'field-review': 'Write for field review. Make evidence, risks, blockers, work sequence, and next site actions easy to inspect.',
    'external-report': 'Write for external stakeholders. Use polished Korean, avoid internal shorthand, and separate confirmed facts from assumptions.',
    'public-archive': 'Write for a searchable public archive. Include a concise card-ready summary, reader-friendly tags, and stable section titles.',
    presentation: 'Write for live presentation. Use short sections, strong headings, and visual hierarchy that can be scanned from a screen.',
    'ai-rework': 'Write for iterative AI review. Include copy-ready review notes, improvement prompts, and clear assumptions that can be brought into a next prompt.',
  }[purpose] || 'Make the intended reader action obvious.';
}

function getContextInstruction(genre, depth, referencePath) {
  if (!referencePath) {
    return 'Use only the active note. Do not invent missing project context. If the note is brief, produce a brief artifact instead of padding it.';
  }
  if (genre === 'construction-daily') {
    const carryForward = depth === 'brief'
      ? 'Use the reference note lightly only for names, work sequence, and recurring context.'
      : 'Carry forward schedule, process order, Mermaid/Gantt diagrams, recurring risks, and baseline assumptions from the reference note when they help explain today.';
    return [
      `A user-selected reference note is attached: ${referencePath}.`,
      'The active note is the source of today/current facts.',
      'The reference note is continuing baseline context, not today evidence.',
      'If the active note conflicts with the reference note, follow the active note and label the difference as 기준 대비 변경/확인 필요.',
      'Do not fabricate progress, quantities, completion status, manpower, weather, dates, or inspection outcomes that are not present in either note.',
      carryForward,
    ].join(' ');
  }
  return [
    `A user-selected reference note is attached: ${referencePath}.`,
    'Use it only to clarify background, definitions, previous decisions, recurring risks, or baseline context.',
    'The active note remains the primary source of current facts.',
  ].join(' ');
}

function shouldUseIntegratedDashboardStandard(genre, depth) {
  return genre === 'integrated-note' || (genre === 'construction-daily' && depth === 'milestone');
}

function getLayoutInstruction(genre, depth) {
  if (!shouldUseIntegratedDashboardStandard(genre, depth)) {
    return 'Use the selected template normally. Keep section hierarchy clear and avoid decorative layouts that obscure the note.';
  }
  return [
    'Use the approved 2026-05-19 integrated-note dashboard standard as the layout model.',
    'Build a project operations dashboard, not a strategy brief, article, poster, or generic slide deck.',
    'Required H2-level sequence: 문서 지도, 빠른 현황, 핵심 관리 흐름, 일정/간트 또는 실행 게이트, 자금/자원 또는 공정 증빙 when present, 리스크·의사결정, 마일스톤 요약, 업데이트 로그, 리뷰 룸.',
    'Use a sticky/visible document map or quick navigation, compact status cards, timeline/process/gate blocks, evidence cards, risk/decision tables, and reader-review prompts.',
    'Include a visible dark/light theme toggle in trusted mode. Use CSS custom properties, local-only JavaScript, and prefers-color-scheme fallback. Do not rely on remote assets.',
    'If source content is sparse, preserve the dashboard skeleton but mark missing data as 확인 필요 rather than inventing facts.',
  ].join(' ');
}

function getQualityContract(genre, depth) {
  const common = 'Never show raw Obsidian-only syntax such as frontmatter, dataviewjs, [!callout] markers, or code that exists only to render inside Obsidian. Keep Korean documents in Korean.';
  if (shouldUseIntegratedDashboardStandard(genre, depth)) {
    const dashboard = [
      'Integrated dashboard output must use clear H2 sections rather than one long H3-only brief.',
      'It must include title/date or reporting period, executive status, baseline context, schedule/process or execution gate, risks/issues, decisions, next actions, and update log when source material supports them.',
      'Do not expose raw Markdown command labels such as [!summary], DataviewJS, wiki links, or frontmatter.',
      'Do not invent progress, quantities, completion status, manpower, dates, costs, risks, or decisions.',
    ].join(' ');
    return `${dashboard} ${common}`;
  }
  if (genre !== 'construction-daily') {
    return common;
  }
  const byDepth = {
    brief: 'Construction daily brief must include a clear title/date, today work summary, and photo/evidence section when images exist.',
    standard: 'Construction daily standard must include title/date, today work, evidence/photos, baseline context when supplied, risks/blockers, and next work.',
    milestone: 'Construction daily milestone must include title/date, today work, baseline schedule/process context, plan-versus-actual or execution-gate view, risks/issues, decisions, and next gates.',
  };
  return `${byDepth[depth] || byDepth.standard} ${common}`;
}

module.exports = {
  buildSelectionPrompt,
  getContextInstruction,
  getDepthInstruction,
  getGenreInstruction,
  getLayoutInstruction,
  getPurposeInstruction,
  getQualityContract,
  shouldUseIntegratedDashboardStandard,
};
