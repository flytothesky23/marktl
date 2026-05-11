"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/artifact-goals.js
var require_artifact_goals = __commonJS({
  "src/core/artifact-goals.js"(exports2, module2) {
    "use strict";
    var artifactGoals = [
      {
        id: "read",
        name: "Readable artifact",
        description: "Make a long note easier to read, navigate, and share.",
        instruction: "Optimize the HTML for reading and navigation. Use strong information hierarchy, scan-friendly sections, generated navigation, tables where useful, and responsive layout."
      },
      {
        id: "decide",
        name: "Decision room",
        description: "Turn the note into an interactive decision surface.",
        instruction: "Make the HTML behave like a decision room: extract the core question, options, criteria, tradeoffs, risks, recommendation, dissenting view, and decision log. In trusted mode, add useful local controls such as criteria weighting, option filters, editable notes, or copy-next-decision-prompt behavior."
      },
      {
        id: "review",
        name: "Review room",
        description: "Help readers leave structured feedback and copy it back to AI.",
        instruction: "Make the HTML behave like a review room: add section-level review prompts, findings, open questions, reader notes, and copy-feedback-to-AI affordances. If comments are enabled, make the reader feedback section feel like the natural final step."
      },
      {
        id: "compare",
        name: "Compare options",
        description: "Lay out alternatives side by side with tradeoffs.",
        instruction: "Make the HTML compare alternatives side by side. Use matrices, scorecards, pros/cons, visual labels, and clear tradeoff summaries. In trusted mode, add filters, sorting, or lightweight scoring controls when useful."
      },
      {
        id: "tune",
        name: "Prompt playground",
        description: "Create a small editable interface with copyable state.",
        instruction: "Make the HTML a purpose-built playground: identify tunable parts of the note, provide editable fields or controls, show the resulting state, and include copy-as-prompt or copy-state behavior so the reader can bring changes back into Claude/Codex."
      },
      {
        id: "explain-code",
        name: "PR / code explainer",
        description: "Explain code, diffs, or technical plans with annotations.",
        instruction: "Make the HTML explain technical work: show architecture, data flow, annotated snippets or diffs when present, risk areas, reviewer checklist, and gotchas. Use diagrams or structured visual explanations where useful."
      },
      {
        id: "publish",
        name: "Public article",
        description: "Prepare a polished public page for sharing.",
        instruction: "Make the HTML a polished public article with strong title, excerpt, section rhythm, clear takeaways, social-share-friendly framing, and a reader-friendly ending."
      }
    ];
    function listArtifactGoals3() {
      return artifactGoals.map(({ id, name, description }) => ({ id, name, description }));
    }
    function getArtifactGoal(id) {
      return artifactGoals.find((goal) => goal.id === id) || artifactGoals[0];
    }
    function getArtifactGoalInstruction(id) {
      return getArtifactGoal(id).instruction;
    }
    module2.exports = {
      getArtifactGoal,
      getArtifactGoalInstruction,
      listArtifactGoals: listArtifactGoals3
    };
  }
});

// src/core/presets.js
var require_presets = __commonJS({
  "src/core/presets.js"(exports2, module2) {
    "use strict";
    var exportPresets = [
      {
        id: "readable-note",
        name: "Readable Note",
        description: "Faithful, clean reading view with better typography.",
        artifactGoal: "read",
        artifactType: "faithful-note",
        template: "editorial",
        mode: "preserve",
        previewSecurity: "sanitized"
      },
      {
        id: "interactive-report",
        name: "Interactive Report",
        description: "HTML-native controls: table of contents, collapsible sections, copy buttons.",
        artifactGoal: "review",
        artifactType: "interactive-explainer",
        template: "interactive-report",
        mode: "presentation",
        previewSecurity: "trusted"
      },
      {
        id: "presentation",
        name: "Presentation",
        description: "Slide-like sections for reviewing or presenting a note.",
        artifactGoal: "read",
        artifactType: "slide-deck",
        template: "deck",
        mode: "presentation",
        previewSecurity: "trusted"
      },
      {
        id: "decision-memo",
        name: "Decision Room",
        description: "Options, tradeoffs, risks, recommendation, decision log, and copy-back prompts.",
        artifactGoal: "decide",
        artifactType: "decision-memo",
        template: "research-memo",
        mode: "presentation",
        previewSecurity: "trusted"
      },
      {
        id: "shareable-article",
        name: "Shareable Article",
        description: "Polished article layout with bundled images and static-hosting-ready output.",
        artifactGoal: "publish",
        artifactType: "research-report",
        template: "editorial",
        mode: "blog",
        previewSecurity: "sanitized"
      },
      {
        id: "playground",
        name: "Prompt Playground",
        description: "Editable working surface with sliders and copyable state.",
        artifactGoal: "tune",
        artifactType: "interactive-explainer",
        template: "playground",
        mode: "presentation",
        previewSecurity: "trusted"
      },
      {
        id: "compare-options",
        name: "Compare Options",
        description: "Side-by-side options, scorecards, filters, and tradeoff summaries.",
        artifactGoal: "compare",
        artifactType: "decision-memo",
        template: "dashboard",
        mode: "presentation",
        previewSecurity: "trusted"
      },
      {
        id: "pr-explainer",
        name: "PR / Code Explainer",
        description: "Annotated technical explainer for code, diffs, plans, and review risks.",
        artifactGoal: "explain-code",
        artifactType: "research-report",
        template: "research-memo",
        mode: "presentation",
        previewSecurity: "trusted"
      }
    ];
    function listExportPresets2() {
      return exportPresets.slice();
    }
    function findExportPreset2(id) {
      return exportPresets.find((preset) => preset.id === id) || null;
    }
    module2.exports = {
      findExportPreset: findExportPreset2,
      listExportPresets: listExportPresets2
    };
  }
});

// src/core/html.js
var require_html = __commonJS({
  "src/core/html.js"(exports2, module2) {
    "use strict";
    function escapeHtml(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function slugify2(value) {
      return String(value).trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "note";
    }
    module2.exports = {
      escapeHtml,
      slugify: slugify2
    };
  }
});

// src/core/templates.js
var require_templates = __commonJS({
  "src/core/templates.js"(exports2, module2) {
    "use strict";
    var { escapeHtml } = require_html();
    var templates = [
      {
        id: "minimal",
        name: "Minimal",
        description: "Clean readable document styling for faithful note exports.",
        css: `
      :root { color-scheme: light; }
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1f2933; background: #f7f8fa; }
      main { max-width: 820px; margin: 0 auto; padding: 48px 28px 72px; background: #ffffff; min-height: 100vh; box-sizing: border-box; }
      h1, h2, h3 { color: #101828; line-height: 1.18; }
      p, li { line-height: 1.68; }
      code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      pre { overflow: auto; padding: 16px; background: #111827; color: #f9fafb; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 18px 0; }
      th, td { border: 1px solid #d8dee8; padding: 8px 10px; text-align: left; }
      img { max-width: 100%; height: auto; border-radius: 6px; }
      .frontmatter { white-space: pre-wrap; border: 1px solid #d8dee8; background: #f2f5f9; padding: 14px; border-radius: 8px; color: #475467; }
      .callout { border-left: 4px solid #3b82f6; background: #eff6ff; padding: 12px 16px; margin: 18px 0; border-radius: 6px; }
      .callout-title { font-weight: 700; margin-bottom: 6px; }
    `
      },
      {
        id: "editorial",
        name: "Editorial",
        description: "Magazine-like layout for polished long-form notes.",
        css: `
      body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #202124; background: #faf7f2; }
      main { max-width: 900px; margin: 0 auto; padding: 56px 36px 80px; box-sizing: border-box; }
      article { background: #fffdf8; border: 1px solid #e6ddcf; padding: 44px; }
      h1 { font-size: 44px; line-height: 1.05; margin-top: 0; }
      h2 { margin-top: 42px; border-top: 1px solid #dfd5c8; padding-top: 24px; }
      p, li { font-size: 18px; line-height: 1.75; }
      a { color: #8b3a2b; }
      pre { overflow: auto; padding: 18px; background: #25211d; color: #f7efe4; border-radius: 6px; }
      table { width: 100%; border-collapse: collapse; margin: 22px 0; background: #fff; }
      th, td { border-bottom: 1px solid #e6ddcf; padding: 10px 12px; }
      img { max-width: 100%; height: auto; display: block; margin: 24px auto; }
      .frontmatter { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #f1eadf; padding: 14px; color: #5f574f; }
      .callout { border: 1px solid #d8b98c; background: #fff6e5; padding: 16px 18px; margin: 24px 0; }
      .callout-title { font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: .08em; }
    `
      },
      {
        id: "deck",
        name: "Deck",
        description: "Slide-like sections for presentation-style reading.",
        css: `
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #e8edf4; }
      main { max-width: 1120px; margin: 0 auto; padding: 36px 24px 60px; }
      article > h1, article > h2 { background: #ffffff; border: 1px solid #cfd8e5; border-radius: 8px; padding: 30px; margin: 24px 0 14px; }
      article > p, article > ul, article > ol, article > pre, article > table, .callout, .frontmatter { background: #ffffff; border: 1px solid #d7dfeb; border-radius: 8px; padding: 18px 22px; }
      h1 { font-size: 42px; }
      h2 { font-size: 30px; }
      p, li { line-height: 1.6; }
      pre { overflow: auto; background: #111827; color: #f9fafb; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #d7dfeb; padding: 10px; }
      img { max-width: 100%; height: auto; border-radius: 8px; }
      .frontmatter { white-space: pre-wrap; color: #526173; }
      .callout { border-left: 5px solid #2563eb; }
      .callout-title { font-weight: 800; }
    `
      },
      {
        id: "dashboard",
        name: "Dashboard",
        description: "Dense report dashboard with KPI-like sections and scan-friendly cards.",
        css: `
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #182230; background: #f3f6fb; }
      main { max-width: 1180px; margin: 0 auto; padding: 32px 22px 56px; }
      article { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
      article > * { grid-column: 1 / -1; background: #ffffff; border: 1px solid #d9e2ef; border-radius: 8px; padding: 18px 20px; box-shadow: 0 8px 24px rgba(22, 34, 51, .05); }
      h1 { font-size: 34px; border-left: 6px solid #0f766e; }
      h2 { font-size: 24px; color: #0f3d4c; }
      p, li { line-height: 1.62; }
      pre { overflow: auto; background: #101828; color: #f8fafc; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #d9e2ef; padding: 10px; }
      .callout { border-left: 5px solid #0f766e; background: #ecfdf5; }
      img { max-width: 100%; height: auto; }
    `
      },
      {
        id: "investor-brief",
        name: "Investor Brief",
        description: "Sharp memo style for strategy, market, and investment analysis.",
        css: `
      body { margin: 0; font-family: "Avenir Next", Inter, ui-sans-serif, system-ui, sans-serif; background: #111318; color: #eceff4; }
      main { max-width: 960px; margin: 0 auto; padding: 56px 28px 80px; }
      article { border-top: 4px solid #d7b56d; }
      h1 { font-size: 46px; line-height: 1.05; color: #f5ddb0; }
      h2 { margin-top: 42px; color: #ffffff; border-bottom: 1px solid #343946; padding-bottom: 10px; }
      p, li { color: #d8dee9; line-height: 1.72; font-size: 17px; }
      strong { color: #ffffff; }
      a { color: #8ecae6; }
      pre, table, .frontmatter, .callout { background: #1d222c; border: 1px solid #343946; border-radius: 8px; }
      pre { overflow: auto; padding: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #343946; padding: 10px; }
      .callout { border-left: 4px solid #d7b56d; padding: 16px; }
      img { max-width: 100%; height: auto; border-radius: 8px; }
    `
      },
      {
        id: "research-memo",
        name: "Research Memo",
        description: "Academic memo styling for long-form reasoning and source-heavy notes.",
        css: `
      body { margin: 0; font-family: "Source Serif 4", Georgia, serif; color: #1c2331; background: #f6f8fb; }
      main { max-width: 860px; margin: 0 auto; padding: 64px 28px 88px; }
      article { counter-reset: section; }
      h1 { font-size: 42px; line-height: 1.12; }
      h2 { counter-increment: section; margin-top: 44px; color: #243b53; }
      h2::before { content: counter(section) ". "; color: #627d98; }
      p, li { font-size: 18px; line-height: 1.78; }
      blockquote, .callout { background: #eef4fb; border-left: 4px solid #486581; padding: 14px 18px; }
      pre { overflow: auto; background: #102a43; color: #f0f4f8; padding: 16px; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; background: #fff; }
      th, td { border: 1px solid #d9e2ec; padding: 10px; }
      img { max-width: 100%; height: auto; }
    `
      },
      {
        id: "interactive-report",
        name: "Interactive Report",
        description: "Self-contained report with progress, generated TOC, and collapsible sections in trusted mode.",
        css: `
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7fafc; color: #1a202c; }
      .progress { position: fixed; top: 0; left: 0; height: 4px; width: 0; background: #2563eb; z-index: 10; }
      main { max-width: 1040px; margin: 0 auto; padding: 48px 24px 80px; }
      .toc { background: #ffffff; border: 1px solid #dbe4f0; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; }
      .toc a { display: inline-block; margin: 4px 12px 4px 0; color: #1d4ed8; text-decoration: none; }
      .toolbox { position: sticky; top: 12px; z-index: 9; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-bottom: 12px; }
      .toolbox input { min-width: 220px; border: 1px solid #bfdbfe; background: #ffffff; color: #1a202c; border-radius: 6px; padding: 8px 10px; }
      .toolbox button { border: 1px solid #bfdbfe; background: #ffffff; color: #1d4ed8; border-radius: 6px; padding: 8px 10px; cursor: pointer; }
      .toolbox button:hover { background: #eff6ff; }
      article section.marktl-filter-hidden, article .marktl-filter-hidden { display: none; }
      article { background: #ffffff; border: 1px solid #dbe4f0; border-radius: 8px; padding: 34px; }
      h1 { font-size: 42px; line-height: 1.08; }
      h2 { cursor: pointer; margin-top: 34px; padding: 14px 16px; background: #eef4ff; border-radius: 8px; }
      p, li { line-height: 1.68; }
      pre { overflow: auto; background: #111827; color: #f9fafb; padding: 16px; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #dbe4f0; padding: 10px; }
      .callout { border-left: 5px solid #2563eb; background: #eff6ff; padding: 14px 18px; border-radius: 8px; }
      img { max-width: 100%; height: auto; border-radius: 8px; }
    `,
        script: `
      const progress = document.createElement('div');
      progress.className = 'progress';
      document.body.prepend(progress);
      const updateProgress = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = max > 0 ? ((scrollY / max) * 100) + '%' : '0';
      };
      addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
      const copyText = async (label, text) => {
        try {
          await navigator.clipboard.writeText(text);
          label.textContent = 'Copied';
          setTimeout(() => { label.textContent = label.dataset.label; }, 1200);
        } catch {
          label.textContent = 'Copy failed';
        }
      };
      const toolbox = document.createElement('div');
      toolbox.className = 'toolbox';
      const filter = document.createElement('input');
      filter.type = 'search';
      filter.placeholder = 'Filter sections';
      filter.setAttribute('aria-label', 'Filter sections');
      toolbox.append(filter);
      const makeButton = (label, getText) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.label = label;
        button.addEventListener('click', () => copyText(button, getText()));
        toolbox.append(button);
      };
      makeButton('Copy as prompt', () => 'Use this HTML artifact as context and continue from its decisions and structure:\\n\\n' + document.body.innerText);
      makeButton('Copy as markdown', () => document.querySelector('article').innerText);
      makeButton('Copy summary', () => [...document.querySelectorAll('h1,h2,h3')].map((h) => '- ' + h.textContent).join('\\n'));
      makeButton('Copy outline JSON', () => JSON.stringify([...document.querySelectorAll('h1,h2,h3')].map((h) => ({ level: h.tagName, text: h.textContent.trim(), id: h.id || '' })), null, 2));
      const expandButton = document.createElement('button');
      expandButton.type = 'button';
      expandButton.textContent = 'Expand all';
      expandButton.addEventListener('click', () => {
        document.querySelectorAll('article [hidden]').forEach((node) => { node.hidden = false; });
      });
      toolbox.append(expandButton);
      document.querySelector('main').prepend(toolbox);
      const headings = [...document.querySelectorAll('article h2')];
      filter.addEventListener('input', () => {
        const query = filter.value.trim().toLowerCase();
        headings.forEach((heading) => {
          const group = [heading];
          let node = heading.nextElementSibling;
          while (node && !/^H2$/.test(node.tagName)) {
            group.push(node);
            node = node.nextElementSibling;
          }
          const text = group.map((node) => node.textContent || '').join(' ').toLowerCase();
          group.forEach((node) => node.classList.toggle('marktl-filter-hidden', Boolean(query && !text.includes(query))));
        });
      });
      if (headings.length) {
        const toc = document.createElement('nav');
        toc.className = 'toc';
        toc.innerHTML = '<strong>Contents</strong> ';
        headings.forEach((heading, index) => {
          heading.id = heading.id || 'section-' + (index + 1);
          const link = document.createElement('a');
          link.href = '#' + heading.id;
          link.textContent = heading.textContent;
          toc.append(link);
          heading.addEventListener('click', () => {
            let node = heading.nextElementSibling;
            while (node && !/^H2$/.test(node.tagName)) {
              node.hidden = !node.hidden;
              node = node.nextElementSibling;
            }
          });
        });
        document.querySelector('main').prepend(toc);
      }
    `
      },
      {
        id: "playground",
        name: "Playground",
        description: "Purpose-built working surface with editable notes, sliders, and copyable state.",
        css: `
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f4f7f6; color: #16201d; }
      main { max-width: 1180px; margin: 0 auto; padding: 32px 22px 72px; }
      article { background: #ffffff; border: 1px solid #d8e2dd; border-radius: 8px; padding: 28px; }
      h1 { font-size: 40px; line-height: 1.08; margin-top: 0; }
      h2 { margin-top: 30px; border-top: 1px solid #d8e2dd; padding-top: 20px; color: #10433b; }
      p, li { line-height: 1.66; }
      table { width: 100%; border-collapse: collapse; margin: 18px 0; }
      th, td { border: 1px solid #d8e2dd; padding: 10px; vertical-align: top; }
      pre { overflow: auto; background: #101820; color: #f8fafc; padding: 16px; border-radius: 8px; }
      img { max-width: 100%; height: auto; border-radius: 8px; }
      .playground-panel { position: sticky; top: 12px; z-index: 9; display: grid; grid-template-columns: minmax(220px, 1fr) auto auto; gap: 10px; align-items: center; background: #ffffff; border: 1px solid #bdd6ce; border-radius: 8px; padding: 12px; margin-bottom: 16px; box-shadow: 0 12px 30px rgba(16, 67, 59, .08); }
      .playground-panel input[type="range"] { width: 100%; }
      .playground-panel button { border: 1px solid #9bc4b8; background: #e7f5ef; color: #10433b; border-radius: 6px; padding: 8px 10px; cursor: pointer; }
      .playground-panel button:hover { background: #d9eee6; }
      .playground-note { min-height: 90px; border: 1px dashed #9bc4b8; border-radius: 8px; padding: 12px; background: #fbfefd; outline: none; }
      .playground-note:focus { border-style: solid; box-shadow: 0 0 0 3px rgba(42, 157, 143, .15); }
      .playground-muted { color: #5f6f69; font-size: 13px; }
      .playground-emphasis-low h2 { font-size: 22px; }
      .playground-emphasis-medium h2 { font-size: 28px; }
      .playground-emphasis-high h2 { font-size: 34px; }
      @media (max-width: 720px) { .playground-panel { grid-template-columns: 1fr; } article { padding: 20px; } }
    `,
        script: `
      const article = document.querySelector('article');
      const panel = document.createElement('div');
      panel.className = 'playground-panel';
      panel.innerHTML = '<label><span class="playground-muted">Emphasis</span><input type="range" min="1" max="3" value="2" aria-label="Emphasis"></label><button type="button" data-action="copy-prompt">Copy prompt</button><button type="button" data-action="copy-state">Copy state JSON</button>';
      document.querySelector('main').prepend(panel);
      const note = document.createElement('section');
      note.innerHTML = '<h2>Working notes</h2><div class="playground-note" contenteditable="true" role="textbox" aria-label="Working notes">Edit this area while reviewing the artifact. Use Copy prompt or Copy state JSON to bring the result back to your AI session.</div>';
      article.prepend(note);
      const applyEmphasis = () => {
        article.classList.remove('playground-emphasis-low', 'playground-emphasis-medium', 'playground-emphasis-high');
        article.classList.add(['playground-emphasis-low', 'playground-emphasis-medium', 'playground-emphasis-high'][Number(panel.querySelector('input').value) - 1]);
      };
      panel.querySelector('input').addEventListener('input', applyEmphasis);
      applyEmphasis();
      const state = () => ({
        emphasis: Number(panel.querySelector('input').value),
        workingNotes: document.querySelector('.playground-note').innerText.trim(),
        outline: [...document.querySelectorAll('article h1, article h2, article h3')].map((heading) => ({ level: heading.tagName, text: heading.innerText.trim() })),
      });
      const copy = async (button, text) => {
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = 'Copied';
        } catch {
          button.textContent = 'Copy failed';
        }
        setTimeout(() => { button.textContent = original; }, 1200);
      };
      panel.querySelector('[data-action="copy-state"]').addEventListener('click', (event) => copy(event.currentTarget, JSON.stringify(state(), null, 2)));
      panel.querySelector('[data-action="copy-prompt"]').addEventListener('click', (event) => copy(event.currentTarget, 'Use this reviewed HTML artifact state as feedback for the next iteration:\\n\\n' + JSON.stringify(state(), null, 2)));
    `
      }
    ];
    function listTemplates3() {
      return templates.map(({ id, name, description }) => ({ id, name, description }));
    }
    function getTemplate(id) {
      return templates.find((template) => template.id === id) || templates[0];
    }
    function wrapWithTemplate(bodyHtml, options = {}) {
      const template = getTemplate(options.template);
      const title = options.title || "Exported note";
      const script = options.trusted && template.script ? `<script>${template.script}</script>` : "";
      return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${template.css}</style>
</head>
<body>
<main data-template="${escapeHtml(template.id)}">
<article>
${bodyHtml}
</article>
</main>
${script}
</body>
</html>`;
    }
    module2.exports = {
      getTemplate,
      listTemplates: listTemplates3,
      wrapWithTemplate
    };
  }
});

// src/core/assets.js
var require_assets = __commonJS({
  "src/core/assets.js"(exports2, module2) {
    "use strict";
    var path = require("node:path");
    var { slugify: slugify2 } = require_html();
    var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".bmp"]);
    function extractMarkdownImageReferences2(markdown) {
      const references = [];
      const seen = /* @__PURE__ */ new Set();
      const text = String(markdown || "");
      for (const match of text.matchAll(/!\[\[([^\]]+)]]/g)) {
        const raw = String(match[1] || "").trim();
        const target = normalizeImageTarget(raw);
        addReference(references, seen, target, raw);
      }
      for (const match of text.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)) {
        const raw = String(match[2] || "").trim();
        const target = normalizeImageTarget(raw);
        addReference(references, seen, target, raw);
      }
      return references;
    }
    function normalizeImageTarget(value) {
      let target = String(value || "").trim();
      if (target.startsWith("<") && target.endsWith(">")) {
        target = target.slice(1, -1).trim();
      }
      target = target.split("|")[0].trim();
      target = target.split("#")[0].trim();
      return decodeUriSafely(target);
    }
    function isLocalImageTarget(target) {
      const value = String(target || "").trim();
      if (!value || /^(?:https?:|data:|blob:|mailto:|#)/i.test(value)) {
        return false;
      }
      return IMAGE_EXTENSIONS.has(path.extname(value).toLowerCase());
    }
    function buildAssetFileName2(originalPath, index, used = /* @__PURE__ */ new Set()) {
      const extension = path.extname(originalPath).toLowerCase();
      const base = slugify2(path.basename(originalPath, path.extname(originalPath))) || `image-${index}`;
      let candidate = `${base}${extension}`;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${suffix}${extension}`;
        suffix += 1;
      }
      used.add(candidate);
      return candidate;
    }
    function rewriteHtmlImageSources2(html, mappings) {
      const replacements = buildReplacementMap(mappings);
      if (replacements.size === 0) {
        return String(html || "");
      }
      return String(html || "").replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])(.*?)\2/gi, (match, prefix, quote, src) => {
        const normalized = normalizeImageTarget(src);
        const replacement = replacements.get(src) || replacements.get(normalized) || replacements.get(decodeUriSafely(src));
        if (!replacement) {
          return match;
        }
        return `${prefix}${quote}${replacement}${quote}`;
      });
    }
    function buildAiAssetInstruction(mappings) {
      if (!Array.isArray(mappings) || mappings.length === 0) {
        return "";
      }
      const lines = mappings.map((mapping) => `- ${mapping.original}: ${mapping.relativeSrc}`).join("\n");
      return `
Local image assets are available. Preserve these images and use the mapped src values exactly:
${lines}`;
    }
    function buildReplacementMap(mappings) {
      const replacements = /* @__PURE__ */ new Map();
      for (const mapping of mappings || []) {
        if (!mapping || !mapping.relativeSrc) {
          continue;
        }
        for (const key of mapping.aliases || []) {
          if (key) {
            replacements.set(key, mapping.relativeSrc);
            replacements.set(`./${key}`, mapping.relativeSrc);
            replacements.set(encodeURI(key), mapping.relativeSrc);
            replacements.set(`./${encodeURI(key)}`, mapping.relativeSrc);
          }
        }
      }
      return replacements;
    }
    function addReference(references, seen, target, raw) {
      if (!isLocalImageTarget(target) || seen.has(target)) {
        return;
      }
      seen.add(target);
      references.push({ target, raw });
    }
    function decodeUriSafely(value) {
      try {
        return decodeURI(String(value || ""));
      } catch (e) {
        return String(value || "");
      }
    }
    module2.exports = {
      buildAiAssetInstruction,
      buildAssetFileName: buildAssetFileName2,
      extractMarkdownImageReferences: extractMarkdownImageReferences2,
      isLocalImageTarget,
      normalizeImageTarget,
      rewriteHtmlImageSources: rewriteHtmlImageSources2
    };
  }
});

// src/core/sanitizer.js
var require_sanitizer = __commonJS({
  "src/core/sanitizer.js"(exports2, module2) {
    "use strict";
    function sanitizeHtml(html, options = {}) {
      if (options.trusted) {
        return html;
      }
      return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "").replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "").replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, "").replace(/<link\b[^>]*>/gi, "").replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s+(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, "").replace(/\s+(href|src)\s*=\s*("|')\s*https?:\/\/[^"']*\2/gi, "");
    }
    function looksLikeHtmlDocument(html) {
      const value = String(html || "").trim();
      return /<\/?[a-z][\s\S]*>/i.test(value);
    }
    module2.exports = {
      looksLikeHtmlDocument,
      sanitizeHtml
    };
  }
});

// src/core/converter.js
var require_converter = __commonJS({
  "src/core/converter.js"(exports2, module2) {
    "use strict";
    var path = require("node:path");
    var { normalizeImageTarget } = require_assets();
    var { escapeHtml } = require_html();
    var { sanitizeHtml } = require_sanitizer();
    var { wrapWithTemplate } = require_templates();
    function convertMarkdownToHtml(markdown, options = {}) {
      const parsed = splitFrontmatter(markdown);
      const bodyHtml = blocksToHtml(parsed.body, options);
      const frontmatterHtml = parsed.frontmatter ? `<pre class="frontmatter">${escapeHtml(parsed.frontmatter)}</pre>
` : "";
      const title = inferTitle(parsed.body, options.sourcePath);
      const html = wrapWithTemplate(`${frontmatterHtml}${bodyHtml}`, {
        template: options.template,
        title,
        trusted: Boolean(options.trusted)
      });
      return sanitizeHtml(html, { trusted: Boolean(options.trusted) });
    }
    function splitFrontmatter(markdown) {
      const normalized = String(markdown || "").replace(/\r\n/g, "\n");
      if (!normalized.startsWith("---\n")) {
        return { frontmatter: "", body: normalized };
      }
      const closeIndex = normalized.indexOf("\n---\n", 4);
      if (closeIndex === -1) {
        return { frontmatter: "", body: normalized };
      }
      return {
        frontmatter: normalized.slice(4, closeIndex).trim(),
        body: normalized.slice(closeIndex + 5).trimStart()
      };
    }
    function inferTitle(markdown, sourcePath) {
      const heading = String(markdown || "").split("\n").find((line) => /^#\s+/.test(line));
      if (heading) {
        return heading.replace(/^#\s+/, "").trim();
      }
      if (sourcePath) {
        return path.basename(sourcePath, path.extname(sourcePath));
      }
      return "Exported note";
    }
    function blocksToHtml(markdown, options) {
      const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
      const blocks = [];
      let index = 0;
      while (index < lines.length) {
        const line = lines[index];
        if (!line.trim()) {
          index += 1;
          continue;
        }
        if (/^```/.test(line)) {
          const language = line.replace(/^```/, "").trim();
          const code = [];
          index += 1;
          while (index < lines.length && !/^```/.test(lines[index])) {
            code.push(lines[index]);
            index += 1;
          }
          index += 1;
          blocks.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
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
        blocks.push(`<p>${inlineMarkdown(paragraph.join(" "), options)}</p>`);
      }
      return blocks.join("\n");
    }
    function isBlockStart(line) {
      return /^(```|#{1,6}\s+|>\s+\[!|\s*[-*]\s+|\s*\d+\.\s+)/.test(line) || readTable([line, "| - |"], 0);
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
        body.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      return {
        html: `<aside class="callout callout-${escapeHtml(type)}"><div class="callout-title">${escapeHtml(title)}</div><div class="callout-body">${blocksToHtml(body.join("\n"), {})}</div></aside>`,
        nextIndex: index
      };
    }
    function readTable(lines, start) {
      if (!/^\s*\|.+\|\s*$/.test(lines[start] || "") || !/^\s*\|[\s:-]+\|/.test(lines[start + 1] || "")) {
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
      const headerHtml = `<thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell, {})}</th>`).join("")}</tr></thead>`;
      const bodyHtml = `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell, {})}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return {
        html: `<table>${headerHtml}${bodyHtml}</table>`,
        nextIndex: index
      };
    }
    function splitTableRow(line) {
      return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
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
        items.push(lines[index].replace(matcher, "").trim());
        index += 1;
      }
      const tag = ordered ? "ol" : "ul";
      return {
        html: `<${tag}>${items.map((item) => `<li>${inlineMarkdown(item, {})}</li>`).join("")}</${tag}>`,
        nextIndex: index
      };
    }
    function inlineMarkdown(value) {
      return escapeHtml(value).replace(/!\[\[([^\]]+)]]/g, (_match, target) => {
        const src = normalizeImageTarget(target);
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(path.basename(src))}">`;
      }).replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_match, alt, src) => {
        const normalizedSrc = normalizeImageTarget(src);
        return `<img src="${escapeHtml(normalizedSrc)}" alt="${escapeHtml(alt)}">`;
      }).replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
    }
    module2.exports = {
      convertMarkdownToHtml,
      inferTitle,
      splitFrontmatter
    };
  }
});

// src/core/ai.js
var require_ai = __commonJS({
  "src/core/ai.js"(exports2, module2) {
    "use strict";
    var { spawn } = require("node:child_process");
    var fs = require("node:fs");
    var os = require("node:os");
    var path = require("node:path");
    var { buildAiAssetInstruction } = require_assets();
    var { getArtifactGoalInstruction } = require_artifact_goals();
    var { convertMarkdownToHtml } = require_converter();
    var { looksLikeHtmlDocument, sanitizeHtml } = require_sanitizer();
    var providerCommands = {
      claude: { command: "claude", args: ["-p"], promptAsArgument: true },
      codex: { command: "codex", args: ["exec", "--json", "--sandbox", "read-only", "-"], parser: "codex-json", promptAsArgument: false }
    };
    var unixCliPath = [
      "/opt/homebrew/bin",
      "/usr/local/bin",
      "/usr/bin",
      "/bin",
      "/usr/sbin",
      "/sbin"
    ];
    async function convertWithAiFallback2(markdown, options = {}) {
      if (!options.provider || options.provider === "none") {
        return {
          html: convertMarkdownToHtml(markdown, options),
          usedFallback: true,
          warnings: ["AI provider is disabled; used local conversion."]
        };
      }
      const runProvider = options.runProvider || runCliProvider;
      try {
        const aiHtml = extractHtmlFromAiOutput(await runProvider(markdown, options));
        if (!looksLikeHtmlDocument(aiHtml)) {
          throw new Error("AI provider returned invalid HTML");
        }
        return {
          html: sanitizeHtml(aiHtml, { trusted: Boolean(options.trusted) }),
          usedFallback: false,
          warnings: []
        };
      } catch (error) {
        if (options.strictAiFailures) {
          throw error;
        }
        return {
          html: convertMarkdownToHtml(markdown, options),
          usedFallback: true,
          warnings: [`AI conversion failed: ${error.message}. Used local fallback.`]
        };
      }
    }
    async function runCliProvider(markdown, options = {}) {
      const provider = providerCommands[options.provider];
      if (!provider) {
        throw new Error(`Unsupported AI provider: ${options.provider}`);
      }
      const prompt = buildPrompt(markdown, options);
      const timeout = Number(options.timeoutMs || 3e5);
      const command = options.cliPaths && options.cliPaths[options.provider] ? options.cliPaths[options.provider] : provider.command;
      const args = provider.promptAsArgument ? [...provider.args, prompt] : provider.args;
      const execOptions = {
        timeout,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          PATH: mergePath(process.env.PATH)
        },
        shell: process.platform === "win32"
      };
      if (!provider.promptAsArgument) {
        execOptions.input = prompt;
      }
      try {
        const executeProcess = options.runProcess || runProcess;
        const { stdout, stderr } = await executeProcess(command, args, execOptions);
        const output = parseProviderOutput(stdout, provider);
        if (!String(output || "").trim()) {
          throw new Error(`AI provider returned empty output${stderr ? `: ${cleanProviderError(stderr)}` : ""}`);
        }
        return output;
      } catch (error) {
        const details = [
          cleanProviderError(error.stderr),
          parseProviderErrorOutput(error.stdout, provider),
          cleanProviderError(error.stdout),
          cleanProviderError(error.message)
        ].filter(Boolean).join("\n");
        throw new Error(details || String(error));
      }
    }
    function runProcess(command, args, options) {
      return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
          env: options.env,
          shell: Boolean(options.shell),
          stdio: ["ignore", "pipe", "pipe"]
        });
        let stdout = "";
        let stderr = "";
        let settled = false;
        const timeout = setTimeout(() => {
          if (settled) {
            return;
          }
          settled = true;
          child.kill("SIGTERM");
          const error = new Error(`Provider timed out after ${options.timeout}ms`);
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        }, options.timeout);
        child.stdout.on("data", (chunk) => {
          stdout += chunk;
          if (stdout.length > options.maxBuffer) {
            child.kill("SIGTERM");
          }
        });
        child.stderr.on("data", (chunk) => {
          stderr += chunk;
          if (stderr.length > options.maxBuffer) {
            child.kill("SIGTERM");
          }
        });
        child.on("error", (error) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        });
        child.on("close", (code, signal) => {
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
      const artifactGoal = options.artifactGoal || "read";
      const goalInstruction = getArtifactGoalInstruction(artifactGoal);
      const artifactInstruction = getArtifactInstruction(options.artifactType || "faithful-note");
      const modeInstruction = {
        preserve: "Preserve the source content. Improve semantic HTML, visual hierarchy, typography, spacing, and responsive styling. Do not summarize or remove content.",
        presentation: "Create a premium presentation-style HTML document with section cards, strong visual rhythm, concise slide-like grouping, summaries, and visual emphasis.",
        blog: "Create a polished editorial blog-style HTML article with refined typography, pull quotes, section rhythm, and light restructuring.",
        landing: "Create a landing-page-style HTML document with strong hero treatment, benefit sections, emphasis copy, and deliberate visual hierarchy."
      }[options.mode || "preserve"];
      const dynamicInstruction = options.trusted ? "Trusted mode is enabled: you may include small inline JavaScript for useful interactions, animations, toggles, table-of-contents behavior, or reveal effects. Keep it self-contained and do not load remote resources." : "Sanitized mode is enabled: do not use JavaScript, iframes, external CSS, external scripts, or remote assets. Use rich CSS-only layout and interactions instead.";
      return `Convert this Obsidian Markdown note to a complete standalone HTML document.
Artifact goal: ${artifactGoal}
Artifact type: ${options.artifactType || "faithful-note"}
Template: ${options.template || "minimal"}
Mode: ${options.mode || "preserve"}
Goal instruction: ${goalInstruction}
Artifact instruction: ${artifactInstruction}
Instruction: ${modeInstruction}
Design standard: produce a refined, modern, visually designed HTML page rather than plain Markdown-looking output. Use responsive CSS, strong spacing, tasteful color, cards/sections where helpful, and readable Korean typography if the content is Korean.
Dynamic policy: ${dynamicInstruction}
Interaction standard: when trusted mode is enabled, make the HTML useful as an AI artifact surface, not just a document. Include local-only controls such as generated table of contents, section collapse, copy as prompt/markdown/summary buttons, annotations, editable review state, sliders, scorecards, or lightweight filters when they fit the artifact goal. End with a clear copy-back-to-AI affordance when the artifact supports decisions, review, comparison, or tuning. Keep everything self-contained.
${buildAiAssetInstruction(options.assetMappings)}
${options.contextPack ? `
Context pack:
${options.contextPack}
` : ""}
Return only HTML. Do not wrap it in Markdown fences.

${markdown}`;
    }
    function getArtifactInstruction(artifactType) {
      return {
        "faithful-note": "Render the note faithfully with better readability, visual hierarchy, and navigation. Do not substantially reorder or summarize unless the source already does.",
        "strategy-brief": "Create an executive strategy brief with TL;DR, decision context, options, tradeoffs, risks, recommendation, and next actions.",
        "research-report": "Create a research report with abstract, key findings, evidence sections, source notes, diagrams or tables where useful, and implications.",
        "decision-memo": "Create a decision memo optimized for choosing: question, criteria, options, comparison matrix, recommendation, dissenting view, and decision log.",
        "interactive-explainer": "Create an interactive explainer with progressive disclosure, visual examples, generated TOC, copy buttons, editable local controls, sliders or filters when useful, and self-contained export/copy state in trusted mode.",
        "slide-deck": "Create a slide-like artifact with concise sections, strong headings, visual rhythm, and one idea per section while preserving source meaning."
      }[artifactType] || "Render a readable, useful HTML artifact from the note.";
    }
    function extractHtmlFromAiOutput(output) {
      const value = String(output || "").trim();
      if (!value) {
        return "";
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
      const lastTag = Math.max(candidate.lastIndexOf(">"), candidate.lastIndexOf("/>"));
      if (firstTag !== -1 && lastTag > firstTag) {
        return candidate.slice(firstTag, lastTag + 1).trim();
      }
      return candidate;
    }
    function mergePath(existingPath = "", options = {}) {
      const platform = options.platform || process.platform;
      const delimiter = options.delimiter || (platform === "win32" ? ";" : path.delimiter);
      const seen = /* @__PURE__ */ new Set();
      return [
        ...defaultCliPaths(platform, options.env || process.env, options.homeDir),
        ...discoverUserCliPaths(options.homeDir, platform, options.env || process.env),
        ...String(existingPath).split(delimiter)
      ].filter(Boolean).filter((entry) => {
        if (seen.has(entry)) {
          return false;
        }
        seen.add(entry);
        return true;
      }).join(delimiter);
    }
    function defaultCliPaths(platform = process.platform, env = process.env, homeDir = os.homedir()) {
      if (platform !== "win32") {
        return unixCliPath;
      }
      return [
        env.APPDATA ? path.join(env.APPDATA, "npm") : "",
        env.LOCALAPPDATA ? path.join(env.LOCALAPPDATA, "Programs", "nodejs") : "",
        homeDir ? path.join(homeDir, "AppData", "Roaming", "npm") : "",
        "C:\\Program Files\\nodejs"
      ].filter(Boolean);
    }
    function discoverUserCliPaths(homeDir = os.homedir(), platform = process.platform, env = process.env) {
      const paths = [];
      if (!homeDir) {
        return paths;
      }
      if (platform === "win32") {
        if (env.APPDATA) {
          paths.push(path.join(env.APPDATA, "npm"));
        }
        paths.push(path.join(homeDir, "AppData", "Roaming", "npm"));
        return [...new Set(paths)];
      }
      paths.push(path.join(homeDir, ".local/bin"));
      paths.push(path.join(homeDir, ".volta/bin"));
      const nvmVersions = path.join(homeDir, ".nvm/versions/node");
      try {
        const versions = fs.readdirSync(nvmVersions).filter((entry) => fs.existsSync(path.join(nvmVersions, entry, "bin/node"))).sort(compareNodeVersionsDesc);
        for (const version of versions) {
          paths.push(path.join(nvmVersions, version, "bin"));
        }
      } catch (e) {
      }
      return paths;
    }
    function compareNodeVersionsDesc(a, b) {
      const parse = (value) => value.replace(/^v/, "").split(".").map((part) => Number(part) || 0);
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
      if (provider.parser !== "codex-json") {
        return stdout;
      }
      let lastMessage = "";
      let lastError = "";
      for (const line of String(stdout || "").split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("{")) {
          continue;
        }
        try {
          const event = JSON.parse(trimmed);
          if (event.type === "item.completed" && event.item && event.item.type === "agent_message") {
            lastMessage = event.item.text || "";
          }
          if (event.type === "item.completed" && event.item && event.item.type === "error") {
            lastError = event.item.message || "";
          }
        } catch (e) {
        }
      }
      if (!lastMessage && lastError) {
        throw new Error(lastError);
      }
      return lastMessage || stdout;
    }
    function parseProviderErrorOutput(stdout, provider = {}) {
      if (!stdout) {
        return "";
      }
      try {
        parseProviderOutput(stdout, provider);
      } catch (error) {
        return cleanProviderError(error.message);
      }
      return "";
    }
    function cleanProviderError(value = "") {
      const text = String(value || "").trim();
      if (!text) {
        return "";
      }
      return text.replace(/Command failed:[\s\S]*?(?=\n[A-Z][a-z]+:|\nError:|\nWarning:|$)/g, "").replace(/Convert this Obsidian Markdown note[\s\S]*$/g, "Provider command failed while processing the prompt.").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 8).join("\n");
    }
    module2.exports = {
      buildPrompt,
      getArtifactInstruction,
      convertWithAiFallback: convertWithAiFallback2,
      extractHtmlFromAiOutput,
      discoverUserCliPaths,
      mergePath,
      parseProviderOutput,
      runCliProvider,
      cleanProviderError
    };
  }
});

// src/core/provider-doctor.js
var require_provider_doctor = __commonJS({
  "src/core/provider-doctor.js"(exports2, module2) {
    "use strict";
    var { spawn } = require("node:child_process");
    var { mergePath } = require_ai();
    async function checkClaudeProvider2(options = {}) {
      const command = options.command || "claude";
      const timeoutMs = Number(options.timeoutMs || 15e3);
      const runner = options.runCommand || runCommand;
      const version = await runner(command, ["--version"], timeoutMs);
      if (version.code !== 0) {
        return {
          ok: false,
          status: "missing",
          message: cleanDoctorOutput(version.output) || "Claude Code CLI was not found or did not start.",
          version: ""
        };
      }
      const probe = await runner(command, ["-p", "Return only this exact text: MARKTL_OK"], timeoutMs);
      if (probe.code !== 0) {
        const output = cleanDoctorOutput(probe.output);
        return {
          ok: false,
          status: output.toLowerCase().includes("not logged in") ? "not-logged-in" : "probe-failed",
          message: output || "Claude Code CLI is installed, but the login probe failed.",
          version: cleanDoctorOutput(version.output)
        };
      }
      return {
        ok: /MARKTL_OK/i.test(probe.output),
        status: /MARKTL_OK/i.test(probe.output) ? "ready" : "unexpected-output",
        message: /MARKTL_OK/i.test(probe.output) ? "Claude Code CLI is installed, logged in, and ready." : cleanDoctorOutput(probe.output) || "Claude Code CLI responded, but not with the expected probe text.",
        version: cleanDoctorOutput(version.output)
      };
    }
    function runCommand(command, args, timeoutMs) {
      return new Promise((resolve) => {
        const child = spawn(command, args, {
          env: {
            ...process.env,
            PATH: mergePath(process.env.PATH)
          },
          stdio: ["ignore", "pipe", "pipe"]
        });
        let output = "";
        let settled = false;
        const timeout = setTimeout(() => {
          if (settled) {
            return;
          }
          settled = true;
          child.kill("SIGTERM");
          resolve({ code: -1, output: `Provider doctor timed out after ${timeoutMs}ms.` });
        }, timeoutMs);
        child.stdout.on("data", (chunk) => {
          output += chunk;
        });
        child.stderr.on("data", (chunk) => {
          output += chunk;
        });
        child.on("error", (error) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          resolve({ code: -1, output: error.message });
        });
        child.on("close", (code) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          resolve({ code: code || 0, output });
        });
      });
    }
    function cleanDoctorOutput(value = "") {
      return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 6).join("\n");
    }
    module2.exports = {
      checkClaudeProvider: checkClaudeProvider2,
      cleanDoctorOutput,
      runCommand
    };
  }
});

// src/core/context-pack.js
var require_context_pack = __commonJS({
  "src/core/context-pack.js"(exports2, module2) {
    "use strict";
    var { escapeHtml } = require_html();
    var MAX_CONTEXT_NOTES = 6;
    var MAX_CONTEXT_CHARS = 1400;
    function extractMarkdownContextTargets2(markdown) {
      const targets = [];
      const seen = /* @__PURE__ */ new Set();
      const add = (target) => {
        const clean = normalizeContextTarget(target);
        if (!clean || seen.has(clean)) {
          return;
        }
        seen.add(clean);
        targets.push(clean);
      };
      const wikiPattern = /(^|[^!])\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g;
      let match;
      while ((match = wikiPattern.exec(String(markdown || ""))) !== null) {
        add(match[2]);
      }
      const markdownLinkPattern = /(^|[^!])\[[^\]]*]\((?!https?:|data:|blob:|mailto:|#)([^)#]+)(?:#[^)]*)?\)/gi;
      while ((match = markdownLinkPattern.exec(String(markdown || ""))) !== null) {
        add(decodeURI(match[2]));
      }
      return targets.slice(0, MAX_CONTEXT_NOTES);
    }
    function normalizeContextTarget(target) {
      return String(target || "").replace(/\\/g, "/").replace(/^\.\//, "").trim();
    }
    function compactMarkdownForContext(markdown, maxChars = MAX_CONTEXT_CHARS) {
      const compact = String(markdown || "").replace(/^---[\s\S]*?---\s*/m, "").replace(/```[\s\S]*?```/g, "[code block omitted]").replace(/!\[\[[^\]]+]]/g, "[embedded asset]").replace(/!\[[^\]]*]\([^)]+\)/g, "[image]").split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
      if (compact.length <= maxChars) {
        return compact;
      }
      return `${compact.slice(0, maxChars).trim()}
[truncated]`;
    }
    function buildContextPackMarkdown2(items) {
      const usable = Array.isArray(items) ? items.filter((item) => item && item.content) : [];
      if (!usable.length) {
        return "";
      }
      return [
        "Additional vault context is available. Use it only to clarify the active note; do not let it override the source note.",
        ...usable.map((item, index) => [
          `
[Context note ${index + 1}: ${item.path || item.target || "linked note"}]`,
          compactMarkdownForContext(item.content)
        ].join("\n"))
      ].join("\n");
    }
    function buildContextPackHtml(items) {
      const usable = Array.isArray(items) ? items.filter((item) => item && item.content) : [];
      if (!usable.length) {
        return "";
      }
      return `<aside class="callout callout-context"><div class="callout-title">Linked context</div><div class="callout-body">${usable.map((item) => `<section><strong>${escapeHtml(item.path || item.target || "linked note")}</strong><pre>${escapeHtml(compactMarkdownForContext(item.content, 700))}</pre></section>`).join("")}</div></aside>`;
    }
    module2.exports = {
      buildContextPackHtml,
      buildContextPackMarkdown: buildContextPackMarkdown2,
      compactMarkdownForContext,
      extractMarkdownContextTargets: extractMarkdownContextTargets2
    };
  }
});

// src/core/feedback.js
var require_feedback = __commonJS({
  "src/core/feedback.js"(exports2, module2) {
    "use strict";
    var { escapeHtml } = require_html();
    function buildGiscusFeedbackSection(options = {}) {
      const config = normalizeGiscusConfig(options);
      if (!config.ready) {
        return "";
      }
      return `<section class="marktl-reader-feedback" aria-label="Reader feedback">
<style>
.marktl-reader-feedback { margin: 48px auto 0; padding: 24px; border: 1px solid #d8e2ef; border-radius: 8px; background: #ffffff; }
.marktl-reader-feedback h2 { margin-top: 0; }
.marktl-reader-feedback p { color: #526173; }
.marktl-github-login-note { display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 18px; padding: 10px 12px; border-radius: 6px; background: #f2f5f9; color: #243b53; font-weight: 700; }
</style>
<h2>Reader feedback</h2>
<p>Sign in with GitHub in the comment box below to leave a public comment or reaction.</p>
<div class="marktl-github-login-note">GitHub login is handled by Giscus.</div>
<script src="https://giscus.app/client.js"
        data-repo="${escapeAttr(config.repo)}"
        data-repo-id="${escapeAttr(config.repoId)}"
        data-category="${escapeAttr(config.category)}"
        data-category-id="${escapeAttr(config.categoryId)}"
        data-mapping="${escapeAttr(config.mapping)}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="${escapeAttr(config.theme)}"
        data-lang="${escapeAttr(config.lang)}"
        crossorigin="anonymous"
        async>
</script>
</section>`;
    }
    function injectReaderFeedback2(html, options = {}) {
      const section = buildGiscusFeedbackSection(options);
      if (!section) {
        return String(html || "");
      }
      const value = String(html || "");
      if (/<\/main>/i.test(value)) {
        return value.replace(/<\/main>/i, `${section}
</main>`);
      }
      if (/<\/body>/i.test(value)) {
        return value.replace(/<\/body>/i, `${section}
</body>`);
      }
      return `${value}
${section}`;
    }
    function validateGiscusConfig2(options = {}) {
      const config = normalizeGiscusConfig(options);
      const warnings = [];
      if (!config.repo) warnings.push("Giscus feedback is missing repository.");
      if (!config.repoId) warnings.push("Giscus feedback is missing repository ID.");
      if (!config.category) warnings.push("Giscus feedback is missing discussion category.");
      if (!config.categoryId) warnings.push("Giscus feedback is missing discussion category ID.");
      return warnings;
    }
    function normalizeGiscusConfig(options = {}) {
      const config = {
        repo: String(options.repo || "").trim(),
        repoId: String(options.repoId || "").trim(),
        category: String(options.category || "").trim(),
        categoryId: String(options.categoryId || "").trim(),
        mapping: String(options.mapping || "pathname").trim() || "pathname",
        theme: String(options.theme || "preferred_color_scheme").trim() || "preferred_color_scheme",
        lang: String(options.lang || "ko").trim() || "ko"
      };
      return {
        ...config,
        ready: Boolean(config.repo && config.repoId && config.category && config.categoryId)
      };
    }
    function escapeAttr(value) {
      return escapeHtml(String(value || "")).replace(/"/g, "&quot;");
    }
    module2.exports = {
      buildGiscusFeedbackSection,
      injectReaderFeedback: injectReaderFeedback2,
      validateGiscusConfig: validateGiscusConfig2
    };
  }
});

// src/core/github-pages.js
var require_github_pages = __commonJS({
  "src/core/github-pages.js"(exports2, module2) {
    "use strict";
    var path = require("node:path");
    function parseRepo2(value) {
      const cleaned = String(value || "").trim().replace(/^https:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/^\/+|\/+$/g, "");
      const [owner, repo] = cleaned.split("/");
      if (!owner || !repo) {
        return null;
      }
      return { owner, repo };
    }
    function normalizePublishPath(value) {
      return String(value || "").trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/").replace(/\/+/g, "/");
    }
    function buildPublishPath2(basePath, slug, filePath) {
      return [normalizePublishPath(basePath), slug, filePath].filter(Boolean).join("/").replace(/\/+/g, "/");
    }
    function buildPagesUrl2(baseUrl, basePath, slug) {
      const root = String(baseUrl || "").trim().replace(/\/+$/g, "");
      if (!root) {
        return "";
      }
      const suffix = [normalizePublishPath(basePath), slug].filter(Boolean).map((part) => encodePathPart(part)).join("/");
      return `${root}/${suffix ? `${suffix}/` : ""}`;
    }
    function buildShortPagesUrl2(baseUrl, basePath, shortId) {
      return buildPagesUrl2(baseUrl, basePath, `s/${shortId}`);
    }
    function buildShareHomeUrl2(baseUrl, basePath) {
      const root = String(baseUrl || "").trim().replace(/\/+$/g, "");
      if (!root) {
        return "";
      }
      const suffix = normalizePublishPath(basePath);
      return `${root}/${suffix ? `${encodePathPart(suffix)}/` : ""}`;
    }
    function encodePathPart(value) {
      return String(value || "").split("/").map((part) => encodeURIComponent(part)).join("/");
    }
    function inferPagesBaseUrl2(repoValue) {
      const repo = parseRepo2(repoValue);
      if (!repo) {
        return "";
      }
      if (repo.repo.toLowerCase() === `${repo.owner.toLowerCase()}.github.io`) {
        return `https://${repo.repo}`;
      }
      return `https://${repo.owner}.github.io/${repo.repo}`;
    }
    function mimeTypeForPath(filePath) {
      const extension = path.extname(filePath).toLowerCase();
      return {
        ".html": "text/html; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif"
      }[extension] || "application/octet-stream";
    }
    function updateShareIndex2(existingIndex, entry) {
      const now = entry.updatedAt || (/* @__PURE__ */ new Date()).toISOString();
      const current = Array.isArray(existingIndex == null ? void 0 : existingIndex.items) ? existingIndex.items : [];
      const items = [
        {
          ...entry,
          updatedAt: now
        },
        ...current.filter((item) => item && item.slug !== entry.slug)
      ].sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
      return {
        version: 1,
        updatedAt: now,
        items
      };
    }
    function renderShareIndexHtml2(index, options = {}) {
      const title = options.title || "MarkTL Shared HTML";
      const baseUrl = String(options.baseUrl || "").replace(/\/+$/g, "");
      const items = Array.isArray(index == null ? void 0 : index.items) ? index.items : [];
      const tagCounts = /* @__PURE__ */ new Map();
      for (const item of items) {
        for (const tag of normalizeTags(item.tags)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      const tagButtons = [...tagCounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([tag, count]) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} <span>${count}</span></button>`).join("");
      const list = items.map((item) => {
        const href = item.url || (baseUrl ? `${baseUrl}/${encodeURIComponent(item.slug)}/` : `${encodeURIComponent(item.slug)}/`);
        const tags = normalizeTags(item.tags);
        const searchText = [
          item.title,
          item.slug,
          item.excerpt,
          item.sourcePath,
          item.artifactType,
          ...tags
        ].filter(Boolean).join(" ").toLowerCase();
        return `<article class="item" data-search="${escapeHtml(searchText)}" data-tags="${escapeHtml(tags.join(" "))}">
<div class="item-top"><a href="${escapeHtml(href)}">${escapeHtml(item.title || item.slug)}</a><span>${escapeHtml(formatDate(item.updatedAt))}</span></div>
<p>${escapeHtml(item.excerpt || item.sourcePath || "")}</p>
<div class="item-meta"><span>${escapeHtml(item.artifactType || "HTML artifact")}</span><span>${escapeHtml(item.sourcePath || "")}</span></div>
${tags.length ? `<div class="tags">${tags.map((tag) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}</div>` : ""}
</article>`;
      }).join("\n");
      return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f4;color:#172033}
main{max-width:1120px;margin:0 auto;padding:44px 22px 72px}
.hero{display:grid;gap:14px;margin-bottom:22px}.eyebrow{color:#8a4b64;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.08em}
h1{font-size:clamp(34px,6vw,72px);line-height:.98;margin:0}.meta{color:#68737d;margin:0;font-size:18px}
.toolbar{position:sticky;top:0;z-index:2;display:grid;gap:12px;background:rgba(246,247,244,.94);backdrop-filter:blur(12px);border-bottom:1px solid #dde2e6;padding:14px 0;margin-bottom:18px}
.toolbar input{width:100%;border:1px solid #cfd8e5;border-radius:8px;padding:12px 14px;font-size:16px;background:#fff;color:#172033}
.tagbar{display:flex;flex-wrap:wrap;gap:8px}.tagbar button,.tags button{border:1px solid #d6dfeb;background:#fff;color:#33506d;border-radius:999px;padding:6px 10px;cursor:pointer}.tagbar button.active,.tags button:hover{background:#174ea6;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.item{display:flex;min-height:210px;flex-direction:column;gap:12px;background:#fff;border:1px solid #dde2e6;border-radius:8px;padding:18px;box-shadow:0 12px 32px rgba(23,32,51,.05)}
.item-top{display:grid;gap:8px}.item a{color:#174ea6;font-size:20px;font-weight:800;line-height:1.2;text-decoration:none}.item a:hover{text-decoration:underline}
.item-top span,.item-meta{color:#68737d;font-size:13px}.item p{color:#344054;line-height:1.55;margin:0;flex:1}.item-meta{display:grid;gap:4px}.tags{display:flex;flex-wrap:wrap;gap:6px}
.empty{background:#fff;border:1px dashed #cfd8e5;border-radius:8px;padding:24px;color:#68737d}
</style>
</head>
<body><main>
<section class="hero"><div class="eyebrow">MarkTL Archive</div><h1>${escapeHtml(title)}</h1><p class="meta"><span id="count">${items.length}</span> published document(s). Search, filter, and open any shared HTML artifact.</p></section>
<section class="toolbar" aria-label="Archive controls"><input id="search" type="search" placeholder="Search documents, tags, sources..." aria-label="Search documents"><div class="tagbar"><button type="button" data-tag="">All</button>${tagButtons}</div></section>
<section class="grid" id="items">${list || '<p class="empty">No published documents yet.</p>'}</section>
</main>
<script>
const search = document.getElementById('search');
const count = document.getElementById('count');
const cards = [...document.querySelectorAll('.item')];
let activeTag = '';
function applyFilters(){
  const query = (search.value || '').trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const matchesQuery = !query || card.dataset.search.includes(query);
    const matchesTag = !activeTag || (' ' + card.dataset.tags + ' ').includes(' ' + activeTag + ' ');
    const show = matchesQuery && matchesTag;
    card.hidden = !show;
    if (show) visible++;
  }
  count.textContent = String(visible);
}
document.querySelectorAll('[data-tag]').forEach((button) => {
  button.addEventListener('click', () => {
    activeTag = button.dataset.tag || '';
    document.querySelectorAll('.tagbar [data-tag]').forEach((node) => node.classList.toggle('active', node.dataset.tag === activeTag));
    applyFilters();
  });
});
search.addEventListener('input', applyFilters);
applyFilters();
</script>
</body>
</html>`;
    }
    function normalizeTags(tags) {
      const values = Array.isArray(tags) ? tags : String(tags || "").split(",");
      return values.map((tag) => String(tag || "").replace(/^#/, "").trim()).filter(Boolean).slice(0, 8);
    }
    function formatDate(value) {
      if (!value) {
        return "";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return String(value);
      }
      return date.toISOString().slice(0, 10);
    }
    function escapeHtml(value) {
      return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    module2.exports = {
      buildPagesUrl: buildPagesUrl2,
      buildPublishPath: buildPublishPath2,
      buildShareHomeUrl: buildShareHomeUrl2,
      buildShortPagesUrl: buildShortPagesUrl2,
      inferPagesBaseUrl: inferPagesBaseUrl2,
      mimeTypeForPath,
      normalizePublishPath,
      parseRepo: parseRepo2,
      renderShareIndexHtml: renderShareIndexHtml2,
      updateShareIndex: updateShareIndex2
    };
  }
});

// src/core/html-qa.js
var require_html_qa = __commonJS({
  "src/core/html-qa.js"(exports2, module2) {
    "use strict";
    function validateHtmlArtifact2(html, options = {}) {
      const warnings = [];
      const value = String(html || "");
      if (!/<!doctype\s+html/i.test(value)) {
        warnings.push("HTML QA: missing <!doctype html>.");
      }
      if (!/<meta\s+name=["']viewport["']/i.test(value)) {
        warnings.push("HTML QA: missing responsive viewport meta tag.");
      }
      if (!/<style\b/i.test(value)) {
        warnings.push("HTML QA: no inline CSS found; output may be too plain.");
      }
      if (!/<h1\b/i.test(value)) {
        warnings.push("HTML QA: no H1 heading found.");
      }
      const trusted = Boolean(options.trusted);
      if (trusted && !/<script\b/i.test(value)) {
        warnings.push("HTML QA: trusted interactive mode produced no script; artifact may be static.");
      }
      if (!trusted && /<script\b|<iframe\b|\son[a-z]+\s*=/i.test(value)) {
        warnings.push("HTML QA: sanitized mode output still contains dynamic markup.");
      }
      const expectedAssets = Array.isArray(options.assetMappings) ? options.assetMappings.map((mapping) => mapping.relativeSrc).filter(Boolean) : [];
      for (const src of expectedAssets) {
        if (!value.includes(src)) {
          warnings.push(`HTML QA: bundled image is not referenced in final HTML: ${src}`);
        }
      }
      if (/<img\b/i.test(value) && !/<img\b[^>]*\balt\s*=/i.test(value)) {
        warnings.push("HTML QA: at least one image is missing alt text.");
      }
      return warnings;
    }
    module2.exports = {
      validateHtmlArtifact: validateHtmlArtifact2
    };
  }
});

// src/core/social.js
var require_social = __commonJS({
  "src/core/social.js"(exports2, module2) {
    "use strict";
    var { escapeHtml } = require_html();
    function buildShortId2(value) {
      let hash = 2166136261;
      for (const char of String(value || "")) {
        hash ^= char.codePointAt(0) || 0;
        hash = Math.imul(hash, 16777619);
      }
      return Math.abs(hash >>> 0).toString(36).slice(0, 7) || "doc";
    }
    function injectSocialMeta2(html, options = {}) {
      const title = options.title || "MarkTL HTML artifact";
      const description = options.description || "A shared HTML document generated with MarkTL.";
      const url = options.url || "";
      const image = options.image || "";
      const tags = [
        `<meta property="og:type" content="article">`,
        `<meta property="og:title" content="${escapeAttr(title)}">`,
        `<meta property="og:description" content="${escapeAttr(description)}">`,
        url ? `<meta property="og:url" content="${escapeAttr(url)}">` : "",
        image ? `<meta property="og:image" content="${escapeAttr(image)}">` : "",
        `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
        `<meta name="twitter:title" content="${escapeAttr(title)}">`,
        `<meta name="twitter:description" content="${escapeAttr(description)}">`,
        image ? `<meta name="twitter:image" content="${escapeAttr(image)}">` : "",
        url ? `<link rel="canonical" href="${escapeAttr(url)}">` : ""
      ].filter(Boolean).join("\n");
      const value = String(html || "");
      if (/<\/head>/i.test(value)) {
        return value.replace(/<\/head>/i, `${tags}
</head>`);
      }
      return `${tags}
${value}`;
    }
    function escapeAttr(value) {
      return escapeHtml(String(value || "")).replace(/"/g, "&quot;");
    }
    module2.exports = {
      buildShortId: buildShortId2,
      injectSocialMeta: injectSocialMeta2
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MarktlPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/export-modal.ts
var import_obsidian = require("obsidian");
var import_artifact_goals = __toESM(require_artifact_goals());
var import_presets = __toESM(require_presets());
var import_templates = __toESM(require_templates());
var MarktlExportModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.selectedPreset = "custom";
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.options = {
      template: plugin.settings.template,
      artifactGoal: plugin.settings.artifactGoal,
      artifactType: plugin.settings.artifactType,
      aiProvider: plugin.settings.aiProvider,
      conversionMode: plugin.settings.conversionMode,
      failurePolicy: plugin.settings.failurePolicy,
      previewSecurity: plugin.settings.previewSecurity,
      contextPackMode: plugin.settings.contextPackMode,
      readerFeedbackMode: plugin.settings.readerFeedbackMode,
      shareTarget: plugin.settings.shareTarget,
      copyShareLinkAfterExport: plugin.settings.copyShareLinkAfterExport
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("Export note to HTML");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Choose what the HTML should do, then choose the visual style. MarkTL works best when the artifact has a job."
    });
    new import_obsidian.Setting(contentEl).setName("HTML preset").setDesc("Applies sensible defaults. You can still adjust individual fields below.").addDropdown((dropdown) => {
      dropdown.addOption("custom", "Custom");
      for (const preset of (0, import_presets.listExportPresets)()) {
        dropdown.addOption(preset.id, preset.name);
      }
      dropdown.setValue(this.selectedPreset).onChange((value) => {
        const preset = (0, import_presets.findExportPreset)(value);
        if (!preset) {
          this.selectedPreset = "custom";
          return;
        }
        this.selectedPreset = preset.id;
        this.options.artifactGoal = preset.artifactGoal;
        this.options.artifactType = preset.artifactType;
        this.options.template = preset.template;
        this.options.conversionMode = preset.mode;
        this.options.previewSecurity = preset.previewSecurity;
        this.onOpen();
      });
    });
    new import_obsidian.Setting(contentEl).setName("Artifact goal").setDesc("The job of the HTML artifact: read, decide, review, compare, tune, explain code, or publish.").addDropdown((dropdown) => {
      for (const goal of (0, import_artifact_goals.listArtifactGoals)()) {
        dropdown.addOption(goal.id, goal.name);
      }
      dropdown.setValue(this.options.artifactGoal).onChange((value) => {
        this.options.artifactGoal = value;
      });
    });
    new import_obsidian.Setting(contentEl).setName("Artifact type").setDesc("Defines the information architecture, not just the visual skin.").addDropdown((dropdown) => dropdown.addOption("faithful-note", "Faithful Note").addOption("strategy-brief", "Strategy Brief").addOption("research-report", "Research Report").addOption("decision-memo", "Decision Memo").addOption("interactive-explainer", "Interactive Explainer").addOption("slide-deck", "Slide Deck").setValue(this.options.artifactType).onChange((value) => {
      this.options.artifactType = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Template").setDesc("Controls the visual direction and local fallback style.").addDropdown((dropdown) => {
      for (const template of (0, import_templates.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.options.template).onChange((value) => {
        this.options.template = value;
      });
    });
    new import_obsidian.Setting(contentEl).setName("AI CLI").setDesc("Only providers that passed live plugin-style execution are shown.").addDropdown((dropdown) => dropdown.addOption("none", "None / local fallback").addOption("claude", "Claude Code CLI").addOption("codex", "Codex CLI").setValue(this.options.aiProvider).onChange((value) => {
      this.options.aiProvider = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Mode").setDesc("Preserve keeps content faithful; other modes allow AI restructuring.").addDropdown((dropdown) => dropdown.addOption("preserve", "Preserve content").addOption("presentation", "Presentation").addOption("blog", "Blog article").addOption("landing", "Landing page").setValue(this.options.conversionMode).onChange((value) => {
      this.options.conversionMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Preview security").setDesc("Trusted mode allows inline JavaScript for interactive HTML.").addDropdown((dropdown) => dropdown.addOption("sanitized", "Sanitized static preview").addOption("trusted", "Trusted interactive preview").setValue(this.options.previewSecurity).onChange((value) => {
      this.options.previewSecurity = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Context pack").setDesc("Optionally lets AI read linked Markdown notes as supporting context.").addDropdown((dropdown) => dropdown.addOption("none", "Active note only").addOption("linked-notes", "Include linked notes").setValue(this.options.contextPackMode).onChange((value) => {
      this.options.contextPackMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Reader feedback").setDesc("Giscus adds GitHub login, reactions, and public comments to trusted exports.").addDropdown((dropdown) => dropdown.addOption("none", "No reader comments").addOption("giscus", "Giscus GitHub comments").setValue(this.options.readerFeedbackMode).onChange((value) => {
      this.options.readerFeedbackMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("AI failure").setDesc("Fallback keeps exporting; strict stops when the CLI fails.").addDropdown((dropdown) => dropdown.addOption("fallback", "Fallback with warning").addOption("strict", "Stop on AI failure").setValue(this.options.failurePolicy).onChange((value) => {
      this.options.failurePolicy = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Share target").setDesc("GitHub Pages publishes share/<slug>/index.html and copies a public URL.").addDropdown((dropdown) => dropdown.addOption("local-link", "Local file link").addOption("static-bundle", "Static hosting bundle").addOption("github-pages", "GitHub Pages link").setValue(this.options.shareTarget).onChange((value) => {
      this.options.shareTarget = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Copy share link").setDesc("Copies a local file:// link for the generated self-contained HTML.").addToggle((toggle) => toggle.setValue(this.options.copyShareLinkAfterExport).onChange((value) => {
      this.options.copyShareLinkAfterExport = value;
    }));
    new import_obsidian.Setting(contentEl).addButton((button) => button.setButtonText("Export").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.options);
    })).addButton((button) => button.setButtonText("Save as defaults").onClick(async () => {
      Object.assign(this.plugin.settings, this.options);
      await this.plugin.saveSettings();
      this.close();
      this.onSubmit(this.options);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/progress-modal.ts
var import_obsidian2 = require("obsidian");
var MarktlProgressModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
    this.listEl = null;
  }
  onOpen() {
    this.contentEl.empty();
    this.setTitle("Export progress");
    this.contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "MarkTL is converting this note to HTML."
    });
    this.listEl = this.contentEl.createEl("ol", { cls: "marktl-progress-list" });
  }
  addStep(text) {
    if (!this.listEl) {
      return;
    }
    this.listEl.createEl("li", { text });
  }
  complete(text) {
    this.addStep(text);
    this.contentEl.createEl("p", {
      cls: "marktl-progress-done",
      text: "You can close this window."
    });
  }
  fail(text) {
    this.addStep(text);
    this.contentEl.createEl("p", {
      cls: "marktl-progress-error",
      text: "Export stopped. Check the message above."
    });
  }
  onClose() {
    this.contentEl.empty();
    this.listEl = null;
  }
};

// src/preview-view.ts
var import_obsidian3 = require("obsidian");
var VIEW_TYPE_MARKTL_PREVIEW = "marktl-html-preview";
var emptyState = {
  html: "<!doctype html><html><body><p>No preview loaded.</p></body></html>",
  filePath: "",
  warnings: [],
  trusted: false
};
var MarktlPreviewView = class extends import_obsidian3.ItemView {
  constructor(leaf) {
    super(leaf);
    this.state = emptyState;
  }
  getViewType() {
    return VIEW_TYPE_MARKTL_PREVIEW;
  }
  getDisplayText() {
    return "HTML Preview";
  }
  getIcon() {
    return "file-code-2";
  }
  async onOpen() {
    this.render();
  }
  async onClose() {
    this.contentEl.empty();
  }
  setPreview(state) {
    this.state = state;
    this.render();
  }
  render() {
    const container = this.contentEl;
    container.empty();
    container.addClass("marktl-preview-container");
    const header = container.createDiv({ cls: "marktl-preview-header" });
    header.createEl("strong", { text: this.state.filePath || "HTML Preview" });
    if (this.state.trusted) {
      header.createSpan({ cls: "marktl-preview-trusted", text: "Trusted" });
    }
    for (const warning of this.state.warnings) {
      container.createDiv({ cls: "marktl-preview-warning", text: warning });
    }
    const renderQa = container.createDiv({ cls: "marktl-preview-render-qa", text: "Render QA: waiting for preview..." });
    const frame = container.createEl("iframe", {
      cls: "marktl-preview-frame",
      attr: {
        sandbox: this.state.trusted ? "allow-same-origin allow-scripts" : "allow-same-origin"
      }
    });
    frame.addEventListener("load", () => {
      this.runRenderQa(frame, renderQa);
    });
    frame.srcdoc = this.state.html;
  }
  runRenderQa(frame, statusEl) {
    var _a, _b, _c, _d;
    try {
      const doc = frame.contentDocument;
      if (!doc) {
        statusEl.setText("Render QA: unable to inspect preview document.");
        statusEl.addClass("marktl-preview-render-qa-warning");
        return;
      }
      const warnings = [];
      const bodyText = ((_b = (_a = doc.body) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || "";
      if (bodyText.length < 20) {
        warnings.push("preview appears nearly empty");
      }
      if (!doc.querySelector("h1")) {
        warnings.push("no visible H1");
      }
      const brokenImages = Array.from(doc.images).filter((image) => image.complete && image.naturalWidth === 0);
      if (brokenImages.length > 0) {
        warnings.push(`${brokenImages.length} broken image(s)`);
      }
      if (this.state.trusted && !doc.querySelector('button,input,select,textarea,[contenteditable="true"]') && !doc.querySelector('script[src*="giscus.app/client.js"]')) {
        warnings.push("trusted preview has no interactive controls");
      }
      const scrollHeight = ((_c = doc.scrollingElement) == null ? void 0 : _c.scrollHeight) || ((_d = doc.body) == null ? void 0 : _d.scrollHeight) || 0;
      if (scrollHeight > 0 && scrollHeight < 120) {
        warnings.push("rendered content is unusually short");
      }
      statusEl.setText(warnings.length > 0 ? `Render QA: ${warnings.join("; ")}.` : "Render QA: preview loaded, content and assets look reachable.");
      statusEl.toggleClass("marktl-preview-render-qa-warning", warnings.length > 0);
    } catch (error) {
      statusEl.setText("Render QA: preview inspection was blocked by iframe security.");
      statusEl.addClass("marktl-preview-render-qa-warning");
    }
  }
};

// src/result-modal.ts
var import_obsidian4 = require("obsidian");
var MarktlResultModal = class extends import_obsidian4.Modal {
  constructor(app, summary, copyLink) {
    super(app);
    this.summary = summary;
    this.copyLink = copyLink;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("HTML export ready");
    const facts = contentEl.createDiv({ cls: "marktl-summary-grid" });
    this.addFact(facts, "Output", this.summary.outputPath);
    this.addFact(facts, "AI", this.summary.aiProvider === "none" ? "Local converter" : this.summary.usedFallback ? `${this.summary.aiProvider} failed; local fallback used` : `${this.summary.aiProvider} generated HTML`);
    this.addFact(facts, "Images", `${this.summary.assetCount} bundled local image(s)`);
    this.addFact(facts, "Share target", this.describeShareTarget());
    if (this.summary.publicUrl) {
      this.addFact(facts, "Public URL", this.summary.publicUrl);
    }
    if (this.summary.shareHomeUrl) {
      this.addFact(facts, "Share home", this.summary.shareHomeUrl);
    }
    if (this.summary.warnings.length > 0) {
      contentEl.createEl("h3", { text: "Warnings" });
      const list = contentEl.createEl("ul", { cls: "marktl-summary-warnings" });
      for (const warning of this.summary.warnings) {
        list.createEl("li", { text: warning });
      }
    }
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: this.summary.publicUrl ? "This public URL is ready to share with other people." : this.summary.shareTarget === "static-bundle" ? "This folder is ready for a static host. Public upload is intentionally a separate step." : "This link opens the generated file on this computer. Public share links require a static host."
    });
    new import_obsidian4.Setting(contentEl).addButton((button) => button.setButtonText(this.summary.publicUrl ? "Copy public link" : "Copy local link").onClick(async () => {
      const link = await this.copyLink(this.summary.outputPath, this.summary.publicUrl);
      new import_obsidian4.Notice(`Copied: ${link}`);
    })).addButton((button) => button.setButtonText("Close").setCta().onClick(() => this.close()));
  }
  onClose() {
    this.contentEl.empty();
  }
  addFact(container, label, value) {
    const item = container.createDiv({ cls: "marktl-summary-item" });
    item.createEl("span", { cls: "marktl-summary-label", text: label });
    item.createEl("strong", { text: value });
  }
  describeShareTarget() {
    if (this.summary.shareTarget === "github-pages") {
      return "GitHub Pages link";
    }
    return this.summary.shareTarget === "static-bundle" ? "Static hosting bundle" : "Local file link";
  }
};

// src/settings-tab.ts
var import_obsidian5 = require("obsidian");
var import_artifact_goals2 = __toESM(require_artifact_goals());
var import_templates2 = __toESM(require_templates());
var MarktlSettingTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "MarkTL HTML Exporter" });
    new import_obsidian5.Setting(containerEl).setName("Setup wizard").setDesc("Guided setup for local export, Claude AI conversion, and share-ready bundles.").addButton((button) => button.setButtonText("Open setup").setCta().onClick(() => {
      this.plugin.openSetupWizard();
    }));
    new import_obsidian5.Setting(containerEl).setName("Export folder").setDesc("Vault-relative folder for generated HTML files.").addText((text) => text.setPlaceholder("html-exports").setValue(this.plugin.settings.exportFolder).onChange(async (value) => {
      this.plugin.settings.exportFolder = value.trim() || "html-exports";
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("Artifact goal").setDesc("Default job for the HTML artifact: read, decide, review, compare, tune, explain code, or publish.").addDropdown((dropdown) => {
      for (const goal of (0, import_artifact_goals2.listArtifactGoals)()) {
        dropdown.addOption(goal.id, goal.name);
      }
      dropdown.setValue(this.plugin.settings.artifactGoal).onChange(async (value) => {
        this.plugin.settings.artifactGoal = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Artifact type").setDesc("Default information architecture for AI exports.").addDropdown((dropdown) => dropdown.addOption("faithful-note", "Faithful Note").addOption("strategy-brief", "Strategy Brief").addOption("research-report", "Research Report").addOption("decision-memo", "Decision Memo").addOption("interactive-explainer", "Interactive Explainer").addOption("slide-deck", "Slide Deck").setValue(this.plugin.settings.artifactType).onChange(async (value) => {
      this.plugin.settings.artifactType = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("Template").setDesc("Default HTML style template.").addDropdown((dropdown) => {
      for (const template of (0, import_templates2.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("AI provider").setDesc("Optional CLI provider for high-quality AI conversion.").addDropdown((dropdown) => dropdown.addOption("none", "None / local fallback").addOption("claude", "Claude Code CLI").addOption("codex", "Codex CLI").setValue(this.plugin.settings.aiProvider).onChange(async (value) => {
      this.plugin.settings.aiProvider = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("Conversion mode").setDesc("Preserve mode keeps the note faithful. Other modes allow AI restructuring.").addDropdown((dropdown) => dropdown.addOption("preserve", "Preserve content").addOption("presentation", "Presentation").addOption("blog", "Blog article").addOption("landing", "Landing page").setValue(this.plugin.settings.conversionMode).onChange(async (value) => {
      this.plugin.settings.conversionMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("Preview security").setDesc("Sanitized mode blocks scripts, iframes, external assets, and event handlers.").addDropdown((dropdown) => dropdown.addOption("sanitized", "Sanitized static preview").addOption("trusted", "Trusted preview/export").setValue(this.plugin.settings.previewSecurity).onChange(async (value) => {
      this.plugin.settings.previewSecurity = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("Context pack").setDesc("Linked notes mode gives AI extra vault context from Markdown links and wikilinks.").addDropdown((dropdown) => dropdown.addOption("none", "Active note only").addOption("linked-notes", "Include linked notes").setValue(this.plugin.settings.contextPackMode).onChange(async (value) => {
      this.plugin.settings.contextPackMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("AI failure policy").setDesc("Fallback creates local HTML with a warning. Strict stops generation.").addDropdown((dropdown) => dropdown.addOption("fallback", "Fallback with warning").addOption("strict", "Stop on AI failure").setValue(this.plugin.settings.failurePolicy).onChange(async (value) => {
      this.plugin.settings.failurePolicy = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian5.Setting(containerEl).setName("CLI timeout").setDesc("Maximum AI CLI runtime in milliseconds. Rich HTML artifacts can take 2-5 minutes.").addText((text) => text.setPlaceholder("300000").setValue(String(this.plugin.settings.timeoutMs)).onChange(async (value) => {
      const parsed = Number(value);
      this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 3e5;
      await this.plugin.saveSettings();
    }));
    this.addCliPathSetting(containerEl, "Claude Code CLI path", "claudePath", "claude");
    this.addCliPathSetting(containerEl, "Codex CLI path", "codexPath", "codex");
    new import_obsidian5.Setting(containerEl).setName("Share target").setDesc("GitHub Pages publishes the generated bundle and copies a public URL.").addDropdown((dropdown) => dropdown.addOption("local-link", "Local file link").addOption("static-bundle", "Static hosting bundle").addOption("github-pages", "GitHub Pages link").setValue(this.plugin.settings.shareTarget).onChange(async (value) => {
      this.plugin.settings.shareTarget = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "Reader feedback" });
    containerEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Giscus uses GitHub Discussions for public comments. It requires trusted exports because it loads the Giscus script."
    });
    new import_obsidian5.Setting(containerEl).setName("Reader feedback mode").setDesc("Adds a GitHub login/comment box to exported HTML when configured.").addDropdown((dropdown) => dropdown.addOption("none", "None").addOption("giscus", "Giscus GitHub comments").setValue(this.plugin.settings.readerFeedbackMode).onChange(async (value) => {
      this.plugin.settings.readerFeedbackMode = value;
      await this.plugin.saveSettings();
    }));
    this.addTextSetting(containerEl, "Giscus repository", "owner/repo where GitHub Discussions are enabled.", "giscusRepo", "reallygood83/moondoc");
    this.addTextSetting(containerEl, "Giscus repository ID", "Repository ID from giscus.app.", "giscusRepoId", "R_...");
    this.addTextSetting(containerEl, "Giscus category", "Discussion category name, for example Announcements or General.", "giscusCategory", "Announcements");
    this.addTextSetting(containerEl, "Giscus category ID", "Discussion category ID from giscus.app.", "giscusCategoryId", "DIC_...");
    this.addTextSetting(containerEl, "Giscus mapping", "Discussion mapping strategy. Usually pathname for GitHub Pages.", "giscusMapping", "pathname");
    this.addTextSetting(containerEl, "Giscus theme", "Theme name such as preferred_color_scheme, light, dark.", "giscusTheme", "preferred_color_scheme");
    containerEl.createEl("h3", { text: "GitHub Pages publishing" });
    containerEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Used only when Share target is GitHub Pages link. Tokens are stored in this plugin data file, so use a fine-grained token limited to the share repository."
    });
    this.addTextSetting(containerEl, "GitHub repository", "owner/repo for the Pages repository.", "githubRepo", "reallygood83/marktl-shares");
    this.addTextSetting(containerEl, "GitHub branch", "Branch to write files to.", "githubBranch", "main");
    this.addTextSetting(containerEl, "GitHub Pages base URL", "Public Pages root URL. Leave blank to infer https://owner.github.io/repo.", "githubPagesBaseUrl", "https://reallygood83.github.io/marktl-shares");
    this.addTextSetting(containerEl, "Publish path", "Folder path inside the repository. Exports go to <path>/<slug>/index.html.", "githubPublishPath", "marktl");
    this.addTextSetting(containerEl, "Share home title", "Title for the generated index page that lists published exports.", "githubShareHomeTitle", "MarkTL Shared HTML");
    this.addTextSetting(containerEl, "GitHub token", "Fine-grained token with Contents read/write permission for the repository.", "githubToken", "github_pat_...", true);
    new import_obsidian5.Setting(containerEl).setName("Copy share link by default").setDesc("Copies a local file:// link after export. Public hosting is planned separately.").addToggle((toggle) => toggle.setValue(this.plugin.settings.copyShareLinkAfterExport).onChange(async (value) => {
      this.plugin.settings.copyShareLinkAfterExport = value;
      await this.plugin.saveSettings();
    }));
  }
  addCliPathSetting(containerEl, name, key, placeholder) {
    new import_obsidian5.Setting(containerEl).setName(name).setDesc("Leave blank to use the command from PATH.").addText((text) => text.setPlaceholder(placeholder).setValue(this.plugin.settings[key]).onChange(async (value) => {
      this.plugin.settings[key] = value.trim();
      await this.plugin.saveSettings();
    }));
  }
  addTextSetting(containerEl, name, description, key, placeholder, password = false) {
    new import_obsidian5.Setting(containerEl).setName(name).setDesc(description).addText((text) => {
      text.setPlaceholder(placeholder).setValue(this.plugin.settings[key]).onChange(async (value) => {
        this.plugin.settings[key] = value.trim();
        await this.plugin.saveSettings();
      });
      if (password) {
        text.inputEl.type = "password";
      }
    });
  }
};

// src/setup-modal.ts
var import_obsidian6 = require("obsidian");
var { checkClaudeProvider } = require_provider_doctor();
var MarktlSetupModal = class extends import_obsidian6.Modal {
  constructor(app, plugin) {
    super(app);
    this.doctorEl = null;
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("MarkTL setup");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Choose the simplest setup that matches how you want to use HTML exports."
    });
    const cards = contentEl.createDiv({ cls: "marktl-setup-cards" });
    this.addSetupCard(cards, {
      title: "Start simple",
      body: "Local HTML export, bundled images, safe preview. No AI setup required.",
      button: "Use local export",
      apply: () => this.applySimpleDefaults()
    });
    this.addSetupCard(cards, {
      title: "Use Claude",
      body: "Use Claude Code CLI for more designed reports and interactive artifacts.",
      button: "Use Claude mode",
      apply: () => this.applyClaudeDefaults()
    });
    this.addSetupCard(cards, {
      title: "Prepare sharing",
      body: "Create GitHub Pages-ready folders and publish public links after settings are filled.",
      button: "Use Pages mode",
      apply: () => this.applyBundleDefaults()
    });
    this.doctorEl = contentEl.createDiv({ cls: "marktl-doctor-box" });
    this.renderDoctorIdle();
    new import_obsidian6.Setting(contentEl).addButton((button) => button.setButtonText("Check Claude CLI").onClick(() => {
      void this.runDoctor();
    })).addButton((button) => button.setButtonText("Finish setup").setCta().onClick(async () => {
      this.plugin.settings.setupCompleted = true;
      await this.plugin.saveSettings();
      this.close();
      new import_obsidian6.Notice("MarkTL setup saved.");
    }));
  }
  onClose() {
    this.contentEl.empty();
    this.doctorEl = null;
  }
  addSetupCard(container, options) {
    const card = container.createDiv({ cls: "marktl-setup-card" });
    card.createEl("h3", { text: options.title });
    card.createEl("p", { text: options.body });
    new import_obsidian6.Setting(card).addButton((button) => button.setButtonText(options.button).onClick(async () => {
      await options.apply();
      new import_obsidian6.Notice(`${options.title} defaults applied.`);
    }));
  }
  async applySimpleDefaults() {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: "none",
      artifactGoal: "read",
      artifactType: "faithful-note",
      template: "editorial",
      conversionMode: "preserve",
      previewSecurity: "sanitized",
      shareTarget: "local-link"
    });
    await this.plugin.saveSettings();
  }
  async applyClaudeDefaults() {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: "claude",
      artifactGoal: "review",
      artifactType: "interactive-explainer",
      template: "interactive-report",
      conversionMode: "presentation",
      previewSecurity: "trusted",
      shareTarget: "local-link"
    });
    await this.plugin.saveSettings();
    await this.runDoctor();
  }
  async applyBundleDefaults() {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: this.plugin.settings.aiProvider,
      artifactGoal: "publish",
      artifactType: "research-report",
      template: "editorial",
      conversionMode: "blog",
      previewSecurity: "sanitized",
      shareTarget: "github-pages",
      copyShareLinkAfterExport: true
    });
    await this.plugin.saveSettings();
  }
  renderDoctorIdle() {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl("strong", { text: "Claude doctor" });
    this.doctorEl.createEl("p", {
      text: "Optional. Checks whether Claude Code CLI is installed and logged in."
    });
  }
  async runDoctor() {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl("strong", { text: "Checking Claude CLI..." });
    const result = await checkClaudeProvider({
      command: this.plugin.settings.claudePath || "claude",
      timeoutMs: 15e3
    });
    this.doctorEl.empty();
    this.doctorEl.toggleClass("marktl-doctor-ok", result.ok);
    this.doctorEl.toggleClass("marktl-doctor-error", !result.ok);
    this.doctorEl.createEl("strong", {
      text: result.ok ? "Claude is ready" : "Claude needs attention"
    });
    this.doctorEl.createEl("p", { text: result.message });
    if (result.version) {
      this.doctorEl.createEl("code", { text: result.version });
    }
  }
};

// src/main.ts
var { convertWithAiFallback } = require_ai();
var { buildAssetFileName, extractMarkdownImageReferences, rewriteHtmlImageSources } = require_assets();
var { buildContextPackMarkdown, extractMarkdownContextTargets } = require_context_pack();
var { injectReaderFeedback, validateGiscusConfig } = require_feedback();
var { buildPagesUrl, buildPublishPath, buildShareHomeUrl, buildShortPagesUrl, inferPagesBaseUrl, parseRepo, renderShareIndexHtml, updateShareIndex } = require_github_pages();
var { validateHtmlArtifact } = require_html_qa();
var { slugify } = require_html();
var { buildShortId, injectSocialMeta } = require_social();
var DEFAULT_SETTINGS = {
  exportFolder: "html-exports",
  setupCompleted: false,
  artifactGoal: "read",
  artifactType: "faithful-note",
  template: "minimal",
  aiProvider: "none",
  conversionMode: "preserve",
  failurePolicy: "fallback",
  previewSecurity: "sanitized",
  contextPackMode: "none",
  readerFeedbackMode: "none",
  shareTarget: "local-link",
  githubRepo: "",
  githubBranch: "main",
  githubToken: "",
  githubPagesBaseUrl: "",
  githubPublishPath: "marktl",
  githubShareHomeTitle: "MarkTL Shared HTML",
  giscusRepo: "",
  giscusRepoId: "",
  giscusCategory: "Announcements",
  giscusCategoryId: "",
  giscusMapping: "pathname",
  giscusTheme: "preferred_color_scheme",
  timeoutMs: 3e5,
  claudePath: "",
  codexPath: "",
  geminiPath: "",
  copyShareLinkAfterExport: false
};
var MarktlPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerView(
      VIEW_TYPE_MARKTL_PREVIEW,
      (leaf) => new MarktlPreviewView(leaf)
    );
    this.addRibbonIcon("file-code-2", "Export current note to HTML", () => {
      this.openExportModal();
    });
    this.addCommand({
      id: "export-active-note-to-html",
      name: "Export active note to HTML...",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const canRun = file instanceof import_obsidian7.TFile && file.extension === "md";
        if (canRun && !checking) {
          this.openExportModal();
        }
        return canRun;
      }
    });
    this.addCommand({
      id: "quick-export-active-note-to-html",
      name: "Quick export active note to HTML",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const canRun = file instanceof import_obsidian7.TFile && file.extension === "md";
        if (canRun && !checking) {
          void this.exportActiveNote();
        }
        return canRun;
      }
    });
    this.addCommand({
      id: "open-marktl-setup",
      name: "Open MarkTL setup wizard",
      callback: () => {
        this.openSetupWizard();
      }
    });
    this.addCommand({
      id: "check-claude-cli",
      name: "Check Claude Code CLI setup",
      callback: () => {
        this.openSetupWizard();
      }
    });
    this.addSettingTab(new MarktlSettingTab(this.app, this));
    if (!this.settings.setupCompleted) {
      window.setTimeout(() => this.openSetupWizard(), 800);
    }
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    let shouldSave = false;
    if (["gemini"].includes(this.settings.aiProvider)) {
      this.settings.aiProvider = "none";
      shouldSave = true;
    }
    if (!["read", "decide", "review", "compare", "tune", "explain-code", "publish"].includes(this.settings.artifactGoal)) {
      this.settings.artifactGoal = DEFAULT_SETTINGS.artifactGoal;
      shouldSave = true;
    }
    if (!Number.isFinite(this.settings.timeoutMs) || this.settings.timeoutMs <= 6e4) {
      this.settings.timeoutMs = DEFAULT_SETTINGS.timeoutMs;
      shouldSave = true;
    }
    if (!["none", "linked-notes"].includes(this.settings.contextPackMode)) {
      this.settings.contextPackMode = DEFAULT_SETTINGS.contextPackMode;
      shouldSave = true;
    }
    if (!["none", "giscus"].includes(this.settings.readerFeedbackMode)) {
      this.settings.readerFeedbackMode = DEFAULT_SETTINGS.readerFeedbackMode;
      shouldSave = true;
    }
    if (shouldSave) {
      await this.saveSettings();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  openSetupWizard() {
    new MarktlSetupModal(this.app, this).open();
  }
  openExportModal() {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md") {
      new import_obsidian7.Notice("Open a Markdown note before exporting HTML.");
      return;
    }
    new MarktlExportModal(this.app, this, (options) => {
      void this.exportActiveNote(options);
    }).open();
  }
  async exportActiveNote(overrides = {}) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md") {
      new import_obsidian7.Notice("Open a Markdown note before exporting HTML.");
      return;
    }
    const options = this.resolveExportOptions(overrides);
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Goal: ${options.artifactGoal}`);
    progress.addStep(`Artifact: ${options.artifactType}`);
    progress.addStep(`Template: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === "none" ? "local fallback" : options.aiProvider}`);
    progress.addStep(`Mode: ${options.conversionMode}; preview: ${options.previewSecurity}`);
    progress.addStep(`Timeout: ${Math.round(this.settings.timeoutMs / 1e3)}s`);
    try {
      progress.addStep("Reading active Markdown note...");
      const markdown = await this.app.vault.read(file);
      const outputPlan = await this.prepareOutputPlan(file, options);
      const assetResult = await this.resolveImageAssets(markdown, file, outputPlan);
      progress.addStep(assetResult.mappings.length > 0 ? `Resolved ${assetResult.mappings.length} local image asset(s).` : "No local image assets found.");
      const contextResult = await this.resolveContextPack(markdown, file, options);
      if (contextResult.count > 0) {
        progress.addStep(`Loaded ${contextResult.count} linked context note(s).`);
      } else if (options.contextPackMode !== "none") {
        progress.addStep("No linked context notes found.");
      }
      progress.addStep(options.aiProvider === "none" ? "Running local converter..." : `Running ${options.aiProvider} CLI...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        artifactGoal: options.artifactGoal,
        artifactType: options.artifactType,
        mode: options.conversionMode,
        template: options.template,
        trusted: options.previewSecurity === "trusted",
        strictAiFailures: options.failurePolicy === "strict",
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        assetMappings: assetResult.mappings,
        contextPack: contextResult.markdown,
        cliPaths: {
          claude: this.settings.claudePath,
          codex: this.settings.codexPath
        }
      });
      progress.addStep(result.usedFallback ? "Generated local fallback HTML." : "Generated AI HTML.");
      const shareMetadata = this.extractShareMetadata(markdown, outputPlan.basename);
      const shortId = buildShortId(outputPlan.basename);
      const socialUrl = options.shareTarget === "github-pages" ? buildShortPagesUrl(this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo), this.settings.githubPublishPath, shortId) : "";
      const socialImage = options.shareTarget === "github-pages" && assetResult.mappings[0] ? `${socialUrl}assets/${assetResult.mappings[0].destinationPath.split("/").pop() || ""}` : "";
      const socialHtml = injectSocialMeta(result.html, {
        title: shareMetadata.title,
        description: shareMetadata.excerpt,
        url: socialUrl,
        image: socialImage
      });
      const imageRewrittenHtml = rewriteHtmlImageSources(socialHtml, assetResult.mappings);
      const feedbackResult = this.applyReaderFeedback(imageRewrittenHtml, options);
      const html = feedbackResult.html;
      if (feedbackResult.injected) {
        progress.addStep("Added Giscus reader feedback.");
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: options.previewSecurity === "trusted",
        assetMappings: assetResult.mappings
      });
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep("HTML QA passed basic checks.");
      }
      const warnings = [...result.warnings, ...assetResult.warnings, ...contextResult.warnings, ...feedbackResult.warnings, ...qaWarnings];
      let publicUrl = "";
      let shareHomeUrl = "";
      progress.addStep("Writing HTML file to vault...");
      await this.copyImageAssets(assetResult.mappings);
      const outputPath = await this.writeHtmlFile(outputPlan, html, options, file.path);
      if (options.shareTarget === "github-pages") {
        progress.addStep("Publishing GitHub Pages bundle...");
        const publishResult = await this.publishGithubPages(outputPlan, assetResult.mappings, file.path, markdown, options, shortId, shareMetadata);
        publicUrl = publishResult.publicUrl;
        shareHomeUrl = publishResult.shareHomeUrl;
        progress.addStep(`Published: ${publicUrl}`);
      }
      progress.addStep("Opening internal preview pane...");
      await this.openPreview({
        html,
        filePath: outputPath,
        warnings,
        trusted: options.previewSecurity === "trusted"
      });
      if (options.copyShareLinkAfterExport) {
        progress.addStep(publicUrl ? "Copying public share link..." : "Copying local share link...");
        await this.copyShareLink(outputPath, publicUrl);
      }
      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        outputPath,
        usedFallback: result.usedFallback,
        aiProvider: options.aiProvider,
        assetCount: assetResult.mappings.length,
        warnings,
        shareTarget: options.shareTarget,
        copiedShareLink: options.copyShareLinkAfterExport,
        publicUrl,
        shareHomeUrl
      });
      if (result.usedFallback && options.aiProvider !== "none") {
        new import_obsidian7.Notice("AI conversion failed; local fallback HTML was generated.");
      } else {
        new import_obsidian7.Notice(`HTML exported to ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new import_obsidian7.Notice(`HTML export failed: ${message}`);
    }
  }
  async prepareOutputPlan(source, options) {
    const folder = (0, import_obsidian7.normalizePath)(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!await this.app.vault.adapter.exists(folder)) {
      await this.app.vault.createFolder(folder);
    }
    const basename = slugify(source.basename);
    const bundled = options.shareTarget === "static-bundle" || options.shareTarget === "github-pages";
    const outputPath = bundled ? (0, import_obsidian7.normalizePath)(`${folder}/share/${basename}/index.html`) : (0, import_obsidian7.normalizePath)(`${folder}/${basename}.html`);
    const assetFolder = bundled ? (0, import_obsidian7.normalizePath)(`${folder}/share/${basename}/assets`) : (0, import_obsidian7.normalizePath)(`${folder}/${basename}-assets`);
    const assetRelativePrefix = bundled ? "assets" : `${basename}-assets`;
    return { folder, basename, outputPath, assetFolder, assetRelativePrefix };
  }
  async writeHtmlFile(plan, html, options, sourcePath) {
    await this.ensureParentFolder(plan.outputPath);
    await this.app.vault.adapter.write(plan.outputPath, html);
    if (options.shareTarget === "static-bundle" || options.shareTarget === "github-pages") {
      await this.writeShareReadme(plan.folder, plan.basename, sourcePath, options);
    }
    return plan.outputPath;
  }
  async resolveImageAssets(markdown, source, plan) {
    const references = extractMarkdownImageReferences(markdown);
    const warnings = [];
    const mappings = [];
    const usedNames = /* @__PURE__ */ new Set();
    for (const reference of references) {
      const target = String(reference.target || "");
      const imageFile = this.resolveImageFile(target, source);
      if (!imageFile) {
        warnings.push(`Image asset not found: ${target}`);
        continue;
      }
      const assetFileName = buildAssetFileName(imageFile.path, mappings.length + 1, usedNames);
      const destinationPath = (0, import_obsidian7.normalizePath)(`${plan.assetFolder}/${assetFileName}`);
      const relativeSrc = encodeURI(`${plan.assetRelativePrefix}/${assetFileName}`);
      mappings.push({
        original: target,
        sourcePath: imageFile.path,
        destinationPath,
        relativeSrc,
        aliases: [
          target,
          String(reference.raw || ""),
          imageFile.path,
          imageFile.name,
          (0, import_obsidian7.normalizePath)(target)
        ]
      });
    }
    return { mappings, warnings };
  }
  resolveImageFile(target, source) {
    var _a;
    const linked = this.app.metadataCache.getFirstLinkpathDest(target, source.path);
    if (linked instanceof import_obsidian7.TFile) {
      return linked;
    }
    const normalized = (0, import_obsidian7.normalizePath)(target);
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof import_obsidian7.TFile) {
      return direct;
    }
    if ((_a = source.parent) == null ? void 0 : _a.path) {
      const relative = this.app.vault.getAbstractFileByPath((0, import_obsidian7.normalizePath)(`${source.parent.path}/${target}`));
      if (relative instanceof import_obsidian7.TFile) {
        return relative;
      }
    }
    const byName = this.app.vault.getFiles().find((file) => file.name === target || file.path.endsWith(`/${target}`));
    return byName instanceof import_obsidian7.TFile ? byName : null;
  }
  async copyImageAssets(mappings) {
    const copied = /* @__PURE__ */ new Set();
    for (const mapping of mappings) {
      if (copied.has(mapping.destinationPath)) {
        continue;
      }
      copied.add(mapping.destinationPath);
      await this.ensureParentFolder(mapping.destinationPath);
      const data = await this.app.vault.adapter.readBinary(mapping.sourcePath);
      await this.app.vault.adapter.writeBinary(mapping.destinationPath, data);
    }
  }
  resolveExportOptions(overrides) {
    var _a;
    return {
      template: overrides.template || this.settings.template,
      artifactGoal: overrides.artifactGoal || this.settings.artifactGoal,
      artifactType: overrides.artifactType || this.settings.artifactType,
      aiProvider: overrides.aiProvider || this.settings.aiProvider,
      conversionMode: overrides.conversionMode || this.settings.conversionMode,
      failurePolicy: overrides.failurePolicy || this.settings.failurePolicy,
      previewSecurity: overrides.previewSecurity || this.settings.previewSecurity,
      contextPackMode: overrides.contextPackMode || this.settings.contextPackMode,
      readerFeedbackMode: overrides.readerFeedbackMode || this.settings.readerFeedbackMode,
      shareTarget: overrides.shareTarget || this.settings.shareTarget,
      copyShareLinkAfterExport: (_a = overrides.copyShareLinkAfterExport) != null ? _a : this.settings.copyShareLinkAfterExport
    };
  }
  applyReaderFeedback(html, options) {
    if (options.readerFeedbackMode !== "giscus") {
      return { html, warnings: [], injected: false };
    }
    if (options.previewSecurity !== "trusted") {
      return {
        html,
        warnings: ["Giscus feedback requires Trusted preview/export because it loads an external comments script."],
        injected: false
      };
    }
    const giscusConfig = {
      repo: this.settings.giscusRepo,
      repoId: this.settings.giscusRepoId,
      category: this.settings.giscusCategory,
      categoryId: this.settings.giscusCategoryId,
      mapping: this.settings.giscusMapping,
      theme: this.settings.giscusTheme,
      lang: "ko"
    };
    const warnings = validateGiscusConfig(giscusConfig);
    if (warnings.length > 0) {
      return { html, warnings, injected: false };
    }
    return {
      html: injectReaderFeedback(html, giscusConfig),
      warnings: [],
      injected: true
    };
  }
  async resolveContextPack(markdown, source, options) {
    if (options.contextPackMode !== "linked-notes") {
      return { markdown: "", count: 0, warnings: [] };
    }
    const warnings = [];
    const items = [];
    for (const target of extractMarkdownContextTargets(markdown)) {
      const linked = this.resolveMarkdownContextFile(target, source);
      if (!linked) {
        warnings.push(`Context note not found: ${target}`);
        continue;
      }
      if (linked.path === source.path) {
        continue;
      }
      try {
        items.push({
          target,
          path: linked.path,
          content: await this.app.vault.read(linked)
        });
      } catch (error) {
        warnings.push(`Context note unreadable: ${target}`);
      }
    }
    return {
      markdown: buildContextPackMarkdown(items),
      count: items.length,
      warnings
    };
  }
  resolveMarkdownContextFile(target, source) {
    var _a;
    const linked = this.app.metadataCache.getFirstLinkpathDest(target, source.path);
    if (linked instanceof import_obsidian7.TFile && linked.extension === "md") {
      return linked;
    }
    const normalized = (0, import_obsidian7.normalizePath)(target.endsWith(".md") ? target : `${target}.md`);
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof import_obsidian7.TFile && direct.extension === "md") {
      return direct;
    }
    if ((_a = source.parent) == null ? void 0 : _a.path) {
      const relative = this.app.vault.getAbstractFileByPath((0, import_obsidian7.normalizePath)(`${source.parent.path}/${normalized}`));
      if (relative instanceof import_obsidian7.TFile && relative.extension === "md") {
        return relative;
      }
    }
    const byName = this.app.vault.getFiles().find((file) => file.extension === "md" && (file.basename === target || file.name === target || file.path.endsWith(`/${normalized}`)));
    return byName instanceof import_obsidian7.TFile ? byName : null;
  }
  async ensureParentFolder(filePath) {
    const parts = filePath.split("/");
    parts.pop();
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!await this.app.vault.adapter.exists(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }
  async writeShareReadme(folder, basename, sourcePath, options) {
    const readmePath = (0, import_obsidian7.normalizePath)(`${folder}/share/${basename}/README.md`);
    const content = [
      `# ${basename}`,
      "",
      "This folder is a static MarkTL HTML export bundle.",
      "",
      `- Source note: ${sourcePath}`,
      `- Artifact goal: ${options.artifactGoal}`,
      `- Artifact type: ${options.artifactType}`,
      `- Template: ${options.template}`,
      `- Preview security: ${options.previewSecurity}`,
      "",
      "Publish this folder with GitHub Pages, S3/R2, Netlify, Vercel, or any static host.",
      "Do not publish it if the source note contains private vault content.",
      ""
    ].join("\n");
    await this.app.vault.adapter.write(readmePath, content);
  }
  async publishGithubPages(plan, mappings, sourcePath, markdown, options, shortId = buildShortId(plan.basename), metadata = this.extractShareMetadata(markdown, plan.basename)) {
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error("GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.");
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error("GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.");
    }
    const branch = this.settings.githubBranch.trim() || "main";
    const basePath = this.settings.githubPublishPath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl(this.settings.githubRepo);
    const canonicalUrl = buildPagesUrl(pagesBaseUrl, basePath, plan.basename);
    const publicUrl = buildShortPagesUrl(pagesBaseUrl, basePath, shortId);
    const shareHomeUrl = buildShareHomeUrl(pagesBaseUrl, basePath);
    const canonicalFiles = [
      { localPath: plan.outputPath, publishPath: buildPublishPath(basePath, plan.basename, "index.html") },
      { localPath: (0, import_obsidian7.normalizePath)(`${plan.folder}/share/${plan.basename}/README.md`), publishPath: buildPublishPath(basePath, plan.basename, "README.md") },
      ...mappings.map((mapping) => ({
        localPath: mapping.destinationPath,
        publishPath: buildPublishPath(basePath, plan.basename, `assets/${mapping.destinationPath.split("/").pop() || "asset"}`)
      }))
    ];
    const shortFiles = canonicalFiles.map((file) => ({
      localPath: file.localPath,
      publishPath: file.publishPath.replace(buildPublishPath(basePath, plan.basename, ""), buildPublishPath(basePath, `s/${shortId}`, ""))
    }));
    const files = [...canonicalFiles, ...shortFiles];
    for (const file of files) {
      const binary = await this.app.vault.adapter.readBinary(file.localPath);
      await this.putGithubFile(repo.owner, repo.repo, branch, file.publishPath, binary);
    }
    await this.publishShareIndex(repo.owner, repo.repo, branch, basePath, {
      slug: plan.basename,
      shortId,
      url: publicUrl,
      canonicalUrl,
      sourcePath,
      artifactType: options.artifactType,
      ...metadata
    }, pagesBaseUrl);
    return { publicUrl, shareHomeUrl };
  }
  extractShareMetadata(markdown, fallbackTitle) {
    var _a, _b, _c, _d;
    const value = String(markdown || "");
    const frontmatter = ((_a = /^---\n([\s\S]*?)\n---/.exec(value)) == null ? void 0 : _a[1]) || "";
    const title = ((_b = /^title:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter)) == null ? void 0 : _b[1]) || ((_c = /^#\s+(.+)$/m.exec(value)) == null ? void 0 : _c[1]) || fallbackTitle;
    const tagLine = ((_d = /^tags:\s*(.+)$/m.exec(frontmatter)) == null ? void 0 : _d[1]) || "";
    const yamlListTags = [...frontmatter.matchAll(/^\s*-\s*["']?([^"'\n]+)["']?\s*$/gm)].map((match) => match[1]);
    const inlineTags = tagLine.replace(/^\[|\]$/g, "").split(",").map((tag) => tag.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    const body = value.replace(/^---\n[\s\S]*?\n---\s*/, "").replace(/^#\s+.+$/m, "").replace(/!\[\[[^\]]+]]/g, "").replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[[^\]]+]\([^)]+\)/g, "$1").replace(/[#*_`>~-]/g, "").split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
    return {
      title: title.trim(),
      excerpt: body.slice(0, 180),
      tags: [...new Set([...inlineTags, ...yamlListTags].map((tag) => tag.replace(/^#/, "").trim()).filter(Boolean))].slice(0, 8)
    };
  }
  async publishShareIndex(owner, repo, branch, basePath, entry, pagesBaseUrl) {
    const indexPath = buildPublishPath(basePath, "", "index.json");
    const existing = await this.getGithubJson(owner, repo, branch, indexPath);
    const index = updateShareIndex(existing, entry);
    const html = renderShareIndexHtml(index, {
      title: this.settings.githubShareHomeTitle || "MarkTL Shared HTML",
      baseUrl: buildShareHomeUrl(pagesBaseUrl, basePath).replace(/\/+$/g, "")
    });
    await this.putGithubTextFile(owner, repo, branch, indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(owner, repo, branch, buildPublishPath(basePath, "", "index.html"), html);
  }
  async getGithubJson(owner, repo, branch, publishPath) {
    var _a;
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, publishPath);
    const response = await (0, import_obsidian7.requestUrl)({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: "GET",
      headers: this.githubHeaders(token),
      throw: false
    });
    if (response.status < 200 || response.status >= 300) {
      return null;
    }
    try {
      return JSON.parse(this.base64ToText(((_a = response.json) == null ? void 0 : _a.content) || ""));
    } catch (e) {
      return null;
    }
  }
  async putGithubTextFile(owner, repo, branch, publishPath, text) {
    const encoded = new TextEncoder().encode(text);
    await this.putGithubFile(owner, repo, branch, publishPath, encoded.buffer);
  }
  async putGithubFile(owner, repo, branch, publishPath, data) {
    var _a;
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, publishPath);
    const existing = await (0, import_obsidian7.requestUrl)({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: "GET",
      headers: this.githubHeaders(token),
      throw: false
    });
    const existingJson = existing.status >= 200 && existing.status < 300 ? existing.json : null;
    const response = await (0, import_obsidian7.requestUrl)({
      url,
      method: "PUT",
      headers: {
        ...this.githubHeaders(token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Publish MarkTL export ${publishPath}`,
        content: this.arrayBufferToBase64(data),
        branch,
        sha: existingJson == null ? void 0 : existingJson.sha
      }),
      throw: false
    });
    if (response.status < 200 || response.status >= 300) {
      const message = ((_a = response.json) == null ? void 0 : _a.message) || response.text || `GitHub upload failed with HTTP ${response.status}`;
      throw new Error(`GitHub upload failed for ${publishPath}: ${message}`);
    }
  }
  githubContentsUrl(owner, repo, publishPath) {
    return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${publishPath.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`;
  }
  githubHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }
  arrayBufferToBase64(data) {
    const bytes = new Uint8Array(data);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return btoa(binary);
  }
  base64ToText(value) {
    return atob(String(value || "").replace(/\s/g, ""));
  }
  openResultSummary(summary) {
    new MarktlResultModal(this.app, summary, (outputPath, preferredLink) => this.copyShareLink(outputPath, preferredLink)).open();
  }
  async copyShareLink(outputPath, preferredLink = "") {
    if (preferredLink) {
      await navigator.clipboard.writeText(preferredLink);
      new import_obsidian7.Notice("HTML share link copied.");
      return preferredLink;
    }
    const adapter = this.app.vault.adapter;
    const fullPath = adapter.getFullPath ? adapter.getFullPath(outputPath) : outputPath;
    const link = fullPath.startsWith("/") ? `file://${encodeURI(fullPath)}` : outputPath;
    await navigator.clipboard.writeText(link);
    new import_obsidian7.Notice("HTML share link copied.");
    return link;
  }
  async openPreview(state) {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW)[0];
    if (!leaf) {
      leaf = this.app.workspace.getLeaf("split", "vertical");
      await leaf.setViewState({ type: VIEW_TYPE_MARKTL_PREVIEW, active: true });
    }
    const view = leaf.view;
    if (view instanceof MarktlPreviewView) {
      view.setPreview(state);
    }
    this.app.workspace.revealLeaf(leaf);
  }
};
