const artifactGoals = [
  {
    id: 'read',
    name: 'Readable artifact',
    description: 'Make a long note easier to read, navigate, and share.',
    instruction: 'Optimize the HTML for reading and navigation. Use strong information hierarchy, scan-friendly sections, generated navigation, tables where useful, and responsive layout.',
  },
  {
    id: 'decide',
    name: 'Decision room',
    description: 'Turn the note into an interactive decision surface.',
    instruction: 'Make the HTML behave like a decision room: extract the core question, options, criteria, tradeoffs, risks, recommendation, dissenting view, and decision log. In trusted mode, add useful local controls such as criteria weighting, option filters, editable notes, or copy-next-decision-prompt behavior.',
  },
  {
    id: 'review',
    name: 'Review room',
    description: 'Help readers leave structured feedback and copy it back to AI.',
    instruction: 'Make the HTML behave like a review room: add section-level review prompts, findings, open questions, reader notes, and copy-feedback-to-AI affordances. If comments are enabled, make the reader feedback section feel like the natural final step.',
  },
  {
    id: 'compare',
    name: 'Compare options',
    description: 'Lay out alternatives side by side with tradeoffs.',
    instruction: 'Make the HTML compare alternatives side by side. Use matrices, scorecards, pros/cons, visual labels, and clear tradeoff summaries. In trusted mode, add filters, sorting, or lightweight scoring controls when useful.',
  },
  {
    id: 'tune',
    name: 'Prompt playground',
    description: 'Create a small editable interface with copyable state.',
    instruction: 'Make the HTML a purpose-built playground: identify tunable parts of the note, provide editable fields or controls, show the resulting state, and include copy-as-prompt or copy-state behavior so the reader can bring changes back into Claude/Codex.',
  },
  {
    id: 'explain-code',
    name: 'PR / code explainer',
    description: 'Explain code, diffs, or technical plans with annotations.',
    instruction: 'Make the HTML explain technical work: show architecture, data flow, annotated snippets or diffs when present, risk areas, reviewer checklist, and gotchas. Use diagrams or structured visual explanations where useful.',
  },
  {
    id: 'publish',
    name: 'Public article',
    description: 'Prepare a polished public page for sharing.',
    instruction: 'Make the HTML a polished public article with strong title, excerpt, section rhythm, clear takeaways, social-share-friendly framing, and a reader-friendly ending.',
  },
];

function listArtifactGoals() {
  return artifactGoals.map(({ id, name, description }) => ({ id, name, description }));
}

function getArtifactGoal(id) {
  return artifactGoals.find((goal) => goal.id === id) || artifactGoals[0];
}

function getArtifactGoalInstruction(id) {
  return getArtifactGoal(id).instruction;
}

module.exports = {
  getArtifactGoal,
  getArtifactGoalInstruction,
  listArtifactGoals,
};
