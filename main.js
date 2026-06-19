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
      return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "").replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "").replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, "").replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "").replace(/<math\b[^>]*>[\s\S]*?<\/math>/gi, "").replace(/<meta\b[^>]*>/gi, "").replace(/<link\b[^>]*>/gi, "").replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s+srcset\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s+(href|src|action|formaction|poster|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (match, _name, value) => {
        const cleaned = String(value || "").replace(/^['"]|['"]$/g, "").trim().toLowerCase();
        return /^(javascript:|data:text\/html|https?:\/\/)/i.test(cleaned) ? "" : match;
      });
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
        id: "construction-daily",
        name: "Construction Daily",
        description: "Field-report layout with large lead visual, concise flow maps, and execution-gate Gantt sections.",
        css: `
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f7f3eb; }
      main { max-width: 1180px; margin: 0 auto; padding: 34px 24px 72px; }
      article { background: rgba(255,255,255,.74); border: 1px solid #d9cfc0; border-radius: 8px; padding: 30px; box-shadow: 0 18px 44px rgba(23,32,51,.08); }
      h1 { font-size: clamp(2.4rem, 5vw, 5.5rem); line-height: .98; letter-spacing: 0; margin: 0 0 22px; color: #172033; }
      h2 { margin: 42px 0 16px; color: #174ea6; border-left: 6px solid #f97316; padding-left: 12px; font-size: clamp(1.5rem, 3vw, 2.4rem); }
      h3 { margin: 24px 0 10px; color: #1f2937; }
      p, li { line-height: 1.68; }
      table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d9e2ec; border-radius: 8px; overflow: hidden; }
      th, td { border-bottom: 1px solid #d9e2ec; padding: 10px 12px; text-align: left; vertical-align: top; }
      th { background: #10233f; color: #fff; }
      img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
      pre { overflow: auto; background: #111827; color: #f8fafc; border-radius: 8px; padding: 16px; }
      .callout { border-left: 5px solid #174ea6; background: #eff6ff; border-radius: 8px; padding: 14px 18px; }
      .marktl-mermaid-rendered, .marktl-mermaid-source { margin: 22px 0; }
      @media (max-width: 760px) { main { padding: 18px 12px 52px; } article { padding: 20px; } table { display: block; overflow-x: auto; } }
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

// src/core/export-profiles.js
var require_export_profiles = __commonJS({
  "src/core/export-profiles.js"(exports2, module2) {
    "use strict";
    var exportGenres = [
      {
        id: "construction-daily",
        label: "\uACF5\uC0AC\uC77C\uBCF4",
        description: "\uD604\uC7A5 \uC0AC\uC9C4, \uB2F9\uC77C \uC791\uC5C5, \uB9AC\uC2A4\uD06C \uC911\uC2EC"
      },
      {
        id: "meeting-notes",
        label: "\uD68C\uC758\uB85D",
        description: "\uC548\uAC74, \uACB0\uC815\uC0AC\uD56D, \uD6C4\uC18D \uC870\uCE58"
      },
      {
        id: "integrated-note",
        label: "\uD1B5\uD569\uB178\uD2B8",
        description: "\uC5EC\uB7EC \uD750\uB984\uC744 \uD55C \uD654\uBA74\uC5D0 \uC815\uB9AC"
      },
      {
        id: "report",
        label: "\uBCF4\uACE0\uC11C",
        description: "\uC694\uC57D, \uADFC\uAC70, \uC2DC\uC0AC\uC810 \uC911\uC2EC"
      },
      {
        id: "general-note",
        label: "\uC77C\uBC18 \uB178\uD2B8",
        description: "\uC6D0\uBB38 \uAD6C\uC870\uB97C \uC77D\uAE30 \uC88B\uAC8C \uBCF4\uC874"
      },
      {
        id: "compare-review",
        label: "\uBE44\uAD50 \uAC80\uD1A0",
        description: "\uC120\uD0DD\uC9C0, \uAE30\uC900, \uC7A5\uB2E8\uC810 \uBE44\uAD50"
      },
      {
        id: "presentation",
        label: "\uBC1C\uD45C \uC790\uB8CC",
        description: "\uBCF4\uACE0/\uBC1C\uD45C\uC6A9 \uC139\uC158 \uD654\uBA74"
      },
      {
        id: "share-article",
        label: "\uACF5\uC720 \uAE30\uC0AC",
        description: "\uACF5\uAC1C \uACF5\uC720\uC6A9 \uAE30\uC0AC\uD615 HTML"
      }
    ];
    var exportDepths = [
      {
        id: "brief",
        label: "\uAC04\uB2E8 \uAE30\uB85D",
        description: "\uC0AC\uC9C4\uACFC \uB2F9\uC77C \uC791\uC5C5 \uC911\uC2EC"
      },
      {
        id: "standard",
        label: "\uD45C\uC900 \uC77C\uBCF4",
        description: "\uC791\uC5C5, \uC99D\uBE59, \uB9AC\uC2A4\uD06C, \uB2E4\uC74C \uC791\uC5C5"
      },
      {
        id: "milestone",
        label: "\uC885\uD569\xB7\uB9C8\uC77C\uC2A4\uD1A4",
        description: "\uC77C\uC815, \uACF5\uC815 \uD750\uB984, \uACC4\uD68D \uB300\uBE44 \uC2E4\uC801"
      }
    ];
    var exportPurposes = [
      {
        id: "internal-share",
        label: "\uB0B4\uBD80 \uACF5\uC720",
        description: "\uD300 \uC0C1\uD669 \uACF5\uC720"
      },
      {
        id: "field-review",
        label: "\uD604\uC7A5 \uAC80\uD1A0",
        description: "\uC99D\uBE59, \uB9AC\uC2A4\uD06C, \uB2E4\uC74C \uC870\uCE58 \uD655\uC778"
      },
      {
        id: "external-report",
        label: "\uC678\uBD80 \uBCF4\uACE0",
        description: "\uC678\uBD80 \uC774\uD574\uAD00\uACC4\uC790 \uBCF4\uACE0"
      },
      {
        id: "public-archive",
        label: "\uACF5\uAC1C \uC544\uCE74\uC774\uBE0C",
        description: "\uACF5\uAC1C \uBAA9\uB85D\uACFC \uC7AC\uC5F4\uB78C \uAE30\uC900"
      },
      {
        id: "presentation",
        label: "\uBC1C\uD45C",
        description: "\uD68C\uC758 \uD654\uBA74 \uACF5\uC720"
      },
      {
        id: "ai-rework",
        label: "AI \uC7AC\uC791\uC5C5",
        description: "\uAC80\uD1A0\uC640 \uC7AC\uC791\uC5C5\uC6A9 \uD654\uBA74"
      }
    ];
    var defaultSelection = {
      exportGenre: "construction-daily",
      exportDepth: "standard",
      exportPurpose: "field-review"
    };
    var genreProfiles = {
      "construction-daily": {
        artifactGoal: "review",
        artifactType: "research-report",
        template: "construction-daily",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      "meeting-notes": {
        artifactGoal: "review",
        artifactType: "interactive-explainer",
        template: "interactive-report",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      "integrated-note": {
        artifactGoal: "read",
        artifactType: "strategy-brief",
        template: "dashboard",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      report: {
        artifactGoal: "review",
        artifactType: "research-report",
        template: "research-memo",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      "general-note": {
        artifactGoal: "read",
        artifactType: "faithful-note",
        template: "editorial",
        conversionMode: "preserve",
        previewSecurity: "sanitized"
      },
      "compare-review": {
        artifactGoal: "compare",
        artifactType: "decision-memo",
        template: "dashboard",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      presentation: {
        artifactGoal: "read",
        artifactType: "slide-deck",
        template: "deck",
        conversionMode: "presentation",
        previewSecurity: "trusted"
      },
      "share-article": {
        artifactGoal: "publish",
        artifactType: "research-report",
        template: "editorial",
        conversionMode: "blog",
        previewSecurity: "sanitized"
      }
    };
    function listExportGenres3() {
      return exportGenres.slice();
    }
    function listExportDepths3() {
      return exportDepths.slice();
    }
    function listExportPurposes3() {
      return exportPurposes.slice();
    }
    function findExportGenre(id) {
      return exportGenres.find((item) => item.id === id) || exportGenres[0];
    }
    function findExportDepth(id) {
      return exportDepths.find((item) => item.id === id) || exportDepths[1];
    }
    function findExportPurpose(id) {
      return exportPurposes.find((item) => item.id === id) || exportPurposes[1];
    }
    function normalizeExportSelection2(selection = {}) {
      return {
        exportGenre: findExportGenre(selection.exportGenre || defaultSelection.exportGenre).id,
        exportDepth: findExportDepth(selection.exportDepth || defaultSelection.exportDepth).id,
        exportPurpose: findExportPurpose(selection.exportPurpose || defaultSelection.exportPurpose).id
      };
    }
    function getExecutionProfile(selection = {}) {
      const normalized = normalizeExportSelection2(selection);
      const profile = {
        ...genreProfiles[normalized.exportGenre] || genreProfiles[defaultSelection.exportGenre]
      };
      if (normalized.exportGenre === "construction-daily") {
        if (normalized.exportDepth === "brief") {
          Object.assign(profile, {
            artifactGoal: "read",
            artifactType: "faithful-note",
            conversionMode: "preserve",
            previewSecurity: "sanitized"
          });
        }
        if (normalized.exportDepth === "milestone") {
          Object.assign(profile, {
            artifactGoal: "review",
            artifactType: "strategy-brief",
            conversionMode: "presentation",
            previewSecurity: "trusted"
          });
        }
      }
      if (normalized.exportPurpose === "public-archive") {
        profile.artifactGoal = normalized.exportGenre === "construction-daily" ? profile.artifactGoal : "publish";
      }
      if (normalized.exportPurpose === "presentation") {
        profile.conversionMode = "presentation";
        profile.previewSecurity = "trusted";
      }
      if (normalized.exportPurpose === "ai-rework") {
        Object.assign(profile, {
          artifactGoal: "tune",
          artifactType: "interactive-explainer",
          template: "playground",
          conversionMode: "presentation",
          previewSecurity: "trusted"
        });
      }
      return {
        ...normalized,
        ...profile
      };
    }
    function applySelectionProfile3(baseOptions = {}, selection = {}) {
      const profile = getExecutionProfile(selection);
      return {
        ...baseOptions,
        exportGenre: profile.exportGenre,
        exportDepth: profile.exportDepth,
        exportPurpose: profile.exportPurpose,
        artifactGoal: profile.artifactGoal,
        artifactType: profile.artifactType,
        template: profile.template,
        conversionMode: profile.conversionMode,
        previewSecurity: profile.previewSecurity
      };
    }
    function describeExecutionProfile2(selection = {}) {
      const profile = getExecutionProfile(selection);
      return [
        findExportGenre(profile.exportGenre).label,
        findExportDepth(profile.exportDepth).label,
        findExportPurpose(profile.exportPurpose).label
      ].join(" \xB7 ");
    }
    module2.exports = {
      applySelectionProfile: applySelectionProfile3,
      defaultSelection,
      describeExecutionProfile: describeExecutionProfile2,
      findExportDepth,
      findExportGenre,
      findExportPurpose,
      getExecutionProfile,
      listExportDepths: listExportDepths3,
      listExportGenres: listExportGenres3,
      listExportPurposes: listExportPurposes3,
      normalizeExportSelection: normalizeExportSelection2
    };
  }
});

// src/core/prompt-composer.js
var require_prompt_composer = __commonJS({
  "src/core/prompt-composer.js"(exports2, module2) {
    "use strict";
    var {
      findExportDepth,
      findExportGenre,
      findExportPurpose,
      normalizeExportSelection: normalizeExportSelection2
    } = require_export_profiles();
    function buildSelectionPrompt(options = {}) {
      const selection = normalizeExportSelection2(options);
      const referencePath = String(options.referenceContextNotePath || "").trim();
      const blocks = [
        "Selection-driven generation contract:",
        `- Document genre: ${findExportGenre(selection.exportGenre).label}`,
        `- Writing depth: ${findExportDepth(selection.exportDepth).label}`,
        `- Reader purpose: ${findExportPurpose(selection.exportPurpose).label}`,
        `Genre instruction: ${getGenreInstruction(selection.exportGenre)}`,
        `Depth instruction: ${getDepthInstruction(selection.exportGenre, selection.exportDepth)}`,
        `Audience instruction: ${getPurposeInstruction(selection.exportPurpose)}`,
        `Context instruction: ${getContextInstruction(selection.exportGenre, selection.exportDepth, referencePath)}`,
        `Quality contract: ${getQualityContract(selection.exportGenre, selection.exportDepth)}`
      ];
      return blocks.join("\n");
    }
    function getGenreInstruction(genre) {
      return {
        "construction-daily": "Create a Korean construction daily HTML report. The reader must quickly understand what happened today, where the work sits in the project sequence, what evidence exists, what risks remain, and what should happen next.",
        "meeting-notes": "Create a Korean meeting note artifact with agenda, attendees if available, decisions, unresolved questions, owners, and next actions.",
        "integrated-note": "Create an integrated project note that connects status, context, decisions, risks, and next steps without turning it into a generic article.",
        report: "Create a structured report with executive summary, evidence, analysis, implications, and next actions.",
        "general-note": "Create a faithful readable note. Preserve the original meaning and avoid unnecessary restructuring.",
        "compare-review": "Create a comparison review with criteria, alternatives, pros and cons, risks, and a clear comparison matrix.",
        presentation: "Create a presentation-ready artifact with strong section rhythm, concise slide-like grouping, and one main idea per section.",
        "share-article": "Create a polished public-facing article with clear title, summary, body sections, and share-friendly framing."
      }[genre] || "Create a useful HTML artifact from the note.";
    }
    function getDepthInstruction(genre, depth) {
      if (genre === "construction-daily") {
        return {
          brief: "Use a compact daily log structure. Prioritize date, location/work area, today work, image evidence, short comments, and next step. Do not force Gantt, Mermaid, or large baseline sections when the active note does not need them.",
          standard: "Use a standard daily report structure. Include today work, image evidence, project context from the reference note when available, risks or blockers, next work, and a compact plan-versus-actual view. Include baseline Gantt/Mermaid only when the reference context provides enough material.",
          milestone: "Use a full milestone report structure. Strongly integrate the reference note schedule, Mermaid/Gantt/process flow, plan-versus-actual status, major risks, decisions, and forward gates. Keep today facts visibly separated from continuing baseline context."
        }[depth];
      }
      return {
        brief: "Keep the artifact compact. Summarize only enough structure to make the note easy to scan.",
        standard: "Create a balanced artifact with summary, main sections, evidence, and next actions.",
        milestone: "Create a full artifact with context, detailed sections, implications, risks, and decision-ready next steps."
      }[depth] || "Use a balanced level of detail.";
    }
    function getPurposeInstruction(purpose) {
      return {
        "internal-share": "Write for internal teammates. Be concise, operational, and explicit about next actions.",
        "field-review": "Write for field review. Make evidence, risks, blockers, work sequence, and next site actions easy to inspect.",
        "external-report": "Write for external stakeholders. Use polished Korean, avoid internal shorthand, and separate confirmed facts from assumptions.",
        "public-archive": "Write for a searchable public archive. Include a concise card-ready summary, reader-friendly tags, and stable section titles.",
        presentation: "Write for live presentation. Use short sections, strong headings, and visual hierarchy that can be scanned from a screen.",
        "ai-rework": "Write for iterative AI review. Include copy-ready review notes, improvement prompts, and clear assumptions that can be brought into a next prompt."
      }[purpose] || "Make the intended reader action obvious.";
    }
    function getContextInstruction(genre, depth, referencePath) {
      if (!referencePath) {
        return "Use only the active note. Do not invent missing project context. If the note is brief, produce a brief artifact instead of padding it.";
      }
      if (genre === "construction-daily") {
        const carryForward = depth === "brief" ? "Use the reference note lightly only for names, work sequence, and recurring context." : "Carry forward schedule, process order, Mermaid/Gantt diagrams, recurring risks, and baseline assumptions from the reference note when they help explain today.";
        return [
          `A user-selected reference note is attached: ${referencePath}.`,
          "The active note is the source of today/current facts.",
          "The reference note is continuing baseline context, not today evidence.",
          "If the active note conflicts with the reference note, follow the active note and label the difference as \uAE30\uC900 \uB300\uBE44 \uBCC0\uACBD/\uD655\uC778 \uD544\uC694.",
          "Do not fabricate progress, quantities, completion status, manpower, weather, dates, or inspection outcomes that are not present in either note.",
          carryForward
        ].join(" ");
      }
      return [
        `A user-selected reference note is attached: ${referencePath}.`,
        "Use it only to clarify background, definitions, previous decisions, recurring risks, or baseline context.",
        "The active note remains the primary source of current facts."
      ].join(" ");
    }
    function getQualityContract(genre, depth) {
      const common = "Never show raw Obsidian-only syntax such as frontmatter, dataviewjs, [!callout] markers, or code that exists only to render inside Obsidian. Keep Korean documents in Korean.";
      if (genre !== "construction-daily") {
        return common;
      }
      const byDepth = {
        brief: "Construction daily brief must include a clear title/date, today work summary, and photo/evidence section when images exist.",
        standard: "Construction daily standard must include title/date, today work, evidence/photos, baseline context when supplied, risks/blockers, and next work.",
        milestone: "Construction daily milestone must include title/date, today work, baseline schedule/process context, plan-versus-actual or execution-gate view, risks/issues, decisions, and next gates."
      };
      return `${byDepth[depth] || byDepth.standard} ${common}`;
    }
    module2.exports = {
      buildSelectionPrompt,
      getContextInstruction,
      getDepthInstruction,
      getGenreInstruction,
      getPurposeInstruction,
      getQualityContract
    };
  }
});

// src/core/ai.js
var require_ai = __commonJS({
  "src/core/ai.js"(exports2, module2) {
    "use strict";
    var { spawn: spawn2 } = require("node:child_process");
    var fs = require("node:fs");
    var os = require("node:os");
    var path = require("node:path");
    var { buildAiAssetInstruction } = require_assets();
    var { getArtifactGoalInstruction } = require_artifact_goals();
    var { convertMarkdownToHtml } = require_converter();
    var { buildSelectionPrompt } = require_prompt_composer();
    var { looksLikeHtmlDocument, sanitizeHtml } = require_sanitizer();
    var providerCommands = {
      claude: {
        command: "claude",
        args: ["-p"],
        promptAsArgument: true,
        unsetEnv: ["ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_KEY"]
      },
      codex: { command: "codex", args: ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check", "-"], parser: "codex-json", promptAsArgument: false }
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
      const timeout = Number(options.timeoutMs || 9e5);
      const rawCommand = options.cliPaths && options.cliPaths[options.provider] ? options.cliPaths[options.provider] : provider.command;
      const command = resolveHomePath2(rawCommand);
      const args = provider.promptAsArgument ? [...provider.args, prompt] : provider.args;
      const execOptions = {
        timeout,
        maxBuffer: 10 * 1024 * 1024,
        env: buildProviderEnv(provider),
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
    function resolveHomePath2(command, env = process.env) {
      const value = String(command || "").trim();
      if (!value) {
        return "";
      }
      const home = String(env.HOME || os.homedir() || "");
      if (value === "~") {
        return home || value;
      }
      if (value.startsWith("~/")) {
        return home ? `${home}${value.slice(1)}` : value;
      }
      return value;
    }
    function getProviderPrivacyNote3(provider) {
      return provider === "claude" ? "Claude Code CLI receives the note prompt as a command-line argument; avoid sending private notes if local process inspection is a concern." : "";
    }
    function buildProviderEnv(provider, baseEnv = process.env) {
      const env = {
        ...baseEnv,
        PATH: mergePath(baseEnv.PATH, { env: baseEnv })
      };
      for (const key of provider.unsetEnv || []) {
        delete env[key];
      }
      return env;
    }
    function runProcess(command, args, options) {
      return new Promise((resolve, reject) => {
        const child = spawn2(command, args, {
          env: options.env,
          shell: Boolean(options.shell),
          stdio: ["pipe", "pipe", "pipe"]
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
        if (options.input) {
          child.stdin.write(options.input);
        }
        child.stdin.end();
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
      const affordanceInstruction = getGoalAffordanceInstruction(artifactGoal, Boolean(options.trusted));
      const interactionStandard = getInteractionStandard(artifactGoal, options.template || "minimal", Boolean(options.trusted), options);
      const selectionInstruction = buildSelectionPrompt(options);
      return `Convert this Obsidian Markdown note to a complete standalone HTML document.
Artifact goal: ${artifactGoal}
Artifact type: ${options.artifactType || "faithful-note"}
Template: ${options.template || "minimal"}
Mode: ${options.mode || "preserve"}
${selectionInstruction}
Goal instruction: ${goalInstruction}
Artifact instruction: ${artifactInstruction}
Instruction: ${modeInstruction}
Design standard: produce a refined, modern, visually designed HTML page rather than plain Markdown-looking output. Use responsive CSS, strong spacing, tasteful color, cards/sections where helpful, and readable Korean typography if the content is Korean.
Dynamic policy: ${dynamicInstruction}
Goal-specific affordances: ${affordanceInstruction}
Interaction standard: ${interactionStandard}
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
        "interactive-explainer": "Create an interactive explainer with progressive disclosure, visual examples, generated TOC, copy buttons, and local controls only when their purpose is clear to the reader.",
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
    function getGoalAffordanceInstruction(artifactGoal, trusted) {
      const policy = trusted ? "Use inline, local-only controls when useful." : "Do not use scripts; express the affordance with static sections, anchors, tables, and copy-ready text blocks.";
      return {
        read: `Prioritize navigation, readability, and visual hierarchy. Avoid unnecessary controls. ${policy}`,
        decide: `Include decision question, criteria, options, tradeoffs, recommendation, dissent, and a copy-back decision summary. ${policy}`,
        review: `Include section-level review prompts, feedback checklist, and a copy-feedback-to-AI area. ${policy}`,
        compare: `Include side-by-side options, scorecards, comparison matrix, and filters or toggles in trusted mode. ${policy}`,
        tune: `Include editable/review notes, state JSON, and copy-next-prompt affordances in trusted mode. ${policy}`,
        "explain-code": `Include code or diff navigation, reviewer checklist, risk sections, and next-review prompt. ${policy}`,
        publish: "Include social-friendly title, description, share framing, and polished article structure. In sanitized mode, avoid JavaScript entirely."
      }[artifactGoal] || `Make the artifact's intended next action obvious. ${policy}`;
    }
    function getInteractionStandard(artifactGoal, template, trusted, options = {}) {
      if (!trusted) {
        return "Keep interaction affordances static: anchors, tables, checklists, and copy-ready text blocks only. Do not add editable playground controls, state JSON panels, or scripts.";
      }
      if (template === "construction-daily") {
        const depth = options.exportDepth || "standard";
        const depthInstruction = {
          brief: "For brief daily logs, keep the page compact and do not force Mermaid, Gantt, execution gates, or large baseline sections unless the active note explicitly contains them.",
          standard: "For standard daily reports, include compact Mermaid/Gantt/process context only when the active or reference note provides enough schedule/process material.",
          milestone: "For milestone reports, include a visible baseline schedule/process section and an HTML/CSS execution-gate or Gantt-style view when the reference note provides schedule or process material."
        }[depth] || "";
        return `Build a Korean construction daily report, not a generic article. On desktop, use a first-screen two-column hero where the left side contains the title and concise project summary and the right side renders the primary infographic or lead image at comparable visual weight when an image exists. On mobile, do not preserve the desktop side-by-side composition; stack the hero in this reader order: kicker/date, primary infographic or lead image, title, then summary. Convert Obsidian callouts, DataviewJS, and raw markdown syntax into clean reader-facing HTML; never show raw markers such as [!abstract]+, dataviewjs, frontmatter, or code used only for Obsidian rendering. ${depthInstruction} Use Korean-only reader tags and card-ready summary text around 50 characters. Keep all controls local-only and self-contained.`;
      }
      if (artifactGoal === "tune" || template === "playground") {
        return "Use local-only editable controls, state JSON, and copy-next-prompt affordances, but label why the controls exist and what the reader should do next. Keep everything self-contained.";
      }
      return "Use local-only navigation, section collapse, copy summary/outline/prompt buttons, filters, or annotations only when they directly help the selected artifact goal. Do not add generic tuning playgrounds, state JSON panels, sliders, or editable fields unless the artifact goal is tune or the template is playground. Any control must have a visible purpose label and an obvious next action.";
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
      getGoalAffordanceInstruction,
      getInteractionStandard,
      getProviderPrivacyNote: getProviderPrivacyNote3,
      convertWithAiFallback: convertWithAiFallback2,
      extractHtmlFromAiOutput,
      discoverUserCliPaths,
      mergePath,
      parseProviderOutput,
      resolveHomePath: resolveHomePath2,
      runCliProvider,
      cleanProviderError
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
    function inferPagesBaseUrl3(repoValue) {
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
      const now = (entry == null ? void 0 : entry.updatedAt) || (/* @__PURE__ */ new Date()).toISOString();
      const current = Array.isArray(existingIndex == null ? void 0 : existingIndex.items) ? existingIndex.items : [];
      const nextEntry = normalizeShareEntry(entry, now);
      const merged = nextEntry ? [nextEntry, ...repairShareItems(current).filter((item) => !shareItemsMatch(item, nextEntry))] : repairShareItems(current);
      const items = dedupeShareItems(merged).sort(compareShareItems);
      return {
        version: 2,
        updatedAt: now,
        items
      };
    }
    function repairShareIndex2(existingIndex) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const current = Array.isArray(existingIndex == null ? void 0 : existingIndex.items) ? existingIndex.items : [];
      const items = dedupeShareItems(repairShareItems(current)).sort(compareShareItems);
      return {
        version: 2,
        updatedAt: (existingIndex == null ? void 0 : existingIndex.updatedAt) || now,
        items
      };
    }
    function renderShareIndexHtml2(index, options = {}) {
      var _a;
      const title = cleanArchiveText(options.title || "\uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8", "\uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8");
      const eyebrow = cleanArchiveText(options.eyebrow || "\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 Archive", "\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 Archive");
      const description = cleanArchiveText(options.description || "\uACF5\uC0AC\uC77C\uBCF4, \uD68C\uC758\uB85D, \uBCF4\uACE0\uC11C\uB97C \uC2A4\uD2B8\uB9AC\uBC0D \uCF58\uD150\uCE20\uCC98\uB7FC \uBE60\uB974\uAC8C \uACE0\uB974\uACE0 \uBC14\uB85C \uC5EC\uB294 MarkTL \uACF5\uC720 \uC544\uCE74\uC774\uBE0C.", "\uACF5\uC720 HTML\uC744 \uBE60\uB974\uAC8C \uCC3E\uACE0 \uC5EC\uB294 MarkTL \uC544\uCE74\uC774\uBE0C.");
      const baseUrl = String(options.baseUrl || "").replace(/\/+$/g, "");
      const items = repairShareItems(Array.isArray(index == null ? void 0 : index.items) ? index.items : []).map((item, itemIndex) => normalizeArchiveItem(item, itemIndex, baseUrl));
      const tagCounts = /* @__PURE__ */ new Map();
      const typeCounts = /* @__PURE__ */ new Map();
      for (const item of items) {
        typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
        for (const tag of item.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      const preferredTypes = ["\uACF5\uC0AC\uC77C\uBCF4", "\uD1B5\uD569\uB178\uD2B8", "\uD68C\uC758\uB85D", "\uB178\uD2B8", "\uBCF4\uACE0\uC11C"];
      const typeButtons = preferredTypes.filter((type) => typeCounts.has(type)).concat([...typeCounts.keys()].filter((type) => !preferredTypes.includes(type)).sort((left, right) => left.localeCompare(right))).map((type) => `<button type="button" data-filter="${escapeHtml(type)}">${escapeHtml(type)}</button>`).join("");
      const tagButtons = [...tagCounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 10).map(([tag, count]) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} ${count}</button>`).join("");
      const list = items.map(renderArchiveTile).join("\n");
      const latestMonth = (((_a = items.find((item) => item.date)) == null ? void 0 : _a.date) || formatDate(index == null ? void 0 : index.updatedAt)).slice(0, 7) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
      const docsJson = safeInlineJson(items.map((item) => ({
        title: item.title,
        type: item.type,
        date: item.date,
        url: item.href,
        tags: item.tags
      })));
      return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<style>
*{box-sizing:border-box}html,body{height:100%;background:#050507}body{margin:0;min-width:0;width:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7f8fb;background:radial-gradient(circle at 12% 0%,rgba(255,61,61,.3),transparent 32rem),radial-gradient(circle at 88% 5%,rgba(25,211,197,.22),transparent 30rem),linear-gradient(180deg,#08090d 0%,#111014 48%,#050507 100%);overflow:hidden}a{color:inherit;text-decoration:none}button,input{font:inherit}.app{width:min(1480px,100%);height:100dvh;margin:0 auto;padding:clamp(14px,2vw,28px);display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;overflow:hidden}.top{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,370px);gap:24px;align-items:start;min-height:0}.hero-panel{display:grid;align-content:start;gap:0;min-width:0;padding-top:8px}.eyebrow{margin:0 0 8px;color:#ffb020;font-size:12px;font-weight:950;letter-spacing:.16em;text-transform:uppercase}.top h1{max-width:860px;margin:0;font-size:clamp(30px,4vw,56px);line-height:1.02;letter-spacing:0;font-weight:950;text-wrap:balance}.hero-copy{max-width:820px;margin:12px 0 0;color:#c8d0dc;font-size:clamp(14px,1.18vw,17px);line-height:1.5}.calendar{height:300px;min-height:300px;align-self:start;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,.105),rgba(255,255,255,.045));box-shadow:0 18px 48px rgba(0,0,0,.26);padding:16px 16px 22px;backdrop-filter:blur(18px)}.cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.cal-title{font-size:16px;font-weight:950;letter-spacing:.02em}.cal-nav{display:flex;gap:6px}.cal-nav button{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.cal-nav button:hover{background:#ff3d3d}.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(7,1fr);gap:4px}.cal-week{color:#8d98a8;font-size:10px;font-weight:900;text-align:center}.cal-day{position:relative;display:grid;place-items:center;min-height:24px;border:0;border-radius:7px;background:transparent;color:#cfd6e4;font-size:12px;font-weight:800}.cal-day.muted{opacity:.28}.cal-day.has-doc{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;min-height:30px!important;padding:3px 4px 2px!important;line-height:1!important;cursor:pointer;color:#fff;background:linear-gradient(135deg,#ff3d3d,#ff9f1c);box-shadow:0 8px 18px rgba(255,80,40,.22)}.cal-day.has-doc::after{content:attr(data-type);display:block;max-width:38px;font-size:6.5px;font-weight:900;color:rgba(255,255,255,.86);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.toolbar{position:static;display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:10px;align-items:center;max-width:100%;overflow:hidden;margin-top:16px;padding:8px 0 0;background:transparent;border:0;backdrop-filter:none}.search{height:38px;min-width:0;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.08);color:#fff;padding:0 13px;outline:none}.search::placeholder{color:#8f98a8}.search:focus{border-color:#ffb020;box-shadow:0 0 0 3px rgba(255,176,32,.16)}.filters{min-width:0;max-width:100%;display:flex;flex-wrap:wrap;align-content:flex-start;gap:4px;max-height:48px;overflow:hidden;scrollbar-width:none}.filters::-webkit-scrollbar{display:none}.filters button,.tags button{border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.065);color:#dce3ef;cursor:pointer;white-space:nowrap}.filters button{height:22px;padding:0 7px;font-size:10px;line-height:1;font-weight:850}.filters button.active{border-color:#ff3d3d;background:#ff3d3d;color:#fff}.content{min-height:0;overflow:auto;padding:0 2px 28px 0;scrollbar-color:rgba(255,255,255,.26) transparent}.content::-webkit-scrollbar{width:10px}.content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:999px}.section-head{position:static;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 8px;padding:2px 0 8px;background:transparent}.section-head h2{margin:0;font-size:18px;letter-spacing:0}.section-head span{color:#9aa4b5;font-size:12px;font-weight:800}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,620px),1fr));gap:14px;align-items:start}.tile{container-type:inline-size;position:relative;display:grid;grid-template-columns:minmax(320px,44%) minmax(0,1fr);height:180px;min-height:0;overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,.095),rgba(255,255,255,.035));box-shadow:0 16px 34px rgba(0,0,0,.28);animation:tileIn .42s ease both;animation-delay:calc(var(--i)*42ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.tile::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 34%,transparent),transparent 58%);opacity:.34;pointer-events:none}.tile:hover{transform:translateY(-4px) scale(1.01);border-color:color-mix(in srgb,var(--accent) 72%,white);box-shadow:0 24px 54px rgba(0,0,0,.42)}.poster{position:relative;min-width:0;background:#181a22;overflow:hidden;border-right:1px solid rgba(255,255,255,.08)}.poster img{width:100%;height:100%;min-height:0;object-fit:cover;display:block;transform:scale(1.01);transition:transform .25s ease,filter .25s ease}.tile:hover .poster img{transform:scale(1.05);filter:saturate(1.12)}.poster::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 48%,rgba(10,10,12,.88) 100%)}.tile-body{position:relative;min-width:0;display:flex;flex-direction:column;padding:14px 44px 16px 14px}.meta-line{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:#aab4c4;font-size:11px;font-weight:850}.type{color:var(--accent2);text-transform:uppercase}.tile h2{margin:0;color:#fff;font-size:clamp(17px,2cqi,23px);line-height:1.18;letter-spacing:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tile p{margin:8px 0 0;color:#c9d0dc;font-size:13px;line-height:1.42;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tags{display:flex;flex-wrap:nowrap;align-items:center;gap:5px;min-height:26px;max-height:26px;overflow-x:auto;overflow-y:hidden;margin-top:auto;padding:4px 38px 0 0;scrollbar-width:none}.tags::-webkit-scrollbar{display:none}.tags button{flex:0 0 auto;height:21px;line-height:1;padding:0 7px;font-size:10px;max-width:132px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.play{position:absolute;right:12px;bottom:12px;z-index:4;display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 10px 20px rgba(0,0,0,.26);font-size:12px}.empty{padding:18px;border:1px dashed rgba(255,255,255,.2);border-radius:8px;color:#aab4c4}.hidden{display:none!important}@keyframes tileIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@media(max-width:980px){.app{padding:10px 12px 16px;gap:8px}.top{grid-template-columns:1fr;gap:9px}.hero-panel{padding-top:0}.eyebrow{font-size:10px;margin-bottom:5px;letter-spacing:.14em}.top h1{font-size:clamp(25px,7.4vw,32px);line-height:1.02;max-width:360px}.hero-copy{margin-top:7px;font-size:12.5px;line-height:1.42;max-width:390px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.toolbar{grid-template-columns:1fr;gap:6px;margin-top:8px;padding:0;overflow:visible}.search{height:34px;border-radius:7px;font-size:12.5px;padding:0 10px}.filters{max-height:52px;gap:4px}.filters button{height:22px;padding:0 7px;font-size:10px}.calendar{height:256px;min-height:256px;padding:10px 10px 14px}.cal-title{font-size:14px}.cal-nav button{width:25px;height:25px}.cal-day{min-height:20px;font-size:10.5px}.cal-day.has-doc{min-height:24px!important;padding:2px 3px!important}.cal-day.has-doc::after{display:none}.section-head{padding:4px 0 7px;margin-bottom:7px}.section-head h2{font-size:15px}.section-head span{font-size:11px}.grid{grid-template-columns:1fr;gap:7px}.tile{grid-template-columns:150px minmax(0,1fr);height:86px;min-height:0;border-radius:8px}.poster{width:auto;border:0;border-radius:0}.poster img{min-height:0;height:100%;object-fit:cover}.poster::after{background:linear-gradient(90deg,transparent 28%,rgba(10,10,12,.9) 100%)}.tile-body{padding:8px 34px 7px 10px}.meta-line{font-size:9.5px;margin-bottom:4px}.tile h2{font-size:15px;line-height:1.12;-webkit-line-clamp:2}.tile p{font-size:11px;line-height:1.25;margin-top:4px;-webkit-line-clamp:1}.play{width:24px;height:24px;right:7px;bottom:7px;font-size:10px}.tags{display:none}}@media(max-width:420px){.app{padding:9px 10px 14px}.calendar{display:none}.tile{grid-template-columns:132px minmax(0,1fr);height:78px;min-height:0}.poster img{min-height:0}.top h1{font-size:25px}.hero-copy{font-size:12px}.filters button{font-size:10px}.tile h2{font-size:14.5px}}
</style>
</head>
<body>
<div class="app">
  <header class="top">
    <div class="hero-panel">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="hero-copy">${escapeHtml(description)}</p>
      <section class="toolbar" aria-label="\uAC80\uC0C9\uACFC \uD544\uD130">
        <input class="search" id="search" type="search" placeholder="\uBB38\uC11C, \uD604\uC7A5, \uD68C\uC758, \uD0DC\uADF8 \uAC80\uC0C9" aria-label="\uBB38\uC11C \uAC80\uC0C9">
        <div class="filters"><button class="active" type="button" data-filter="">\uC804\uCCB4</button>${typeButtons}${tagButtons}</div>
      </section>
    </div>
    <aside class="calendar" aria-label="\uAC8C\uC2DC \uB0A0\uC9DC \uCE98\uB9B0\uB354">
      <div class="cal-head"><button type="button" class="cal-title" id="calTitle" aria-label="\uD604\uC7AC \uC6D4"></button><div class="cal-nav"><button type="button" id="prevMonth" aria-label="\uC774\uC804 \uB2EC">\u2039</button><button type="button" id="nextMonth" aria-label="\uB2E4\uC74C \uB2EC">\u203A</button></div></div>
      <div class="cal-grid" id="calendarGrid"></div>
    </aside>
  </header>
  <section class="content" aria-label="\uBB38\uC11C \uBAA9\uB85D \uC2A4\uD06C\uB864 \uC601\uC5ED">
    <div class="section-head"><h2>\uC9C0\uAE08 \uBCFC \uBB38\uC11C</h2><span id="count">${items.length}\uAC1C \uD45C\uC2DC</span></div>
    <main class="grid" id="items">${list || '<p class="empty">\uAC8C\uC2DC\uB41C \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</p>'}</main>
  </section>
</div>
<script>
const docs=${docsJson};
const initialMonth='${escapeJsString(latestMonth)}';
const search=document.getElementById('search');const count=document.getElementById('count');const cards=[...document.querySelectorAll('.tile')];let activeType='';let activeTag='';let activeDate='';let calDate=new Date(Number(initialMonth.slice(0,4)),Number(initialMonth.slice(5,7))-1,1);
function apply(){const q=(search.value||'').trim().toLowerCase();let n=0;for(const card of cards){const okQ=!q||card.dataset.search.includes(q);const okT=!activeType||card.dataset.type===activeType;const okTag=!activeTag||(' '+card.dataset.tags+' ').includes(' '+activeTag+' ');const okDate=!activeDate||card.dataset.date===activeDate;const show=okQ&&okT&&okTag&&okDate;card.classList.toggle('hidden',!show);if(show)n++;}count.textContent=(activeDate?activeDate+' \xB7 ':'')+n+'\uAC1C \uD45C\uC2DC';}
function setActiveButton(btn){document.querySelectorAll('.filters button').forEach(b=>b.classList.toggle('active',b===btn));}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{activeType=btn.dataset.filter||'';activeTag='';activeDate='';setActiveButton(btn);apply();}));document.querySelectorAll('[data-tag]').forEach(btn=>btn.addEventListener('click',()=>{activeTag=btn.dataset.tag||'';activeType='';activeDate='';setActiveButton(btn);apply();}));search.addEventListener('input',()=>{activeDate='';apply();});
function docsByDate(date){return docs.filter(d=>d.date===date)}
function renderCalendar(){const y=calDate.getFullYear();const m=calDate.getMonth();const title=document.getElementById('calTitle');title.textContent=y+'.'+String(m+1).padStart(2,'0');const grid=document.getElementById('calendarGrid');grid.innerHTML='';['\uC77C','\uC6D4','\uD654','\uC218','\uBAA9','\uAE08','\uD1A0'].forEach(w=>{const el=document.createElement('div');el.className='cal-week';el.textContent=w;grid.append(el);});const first=new Date(y,m,1);const days=new Date(y,m+1,0).getDate();for(let i=0;i<first.getDay();i++){const blank=document.createElement('span');blank.className='cal-day muted';grid.append(blank);}for(let d=1;d<=days;d++){const date=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const dayDocs=docsByDate(date);const button=document.createElement('button');button.type='button';button.className='cal-day'+(dayDocs.length?' has-doc':'');button.textContent=String(d);button.dataset.date=date;if(dayDocs.length){button.dataset.type=dayDocs[0].type;button.title=dayDocs.map(x=>x.title).join(String.fromCharCode(10));button.addEventListener('click',()=>{if(dayDocs.length===1){location.href=dayDocs[0].url;}else{activeDate=date;activeType='';activeTag='';setActiveButton(document.querySelector('[data-filter=""]'));apply();}});}grid.append(button);}}
document.getElementById('prevMonth').addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);renderCalendar();});document.getElementById('nextMonth').addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);renderCalendar();});document.getElementById('calTitle').addEventListener('click',()=>{calDate=new Date(Number(initialMonth.slice(0,4)),Number(initialMonth.slice(5,7))-1,1);renderCalendar();});renderCalendar();apply();
</script>
</body>
</html>`;
    }
    function normalizeArchiveItem(item, itemIndex, baseUrl) {
      const tags = normalizeTags(item == null ? void 0 : item.tags);
      const title = recoverShareTitle(item);
      const date = extractArchiveDate(item);
      const type = inferArchiveType(item, title, tags);
      const accents = archiveAccents(type, itemIndex);
      const href = (item == null ? void 0 : item.url) || (item == null ? void 0 : item.canonicalUrl) || (baseUrl ? `${baseUrl}/${encodeURIComponent((item == null ? void 0 : item.slug) || "")}/` : `${encodeURIComponent((item == null ? void 0 : item.slug) || "")}/`);
      const excerpt = cleanArchiveText((item == null ? void 0 : item.excerpt) || (item == null ? void 0 : item.sourcePath) || "", "");
      const thumbnail = firstImageUrl(item) || buildArchivePosterSvg(title, type, date, accents, itemIndex);
      const searchText = [title, item == null ? void 0 : item.slug, excerpt, item == null ? void 0 : item.sourcePath, type, date, ...tags].filter(Boolean).join(" ").toLowerCase();
      return { title, date, type, accents, href, excerpt, tags, thumbnail, searchText, itemIndex };
    }
    function renderArchiveTile(item) {
      return `<article class="tile" data-search="${escapeHtml(item.searchText)}" data-tags="${escapeHtml(item.tags.join(" "))}" data-type="${escapeHtml(item.type)}" data-date="${escapeHtml(item.date)}" style="--accent:${escapeHtml(item.accents[0])};--accent2:${escapeHtml(item.accents[1])};--i:${item.itemIndex}">
  <a class="poster" href="${escapeHtml(item.href)}"><img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy"></a>
  <div class="tile-body">
    <div class="meta-line"><span class="type">${escapeHtml(item.type)}</span><time>${escapeHtml(item.date)}</time></div>
    <h2><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></h2>
    ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
    ${item.tags.length ? `<div class="tags">${item.tags.map((tag) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}</div>` : '<div class="tags"></div>'}
  </div>
  <a class="play" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(item.title)} \uC5F4\uAE30">\u25B6</a>
</article>`;
    }
    function extractArchiveDate(item) {
      const text = [item == null ? void 0 : item.title, item == null ? void 0 : item.sourcePath, item == null ? void 0 : item.slug, item == null ? void 0 : item.updatedAt].filter(Boolean).join(" ");
      const match = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
      return match ? match[1] : formatDate(item == null ? void 0 : item.updatedAt) || "";
    }
    function compareShareItems(left, right) {
      const dateCompare = String(extractArchiveDate(right) || "").localeCompare(String(extractArchiveDate(left) || ""));
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return String((right == null ? void 0 : right.updatedAt) || "").localeCompare(String((left == null ? void 0 : left.updatedAt) || ""));
    }
    function inferArchiveType(item, title, tags) {
      const text = [title, item == null ? void 0 : item.sourcePath, item == null ? void 0 : item.artifactType, ...tags].join(" ").toLowerCase();
      if (/공사일보|daily\s*construction/.test(text)) return "\uACF5\uC0AC\uC77C\uBCF4";
      if (/회의록|회의|meeting/.test(text)) return "\uD68C\uC758\uB85D";
      if (/통합노트|프로젝트관리|통합관리|integrated/.test(text)) return "\uD1B5\uD569\uB178\uD2B8";
      if (/보고서|report|research-report|decision-memo/.test(text)) return "\uBCF4\uACE0\uC11C";
      return "\uB178\uD2B8";
    }
    function archiveAccents(type, index) {
      const byType = {
        \uACF5\uC0AC\uC77C\uBCF4: ["#ff3d3d", "#ff9f1c"],
        \uD1B5\uD569\uB178\uD2B8: ["#10b981", "#84cc16"],
        \uD68C\uC758\uB85D: ["#8b5cf6", "#06b6d4"],
        \uBCF4\uACE0\uC11C: ["#f59e0b", "#ef4444"],
        \uB178\uD2B8: ["#38bdf8", "#a78bfa"]
      };
      const fallbacks = [["#38bdf8", "#a78bfa"], ["#ec4899", "#f97316"], ["#22c55e", "#14b8a6"]];
      return byType[type] || fallbacks[index % fallbacks.length];
    }
    function firstImageUrl(item) {
      const value = (item == null ? void 0 : item.thumbnail) || (item == null ? void 0 : item.thumbnailUrl) || (item == null ? void 0 : item.image) || (item == null ? void 0 : item.imageUrl) || (item == null ? void 0 : item.coverUrl) || "";
      const text = String(value || "").trim();
      return /^(https?:\/\/|data:image\/)/i.test(text) ? text : "";
    }
    function buildArchivePosterSvg(title, type, date, accents, index) {
      const safeTitle = truncateArchiveText(title, 42);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${escapeHtml(safeTitle)}"><defs><linearGradient id="g${index}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${accents[0]}"/><stop offset="1" stop-color="${accents[1]}"/></linearGradient><filter id="s${index}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".32"/></filter></defs><rect width="640" height="360" rx="28" fill="#10131a"/><circle cx="520" cy="-10" r="210" fill="url(#g${index})" opacity=".9"/><circle cx="55" cy="315" r="180" fill="url(#g${index})" opacity=".42"/><path d="M60 250h520" stroke="#fff" stroke-opacity=".13" stroke-width="2"/><g filter="url(#s${index})"><rect x="58" y="60" width="116" height="116" rx="24" fill="rgba(255,255,255,.14)"/><path d="M89 132h54M89 101h92M89 162h140" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".82"/></g><text x="58" y="224" fill="#fff" font-family="system-ui, sans-serif" font-size="30" font-weight="900">${escapeHtml(type)}</text><text x="58" y="270" fill="#fff" font-family="system-ui, sans-serif" font-size="22" font-weight="800" opacity=".92">${escapeHtml(date)}</text><text x="58" y="314" fill="#fff" font-family="system-ui, sans-serif" font-size="22" font-weight="700" opacity=".82">${escapeHtml(safeTitle)}</text></svg>`;
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }
    function truncateArchiveText(value, limit = 58) {
      const text = String(value || "").trim();
      return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
    }
    function safeInlineJson(value) {
      return JSON.stringify(value).replace(/</g, "\\u003c");
    }
    function escapeJsString(value) {
      return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }
    function normalizeShareEntry(entry, now) {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const normalized = {
        ...entry,
        schemaVersion: 2,
        updatedAt: entry.updatedAt || now || (/* @__PURE__ */ new Date()).toISOString()
      };
      normalized.sourcePathKey = normalized.sourcePathKey || buildSourcePathKey(normalized.sourcePath || "");
      normalized.title = recoverShareTitle(normalized);
      normalized.excerpt = cleanArchiveText(normalized.excerpt || "", "");
      normalized.tags = normalizeTags(normalized.tags);
      return normalized;
    }
    function repairShareItems(items) {
      return items.map((item) => normalizeShareEntry(item, item == null ? void 0 : item.updatedAt)).filter(Boolean);
    }
    function dedupeShareItems(items) {
      const deduped = [];
      for (const item of items) {
        if (!deduped.some((existing) => shareItemsMatch(existing, item))) {
          deduped.push(item);
        }
      }
      return deduped;
    }
    function shareItemsMatch(left, right) {
      const rightKeys = new Set(shareItemKeys(right));
      return shareItemKeys(left).some((key) => rightKeys.has(key));
    }
    function shareItemKeys(item) {
      const keys = [];
      const shortId = cleanArchiveText(item == null ? void 0 : item.shortId, "");
      if (shortId) {
        keys.push(`short:${shortId}`);
      }
      const url = normalizeUrlKey(item == null ? void 0 : item.url);
      if (url) {
        keys.push(`url:${url}`);
      }
      const canonicalUrl = normalizeUrlKey(item == null ? void 0 : item.canonicalUrl);
      if (canonicalUrl) {
        keys.push(`canonical:${canonicalUrl}`);
      }
      const sourcePath = buildSourcePathKey((item == null ? void 0 : item.sourcePathKey) || (item == null ? void 0 : item.sourcePath) || "");
      if (sourcePath) {
        keys.push(`source:${sourcePath}`);
      }
      const slug = normalizeIndexKey(item == null ? void 0 : item.slug);
      if (slug) {
        keys.push(`slug:${slug}`);
      }
      return keys;
    }
    function normalizeUrlKey(value) {
      return normalizeIndexKey(value).replace(/\/+$/g, "");
    }
    function buildSourcePathKey(value) {
      return normalizeIndexKey(value);
    }
    function normalizeIndexKey(value) {
      return repairMojibake(decodeArchiveComponent(value)).normalize("NFC").replace(/\\/g, "/").replace(/\s+/g, " ").trim().toLowerCase();
    }
    function recoverShareTitle(item) {
      const candidates = [
        item == null ? void 0 : item.title,
        titleFromUrl(item == null ? void 0 : item.canonicalUrl),
        titleFromSourcePath(item == null ? void 0 : item.sourcePath),
        item == null ? void 0 : item.slug
      ];
      for (const candidate of candidates) {
        const title = normalizeTitleCandidate(candidate);
        if (title) {
          return title;
        }
      }
      return "\uC81C\uBAA9 \uC5C6\uB294 HTML \uC0B0\uCD9C\uBB3C";
    }
    function titleFromUrl(value) {
      try {
        const url = new URL(String(value || ""));
        const segments = url.pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1] || "";
        const previous = segments[segments.length - 2] || "";
        if (previous === "s") {
          return "";
        }
        return last;
      } catch (e) {
        return "";
      }
    }
    function titleFromSourcePath(value) {
      const text = decodeArchiveComponent(value).split(/[\\/]/).filter(Boolean).pop() || "";
      return text.replace(/\.(md|html?)$/i, "");
    }
    function normalizeTitleCandidate(value) {
      const basename = decodeArchiveComponent(value).split(/[\\/]/).filter(Boolean).pop() || value;
      const cleaned = cleanArchiveText(prettifySlugTitle(String(basename || "").replace(/\.(md|html?)$/i, "")), "");
      if (isGenericShareTitle(cleaned)) {
        return "";
      }
      return cleanArchiveText(cleaned, "");
    }
    function isGenericShareTitle(value) {
      const text = repairMojibake(value).toLowerCase().replace(/\s+/g, " ").trim();
      return [
        "marktl shared html",
        "marktl archive",
        "open artifact",
        "html artifact"
      ].includes(text);
    }
    function prettifySlugTitle(value) {
      const text = String(value || "").trim();
      const match = /^(\d{4}-\d{2}-\d{2})-(\S.+)$/.exec(text);
      if (!match || text.includes(" ")) {
        return text;
      }
      const parts = match[2].split("-").filter(Boolean);
      if (parts.length >= 4) {
        return `${match[1]} - ${parts.slice(0, 2).join(" ")} - ${parts.slice(2).join(" ")}`;
      }
      return `${match[1]} - ${parts.join(" ")}`;
    }
    function decodeArchiveComponent(value) {
      let text = String(value || "");
      for (let index = 0; index < 2; index += 1) {
        try {
          const decoded = decodeURIComponent(text);
          if (decoded === text) {
            break;
          }
          text = decoded;
        } catch (e) {
          break;
        }
      }
      return text;
    }
    function normalizeTags(tags) {
      const values = Array.isArray(tags) ? tags : String(tags || "").split(",");
      return [...new Set(values.map((tag) => cleanArchiveText(String(tag || "").replace(/^\s*-\s*/, "").replace(/^#/, "").replace(/^["']|["']$/g, "").trim(), "")).filter(Boolean).filter((tag) => !looksLikeMojibake(tag)).map(toReaderTag).filter(Boolean).map((tag) => tag.length > 44 ? `${tag.slice(0, 41)}...` : tag))].slice(0, 8);
    }
    var READER_TAG_ALIASES = /* @__PURE__ */ new Map([
      ["obsidian/project-management", "\uD504\uB85C\uC81D\uD2B8\uAD00\uB9AC"],
      ["gantt", "\uAC04\uD2B8"],
      ["budget", "\uC608\uC0B0"],
      ["risk", "\uB9AC\uC2A4\uD06C"],
      ["function/ops", "\uC6B4\uC601"],
      ["doc/meeting", "\uD68C\uC758\uB85D"],
      ["doc/\uBCF4\uACE0\uC11C", "\uBCF4\uACE0\uC11C"],
      ["state/\uAC80\uD1A0\uC911", "\uAC80\uD1A0\uC911"]
    ]);
    var HIDDEN_READER_TAGS = /* @__PURE__ */ new Set([
      "ai",
      "dataviewjs",
      "reforged-note",
      "obsidian/mermaid",
      "obsidian/dataviewjs"
    ]);
    function toReaderTag(tag) {
      const normalized = String(tag || "").trim().replace(/^#/, "");
      const key = normalized.toLowerCase();
      if (!normalized || HIDDEN_READER_TAGS.has(key)) {
        return "";
      }
      if (READER_TAG_ALIASES.has(key)) {
        return READER_TAG_ALIASES.get(key);
      }
      if (/^obsidian\//i.test(normalized)) {
        return "";
      }
      if (/^(project|topic|doc|state|function|업무|회의록|프로젝트)\//i.test(normalized)) {
        return normalized.split("/").filter(Boolean).pop() || "";
      }
      return normalized;
    }
    function cleanArchiveText(value, fallback = "") {
      const cleaned = repairMojibake(String(value || "")).replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<iframe\b[\s\S]*?<\/iframe>/gi, " ").replace(/<[^>]+>/g, " ").replace(/<[^>]*$/g, " ").replace(/^\s*>\s*/gm, " ").replace(/\[\!(?:summary|note|info|tip|warning|important|abstract|todo|success|question|failure|danger|bug|example|quote)\][+-]?\s*/gi, " ").replace(/\[[ xX-]\]\s*/g, " ").replace(/!\[\[[^\]]+\]\]/g, " ").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/[*_`~>#]+/g, " ").replace(/\s+/g, " ").trim();
      if (!cleaned || looksLikeMojibake(cleaned)) {
        return fallback;
      }
      return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
    }
    function repairMojibake(value) {
      let best = String(value || "");
      let bestScore = mojibakeScore(best);
      for (let index = 0; index < 2; index++) {
        const next = Buffer.from(best, "latin1").toString("utf8");
        const score = mojibakeScore(next);
        if (score >= bestScore) {
          break;
        }
        best = next;
        bestScore = score;
      }
      return best;
    }
    function looksLikeMojibake(value) {
      const text = String(value || "");
      if (!text) {
        return false;
      }
      if (text.includes("\uFFFD")) {
        return true;
      }
      return mojibakeScore(text) / Math.max(text.length, 1) > 0.08;
    }
    function mojibakeScore(value) {
      const text = String(value || "");
      if (!text) {
        return 0;
      }
      return (text.match(/[�ÂÃìíëê¼½¾]/g) || []).length;
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
      inferPagesBaseUrl: inferPagesBaseUrl3,
      mimeTypeForPath,
      normalizePublishPath,
      parseRepo: parseRepo2,
      repairShareIndex: repairShareIndex2,
      renderShareIndexHtml: renderShareIndexHtml2,
      updateShareIndex: updateShareIndex2
    };
  }
});

// src/core/share-home-profiles.js
var require_share_home_profiles = __commonJS({
  "src/core/share-home-profiles.js"(exports2, module2) {
    "use strict";
    var { buildShareHomeUrl: buildShareHomeUrl2, inferPagesBaseUrl: inferPagesBaseUrl3, normalizePublishPath } = require_github_pages();
    var DEFAULT_SHARE_HOME_PROFILE_ID2 = "jisu-construction";
    var DEFAULT_SHARE_HOME_TITLE = "\uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8";
    var DEFAULT_SHARE_HOME_EYEBROW = "\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 Archive";
    var DEFAULT_SHARE_HOME_DESCRIPTION = "\uACF5\uC0AC\uC77C\uBCF4, \uD68C\uC758\uB85D, \uBCF4\uACE0\uC11C\uB97C \uD504\uB85C\uC81D\uD2B8\uBCC4 \uD5C8\uBE0C\uC5D0\uC11C \uBE60\uB974\uAC8C \uCC3E\uACE0 \uC5EC\uB294 MarkTL \uACF5\uC720 \uC544\uCE74\uC774\uBE0C.";
    function cleanProfileText(value, fallback = "") {
      const text = String(value || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
      return text || fallback;
    }
    function normalizeShareHomeProfileId(value, fallback = DEFAULT_SHARE_HOME_PROFILE_ID2) {
      const ascii = String(value || "").normalize("NFKD").replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      return ascii || fallback;
    }
    function buildDefaultShareHomeProfile2(settings = {}) {
      return {
        id: DEFAULT_SHARE_HOME_PROFILE_ID2,
        title: cleanProfileText(settings.githubShareHomeTitle, DEFAULT_SHARE_HOME_TITLE),
        basePath: normalizePublishPath(
          Object.prototype.hasOwnProperty.call(settings, "githubPublishPath") ? settings.githubPublishPath : "marktl"
        ),
        eyebrow: DEFAULT_SHARE_HOME_EYEBROW,
        description: DEFAULT_SHARE_HOME_DESCRIPTION
      };
    }
    function normalizeShareHomeProfile(profile, settings = {}, index = 0, usedIds = /* @__PURE__ */ new Set()) {
      const fallback = buildDefaultShareHomeProfile2(settings);
      const raw = profile && typeof profile === "object" ? profile : {};
      const baseFallback = index === 0 ? fallback.basePath : `marktl/hub-${index + 1}`;
      const idFallback = index === 0 ? fallback.id : `share-hub-${index + 1}`;
      const normalized = {
        id: normalizeShareHomeProfileId(raw.id || raw.key || raw.name, idFallback),
        title: cleanProfileText(raw.title || raw.name, index === 0 ? fallback.title : `\uACF5\uC720 \uD5C8\uBE0C ${index + 1}`),
        basePath: Object.prototype.hasOwnProperty.call(raw, "basePath") ? normalizePublishPath(raw.basePath) : baseFallback,
        eyebrow: cleanProfileText(raw.eyebrow || raw.badge, index === 0 ? fallback.eyebrow : "MarkTL Archive"),
        description: cleanProfileText(raw.description, index === 0 ? fallback.description : DEFAULT_SHARE_HOME_DESCRIPTION)
      };
      let id = normalized.id;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${normalized.id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);
      normalized.id = id;
      return normalized;
    }
    function normalizeShareHomeProfiles4(rawProfiles, settings = {}) {
      const usedIds = /* @__PURE__ */ new Set();
      const source = Array.isArray(rawProfiles) && rawProfiles.length > 0 ? rawProfiles : [buildDefaultShareHomeProfile2(settings)];
      return source.map((profile, index) => normalizeShareHomeProfile(profile, settings, index, usedIds));
    }
    function resolveShareHomeProfile4(settings = {}, profileId = "") {
      const profiles = normalizeShareHomeProfiles4(settings.shareHomeProfiles, settings);
      const selectedId = cleanProfileText(profileId || settings.activeShareHomeProfileId, "");
      return profiles.find((profile) => profile.id === selectedId) || profiles[0] || buildDefaultShareHomeProfile2(settings);
    }
    function normalizeShareHomeSettings(settings = {}) {
      const profiles = normalizeShareHomeProfiles4(settings.shareHomeProfiles, settings);
      const activeId = cleanProfileText(settings.activeShareHomeProfileId, "");
      const activeProfile = profiles.find((profile) => profile.id === activeId) || profiles[0];
      return {
        shareHomeProfiles: profiles,
        activeShareHomeProfileId: (activeProfile == null ? void 0 : activeProfile.id) || DEFAULT_SHARE_HOME_PROFILE_ID2
      };
    }
    function createShareHomeProfile3(existingProfiles = [], seed = {}) {
      const profiles = normalizeShareHomeProfiles4(existingProfiles, {});
      const index = profiles.length + 1;
      const usedIds = new Set(profiles.map((profile) => profile.id));
      return normalizeShareHomeProfile({
        id: seed.id || `share-hub-${index}`,
        title: seed.title || `\uC0C8 \uACF5\uC720 \uD5C8\uBE0C ${index}`,
        basePath: Object.prototype.hasOwnProperty.call(seed, "basePath") ? seed.basePath : `marktl/hub-${index}`,
        eyebrow: seed.eyebrow || "MarkTL Archive",
        description: seed.description || DEFAULT_SHARE_HOME_DESCRIPTION
      }, {}, index - 1, usedIds);
    }
    function describeShareHomeProfile3(profile, settings = {}) {
      const pagesBaseUrl = cleanProfileText(settings.githubPagesBaseUrl, "") || inferPagesBaseUrl3(settings.githubRepo);
      const homeUrl = buildShareHomeUrl2(pagesBaseUrl, (profile == null ? void 0 : profile.basePath) || "");
      const pathLabel = (profile == null ? void 0 : profile.basePath) ? `/${profile.basePath}/` : "/";
      return {
        pathLabel,
        homeUrl,
        summary: homeUrl ? `${profile.title} \xB7 ${homeUrl}` : `${profile.title} \xB7 ${pathLabel}`
      };
    }
    function sameShareHomeSettings(left = {}, right = {}) {
      return JSON.stringify({
        activeShareHomeProfileId: left.activeShareHomeProfileId,
        shareHomeProfiles: left.shareHomeProfiles
      }) === JSON.stringify({
        activeShareHomeProfileId: right.activeShareHomeProfileId,
        shareHomeProfiles: right.shareHomeProfiles
      });
    }
    module2.exports = {
      DEFAULT_SHARE_HOME_DESCRIPTION,
      DEFAULT_SHARE_HOME_EYEBROW,
      DEFAULT_SHARE_HOME_PROFILE_ID: DEFAULT_SHARE_HOME_PROFILE_ID2,
      DEFAULT_SHARE_HOME_TITLE,
      buildDefaultShareHomeProfile: buildDefaultShareHomeProfile2,
      cleanProfileText,
      createShareHomeProfile: createShareHomeProfile3,
      describeShareHomeProfile: describeShareHomeProfile3,
      normalizeShareHomeProfileId,
      normalizeShareHomeProfiles: normalizeShareHomeProfiles4,
      normalizeShareHomeSettings,
      resolveShareHomeProfile: resolveShareHomeProfile4,
      sameShareHomeSettings
    };
  }
});

// src/core/setup-guidance.js
var require_setup_guidance = __commonJS({
  "src/core/setup-guidance.js"(exports2, module2) {
    "use strict";
    function buildPagesSetupChecklist2(settings = {}) {
      const repo = String(settings.githubRepo || "owner/repo").trim() || "owner/repo";
      const branch = String(settings.githubBranch || "main").trim() || "main";
      const baseUrl = String(settings.githubPagesBaseUrl || "").trim() || "https://owner.github.io/repo";
      const publishPath = String(settings.githubPublishPath || "marktl").trim() || "marktl";
      return [
        "MarkTL GitHub Pages setup checklist",
        "",
        `1. GitHub repository: ${repo}`,
        `2. Enable GitHub Pages for branch "${branch}" in GitHub repository Settings > Pages.`,
        "3. Pages source should publish from the same branch/folder that receives MarkTL files.",
        `4. GitHub Pages base URL: ${baseUrl}`,
        `5. Publish path: ${publishPath}`,
        `6. Expected export URL: ${baseUrl.replace(/\/+$/g, "")}/${publishPath.replace(/^\/+|\/+$/g, "")}/<slug>/`,
        "7. Open https://github.com/settings/personal-access-tokens/new and create a fine-grained token.",
        `8. Limit repository access to ${repo}.`,
        "9. Grant Contents read/write permission. No broader permissions are required for publishing files.",
        "10. Paste the token into MarkTL settings, then export one test note with Share target = GitHub Pages link."
      ].join("\n");
    }
    function buildGiscusSetupChecklist2(settings = {}) {
      const repo = String(settings.giscusRepo || settings.githubRepo || "owner/repo").trim() || "owner/repo";
      const category = String(settings.giscusCategory || "Announcements").trim() || "Announcements";
      return [
        "MarkTL Giscus setup checklist",
        "",
        `1. Use repository: ${repo}`,
        "2. Install the Giscus GitHub App from https://github.com/apps/giscus for this repository.",
        "3. In GitHub repository Settings, enable Discussions.",
        "4. Create or choose a discussion category, for example General or Announcements.",
        "5. Open https://giscus.app and enter the repository.",
        `6. Choose category: ${category}`,
        "7. Choose mapping: pathname",
        "8. Choose theme: preferred_color_scheme",
        "9. Copy data-repo-id and data-category-id from the generated Giscus script.",
        "10. Paste those IDs into MarkTL settings.",
        "11. Export with Preview/export = Trusted interactive preview and Reader feedback = Giscus GitHub comments."
      ].join("\n");
    }
    module2.exports = {
      buildGiscusSetupChecklist: buildGiscusSetupChecklist2,
      buildPagesSetupChecklist: buildPagesSetupChecklist2
    };
  }
});

// src/core/provider-doctor.js
var require_provider_doctor = __commonJS({
  "src/core/provider-doctor.js"(exports2, module2) {
    "use strict";
    var { spawn: spawn2 } = require("node:child_process");
    var { mergePath } = require_ai();
    async function checkClaudeProvider2(options = {}) {
      return checkTextProvider({
        ...options,
        command: options.command || "claude",
        name: "Claude Code CLI",
        versionArgs: ["--version"],
        probeArgs: ["-p", "Return only this exact text: MARKTL_OK"],
        readyMessage: "Claude Code CLI is installed, logged in, and ready.",
        missingMessage: "Claude Code CLI was not found or did not start.",
        failedMessage: "Claude Code CLI is installed, but the login probe failed."
      });
    }
    async function checkCodexProvider2(options = {}) {
      return checkTextProvider({
        ...options,
        command: options.command || "codex",
        name: "Codex CLI",
        versionArgs: ["--version"],
        probeArgs: ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check", "-"],
        probeInput: "Return only this exact text: MARKTL_OK",
        readyMessage: "Codex CLI is installed, logged in, and ready.",
        missingMessage: "Codex CLI was not found or did not start.",
        failedMessage: "Codex CLI is installed, but the probe failed."
      });
    }
    async function checkTextProvider(options = {}) {
      const command = options.command || "claude";
      const timeoutMs = Number(options.timeoutMs || 15e3);
      const runner = options.runCommand || runCommand;
      const version = await runner(command, options.versionArgs || ["--version"], timeoutMs);
      if (version.code !== 0) {
        return {
          ok: false,
          status: "missing",
          message: cleanDoctorOutput(version.output) || options.missingMessage || `${options.name || "Provider"} was not found or did not start.`,
          version: ""
        };
      }
      const probe = await runner(command, options.probeArgs, timeoutMs, options.probeInput);
      if (probe.code !== 0) {
        const output = cleanDoctorOutput(probe.output);
        return {
          ok: false,
          status: output.toLowerCase().includes("not logged in") ? "not-logged-in" : "probe-failed",
          message: output || options.failedMessage || `${options.name || "Provider"} is installed, but the probe failed.`,
          version: cleanDoctorOutput(version.output)
        };
      }
      return {
        ok: /MARKTL_OK/i.test(probe.output),
        status: /MARKTL_OK/i.test(probe.output) ? "ready" : "unexpected-output",
        message: /MARKTL_OK/i.test(probe.output) ? options.readyMessage || `${options.name || "Provider"} is installed, logged in, and ready.` : cleanDoctorOutput(probe.output) || `${options.name || "Provider"} responded, but not with the expected probe text.`,
        version: cleanDoctorOutput(version.output)
      };
    }
    function runCommand(command, args, timeoutMs, input = "") {
      return new Promise((resolve) => {
        const child = spawn2(command, args, {
          env: {
            ...process.env,
            PATH: mergePath(process.env.PATH)
          },
          stdio: ["pipe", "pipe", "pipe"]
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
        if (input) {
          child.stdin.write(input);
        }
        child.stdin.end();
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
      checkCodexProvider: checkCodexProvider2,
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
      const compact = String(markdown || "").replace(/^---[\s\S]*?---\s*/m, "").replace(/```([a-z0-9_-]*)\s*\n([\s\S]*?)```/gi, (_match, lang, code) => {
        const language = String(lang || "").trim().toLowerCase();
        const source = String(code || "").trim();
        const looksLikeDiagram = /^(mermaid|gantt)$/i.test(language) || /^(gantt|graph|flowchart|timeline|journey|mindmap)\b/i.test(source);
        if (/^dataview/.test(language)) {
          return "[dataview query omitted]";
        }
        if (looksLikeDiagram) {
          const fence = language || "mermaid";
          return `\`\`\`${fence}
${source}
\`\`\``;
        }
        return "[code block omitted]";
      }).replace(/!\[\[[^\]]+]]/g, "[embedded asset]").replace(/!\[[^\]]*]\([^)]+\)/g, "[image]").split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
      if (compact.length <= maxChars) {
        return compact;
      }
      return `${compact.slice(0, maxChars).trim()}
[truncated]`;
    }
    function buildContextPackMarkdown2(items, options = {}) {
      const usable = Array.isArray(items) ? items.filter((item) => item && item.content) : [];
      if (!usable.length) {
        return "";
      }
      const kind = options.kind === "reference" ? "reference" : "linked";
      const intro = kind === "reference" ? "Reference context note is available. Treat the active note as today/current facts, and use this reference note only for continuing project context such as schedule, process order, Mermaid/Gantt diagrams, recurring risks, and baseline assumptions." : "Additional vault context is available. Use it only to clarify the active note; do not let it override the source note.";
      return [
        intro,
        ...usable.map((item, index) => [
          `
[${kind === "reference" ? "Reference context note" : `Context note ${index + 1}`}: ${item.path || item.target || "linked note"}]`,
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

// src/core/external-html.js
var require_external_html = __commonJS({
  "src/core/external-html.js"(exports2, module2) {
    "use strict";
    var path = require("node:path");
    var { slugify: slugify2 } = require_html();
    var EXTERNAL_THUMBNAIL_EXTENSIONS = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"]);
    function basenameFromHtmlFileName2(fileName) {
      const cleanName = String(fileName || "uploaded-html").split(/[\\/]/).filter(Boolean).pop() || "uploaded-html";
      const withoutExt = cleanName.replace(/\.html?$/i, "").trim() || cleanName;
      return slugify2(withoutExt);
    }
    function extractExternalHtmlMetadata2(html, fileName = "") {
      const value = String(html || "");
      const fallbackTitle = titleCaseFromFileName(fileName || "HTML upload");
      const title = cleanText(
        firstMatch(value, /<title\b[^>]*>([\s\S]*?)<\/title>/i) || firstMatch(value, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || fallbackTitle
      );
      const excerpt = cleanText(stripHtml(
        firstMatch(value, /<meta\b[^>]*\bname=(["'])description\1[^>]*\bcontent=(["'])(.*?)\2[^>]*>/i, 3) || firstMatch(value, /<meta\b[^>]*\bcontent=(["'])(.*?)\1[^>]*\bname=(["'])description\3[^>]*>/i, 2) || firstMatch(value, /<main\b[^>]*>([\s\S]*?)<\/main>/i) || firstMatch(value, /<body\b[^>]*>([\s\S]*?)<\/body>/i) || value
      )).slice(0, 180);
      return {
        title: title || fallbackTitle,
        excerpt,
        tags: []
      };
    }
    function findExternalHtmlAssetWarnings2(html) {
      const value = String(html || "");
      const warnings = [];
      const attributes = [
        ...collectAttributeValues(value, "src"),
        ...collectAttributeValues(value, "href"),
        ...collectSrcsetValues(value)
      ];
      const localRefs = [...new Set(attributes.map((ref) => String(ref || "").trim()).filter((ref) => ref && isLikelyLocalAssetReference(ref)))];
      if (localRefs.length > 0) {
        warnings.push(`HTML upload warning: ${localRefs.length} relative asset reference(s) were not bundled. Use embedded/data URLs or publish assets separately: ${localRefs.slice(0, 5).join(", ")}`);
      }
      return warnings;
    }
    function externalThumbnailAssetName2(fileName) {
      const extension = externalThumbnailExtension2(fileName);
      if (!EXTERNAL_THUMBNAIL_EXTENSIONS.has(extension)) {
        return "";
      }
      return `thumbnail${extension}`;
    }
    function externalThumbnailExtension2(fileName) {
      const cleanName = String(fileName || "").split(/[\\/]/).filter(Boolean).pop() || "";
      const extension = path.extname(cleanName.split(/[?#]/)[0] || "").toLowerCase();
      return EXTERNAL_THUMBNAIL_EXTENSIONS.has(extension) ? extension : "";
    }
    function isSupportedExternalThumbnailFileName2(fileName) {
      return Boolean(externalThumbnailAssetName2(fileName));
    }
    function collectAttributeValues(html, attributeName) {
      const values = [];
      const pattern = new RegExp(`\\b${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");
      for (const match of String(html || "").matchAll(pattern)) {
        values.push(match[2] || match[3] || match[4] || "");
      }
      return values;
    }
    function collectSrcsetValues(html) {
      return collectAttributeValues(html, "srcset").flatMap((value) => String(value || "").split(",")).map((item) => item.trim().split(/\s+/)[0] || "").filter(Boolean);
    }
    function isLikelyLocalAssetReference(value) {
      const ref = String(value || "").trim();
      if (!ref || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|#|\/\/)/i.test(ref)) {
        return false;
      }
      if (ref.startsWith("{{") || ref.startsWith("<%")) {
        return false;
      }
      const ext = path.extname(ref.split(/[?#]/)[0] || "").toLowerCase();
      return [".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".bmp", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm", ".mp3", ".wav", ".json"].includes(ext);
    }
    function firstMatch(value, pattern, group = 1) {
      const match = pattern.exec(String(value || ""));
      return (match == null ? void 0 : match[group]) || "";
    }
    function stripHtml(value) {
      return String(value || "").replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<svg\b[\s\S]*?<\/svg>/gi, " ").replace(/<[^>]+>/g, " ");
    }
    function cleanText(value) {
      return decodeHtmlEntities(String(value || "")).replace(/\s+/g, " ").trim();
    }
    function titleCaseFromFileName(fileName) {
      var _a;
      return cleanText(((_a = String(fileName || "HTML upload").split(/[\\/]/).filter(Boolean).pop()) == null ? void 0 : _a.replace(/\.html?$/i, "").replace(/[-_]+/g, " ")) || "HTML upload");
    }
    function decodeHtmlEntities(value) {
      return String(value || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
    }
    module2.exports = {
      basenameFromHtmlFileName: basenameFromHtmlFileName2,
      externalThumbnailAssetName: externalThumbnailAssetName2,
      externalThumbnailExtension: externalThumbnailExtension2,
      extractExternalHtmlMetadata: extractExternalHtmlMetadata2,
      findExternalHtmlAssetWarnings: findExternalHtmlAssetWarnings2,
      isSupportedExternalThumbnailFileName: isSupportedExternalThumbnailFileName2,
      isLikelyLocalAssetReference
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
.marktl-reader-feedback { margin: 40px auto 0; padding: 0; }
.marktl-reader-feedback h2 { margin: 0 0 8px; font: 800 22px/1.25 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.marktl-reader-feedback p { margin: 0 0 14px; color: #526173; font: 500 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.marktl-reader-feedback .giscus, .marktl-reader-feedback .giscus-frame { width: 100%; }
</style>
<h2>Reader feedback</h2>
<p>Leave a public GitHub comment or reaction below.</p>
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
    function shouldAttachReaderFeedback2(options = {}) {
      return options.readerFeedbackMode === "giscus" && options.shareTarget !== "local-link";
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
      shouldAttachReaderFeedback: shouldAttachReaderFeedback2,
      validateGiscusConfig: validateGiscusConfig2
    };
  }
});

// src/core/html-repair.js
var require_html_repair = __commonJS({
  "src/core/html-repair.js"(exports2, module2) {
    "use strict";
    function repairObsidianSyntaxResidue2(html) {
      let value = String(html || "");
      if (!value) {
        return value;
      }
      value = removeRawDataviewBlocks(value);
      value = removeFrontmatterResidue(value);
      value = value.replace(/<p>\s*---\s*<\/p>/gi, "<hr>").replace(/(^|\n)\s*---\s*(?=\n|$)/g, "$1<hr>").replace(/\[![-\w]+][+-]?/gi, "").replace(/!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?]]/g, (_match, target, label) => cleanWikiLabel(label || target)).replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?]]/g, (_match, target, label) => cleanWikiLabel(label || target)).replace(/<blockquote>\s*<\/blockquote>/gi, "").replace(/<p>\s*<\/p>/gi, "");
      return value;
    }
    function removeRawDataviewBlocks(value) {
      return String(value || "").replace(/```(?:dataviewjs|dataview)\b[\s\S]*?```/gi, "").replace(/<pre\b[^>]*>\s*<code\b[^>]*class=["'][^"']*\blanguage-(?:dataviewjs|dataview)\b[^"']*["'][^>]*>[\s\S]*?<\/code>\s*<\/pre>/gi, "").replace(/<pre\b[^>]*>\s*<code\b[^>]*>\s*(?:dataviewjs|dataview)\b[\s\S]*?<\/code>\s*<\/pre>/gi, "").replace(/<code\b[^>]*class=["'][^"']*\blanguage-(?:dataviewjs|dataview)\b[^"']*["'][^>]*>[\s\S]*?<\/code>/gi, "").replace(/<code\b[^>]*>\s*(?:dataviewjs|dataview)\b[\s\S]*?<\/code>/gi, "");
    }
    function removeFrontmatterResidue(value) {
      return String(value || "").replace(/(<body\b[^>]*>\s*)---\s*\n[\s\S]{0,2000}?\n---\s*(?=\n|<)/i, "$1").replace(/(^|\n)---\s*\n(?:[A-Za-z0-9_-]+\s*:[^\n]*\n){1,40}---\s*(?=\n|$)/g, "$1");
    }
    function cleanWikiLabel(value) {
      return String(value || "").split("/").pop().replace(/\.(md|markdown)$/i, "").trim();
    }
    module2.exports = {
      repairObsidianSyntaxResidue: repairObsidianSyntaxResidue2
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
      const externalHtml = Boolean(options.externalHtml);
      const artifactGoal = String(options.artifactGoal || "");
      if (trusted && !externalHtml && !/<script\b/i.test(value)) {
        warnings.push("HTML QA: trusted interactive mode produced no script; artifact may be static.");
      }
      if (!trusted && /<script\b|<iframe\b|\son[a-z]+\s*=/i.test(value)) {
        warnings.push("HTML QA: sanitized mode output still contains dynamic markup.");
      }
      if (trusted && ["review", "compare", "tune"].includes(artifactGoal) && !/<button\b|<input\b|<select\b|<textarea\b|contenteditable=/i.test(value)) {
        warnings.push(`HTML QA: ${artifactGoal} artifact has no obvious copy-back or interactive controls.`);
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
      if (/```(?:dataviewjs|dataview)\b|<code\b[^>]*>\s*(?:dataviewjs|dataview)\b|\[![-\w]+][+-]?|\[\[[^\]]+]]|(?:^|\n)\s*---\s*(?:\n|$)/i.test(value)) {
        warnings.push("HTML QA fatal: raw Obsidian-only syntax remains in the HTML.");
      }
      if (!externalHtml && options.exportGenre === "construction-daily") {
        const depth = options.exportDepth || "standard";
        const text = value.replace(/<[^>]+>/g, " ");
        if (!/(공사일보|공사 일보|daily)/i.test(text)) {
          warnings.push("HTML QA: construction daily output does not clearly identify itself as a construction daily report.");
        }
        if (depth === "brief") {
          if (!/(오늘|당일|작업|공정|사진|증빙)/.test(text)) {
            warnings.push("HTML QA: brief construction daily should include today work or evidence.");
          }
        }
        if (depth === "standard") {
          if (!/(리스크|위험|이슈|다음|후속|예정|계획|공정|일정)/.test(text)) {
            warnings.push("HTML QA: standard construction daily should include risk/next-work or schedule context.");
          }
        }
        if (depth === "milestone") {
          if (!/(간트|gantt|mermaid|실행\s*게이트|계획\s*대비|공정\s*흐름|마일스톤)/i.test(text)) {
            warnings.push("HTML QA: milestone construction daily should include schedule/process or plan-versus-actual context.");
          }
        }
      }
      return warnings;
    }
    module2.exports = {
      validateHtmlArtifact: validateHtmlArtifact2
    };
  }
});

// src/core/settings.js
var require_settings = __commonJS({
  "src/core/settings.js"(exports2, module2) {
    "use strict";
    var { normalizeShareHomeSettings, sameShareHomeSettings } = require_share_home_profiles();
    function firstString(...values) {
      for (const value of values) {
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }
      return "";
    }
    function migrateSettings2(defaultSettings, rawSettings) {
      const raw = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
      const settings = Object.assign({}, defaultSettings, raw);
      let migrated = false;
      const legacyRepo = firstString(raw.githubRepository, raw.repository);
      if (!firstString(settings.githubRepo) && legacyRepo) {
        settings.githubRepo = legacyRepo;
        migrated = true;
      }
      const legacyPublishPath = firstString(raw.publishPath, raw.githubPath);
      if ((!firstString(settings.githubPublishPath) || settings.githubPublishPath === defaultSettings.githubPublishPath) && legacyPublishPath) {
        settings.githubPublishPath = legacyPublishPath;
        migrated = true;
      }
      const legacyShareHomeTitle = firstString(raw.shareHomeTitle);
      if ((!firstString(settings.githubShareHomeTitle) || settings.githubShareHomeTitle === defaultSettings.githubShareHomeTitle) && legacyShareHomeTitle) {
        settings.githubShareHomeTitle = legacyShareHomeTitle;
        migrated = true;
      }
      if (!Array.isArray(raw.shareHomeProfiles) || raw.shareHomeProfiles.length === 0) {
        settings.shareHomeProfiles = [];
        settings.activeShareHomeProfileId = "";
      }
      const shareHomeSettings = normalizeShareHomeSettings(settings);
      if (!sameShareHomeSettings(settings, shareHomeSettings)) {
        settings.shareHomeProfiles = shareHomeSettings.shareHomeProfiles;
        settings.activeShareHomeProfileId = shareHomeSettings.activeShareHomeProfileId;
        migrated = true;
      }
      return { settings, migrated };
    }
    module2.exports = {
      migrateSettings: migrateSettings2
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
        id: "construction-daily-report",
        name: "Construction Daily",
        description: "Korean construction daily report with large lead infographic, concise Mermaid-style flow maps, and execution-gate Gantt UI.",
        artifactGoal: "review",
        artifactType: "research-report",
        template: "construction-daily",
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
    function listExportPresets() {
      return exportPresets.slice();
    }
    function findExportPreset(id) {
      return exportPresets.find((preset) => preset.id === id) || null;
    }
    function applyPresetToOptions2(baseOptions, presetId) {
      const preset = findExportPreset(presetId);
      if (!preset) {
        return { ...baseOptions };
      }
      return {
        ...baseOptions,
        presetId: preset.id,
        artifactGoal: preset.artifactGoal,
        artifactType: preset.artifactType,
        template: preset.template,
        conversionMode: preset.mode,
        previewSecurity: preset.previewSecurity
      };
    }
    function findPresetForOptions(options = {}) {
      const preset = exportPresets.find((item) => item.artifactGoal === options.artifactGoal && item.artifactType === options.artifactType && item.template === options.template && item.mode === options.conversionMode && item.previewSecurity === options.previewSecurity);
      return preset ? preset.id : "custom";
    }
    module2.exports = {
      applyPresetToOptions: applyPresetToOptions2,
      findExportPreset,
      findPresetForOptions,
      listExportPresets
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MarktlPlugin
});
module.exports = __toCommonJS(main_exports);
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");
var import_obsidian8 = require("obsidian");

// src/export-modal.ts
var import_obsidian = require("obsidian");
var import_artifact_goals = __toESM(require_artifact_goals());
var import_ai = __toESM(require_ai());
var import_export_profiles = __toESM(require_export_profiles());
var import_templates = __toESM(require_templates());
var { createShareHomeProfile, describeShareHomeProfile, normalizeShareHomeProfiles, resolveShareHomeProfile } = require_share_home_profiles();
var ReferenceNoteSuggestModal = class extends import_obsidian.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder("\uAE30\uC900 \uB9E5\uB77D\uC73C\uB85C \uC0AC\uC6A9\uD560 Markdown \uB178\uD2B8\uB97C \uC120\uD0DD\uD558\uC138\uC694");
    this.emptyStateText = "\uC120\uD0DD\uD560 Markdown \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
  }
  getItems() {
    return this.app.vault.getMarkdownFiles().slice().sort((left, right) => left.path.localeCompare(right.path));
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};
var ShareHomeProfileEditModal = class extends import_obsidian.Modal {
  constructor(app, mode, profile, profiles, onSave) {
    super(app);
    this.mode = mode;
    this.draft = { ...profile };
    this.profiles = profiles;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle(this.mode === "create" ? "\uACF5\uC720 \uD5C8\uBE0C \uB9CC\uB4E4\uAE30" : "\uACF5\uC720 \uD5C8\uBE0C \uC218\uC815");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "\uD5C8\uBE0C\uB294 \uACF5\uC720 \uBA54\uC778\uD398\uC774\uC9C0\uC785\uB2C8\uB2E4. \uAC8C\uC2DC \uACBD\uB85C\uAC00 \uB2E4\uB974\uBA74 \uD504\uB85C\uC81D\uD2B8\uB098 \uC5C5\uBB34 \uBD84\uC57C\uBCC4\uB85C \uBCC4\uB3C4\uC758 \uBA54\uC778\uD398\uC774\uC9C0\uC640 \uC11C\uBE0C\uD398\uC774\uC9C0 \uBB36\uC74C\uC744 \uC6B4\uC601\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
    new import_obsidian.Setting(contentEl).setName("\uD5C8\uBE0C \uBA85\uCE6D").setDesc("\uC120\uD0DD \uCE74\uB4DC\uC640 \uBA54\uC778\uD398\uC774\uC9C0 \uC81C\uBAA9\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.").addText((text) => text.setPlaceholder("\uC608: \uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8").setValue(this.draft.title).onChange((value) => {
      this.draft.title = value;
    }));
    new import_obsidian.Setting(contentEl).setName("\uAC8C\uC2DC \uACBD\uB85C").setDesc("GitHub Pages \uC800\uC7A5\uC18C \uC548\uC758 \uD3F4\uB354\uC785\uB2C8\uB2E4. \uC608: marktl, marktl/work, marktl/research").addText((text) => text.setPlaceholder("marktl/project").setValue(this.draft.basePath).onChange((value) => {
      this.draft.basePath = value;
    }));
    new import_obsidian.Setting(contentEl).setName("\uC0C1\uB2E8 \uBC30\uC9C0").setDesc("\uBA54\uC778\uD398\uC774\uC9C0 \uC67C\uCABD \uC704 \uC791\uC740 \uBD84\uB958\uBA85\uC785\uB2C8\uB2E4.").addText((text) => text.setPlaceholder("\uC608: Project Archive").setValue(this.draft.eyebrow).onChange((value) => {
      this.draft.eyebrow = value;
    }));
    new import_obsidian.Setting(contentEl).setName("\uD5C8\uBE0C \uC124\uBA85").setDesc("\uBA54\uC778\uD398\uC774\uC9C0 H1 \uC544\uB798 \uC124\uBA85\uBB38\uC785\uB2C8\uB2E4.").addTextArea((text) => {
      text.inputEl.rows = 3;
      text.setPlaceholder("\uC774 \uD5C8\uBE0C\uC5D0\uC11C \uAD00\uB9AC\uD560 \uBB38\uC11C \uBC94\uC704\uC640 \uBAA9\uC801\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.").setValue(this.draft.description).onChange((value) => {
        this.draft.description = value;
      });
    });
    new import_obsidian.Setting(contentEl).addButton((button) => button.setButtonText("\uCDE8\uC18C").onClick(() => this.close())).addButton((button) => button.setButtonText(this.mode === "create" ? "\uD5C8\uBE0C \uB9CC\uB4E4\uAE30" : "\uC218\uC815 \uC800\uC7A5").setCta().onClick(() => this.save()));
  }
  onClose() {
    this.contentEl.empty();
  }
  save() {
    if (!this.draft.title.trim()) {
      new import_obsidian.Notice("\uACF5\uC720 \uD5C8\uBE0C \uBA85\uCE6D\uC744 \uC785\uB825\uD558\uC138\uC694.");
      return;
    }
    const [candidate] = normalizeShareHomeProfiles([this.draft], {});
    const hasDuplicatePath = this.profiles.some((profile) => {
      if (profile.id === candidate.id) {
        return false;
      }
      const [normalized] = normalizeShareHomeProfiles([profile], {});
      return normalized.basePath === candidate.basePath;
    });
    if (hasDuplicatePath) {
      new import_obsidian.Notice("\uAC19\uC740 \uAC8C\uC2DC \uACBD\uB85C\uB97C \uC0AC\uC6A9\uD558\uB294 \uACF5\uC720 \uD5C8\uBE0C\uAC00 \uC774\uBBF8 \uC788\uC2B5\uB2C8\uB2E4.");
      return;
    }
    this.onSave(candidate);
    this.close();
  }
};
var MarktlExportModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit, onUploadHtml) {
    super(app);
    this.showAdvanced = false;
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.onUploadHtml = onUploadHtml;
    this.modalEl.addClass("marktl-export-modal");
    const baseOptions = {
      presetId: "custom",
      shareHomeProfileId: plugin.settings.activeShareHomeProfileId,
      template: plugin.settings.template,
      artifactGoal: plugin.settings.artifactGoal,
      artifactType: plugin.settings.artifactType,
      exportGenre: plugin.settings.exportGenre,
      exportDepth: plugin.settings.exportDepth,
      exportPurpose: plugin.settings.exportPurpose,
      referenceContextNotePath: plugin.settings.referenceContextNotePath,
      aiProvider: plugin.settings.aiProvider,
      conversionMode: plugin.settings.conversionMode,
      failurePolicy: plugin.settings.failurePolicy,
      previewSecurity: plugin.settings.previewSecurity,
      contextPackMode: plugin.settings.contextPackMode,
      readerFeedbackMode: plugin.settings.readerFeedbackMode,
      shareTarget: plugin.settings.shareTarget,
      copyShareLinkAfterExport: plugin.settings.copyShareLinkAfterExport
    };
    this.options = (0, import_export_profiles.applySelectionProfile)(baseOptions, baseOptions);
    this.options.presetId = "custom";
    this.options.referenceContextNotePath = baseOptions.referenceContextNotePath;
    this.options.contextPackMode = baseOptions.contextPackMode === "reference-note" && baseOptions.referenceContextNotePath ? "reference-note" : baseOptions.contextPackMode === "linked-notes" ? "linked-notes" : "none";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("\uB178\uD2B8\uB97C HTML\uB85C \uB0B4\uBCF4\uB0B4\uAE30");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "HTML \uD488\uC9C8\uC5D0 \uC9C1\uC811 \uC601\uD5A5\uC744 \uC8FC\uB294 \uC120\uD0DD\uB9CC \uBA3C\uC800 \uC815\uD569\uB2C8\uB2E4. \uC138\uBD80 \uC2E4\uD589\xB7\uACF5\uC720 \uC635\uC158\uC740 \uAE30\uD0C0 \uC124\uC815\uC5D0\uC11C \uC870\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
    this.renderShareHomeSelector(contentEl);
    this.renderDirectHtmlUpload(contentEl);
    this.renderDecisionRail(contentEl);
    this.renderContextSelector(contentEl);
    this.renderExecutionSummary(contentEl);
    new import_obsidian.Setting(contentEl).setName("\uAE30\uD0C0 \uC124\uC815").setDesc("AI CLI, \uC2E4\uD328 \uCC98\uB9AC, \uBCF4\uC548, \uB313\uAE00, \uACF5\uC720 \uB300\uC0C1\uCC98\uB7FC \uC790\uC8FC \uBC14\uAFB8\uC9C0 \uC54A\uB294 \uC2E4\uD589 \uC635\uC158\uC785\uB2C8\uB2E4.").addButton((button) => button.setButtonText(this.showAdvanced ? "\uAE30\uD0C0 \uC124\uC815 \uC228\uAE30\uAE30" : "\uAE30\uD0C0 \uC124\uC815 \uC5F4\uAE30").onClick(() => {
      this.showAdvanced = !this.showAdvanced;
      this.onOpen();
    }));
    if (this.showAdvanced) {
      this.renderAdvanced(contentEl);
    }
    this.renderActions(contentEl);
  }
  renderDirectHtmlUpload(container) {
    const section = container.createDiv({ cls: "marktl-choice-section marktl-html-upload-section" });
    const header = section.createDiv({ cls: "marktl-choice-header" });
    header.createEl("span", { cls: "marktl-choice-step marktl-choice-step-hub", text: "HTML" });
    const copy = header.createDiv();
    copy.createEl("h3", { text: "\uC644\uC131 HTML \uBC14\uB85C \uC5C5\uB85C\uB4DC" });
    copy.createEl("p", { text: "\uC774\uBBF8 \uB9CC\uB4E0 HTML \uD30C\uC77C\uC744 \uC120\uD0DD\uD55C \uACF5\uC720 \uD5C8\uBE0C\uC758 \uC11C\uBE0C\uD398\uC774\uC9C0\uB85C \uBC14\uB85C \uAC8C\uC2DC\uD569\uB2C8\uB2E4. \uB178\uD2B8 \uBCC0\uD658\uACFC AI \uC2E4\uD589\uC740 \uAC74\uB108\uB701\uB2C8\uB2E4." });
    const actions = section.createDiv({ cls: "marktl-reference-row marktl-html-upload-row" });
    actions.createEl("span", {
      text: "\uB2E8\uC77C HTML \uD30C\uC77C \uAE30\uC900\uC785\uB2C8\uB2E4. \uB300\uD45C \uC378\uB124\uC77C\uC740 \uD5C8\uBE0C \uCE74\uB4DC\uC5D0\uB9CC \uC4F0\uC774\uBA70, HTML \uC548\uC758 \uC0C1\uB300 \uACBD\uB85C \uC774\uBBF8\uC9C0\xB7CSS\xB7JS\uB294 \uD568\uAED8 \uBB36\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    });
    actions.createEl("button", { text: "HTML\uB9CC \uC5C5\uB85C\uB4DC", type: "button" }).addEventListener("click", () => {
      this.close();
      this.onUploadHtml(this.options, false);
    });
    actions.createEl("button", { text: "HTML + \uC378\uB124\uC77C \uC5C5\uB85C\uB4DC", type: "button" }).addEventListener("click", () => {
      this.close();
      this.onUploadHtml(this.options, true);
    });
  }
  onClose() {
    this.contentEl.empty();
  }
  renderDecisionRail(container) {
    const rail = container.createDiv({ cls: "marktl-decision-rail" });
    this.renderChoiceGroup(rail, "1", "\uBB38\uC11C \uC7A5\uB974", "\uB178\uD2B8\uC758 \uD070 \uC131\uACA9\uC744 \uC815\uD569\uB2C8\uB2E4.", (0, import_export_profiles.listExportGenres)(), this.options.exportGenre, (value) => {
      this.applyPrimarySelection({ exportGenre: value });
    });
    this.renderChoiceGroup(rail, "2", "\uC791\uC131 \uAE4A\uC774", "\uACB0\uACFC\uBB3C\uC758 \uBC00\uB3C4\uC640 \uD544\uC218 \uC139\uC158\uC744 \uC815\uD569\uB2C8\uB2E4.", (0, import_export_profiles.listExportDepths)(), this.options.exportDepth, (value) => {
      this.applyPrimarySelection({ exportDepth: value });
    });
    this.renderChoiceGroup(rail, "3", "\uC0AC\uC6A9 \uBAA9\uC801", "\uB3C5\uC790\uC640 \uBB38\uCCB4, \uB2E4\uC74C \uD589\uB3D9\uC744 \uC815\uD569\uB2C8\uB2E4.", (0, import_export_profiles.listExportPurposes)(), this.options.exportPurpose, (value) => {
      this.applyPrimarySelection({ exportPurpose: value });
    });
  }
  renderShareHomeSelector(container) {
    const profiles = normalizeShareHomeProfiles(this.plugin.settings.shareHomeProfiles, this.plugin.settings);
    const selectedProfile = resolveShareHomeProfile({
      ...this.plugin.settings,
      shareHomeProfiles: profiles,
      activeShareHomeProfileId: this.options.shareHomeProfileId
    }, this.options.shareHomeProfileId);
    this.options.shareHomeProfileId = selectedProfile.id;
    const section = container.createDiv({ cls: "marktl-choice-section marktl-hub-section" });
    const header = section.createDiv({ cls: "marktl-choice-header" });
    header.createEl("span", { cls: "marktl-choice-step marktl-choice-step-hub", text: "\uD5C8\uBE0C" });
    const copy = header.createDiv();
    copy.createEl("h3", { text: "\uACF5\uC720 \uD5C8\uBE0C" });
    copy.createEl("p", { text: "\uC774\uBC88 HTML\uC774 \uC5B4\uB290 \uBA54\uC778\uD398\uC774\uC9C0\uC758 \uC11C\uBE0C\uD398\uC774\uC9C0\uB85C \uB4E4\uC5B4\uAC08\uC9C0 \uBA3C\uC800 \uC815\uD569\uB2C8\uB2E4." });
    const grid = section.createDiv({ cls: "marktl-choice-grid marktl-hub-grid" });
    for (const profile of profiles) {
      const isSelected = selectedProfile.id === profile.id;
      const description2 = describeShareHomeProfile(profile, this.plugin.settings);
      const button = grid.createEl("button", {
        cls: `marktl-choice-card marktl-hub-card${isSelected ? " is-selected" : ""}`,
        type: "button"
      });
      button.setAttr("aria-pressed", String(isSelected));
      button.setAttr("title", `${profile.title}: ${description2.pathLabel}`);
      button.createEl("strong", { text: profile.title });
      button.createEl("span", { text: `${description2.pathLabel} \xB7 ${profile.description}` });
      button.addEventListener("click", () => {
        this.options.shareHomeProfileId = profile.id;
        this.onOpen();
      });
    }
    const selected = section.createDiv({ cls: "marktl-reference-row marktl-hub-summary" });
    const description = describeShareHomeProfile(selectedProfile, this.plugin.settings);
    selected.createEl("span", {
      text: description.homeUrl ? `\uC120\uD0DD\uB41C \uD5C8\uBE0C: ${selectedProfile.title} \xB7 ${description.homeUrl}` : `\uC120\uD0DD\uB41C \uD5C8\uBE0C: ${selectedProfile.title} \xB7 \uAC8C\uC2DC \uACBD\uB85C ${description.pathLabel}`
    });
    const actions = section.createDiv({ cls: "marktl-hub-actions" });
    actions.createEl("button", { text: "\uC0C8 \uD5C8\uBE0C", type: "button" }).addEventListener("click", () => this.openShareHomeCreateModal(profiles));
    actions.createEl("button", { text: "\uC120\uD0DD \uD5C8\uBE0C \uC218\uC815", type: "button" }).addEventListener("click", () => this.openShareHomeEditModal(selectedProfile, profiles));
    actions.createEl("button", { text: "\uAC8C\uC2DC\uBB3C \uAD00\uB9AC", type: "button" }).addEventListener("click", () => {
      this.close();
      this.plugin.openPublishedHtmlManager(selectedProfile.id);
    });
    const deleteButton = actions.createEl("button", {
      cls: "marktl-danger-button",
      text: "\uC120\uD0DD \uD5C8\uBE0C \uC0AD\uC81C",
      type: "button"
    });
    deleteButton.toggleAttribute("disabled", profiles.length <= 1);
    deleteButton.addEventListener("click", () => {
      void this.deleteShareHomeProfile(selectedProfile, profiles);
    });
  }
  renderChoiceGroup(container, step, title, desc, choices, selected, onChoose) {
    const section = container.createDiv({ cls: "marktl-choice-section" });
    const header = section.createDiv({ cls: "marktl-choice-header" });
    header.createEl("span", { cls: "marktl-choice-step", text: step });
    const copy = header.createDiv();
    copy.createEl("h3", { text: title });
    copy.createEl("p", { text: desc });
    const grid = section.createDiv({ cls: "marktl-choice-grid" });
    for (const choice of choices) {
      const isSelected = selected === choice.id;
      const button = grid.createEl("button", {
        cls: `marktl-choice-card${isSelected ? " is-selected" : ""}`,
        type: "button"
      });
      button.setAttr("aria-pressed", String(isSelected));
      button.setAttr("title", `${choice.label}: ${choice.description}`);
      button.createEl("strong", { text: choice.label });
      button.createEl("span", { text: choice.description });
      button.addEventListener("click", () => onChoose(choice.id));
    }
  }
  renderContextSelector(container) {
    const section = container.createDiv({ cls: "marktl-choice-section marktl-context-section" });
    const header = section.createDiv({ cls: "marktl-choice-header" });
    header.createEl("span", { cls: "marktl-choice-step", text: "4" });
    const copy = header.createDiv();
    copy.createEl("h3", { text: "\uAE30\uC900 \uB9E5\uB77D \uB178\uD2B8" });
    copy.createEl("p", { text: "\uD604\uC7AC \uB178\uD2B8\uB9CC \uC0AC\uC6A9\uD560\uC9C0, \uC0AC\uC6A9\uC790\uAC00 \uC9C0\uC815\uD55C \uAE30\uC900 \uB178\uD2B8\uC758 \uC77C\uC815\xB7\uACF5\uC815 \uB9E5\uB77D\uC744 \uD568\uAED8 \uC0AC\uC6A9\uD560\uC9C0 \uC815\uD569\uB2C8\uB2E4." });
    const modeGrid = section.createDiv({ cls: "marktl-choice-grid marktl-context-grid" });
    const activeOnly = modeGrid.createEl("button", {
      cls: `marktl-choice-card${this.options.contextPackMode !== "reference-note" ? " is-selected" : ""}`,
      type: "button"
    });
    activeOnly.setAttr("aria-pressed", String(this.options.contextPackMode !== "reference-note"));
    activeOnly.setAttr("title", "\uD604\uC7AC \uB178\uD2B8\uB9CC \uC0AC\uC6A9: \uB2F9\uC77C \uB178\uD2B8\uC758 \uB0B4\uC6A9\uB9CC\uC73C\uB85C HTML\uC744 \uB9CC\uB4ED\uB2C8\uB2E4.");
    activeOnly.createEl("strong", { text: "\uD604\uC7AC \uB178\uD2B8\uB9CC \uC0AC\uC6A9" });
    activeOnly.createEl("span", { text: "\uB2F9\uC77C \uB178\uD2B8\uC758 \uB0B4\uC6A9\uB9CC\uC73C\uB85C HTML\uC744 \uB9CC\uB4ED\uB2C8\uB2E4." });
    activeOnly.addEventListener("click", () => {
      this.options.contextPackMode = "none";
      this.onOpen();
    });
    const reference = modeGrid.createEl("button", {
      cls: `marktl-choice-card${this.options.contextPackMode === "reference-note" ? " is-selected" : ""}`,
      type: "button"
    });
    reference.setAttr("aria-pressed", String(this.options.contextPackMode === "reference-note"));
    reference.setAttr("title", "\uC9C0\uC815 \uAE30\uC900 \uB178\uD2B8 \uC0AC\uC6A9: \uC120\uD0DD\uD55C \uC885\uD569/\uB9C8\uC77C\uC2A4\uD1A4 \uB178\uD2B8\uC758 \uC77C\uC815, \uAC04\uD2B8, \uACF5\uC815 \uB9E5\uB77D\uC744 \uCC38\uACE0\uD569\uB2C8\uB2E4.");
    reference.createEl("strong", { text: "\uC9C0\uC815 \uAE30\uC900 \uB178\uD2B8 \uC0AC\uC6A9" });
    reference.createEl("span", { text: "\uC120\uD0DD\uD55C \uC885\uD569/\uB9C8\uC77C\uC2A4\uD1A4 \uB178\uD2B8\uC758 \uC77C\uC815, \uAC04\uD2B8, \uACF5\uC815 \uB9E5\uB77D\uC744 \uCC38\uACE0\uD569\uB2C8\uB2E4." });
    reference.addEventListener("click", () => {
      this.options.contextPackMode = "reference-note";
      if (!this.options.referenceContextNotePath) {
        this.openReferencePicker();
        return;
      }
      this.onOpen();
    });
    const selected = section.createDiv({ cls: "marktl-reference-row" });
    selected.createEl("span", {
      text: this.options.referenceContextNotePath ? `\uC120\uD0DD\uB41C \uAE30\uC900 \uB178\uD2B8: ${this.options.referenceContextNotePath}` : "\uC120\uD0DD\uB41C \uAE30\uC900 \uB178\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    });
    selected.createEl("button", { text: this.options.referenceContextNotePath ? "\uAE30\uC900 \uB178\uD2B8 \uBCC0\uACBD" : "\uAE30\uC900 \uB178\uD2B8 \uC120\uD0DD", type: "button" }).addEventListener("click", () => this.openReferencePicker());
    if (this.options.referenceContextNotePath) {
      selected.createEl("button", { text: "\uD574\uC81C", type: "button" }).addEventListener("click", () => {
        this.options.referenceContextNotePath = "";
        this.options.contextPackMode = "none";
        this.onOpen();
      });
    }
  }
  renderExecutionSummary(container) {
    const summary = container.createDiv({ cls: "marktl-execution-summary" });
    summary.createEl("strong", { text: (0, import_export_profiles.describeExecutionProfile)(this.options) });
    summary.createEl("span", {
      text: [
        `\uC2E4\uD589 \uD504\uB85C\uD544: ${this.options.artifactGoal}`,
        this.options.artifactType,
        this.options.template,
        this.options.conversionMode,
        this.options.previewSecurity
      ].join(" \xB7 ")
    });
  }
  renderAdvanced(container) {
    new import_obsidian.Setting(container).setName("\uB3C5\uC790 \uC791\uC5C5").setDesc("\uB0B4\uBD80 \uC2E4\uD589 \uD504\uB85C\uD544\uC785\uB2C8\uB2E4. \uC77C\uBC18\uC801\uC73C\uB85C \uC704 1-3\uB2E8\uACC4 \uC120\uD0DD\uB9CC \uC0AC\uC6A9\uD558\uC138\uC694.").addDropdown((dropdown) => {
      for (const goal of (0, import_artifact_goals.listArtifactGoals)()) {
        dropdown.addOption(goal.id, goal.name);
      }
      dropdown.setValue(this.options.artifactGoal).onChange((value) => {
        this.options.presetId = "custom";
        this.options.artifactGoal = value;
      });
    });
    new import_obsidian.Setting(container).setName("\uB0B4\uC6A9 \uAD6C\uC870").setDesc("\uC815\uBCF4 \uBC30\uC5F4 \uBC29\uC2DD\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("faithful-note", "\uC6D0\uBB38 \uCDA9\uC2E4 \uB178\uD2B8").addOption("strategy-brief", "\uC804\uB7B5 \uBE0C\uB9AC\uD504").addOption("research-report", "\uB9AC\uD3EC\uD2B8").addOption("decision-memo", "\uC758\uC0AC\uACB0\uC815 \uBA54\uBAA8").addOption("interactive-explainer", "\uC778\uD130\uB799\uD2F0\uBE0C \uC124\uBA85\uC11C").addOption("slide-deck", "\uBC1C\uD45C \uC2AC\uB77C\uC774\uB4DC").setValue(this.options.artifactType).onChange((value) => {
      this.options.presetId = "custom";
      this.options.artifactType = value;
    }));
    new import_obsidian.Setting(container).setName("\uD654\uBA74 \uC2A4\uD0C0\uC77C").setDesc("\uC2DC\uAC01 \uBC29\uD5A5\uACFC \uB85C\uCEEC fallback \uC2A4\uD0C0\uC77C\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => {
      for (const template of (0, import_templates.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.options.template).onChange((value) => {
        this.options.presetId = "custom";
        this.options.template = value;
      });
    });
    new import_obsidian.Setting(container).setName("AI CLI").setDesc((0, import_ai.getProviderPrivacyNote)(this.options.aiProvider) || "\uAC80\uC99D\uB41C provider\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("none", "\uC0AC\uC6A9 \uC548 \uD568 / \uB85C\uCEEC \uBCC0\uD658").addOption("claude", "Claude Code CLI").addOption("codex", "Codex CLI").setValue(this.options.aiProvider).onChange((value) => {
      this.options.aiProvider = value;
      this.onOpen();
    }));
    new import_obsidian.Setting(container).setName("\uC7AC\uAD6C\uC131 \uAC15\uB3C4").setDesc("\uBCF4\uC874\uC740 \uC6D0\uBB38\uC5D0 \uCDA9\uC2E4\uD558\uACE0, \uBC1C\uD45C/\uAE30\uC0AC\uD615\uC740 AI\uAC00 \uAD6C\uC870\uB97C \uB354 \uC7AC\uBC30\uCE58\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("preserve", "\uC6D0\uBB38 \uBCF4\uC874").addOption("presentation", "\uBC1C\uD45C\uD615 \uC7AC\uAD6C\uC131").addOption("blog", "\uAE30\uC0AC\uD615 \uC7AC\uAD6C\uC131").addOption("landing", "\uB79C\uB529\uD615 \uC7AC\uAD6C\uC131").setValue(this.options.conversionMode).onChange((value) => {
      this.options.presetId = "custom";
      this.options.conversionMode = value;
    }));
    new import_obsidian.Setting(container).setName("\uC778\uD130\uB799\uC158 \uD5C8\uC6A9").setDesc("\uC2E0\uB8B0 \uBAA8\uB4DC\uB294 HTML \uC548\uC758 \uB85C\uCEEC JavaScript\uB97C \uD5C8\uC6A9\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("sanitized", "\uC548\uC804\uD55C \uC815\uC801 \uBBF8\uB9AC\uBCF4\uAE30").addOption("trusted", "\uC2E0\uB8B0 \uC778\uD130\uB799\uD2F0\uBE0C \uBBF8\uB9AC\uBCF4\uAE30").setValue(this.options.previewSecurity).onChange((value) => {
      this.options.presetId = "custom";
      this.options.previewSecurity = value;
    }));
    new import_obsidian.Setting(container).setName("\uB9E5\uB77D \uCC98\uB9AC").setDesc("\uAE30\uBCF8 \uD654\uBA74\uC758 \uAE30\uC900 \uB178\uD2B8 \uC120\uD0DD\uC744 \uC6B0\uC120 \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC5F0\uACB0 \uB178\uD2B8 \uD3EC\uD568\uC740 \uAE30\uC874 \uD638\uD658 \uC635\uC158\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("none", "\uD604\uC7AC \uB178\uD2B8\uB9CC").addOption("reference-note", "\uC9C0\uC815 \uAE30\uC900 \uB178\uD2B8").addOption("linked-notes", "\uC5F0\uACB0 \uB178\uD2B8 \uD3EC\uD568").setValue(this.options.contextPackMode).onChange((value) => {
      this.options.contextPackMode = value;
    }));
    new import_obsidian.Setting(container).setName("\uB3C5\uC790 \uD53C\uB4DC\uBC31").setDesc("Giscus\uB294 GitHub \uB313\uAE00/\uBC18\uC751\uC744 \uBD99\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("none", "\uB313\uAE00 \uC5C6\uC74C").addOption("giscus", "Giscus GitHub \uB313\uAE00").setValue(this.options.readerFeedbackMode).onChange((value) => {
      this.options.readerFeedbackMode = value;
    }));
    new import_obsidian.Setting(container).setName("AI \uC2E4\uD328 \uCC98\uB9AC").setDesc("GitHub Pages \uAC8C\uC2DC\uC5D0\uC11C\uB294 strict\uAC00 \uAC15\uC81C\uB429\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("fallback", "\uACBD\uACE0 \uD6C4 \uB85C\uCEEC fallback").addOption("strict", "\uC2E4\uD328 \uC2DC \uC911\uB2E8").setValue(this.options.failurePolicy).onChange((value) => {
      this.options.failurePolicy = value;
    }));
    new import_obsidian.Setting(container).setName("\uACF5\uC720 \uB300\uC0C1").setDesc("GitHub Pages\uB294 \uC131\uACF5\uD55C AI HTML\uB9CC \uAC8C\uC2DC\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => dropdown.addOption("local-link", "\uB85C\uCEEC \uD30C\uC77C \uB9C1\uD06C").addOption("static-bundle", "\uC815\uC801 \uD638\uC2A4\uD305 \uBC88\uB4E4").addOption("github-pages", "GitHub Pages \uB9C1\uD06C").setValue(this.options.shareTarget).onChange((value) => {
      this.options.shareTarget = value;
      if (value === "github-pages") {
        this.options.previewSecurity = "trusted";
        this.options.readerFeedbackMode = "giscus";
        this.options.copyShareLinkAfterExport = true;
      }
    }));
    new import_obsidian.Setting(container).setName("\uACF5\uC720 \uB9C1\uD06C \uBCF5\uC0AC").setDesc("\uB0B4\uBCF4\uB0B4\uAE30 \uD6C4 \uACF5\uAC1C URL \uB610\uB294 \uB85C\uCEEC \uB9C1\uD06C\uB97C \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uD569\uB2C8\uB2E4.").addToggle((toggle) => toggle.setValue(this.options.copyShareLinkAfterExport).onChange((value) => {
      this.options.copyShareLinkAfterExport = value;
    }));
  }
  applyPrimarySelection(partial) {
    const next = {
      ...this.options,
      ...partial
    };
    this.options = (0, import_export_profiles.applySelectionProfile)(next, next);
    this.options.presetId = "custom";
    this.onOpen();
  }
  openReferencePicker() {
    new ReferenceNoteSuggestModal(this.app, (file) => {
      this.options.referenceContextNotePath = file.path;
      this.options.contextPackMode = "reference-note";
      this.onOpen();
    }).open();
  }
  openShareHomeCreateModal(profiles) {
    const next = createShareHomeProfile(profiles);
    new ShareHomeProfileEditModal(this.app, "create", next, profiles, (profile) => {
      void this.persistShareHomeProfiles([...profiles, profile], profile.id);
    }).open();
  }
  openShareHomeEditModal(profile, profiles) {
    new ShareHomeProfileEditModal(this.app, "edit", profile, profiles, (updatedProfile) => {
      const nextProfiles = profiles.map((candidate) => candidate.id === profile.id ? updatedProfile : candidate);
      void this.persistShareHomeProfiles(nextProfiles, updatedProfile.id);
    }).open();
  }
  async deleteShareHomeProfile(profile, profiles) {
    var _a;
    if (profiles.length <= 1) {
      return;
    }
    const confirmed = window.confirm(`\uACF5\uC720 \uD5C8\uBE0C "${profile.title}"\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?
\uC774\uBBF8 GitHub Pages\uC5D0 \uC62C\uB77C\uAC04 \uD30C\uC77C\uC740 \uC790\uB3D9 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`);
    if (!confirmed) {
      return;
    }
    const remaining = profiles.filter((candidate) => candidate.id !== profile.id);
    await this.persistShareHomeProfiles(remaining, ((_a = remaining[0]) == null ? void 0 : _a.id) || "");
    new import_obsidian.Notice("\uACF5\uC720 \uD5C8\uBE0C\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.");
  }
  async persistShareHomeProfiles(profiles, activeProfileId) {
    const normalized = normalizeShareHomeProfiles(profiles, this.plugin.settings);
    const activeProfile = normalized.find((profile) => profile.id === activeProfileId) || normalized[0];
    this.plugin.settings.shareHomeProfiles = normalized;
    this.plugin.settings.activeShareHomeProfileId = (activeProfile == null ? void 0 : activeProfile.id) || "";
    if (activeProfile) {
      this.plugin.settings.githubPublishPath = activeProfile.basePath;
      this.plugin.settings.githubShareHomeTitle = activeProfile.title;
      this.options.shareHomeProfileId = activeProfile.id;
    }
    await this.plugin.saveSettings();
    new import_obsidian.Notice("\uACF5\uC720 \uD5C8\uBE0C \uC124\uC815\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.");
    this.onOpen();
  }
  renderActions(container) {
    new import_obsidian.Setting(container).addButton((button) => button.setButtonText("\uB0B4\uBCF4\uB0B4\uAE30").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.options);
    })).addButton((button) => button.setButtonText("\uAE30\uBCF8\uAC12\uC73C\uB85C \uC800\uC7A5").onClick(async () => {
      const { presetId: _presetId, shareHomeProfileId, ...settings } = this.options;
      Object.assign(this.plugin.settings, settings);
      this.plugin.settings.activeShareHomeProfileId = shareHomeProfileId;
      const activeProfile = resolveShareHomeProfile(this.plugin.settings, shareHomeProfileId);
      if (activeProfile) {
        this.plugin.settings.githubPublishPath = activeProfile.basePath;
        this.plugin.settings.githubShareHomeTitle = activeProfile.title;
      }
      await this.plugin.saveSettings();
      this.close();
      this.onSubmit(this.options);
    }));
  }
};

// src/published-html-modal.ts
var import_obsidian2 = require("obsidian");
var MarktlPublishedHtmlModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, shareHomeProfileId = "") {
    super(app);
    this.plugin = plugin;
    this.shareHomeProfileId = shareHomeProfileId;
  }
  onOpen() {
    void this.render();
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\uAC8C\uC2DC\uB41C MarkTL HTML" });
    const description = contentEl.createEl("p", {
      text: "\uD604\uC7AC \uC120\uD0DD\uB41C \uACF5\uC720 \uD5C8\uBE0C\uC758 \uAC8C\uC2DC\uBB3C\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4. \uC798\uBABB \uC62C\uB9B0 \uC11C\uBE0C\uD398\uC774\uC9C0\uB294 \uC644\uC804 \uC0AD\uC81C\uD558\uACE0, \uCE74\uB4DC \uC378\uB124\uC77C\uC740 \uAC8C\uC2DC \uD6C4\uC5D0\uB3C4 \uAD50\uCCB4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
    description.addClass("setting-item-description");
    const statusEl = contentEl.createEl("div");
    const controls = contentEl.createDiv();
    new import_obsidian2.Setting(controls).addButton((button) => button.setButtonText("\uC0C8\uB85C\uACE0\uCE68").onClick(() => void this.render())).addButton((button) => button.setButtonText("\uC778\uB371\uC2A4 \uBA54\uD0C0\uB370\uC774\uD130 \uBCF5\uAD6C").setCta().onClick(async () => {
      statusEl.setText("\uACF5\uAC1C \uC778\uB371\uC2A4\uB97C \uBCF5\uAD6C\uD558\uB294 \uC911...");
      try {
        const index = await this.plugin.repairPublishedShareIndex(this.shareHomeProfileId);
        new import_obsidian2.Notice(`MarkTL \uC778\uB371\uC2A4\uB97C \uBCF5\uAD6C\uD588\uC2B5\uB2C8\uB2E4: ${index.items.length}\uAC1C \uD56D\uBAA9.`);
        await this.render();
      } catch (error) {
        statusEl.setText(error instanceof Error ? error.message : String(error));
      }
    })).addButton((button) => button.setButtonText("\uBAA8\uB4E0 \uD5C8\uBE0C \uBA54\uC778\uD398\uC774\uC9C0 \uBCF5\uAD6C").onClick(async () => {
      statusEl.setText("\uBAA8\uB4E0 \uACF5\uC720 \uD5C8\uBE0C \uBA54\uC778\uD398\uC774\uC9C0\uB97C \uBCF5\uAD6C\uD558\uB294 \uC911...");
      try {
        const result = await this.plugin.repairAllPublishedShareIndexes();
        new import_obsidian2.Notice(`MarkTL \uACF5\uC720 \uD5C8\uBE0C ${result.repairedCount}\uAC1C\uB97C \uBCF5\uAD6C\uD588\uC2B5\uB2C8\uB2E4.`);
        await this.render();
      } catch (error) {
        statusEl.setText(error instanceof Error ? error.message : String(error));
      }
    }));
    const listEl = contentEl.createDiv();
    statusEl.setText("\uAC8C\uC2DC \uC778\uB371\uC2A4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...");
    try {
      const { index } = await this.plugin.loadPublishedShareIndex(this.shareHomeProfileId);
      statusEl.setText(`\uAC8C\uC2DC \uD56D\uBAA9 ${index.items.length}\uAC1C.`);
      if (!index.items.length) {
        listEl.createEl("p", { text: "\uAC8C\uC2DC\uB41C \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." });
        return;
      }
      for (const item of index.items) {
        this.renderItem(listEl, item);
      }
    } catch (error) {
      statusEl.setText(error instanceof Error ? error.message : String(error));
    }
  }
  renderItem(container, item) {
    const card = container.createDiv({ cls: "marktl-published-item" });
    const title = this.cleanPublishedText(item.title || item.slug || "", "\uC81C\uBAA9 \uC5C6\uB294 HTML \uC0B0\uCD9C\uBB3C", 96);
    const url = String(item.url || item.canonicalUrl || "");
    new import_obsidian2.Setting(card).setName(title).setDesc(this.formatPublishedItemDescription(item, url)).addButton((button) => button.setButtonText("\uC5F4\uAE30").onClick(() => {
      if (url) {
        window.open(url);
      }
    })).addButton((button) => button.setButtonText("URL \uBCF5\uC0AC").onClick(async () => {
      if (url) {
        await navigator.clipboard.writeText(url);
        new import_obsidian2.Notice("MarkTL URL\uC744 \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4.");
      }
    })).addButton((button) => button.setButtonText("\uC378\uB124\uC77C \uAD50\uCCB4").onClick(() => {
      this.chooseReplacementThumbnail(item);
    })).addButton((button) => button.setButtonText("\uC644\uC804 \uC0AD\uC81C").setWarning().onClick(async () => {
      const confirmed = window.confirm(`\uAC8C\uC2DC\uB41C MarkTL \uC0B0\uCD9C\uBB3C\uC744 \uC0AD\uC81C\uD558\uACE0 \uC544\uCE74\uC774\uBE0C\uC5D0\uC11C\uB3C4 \uC81C\uAC70\uD560\uAE4C\uC694?

${title}`);
      if (!confirmed) {
        return;
      }
      try {
        const result = await this.plugin.deletePublishedShareItem(item, this.shareHomeProfileId);
        new import_obsidian2.Notice(`\uC544\uCE74\uC774\uBE0C \uD56D\uBAA9 ${result.removedCount}\uAC1C\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`);
        await this.render();
      } catch (error) {
        new import_obsidian2.Notice(error instanceof Error ? error.message : String(error));
      }
    }));
  }
  formatPublishedItemDescription(item, url) {
    const parts = [
      item.updatedAt ? `\uAC31\uC2E0\uC77C: ${String(item.updatedAt).slice(0, 10)}` : "",
      this.formatSourcePath(item.sourcePath),
      item.shortId ? `shortId: ${this.cleanPublishedText(item.shortId, "", 24)}` : "",
      this.cleanPublishedText(url, "", 128)
    ].filter(Boolean);
    return parts.join(" \xB7 ");
  }
  formatSourcePath(value) {
    const raw = String(value || "").trim();
    if (!raw || this.isNoisyPublishedMeta(raw)) {
      return "";
    }
    const externalPrefix = "External HTML file:";
    if (raw.startsWith(externalPrefix)) {
      const name = this.cleanPublishedText(raw.slice(externalPrefix.length).trim(), "", 80);
      return name ? `\uCD9C\uCC98: ${name}` : "";
    }
    const normalized = raw.replace(/\\/g, "/");
    const display = normalized.length > 120 ? normalized.split("/").filter(Boolean).pop() || "" : normalized;
    return this.cleanPublishedText(display, "", 96) ? `\uCD9C\uCC98: ${this.cleanPublishedText(display, "", 96)}` : "";
  }
  cleanPublishedText(value, fallback, maxLength) {
    const raw = String(value || "").replace(/<[^>]*>/g, " ");
    if (!raw.trim() || this.isNoisyPublishedMeta(raw)) {
      return fallback;
    }
    const text = raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}\u2026`;
  }
  isNoisyPublishedMeta(value) {
    const text = String(value || "");
    if (/<\/?(html|head|body|script|style|meta|div|section|article)\b/i.test(text)) {
      return true;
    }
    const noisyCount = Array.from(text).filter((char) => char === "\xC2" || char === "\xC3" || char === "\uFFFD").length;
    if (noisyCount >= 8 || text.length > 0 && noisyCount / text.length > 0.12) {
      return true;
    }
    return text.length > 260 && !/[./\\]/.test(text);
  }
  chooseReplacementThumbnail(item) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml";
    input.onchange = async () => {
      var _a;
      const file = (_a = input.files) == null ? void 0 : _a[0];
      if (!file) {
        return;
      }
      try {
        const result = await this.plugin.replacePublishedShareThumbnail(item, file, this.shareHomeProfileId);
        new import_obsidian2.Notice(`\uC378\uB124\uC77C\uC744 \uAD50\uCCB4\uD588\uC2B5\uB2C8\uB2E4: ${result.updatedCount}\uAC1C \uD56D\uBAA9.`);
        await this.render();
      } catch (error) {
        new import_obsidian2.Notice(error instanceof Error ? error.message : String(error));
      }
    };
    input.click();
  }
};

// src/progress-modal.ts
var import_obsidian3 = require("obsidian");
var MarktlProgressModal = class extends import_obsidian3.Modal {
  constructor(app) {
    super(app);
    this.listEl = null;
    this.statusEl = null;
    this.barEl = null;
    this.steps = [];
  }
  onOpen() {
    this.contentEl.empty();
    this.setTitle("Export progress");
    this.contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "MarkTL is converting this note to HTML."
    });
    const visualEl = this.contentEl.createDiv({ cls: "marktl-progress-visual" });
    this.statusEl = visualEl.createDiv({
      cls: "marktl-progress-status",
      text: "Preparing export..."
    });
    const trackEl = visualEl.createDiv({ cls: "marktl-progress-track" });
    this.barEl = trackEl.createDiv({ cls: "marktl-progress-bar" });
    this.listEl = this.contentEl.createEl("ol", { cls: "marktl-progress-list" });
  }
  addStep(text) {
    if (!this.listEl) {
      return;
    }
    const previous = this.steps[this.steps.length - 1];
    if (previous) {
      previous.removeClass("marktl-progress-step-active");
      previous.addClass("marktl-progress-step-done");
    }
    const item = this.listEl.createEl("li", {
      cls: "marktl-progress-step marktl-progress-step-active",
      text
    });
    this.steps.push(item);
    this.updateVisual(text);
    item.scrollIntoView({ block: "nearest" });
  }
  complete(text) {
    this.addStep(text);
    const current = this.steps[this.steps.length - 1];
    if (current) {
      current.removeClass("marktl-progress-step-active");
      current.addClass("marktl-progress-step-done");
    }
    if (this.statusEl) {
      this.statusEl.setText("Export complete.");
      this.statusEl.removeClass("marktl-progress-status-error");
      this.statusEl.addClass("marktl-progress-status-done");
    }
    if (this.barEl) {
      this.barEl.setAttr("style", "width: 100%;");
    }
    this.contentEl.createEl("p", {
      cls: "marktl-progress-done",
      text: "You can close this window."
    });
  }
  fail(text) {
    this.addStep(text);
    const current = this.steps[this.steps.length - 1];
    if (current) {
      current.removeClass("marktl-progress-step-active");
      current.addClass("marktl-progress-step-error");
    }
    if (this.statusEl) {
      this.statusEl.setText(`Export stopped: ${text}`);
      this.statusEl.removeClass("marktl-progress-status-done");
      this.statusEl.addClass("marktl-progress-status-error");
    }
    if (this.barEl) {
      this.barEl.setAttr("style", "width: 100%;");
    }
    this.contentEl.createEl("p", {
      cls: "marktl-progress-error",
      text
    });
  }
  onClose() {
    this.contentEl.empty();
    this.listEl = null;
    this.statusEl = null;
    this.barEl = null;
    this.steps = [];
  }
  updateVisual(text) {
    if (this.statusEl) {
      this.statusEl.setText(text);
      this.statusEl.removeClass("marktl-progress-status-done");
      this.statusEl.removeClass("marktl-progress-status-error");
    }
    if (this.barEl) {
      const pct = Math.min(92, 8 + this.steps.length * 7);
      this.barEl.setAttr("style", `width: ${pct}%;`);
    }
  }
};

// src/preview-view.ts
var import_obsidian4 = require("obsidian");
var VIEW_TYPE_MARKTL_PREVIEW = "marktl-html-preview";
var emptyState = {
  html: "<!doctype html><html><body><p>No preview loaded.</p></body></html>",
  filePath: "",
  warnings: [],
  trusted: false,
  previewSecurity: "sanitized"
};
var MarktlPreviewView = class extends import_obsidian4.ItemView {
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
    header.createSpan({
      cls: this.state.trusted ? "marktl-preview-trusted" : "marktl-preview-sanitized",
      text: this.state.trusted ? "Trusted interactive" : "Sanitized static"
    });
    let frame;
    const tools = container.createDiv({ cls: "marktl-preview-tools" });
    this.addToolButton(tools, "Copy as prompt", () => this.copyPrompt(frame));
    this.addToolButton(tools, "Copy outline", () => this.copyOutline(frame));
    this.addToolButton(tools, "Copy section feedback", () => this.copySectionFeedback(frame));
    this.addToolButton(tools, "Open generated file", () => this.openGeneratedFile());
    for (const warning of this.state.warnings) {
      container.createDiv({ cls: "marktl-preview-warning", text: warning });
    }
    const renderQa = container.createDiv({ cls: "marktl-preview-render-qa", text: "Render QA: waiting for preview..." });
    frame = container.createEl("iframe", {
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
  addToolButton(container, label, onClick) {
    const button = container.createEl("button", { text: label });
    button.type = "button";
    button.addEventListener("click", () => {
      void onClick();
    });
  }
  async copyPrompt(frame) {
    const text = this.getFrameText(frame) || this.stripHtml(this.state.html);
    await navigator.clipboard.writeText([
      "Use this MarkTL HTML artifact as context for the next iteration.",
      "",
      `Artifact: ${this.state.title || this.state.filePath || "HTML Preview"}`,
      `Preview security: ${this.state.previewSecurity}`,
      "",
      text
    ].join("\n"));
    new import_obsidian4.Notice("Copied preview prompt.");
  }
  async copyOutline(frame) {
    const outline = this.getOutline(frame);
    if (!outline) {
      await navigator.clipboard.writeText(this.state.title || this.state.filePath || "HTML Preview");
      new import_obsidian4.Notice("No headings found; copied artifact title.");
      return;
    }
    await navigator.clipboard.writeText(outline);
    new import_obsidian4.Notice("Copied preview outline.");
  }
  async copySectionFeedback(frame) {
    const section = this.getFirstSection(frame);
    const fallback = this.getFrameText(frame) || this.stripHtml(this.state.html);
    await navigator.clipboard.writeText([
      "Give feedback on this MarkTL HTML artifact section.",
      "",
      `Artifact: ${this.state.title || this.state.filePath || "HTML Preview"}`,
      `Section: ${section.heading || "Whole document fallback"}`,
      "",
      section.text || fallback,
      "",
      "Focus on what should be clearer, more visual, or more interactive."
    ].join("\n"));
    new import_obsidian4.Notice(section.heading ? "Copied section feedback prompt." : "Copied whole-document feedback prompt.");
  }
  openGeneratedFile() {
    if (!this.state.filePath) {
      new import_obsidian4.Notice("No generated file path is available.");
      return;
    }
    const adapter = this.app.vault.adapter;
    const fullPath = adapter.getFullPath ? adapter.getFullPath(this.state.filePath) : this.state.filePath;
    const target = fullPath.startsWith("/") ? `file://${encodeURI(fullPath)}` : encodeURI(fullPath);
    window.open(target, "_blank", "noopener,noreferrer");
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
  getFrameDocument(frame) {
    try {
      return frame.contentDocument;
    } catch (e) {
      return null;
    }
  }
  getFrameText(frame) {
    var _a, _b;
    const doc = this.getFrameDocument(frame);
    return ((_b = (_a = doc == null ? void 0 : doc.body) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || "";
  }
  getOutline(frame) {
    const doc = this.getFrameDocument(frame);
    if (!doc) {
      return "";
    }
    const headings = Array.from(doc.querySelectorAll("h1,h2,h3"));
    return headings.map((heading) => {
      var _a;
      const level = Number(heading.tagName.slice(1));
      return `${"  ".repeat(Math.max(0, level - 1))}- ${((_a = heading.textContent) == null ? void 0 : _a.trim()) || "Untitled"}`;
    }).join("\n");
  }
  getFirstSection(frame) {
    var _a, _b, _c;
    const doc = this.getFrameDocument(frame);
    const heading = doc == null ? void 0 : doc.querySelector("h2,h1,h3");
    if (!doc || !heading) {
      return { heading: "", text: "" };
    }
    const parts = [((_a = heading.textContent) == null ? void 0 : _a.trim()) || "Untitled"];
    let node = heading.nextElementSibling;
    while (node && !/^H[1-3]$/.test(node.tagName)) {
      parts.push(((_b = node.textContent) == null ? void 0 : _b.trim()) || "");
      node = node.nextElementSibling;
    }
    return {
      heading: ((_c = heading.textContent) == null ? void 0 : _c.trim()) || "Untitled",
      text: parts.filter(Boolean).join("\n\n")
    };
  }
  stripHtml(html) {
    return String(html || "").replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
};

// src/result-modal.ts
var import_obsidian5 = require("obsidian");
var MarktlResultModal = class extends import_obsidian5.Modal {
  constructor(app, summary, copyLink, regenerate) {
    super(app);
    this.summary = summary;
    this.copyLink = copyLink;
    this.regenerate = regenerate;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("HTML export ready");
    if (this.summary.publicUrl) {
      const shareCard = contentEl.createDiv({ cls: "marktl-share-card" });
      shareCard.createEl("span", { cls: "marktl-share-eyebrow", text: "Share this page" });
      const link = shareCard.createEl("a", {
        cls: "marktl-share-link",
        href: this.summary.publicUrl,
        text: this.summary.publicUrl
      });
      link.setAttr("target", "_blank");
      link.setAttr("rel", "noopener noreferrer");
      shareCard.createEl("p", {
        text: this.summary.commentsEnabled ? "Readers can open this link and comment with GitHub through Giscus." : "Readers can open this link. Comments need Giscus settings before they appear."
      });
    }
    const facts = contentEl.createDiv({ cls: "marktl-summary-grid" });
    this.addFact(facts, "Output", this.summary.outputPath);
    this.addFact(facts, "Preview", this.summary.previewSecurity === "trusted" ? "Trusted interactive" : "Sanitized static");
    this.addFact(facts, "Source", this.summary.sourceKind === "html-file" ? "Existing HTML file upload" : "Markdown note export");
    this.addFact(facts, "AI", this.summary.sourceKind === "html-file" ? "Skipped; existing HTML was published" : this.summary.aiProvider === "none" ? "Local converter" : this.summary.usedFallback ? `${this.summary.aiProvider} failed; local fallback used` : `${this.summary.aiProvider} generated HTML`);
    this.addFact(facts, "Images", `${this.summary.assetCount} bundled local image(s)`);
    this.addFact(facts, "Share target", this.describeShareTarget());
    if (this.summary.shareHomeTitle) {
      this.addFact(facts, "Share hub", this.summary.shareHomeTitle);
    }
    this.addFact(facts, "Comments", this.summary.commentsStatus);
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
    const actions = contentEl.createDiv({ cls: "marktl-result-actions" });
    this.addActionButton(actions, this.summary.publicUrl ? "Copy public link" : "Copy local link", async () => {
      const link = await this.copyLink(this.summary.outputPath, this.summary.publicUrl);
      new import_obsidian5.Notice(`Copied: ${link}`);
    });
    if (this.summary.publicUrl) {
      this.addActionButton(actions, "Copy share text", async () => {
        const text = [this.summary.shareTitle, this.summary.publicUrl].filter(Boolean).join("\n");
        await navigator.clipboard.writeText(text);
        new import_obsidian5.Notice("Copied share text.");
      });
      this.addActionButton(actions, "Open page", () => {
        window.open(this.summary.publicUrl, "_blank", "noopener,noreferrer");
      });
    }
    if (this.summary.shareHomeUrl) {
      this.addActionButton(actions, "Open archive", () => {
        window.open(this.summary.shareHomeUrl, "_blank", "noopener,noreferrer");
      });
    }
    this.addActionButton(actions, "Copy AI handoff", async () => {
      await navigator.clipboard.writeText(this.buildAiHandoffPrompt());
      new import_obsidian5.Notice("Copied AI handoff prompt.");
    });
    if (this.summary.sourceKind !== "html-file") {
      this.addActionButton(actions, "Regenerate slides", () => {
        this.close();
        this.regenerate("presentation");
      });
      this.addActionButton(actions, "Regenerate interactive", () => {
        this.close();
        this.regenerate("interactive-report");
      });
    }
    this.addActionButton(actions, "Close", () => this.close(), true);
  }
  onClose() {
    this.contentEl.empty();
  }
  addFact(container, label, value) {
    const item = container.createDiv({ cls: "marktl-summary-item" });
    item.createEl("span", { cls: "marktl-summary-label", text: label });
    item.createEl("strong", { text: value });
  }
  addActionButton(container, label, onClick, cta = false) {
    const button = container.createEl("button", {
      cls: cta ? "mod-cta" : "",
      text: label
    });
    button.addEventListener("click", () => {
      void onClick();
    });
  }
  describeShareTarget() {
    if (this.summary.shareTarget === "github-pages") {
      return "GitHub Pages link";
    }
    return this.summary.shareTarget === "static-bundle" ? "Static hosting bundle" : "Local file link";
  }
  buildAiHandoffPrompt() {
    return [
      "Use this MarkTL HTML artifact as context for the next iteration.",
      "",
      `Source note: ${this.summary.sourcePath || this.summary.sourceTitle || "Unknown source note"}`,
      `HTML output: ${this.summary.publicUrl || this.summary.localPath || this.summary.outputPath}`,
      `Preview security: ${this.summary.previewSecurity}`,
      `Share target: ${this.describeShareTarget()}`,
      this.summary.publicUrl ? `Public URL: ${this.summary.publicUrl}` : "",
      "",
      "Task:",
      "- Review the artifact as a visual HTML output, not just as Markdown text.",
      "- Identify what should be clearer, more visual, or more interactive.",
      "- Suggest the next concrete revision."
    ].filter(Boolean).join("\n");
  }
};

// src/settings-tab.ts
var import_obsidian6 = require("obsidian");
var import_artifact_goals2 = __toESM(require_artifact_goals());
var import_export_profiles2 = __toESM(require_export_profiles());
var import_templates2 = __toESM(require_templates());
var { inferPagesBaseUrl } = require_github_pages();
var { buildGiscusSetupChecklist, buildPagesSetupChecklist } = require_setup_guidance();
var { createShareHomeProfile: createShareHomeProfile2, describeShareHomeProfile: describeShareHomeProfile2, normalizeShareHomeProfiles: normalizeShareHomeProfiles2, resolveShareHomeProfile: resolveShareHomeProfile2 } = require_share_home_profiles();
var MarktlSettingTab = class extends import_obsidian6.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Flytothesky MarkTL HTML Exporter" });
    new import_obsidian6.Setting(containerEl).setName("Setup wizard").setDesc("Guided setup for local export, Claude AI conversion, and share-ready bundles.").addButton((button) => button.setButtonText("Open setup").setCta().onClick(() => {
      this.plugin.openSetupWizard();
    }));
    new import_obsidian6.Setting(containerEl).setName("Export folder").setDesc("Vault-relative folder for generated HTML files.").addText((text) => text.setPlaceholder("html-exports").setValue(this.plugin.settings.exportFolder).onChange(async (value) => {
      this.plugin.settings.exportFolder = value.trim() || "html-exports";
      await this.plugin.saveSettings();
    }));
    this.renderShareHomeSettings(containerEl);
    containerEl.createEl("h3", { text: "Note to HTML \uAE30\uBCF8 \uC120\uD0DD" });
    containerEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Export modal \uCCAB \uD654\uBA74\uC758 \uC7A5\uB974, \uAE4A\uC774, \uBAA9\uC801, \uAE30\uC900 \uB9E5\uB77D \uB178\uD2B8 \uAE30\uBCF8\uAC12\uC785\uB2C8\uB2E4."
    });
    new import_obsidian6.Setting(containerEl).setName("\uBB38\uC11C \uC7A5\uB974").setDesc("\uAE30\uBCF8 HTML \uC7A5\uB974\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => {
      for (const genre of (0, import_export_profiles2.listExportGenres)()) {
        dropdown.addOption(genre.id, genre.label);
      }
      dropdown.setValue(this.plugin.settings.exportGenre).onChange(async (value) => {
        await this.applyDefaultSelection({ exportGenre: value });
      });
    });
    new import_obsidian6.Setting(containerEl).setName("\uC791\uC131 \uAE4A\uC774").setDesc("\uACF5\uC0AC\uC77C\uBCF4\uB294 \uAC04\uB2E8 \uAE30\uB85D, \uD45C\uC900 \uC77C\uBCF4, \uC885\uD569\xB7\uB9C8\uC77C\uC2A4\uD1A4 3\uB2E8\uACC4\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => {
      for (const depth of (0, import_export_profiles2.listExportDepths)()) {
        dropdown.addOption(depth.id, depth.label);
      }
      dropdown.setValue(this.plugin.settings.exportDepth).onChange(async (value) => {
        await this.applyDefaultSelection({ exportDepth: value });
      });
    });
    new import_obsidian6.Setting(containerEl).setName("\uC0AC\uC6A9 \uBAA9\uC801").setDesc("\uB3C5\uC790\uC640 \uBB38\uCCB4, \uB2E4\uC74C \uD589\uB3D9\uC744 \uC815\uD569\uB2C8\uB2E4.").addDropdown((dropdown) => {
      for (const purpose of (0, import_export_profiles2.listExportPurposes)()) {
        dropdown.addOption(purpose.id, purpose.label);
      }
      dropdown.setValue(this.plugin.settings.exportPurpose).onChange(async (value) => {
        await this.applyDefaultSelection({ exportPurpose: value });
      });
    });
    new import_obsidian6.Setting(containerEl).setName("\uAE30\uC900 \uB9E5\uB77D \uB178\uD2B8 \uACBD\uB85C").setDesc("\uC120\uD0DD \uC0AC\uD56D\uC785\uB2C8\uB2E4. \uBE44\uC6CC\uB450\uBA74 \uD604\uC7AC \uB178\uD2B8\uB9CC \uC0AC\uC6A9\uD569\uB2C8\uB2E4.").addText((text) => text.setPlaceholder("\uC608: \uD504\uB85C\uC81D\uD2B8/2026-06-11 \uC9C0\uC218\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uACF5\uC0AC\uC77C\uBCF4.md").setValue(this.plugin.settings.referenceContextNotePath).onChange(async (value) => {
      this.plugin.settings.referenceContextNotePath = value.trim();
      this.plugin.settings.contextPackMode = this.plugin.settings.referenceContextNotePath ? "reference-note" : "none";
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("Artifact goal").setDesc("Default job for the HTML artifact: read, decide, review, compare, tune, explain code, or publish.").addDropdown((dropdown) => {
      for (const goal of (0, import_artifact_goals2.listArtifactGoals)()) {
        dropdown.addOption(goal.id, goal.name);
      }
      dropdown.setValue(this.plugin.settings.artifactGoal).onChange(async (value) => {
        this.plugin.settings.artifactGoal = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Artifact type").setDesc("Default information architecture for AI exports.").addDropdown((dropdown) => dropdown.addOption("faithful-note", "Faithful Note").addOption("strategy-brief", "Strategy Brief").addOption("research-report", "Research Report").addOption("decision-memo", "Decision Memo").addOption("interactive-explainer", "Interactive Explainer").addOption("slide-deck", "Slide Deck").setValue(this.plugin.settings.artifactType).onChange(async (value) => {
      this.plugin.settings.artifactType = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("Template").setDesc("Default HTML style template.").addDropdown((dropdown) => {
      for (const template of (0, import_templates2.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("AI provider").setDesc("Optional CLI provider for high-quality AI conversion.").addDropdown((dropdown) => dropdown.addOption("none", "None / local fallback").addOption("claude", "Claude Code CLI").addOption("codex", "Codex CLI").setValue(this.plugin.settings.aiProvider).onChange(async (value) => {
      this.plugin.settings.aiProvider = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("Conversion mode").setDesc("Preserve mode keeps the note faithful. Other modes allow AI restructuring.").addDropdown((dropdown) => dropdown.addOption("preserve", "Preserve content").addOption("presentation", "Presentation").addOption("blog", "Blog article").addOption("landing", "Landing page").setValue(this.plugin.settings.conversionMode).onChange(async (value) => {
      this.plugin.settings.conversionMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("Preview security").setDesc("Sanitized mode blocks scripts, iframes, external assets, and event handlers.").addDropdown((dropdown) => dropdown.addOption("sanitized", "Sanitized static preview").addOption("trusted", "Trusted preview/export").setValue(this.plugin.settings.previewSecurity).onChange(async (value) => {
      this.plugin.settings.previewSecurity = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("Context pack").setDesc("Reference note mode gives AI the user-selected baseline context. Linked notes remains for compatibility.").addDropdown((dropdown) => dropdown.addOption("none", "Active note only").addOption("reference-note", "Use selected reference note").addOption("linked-notes", "Include linked notes").setValue(this.plugin.settings.contextPackMode).onChange(async (value) => {
      this.plugin.settings.contextPackMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian6.Setting(containerEl).setName("AI failure policy").setDesc("Fallback creates local HTML with a warning. Strict stops generation. GitHub Pages always requires strict AI success.").addDropdown((dropdown) => dropdown.addOption("fallback", "Fallback with warning").addOption("strict", "Stop on AI failure").setValue(this.plugin.settings.failurePolicy).onChange(async (value) => {
      this.plugin.settings.failurePolicy = this.plugin.settings.shareTarget === "github-pages" && value === "fallback" ? "strict" : value;
      await this.plugin.saveSettings();
      if (this.plugin.settings.shareTarget === "github-pages" && value === "fallback") {
        new import_obsidian6.Notice("GitHub Pages export requires strict AI success. Fallback was not enabled.");
        this.display();
      }
    }));
    new import_obsidian6.Setting(containerEl).setName("CLI timeout").setDesc("Maximum AI CLI runtime in milliseconds. Rich HTML artifacts can take 5-15 minutes on long notes.").addText((text) => text.setPlaceholder("900000").setValue(String(this.plugin.settings.timeoutMs)).onChange(async (value) => {
      const parsed = Number(value);
      this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 9e5;
      await this.plugin.saveSettings();
    }));
    this.addCliPathSetting(containerEl, "Claude Code CLI path", "claudePath", "claude");
    this.addCliPathSetting(containerEl, "Codex CLI path", "codexPath", "codex");
    new import_obsidian6.Setting(containerEl).setName("Share target").setDesc("GitHub Pages publishes only after successful AI conversion. Fallback HTML is never published.").addDropdown((dropdown) => dropdown.addOption("local-link", "Local file link").addOption("static-bundle", "Static hosting bundle").addOption("github-pages", "GitHub Pages link").setValue(this.plugin.settings.shareTarget).onChange(async (value) => {
      this.plugin.settings.shareTarget = value;
      if (value === "github-pages" && this.plugin.settings.failurePolicy !== "strict") {
        this.plugin.settings.failurePolicy = "strict";
        new import_obsidian6.Notice("GitHub Pages export now uses strict AI failure policy.");
      }
      await this.plugin.saveSettings();
      if (value === "github-pages") {
        this.display();
      }
    }));
    containerEl.createEl("h3", { text: "Reader feedback" });
    containerEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Giscus uses GitHub Discussions for public comments. It requires trusted exports because it loads the Giscus script."
    });
    new import_obsidian6.Setting(containerEl).setName("Giscus setup helper").setDesc("Install the Giscus GitHub App first, then use giscus.app to get repository ID and category ID.").addButton((button) => button.setButtonText("Install Giscus app").onClick(() => {
      window.open("https://github.com/apps/giscus", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Open giscus.app").onClick(() => {
      window.open("https://giscus.app", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Copy checklist").onClick(async () => {
      await navigator.clipboard.writeText(buildGiscusSetupChecklist(this.plugin.settings));
      new import_obsidian6.Notice("Giscus setup checklist copied.");
    }));
    new import_obsidian6.Setting(containerEl).setName("Reader feedback mode").setDesc("Adds a GitHub login/comment box to exported HTML when configured.").addDropdown((dropdown) => dropdown.addOption("none", "None").addOption("giscus", "Giscus GitHub comments").setValue(this.plugin.settings.readerFeedbackMode).onChange(async (value) => {
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
    new import_obsidian6.Setting(containerEl).setName("GitHub Pages setup helper").setDesc("For owner/repo, the usual Pages URL is https://owner.github.io/repo. The final page becomes <base>/<publish path>/<slug>/.").addButton((button) => button.setButtonText("Create token").onClick(() => {
      window.open("https://github.com/settings/personal-access-tokens/new", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Fill base URL").onClick(async () => {
      const inferred = inferPagesBaseUrl(this.plugin.settings.githubRepo);
      if (!inferred) {
        new import_obsidian6.Notice("Enter GitHub repository as owner/repo first.");
        return;
      }
      this.plugin.settings.githubPagesBaseUrl = inferred;
      await this.plugin.saveSettings();
      this.display();
      new import_obsidian6.Notice(`GitHub Pages base URL set to ${inferred}`);
    })).addButton((button) => button.setButtonText("Copy checklist").onClick(async () => {
      await navigator.clipboard.writeText(buildPagesSetupChecklist(this.plugin.settings));
      new import_obsidian6.Notice("GitHub Pages setup checklist copied.");
    }));
    this.addTextSetting(containerEl, "GitHub repository", "owner/repo for the Pages repository.", "githubRepo", "reallygood83/marktl-shares");
    this.addTextSetting(containerEl, "GitHub branch", "Branch to write files to.", "githubBranch", "main");
    this.addTextSetting(containerEl, "GitHub Pages base URL", "Public Pages root URL. Leave blank to infer https://owner.github.io/repo.", "githubPagesBaseUrl", "https://reallygood83.github.io/marktl-shares");
    this.addTextSetting(containerEl, "GitHub token", "Fine-grained token with Contents read/write permission for the repository.", "githubToken", "github_pat_...", true);
    new import_obsidian6.Setting(containerEl).setName("Copy share link by default").setDesc("Copies the public GitHub Pages URL after publish, or a local file:// link for local exports.").addToggle((toggle) => toggle.setValue(this.plugin.settings.copyShareLinkAfterExport).onChange(async (value) => {
      this.plugin.settings.copyShareLinkAfterExport = value;
      await this.plugin.saveSettings();
    }));
  }
  renderShareHomeSettings(containerEl) {
    containerEl.createEl("h3", { text: "\uACF5\uC720 \uD5C8\uBE0C" });
    containerEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "\uD5C8\uBE0C\uB294 \uACF5\uC720 \uBA54\uC778\uD398\uC774\uC9C0\uC785\uB2C8\uB2E4. \uB0B4\uBCF4\uB0B4\uAE30 \uCCAB \uD654\uBA74\uC5D0\uC11C \uD5C8\uBE0C\uB97C \uBA3C\uC800 \uACE0\uB974\uBA74, \uC0DD\uC131\uB41C HTML\uC740 \uC120\uD0DD\uD55C \uD5C8\uBE0C\uC758 \uC11C\uBE0C\uD398\uC774\uC9C0\uC640 \uC778\uB371\uC2A4\uC5D0 \uB4F1\uB85D\uB429\uB2C8\uB2E4."
    });
    const profiles = normalizeShareHomeProfiles2(this.plugin.settings.shareHomeProfiles, this.plugin.settings);
    const activeProfile = resolveShareHomeProfile2(this.plugin.settings, this.plugin.settings.activeShareHomeProfileId);
    this.plugin.settings.shareHomeProfiles = profiles;
    this.plugin.settings.activeShareHomeProfileId = activeProfile.id;
    new import_obsidian6.Setting(containerEl).setName("\uAE30\uBCF8 \uACF5\uC720 \uD5C8\uBE0C").setDesc("Export modal\uC5D0\uC11C \uCC98\uC74C \uC120\uD0DD\uB418\uC5B4 \uC788\uC744 \uD5C8\uBE0C\uC785\uB2C8\uB2E4.").addDropdown((dropdown) => {
      for (const profile of profiles) {
        dropdown.addOption(profile.id, profile.title);
      }
      dropdown.setValue(activeProfile.id).onChange(async (value) => {
        await this.setActiveShareHomeProfile(value);
      });
    }).addButton((button) => button.setButtonText("\uC0C8 \uD5C8\uBE0C \uCD94\uAC00").onClick(async () => {
      const next = createShareHomeProfile2(profiles);
      this.plugin.settings.shareHomeProfiles = [...profiles, next];
      await this.setActiveShareHomeProfile(next.id);
      new import_obsidian6.Notice("\uC0C8 \uACF5\uC720 \uD5C8\uBE0C\uB97C \uCD94\uAC00\uD588\uC2B5\uB2C8\uB2E4. \uBA85\uCE6D\uACFC \uAC8C\uC2DC \uACBD\uB85C\uB97C \uC218\uC815\uD558\uC138\uC694.");
    }));
    const description = describeShareHomeProfile2(activeProfile, this.plugin.settings);
    const card = containerEl.createDiv({ cls: "marktl-settings-card" });
    card.createEl("h4", { text: `\uC120\uD0DD \uD5C8\uBE0C: ${activeProfile.title}` });
    card.createEl("p", {
      cls: "marktl-settings-muted",
      text: description.homeUrl ? `\uAC8C\uC2DC \uD648: ${description.homeUrl}` : `\uAC8C\uC2DC \uACBD\uB85C: ${description.pathLabel}`
    });
    this.addShareHomeProfileText(card, "\uD5C8\uBE0C \uBA85\uCE6D", "\uBA54\uC778\uD398\uC774\uC9C0 H1\uACFC \uC120\uD0DD \uCE74\uB4DC\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.", "title", activeProfile);
    this.addShareHomeProfileText(card, "\uAC8C\uC2DC \uACBD\uB85C", "GitHub Pages \uC800\uC7A5\uC18C \uC548\uC758 \uD3F4\uB354\uC785\uB2C8\uB2E4. \uC608: marktl/jisu, marktl/work, marktl/research", "basePath", activeProfile);
    this.addShareHomeProfileText(card, "\uC0C1\uB2E8 \uBC30\uC9C0", "\uBA54\uC778\uD398\uC774\uC9C0 \uC67C\uCABD \uC704 \uC791\uC740 \uBD84\uB958\uBA85\uC785\uB2C8\uB2E4.", "eyebrow", activeProfile);
    this.addShareHomeProfileText(card, "\uD5C8\uBE0C \uC124\uBA85", "\uBA54\uC778\uD398\uC774\uC9C0 H1 \uC544\uB798 \uC124\uBA85\uBB38\uC785\uB2C8\uB2E4.", "description", activeProfile);
    new import_obsidian6.Setting(card).setName("\uC120\uD0DD \uD5C8\uBE0C \uC0AD\uC81C").setDesc("\uCD5C\uC18C \uD558\uB098\uC758 \uD5C8\uBE0C\uB294 \uB0A8\uACA8\uC57C \uD569\uB2C8\uB2E4. \uC0AD\uC81C\uD574\uB3C4 \uC774\uBBF8 GitHub Pages\uC5D0 \uC62C\uB77C\uAC04 \uD30C\uC77C\uC740 \uC790\uB3D9 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.").addButton((button) => {
      button.setButtonText("\uC0AD\uC81C");
      if (profiles.length <= 1) {
        button.setDisabled(true);
      }
      button.onClick(async () => {
        var _a;
        if (profiles.length <= 1) {
          return;
        }
        const remaining = profiles.filter((profile) => profile.id !== activeProfile.id);
        this.plugin.settings.shareHomeProfiles = remaining;
        this.plugin.settings.activeShareHomeProfileId = ((_a = remaining[0]) == null ? void 0 : _a.id) || "";
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian6.Notice("\uACF5\uC720 \uD5C8\uBE0C\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.");
      });
    });
  }
  async setActiveShareHomeProfile(profileId, refresh = true) {
    const profiles = normalizeShareHomeProfiles2(this.plugin.settings.shareHomeProfiles, this.plugin.settings);
    const active = profiles.find((profile) => profile.id === profileId) || profiles[0];
    this.plugin.settings.shareHomeProfiles = profiles;
    this.plugin.settings.activeShareHomeProfileId = (active == null ? void 0 : active.id) || "";
    if (active) {
      this.plugin.settings.githubPublishPath = active.basePath;
      this.plugin.settings.githubShareHomeTitle = active.title;
    }
    await this.plugin.saveSettings();
    if (refresh) {
      this.display();
    }
  }
  addShareHomeProfileText(containerEl, name, description, key, activeProfile) {
    new import_obsidian6.Setting(containerEl).setName(name).setDesc(description).addText((text) => text.setValue(activeProfile[key]).onChange(async (value) => {
      await this.patchActiveShareHomeProfile({ [key]: value.trim() });
    }));
  }
  async patchActiveShareHomeProfile(patch) {
    var _a;
    const profiles = normalizeShareHomeProfiles2(this.plugin.settings.shareHomeProfiles, this.plugin.settings);
    const activeId = this.plugin.settings.activeShareHomeProfileId || ((_a = profiles[0]) == null ? void 0 : _a.id) || "";
    const index = profiles.findIndex((profile) => profile.id === activeId);
    if (index < 0) {
      return;
    }
    const nextProfiles = profiles.slice();
    nextProfiles[index] = {
      ...nextProfiles[index],
      ...patch
    };
    const normalized = normalizeShareHomeProfiles2(nextProfiles, this.plugin.settings);
    const active = normalized.find((profile) => profile.id === activeId) || normalized[index] || normalized[0];
    this.plugin.settings.shareHomeProfiles = normalized;
    this.plugin.settings.activeShareHomeProfileId = (active == null ? void 0 : active.id) || "";
    if (active) {
      this.plugin.settings.githubPublishPath = active.basePath;
      this.plugin.settings.githubShareHomeTitle = active.title;
    }
    await this.plugin.saveSettings();
  }
  async applyDefaultSelection(partial) {
    const next = (0, import_export_profiles2.applySelectionProfile)({
      ...this.plugin.settings,
      ...partial
    }, {
      ...this.plugin.settings,
      ...partial
    });
    Object.assign(this.plugin.settings, next);
    await this.plugin.saveSettings();
    this.display();
  }
  addCliPathSetting(containerEl, name, key, placeholder) {
    new import_obsidian6.Setting(containerEl).setName(name).setDesc("Leave blank to use the command from PATH.").addText((text) => text.setPlaceholder(placeholder).setValue(this.plugin.settings[key]).onChange(async (value) => {
      this.plugin.settings[key] = value.trim();
      await this.plugin.saveSettings();
    }));
  }
  addTextSetting(containerEl, name, description, key, placeholder, password = false) {
    new import_obsidian6.Setting(containerEl).setName(name).setDesc(description).addText((text) => {
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
var import_obsidian7 = require("obsidian");
var { checkClaudeProvider, checkCodexProvider } = require_provider_doctor();
var MarktlSetupModal = class extends import_obsidian7.Modal {
  constructor(app, plugin) {
    super(app);
    this.doctorEl = null;
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("Flytothesky MarkTL setup");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "Choose the outcome you want from your HTML artifacts. Provider setup stays optional until you need richer AI-generated output."
    });
    const cards = contentEl.createDiv({ cls: "marktl-setup-cards" });
    this.addSetupCard(cards, {
      title: "Start with safe local HTML",
      body: "Turn notes into readable local HTML with bundled images and sanitized preview. No AI setup required.",
      button: "Use local export",
      apply: () => this.applySimpleDefaults()
    });
    this.addSetupCard(cards, {
      title: "Make visual AI artifacts",
      body: "Use Claude Code CLI to reshape long notes into designed reports, explainers, and slide-like pages.",
      button: "Use Claude",
      apply: () => this.applyClaudeDefaults()
    });
    this.addSetupCard(cards, {
      title: "Create interactive review surfaces",
      body: "Use Codex CLI for HTML artifacts with review prompts, copy-back controls, and local interactivity.",
      button: "Use Codex",
      apply: () => this.applyCodexDefaults()
    });
    this.addSetupCard(cards, {
      title: "Publish public links",
      body: "Prepare GitHub Pages-ready bundles with share links and optional Giscus reader feedback.",
      button: "Prepare sharing",
      apply: () => this.applyBundleDefaults()
    });
    this.doctorEl = contentEl.createDiv({ cls: "marktl-doctor-box" });
    this.renderDoctorIdle();
    const agentBox = contentEl.createDiv({ cls: "marktl-agent-setup-box" });
    agentBox.createEl("h3", { text: "Agent-assisted setup" });
    agentBox.createEl("p", {
      text: "If you use Codex or Claude Code, copy a setup prompt and let your coding agent configure BRAT, MarkTL, GitHub Pages, and Giscus with you."
    });
    new import_obsidian7.Setting(agentBox).addButton((button) => button.setButtonText("Copy Codex setup prompt").onClick(() => this.copyAgentPrompt("codex"))).addButton((button) => button.setButtonText("Copy Claude setup prompt").onClick(() => this.copyAgentPrompt("claude")));
    new import_obsidian7.Setting(contentEl).addButton((button) => button.setButtonText("Check Claude CLI").onClick(() => {
      void this.runDoctor("claude");
    })).addButton((button) => button.setButtonText("Check Codex CLI").onClick(() => {
      void this.runDoctor("codex");
    })).addButton((button) => button.setButtonText("Finish setup").setCta().onClick(async () => {
      this.plugin.settings.setupCompleted = true;
      await this.plugin.saveSettings();
      this.close();
      new import_obsidian7.Notice("Flytothesky MarkTL setup saved.");
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
    new import_obsidian7.Setting(card).addButton((button) => button.setButtonText(options.button).onClick(async () => {
      await options.apply();
      new import_obsidian7.Notice(`${options.title} defaults applied.`);
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
    await this.runDoctor("claude");
  }
  async applyCodexDefaults() {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: "codex",
      artifactGoal: "review",
      artifactType: "interactive-explainer",
      template: "interactive-report",
      conversionMode: "presentation",
      previewSecurity: "trusted",
      shareTarget: "local-link"
    });
    await this.plugin.saveSettings();
    await this.runDoctor("codex");
  }
  async applyBundleDefaults() {
    Object.assign(this.plugin.settings, {
      setupCompleted: true,
      aiProvider: this.plugin.settings.aiProvider,
      artifactGoal: "publish",
      artifactType: "research-report",
      template: "editorial",
      conversionMode: "blog",
      failurePolicy: "strict",
      previewSecurity: "trusted",
      readerFeedbackMode: "giscus",
      shareTarget: "github-pages",
      copyShareLinkAfterExport: true
    });
    await this.plugin.saveSettings();
  }
  async copyAgentPrompt(agent) {
    const prompt = buildAgentSetupPrompt(agent);
    await navigator.clipboard.writeText(prompt);
    new import_obsidian7.Notice(`${agent === "codex" ? "Codex" : "Claude"} setup prompt copied.`);
  }
  renderDoctorIdle() {
    if (!this.doctorEl) {
      return;
    }
    this.doctorEl.empty();
    this.doctorEl.createEl("strong", { text: "AI CLI doctor" });
    this.doctorEl.createEl("p", {
      text: "Optional. Checks whether Claude Code CLI or Codex CLI is installed and logged in."
    });
  }
  async runDoctor(provider = "claude") {
    if (!this.doctorEl) {
      return;
    }
    const label = provider === "codex" ? "Codex CLI" : "Claude CLI";
    this.doctorEl.empty();
    this.doctorEl.createEl("strong", { text: `Checking ${label}...` });
    const result = provider === "codex" ? await checkCodexProvider({
      command: this.plugin.settings.codexPath || "codex",
      timeoutMs: 15e3
    }) : await checkClaudeProvider({
      command: this.plugin.settings.claudePath || "claude",
      timeoutMs: 15e3
    });
    this.doctorEl.empty();
    this.doctorEl.toggleClass("marktl-doctor-ok", result.ok);
    this.doctorEl.toggleClass("marktl-doctor-error", !result.ok);
    this.doctorEl.createEl("strong", {
      text: result.ok ? `${label} is ready` : `${label} needs attention`
    });
    this.doctorEl.createEl("p", { text: result.message });
    if (result.version) {
      this.doctorEl.createEl("code", { text: result.version });
    }
  }
};
function buildAgentSetupPrompt(agent) {
  const agentName = agent === "codex" ? "Codex" : "Claude Code";
  return [
    `You are helping me set up the MarkTL Obsidian plugin using ${agentName}.`,
    "",
    "Goal:",
    "- Install Flytothesky MarkTL through BRAT from https://github.com/flytothesky23/marktl.",
    "- Configure MarkTL so an Obsidian Markdown note can be exported to a GitHub Pages HTML link.",
    "- Make the exported page comment-ready with Giscus GitHub comments.",
    "",
    "Please guide me step by step. Do not ask for secrets unless needed, and never print my GitHub token back to me.",
    "",
    "Target MarkTL settings:",
    "- Share target: GitHub Pages link",
    "- Preview/export: Trusted interactive preview",
    "- Reader feedback: Giscus GitHub comments",
    "- Copy share link by default: enabled",
    "- GitHub repository: owner/repo for my Pages repository",
    "- GitHub branch: main",
    "- GitHub Pages base URL: https://owner.github.io/repo",
    "- Publish path: marktl",
    "- GitHub token: fine-grained token limited to the Pages repo with Contents read/write",
    "- Giscus repository: owner/repo with Discussions enabled",
    "- Giscus category: Announcements or General",
    "- Giscus repo ID and category ID: values from https://giscus.app",
    "",
    "Checklist:",
    "1. Confirm BRAT has installed and enabled MarkTL.",
    "2. Confirm the Pages repository exists and GitHub Pages is enabled for the target branch.",
    "3. Confirm the token has Contents read/write only for that repository.",
    "4. Confirm Giscus is enabled and the repo/category IDs are filled.",
    "5. Export one test note with GitHub Pages link selected.",
    "6. Verify the result modal shows a short public link and archive link.",
    "7. Open the public link and verify the Sign in with GitHub button and Giscus comment box appear.",
    "",
    "If anything fails, diagnose the exact missing setting instead of guessing."
  ].join("\n");
}

// src/main.ts
var { convertWithAiFallback, getProviderPrivacyNote: getProviderPrivacyNote2 } = require_ai();
var { buildAssetFileName, extractMarkdownImageReferences, rewriteHtmlImageSources } = require_assets();
var { buildContextPackMarkdown, extractMarkdownContextTargets } = require_context_pack();
var { basenameFromHtmlFileName, externalThumbnailAssetName, externalThumbnailExtension, extractExternalHtmlMetadata, findExternalHtmlAssetWarnings, isSupportedExternalThumbnailFileName } = require_external_html();
var { normalizeExportSelection } = require_export_profiles();
var { injectReaderFeedback, shouldAttachReaderFeedback, validateGiscusConfig } = require_feedback();
var { buildPagesUrl, buildPublishPath, buildShareHomeUrl, buildShortPagesUrl, inferPagesBaseUrl: inferPagesBaseUrl2, parseRepo, repairShareIndex, renderShareIndexHtml, updateShareIndex } = require_github_pages();
var { repairObsidianSyntaxResidue } = require_html_repair();
var { validateHtmlArtifact } = require_html_qa();
var { slugify } = require_html();
var { migrateSettings } = require_settings();
var { DEFAULT_SHARE_HOME_PROFILE_ID, buildDefaultShareHomeProfile, normalizeShareHomeProfiles: normalizeShareHomeProfiles3, resolveShareHomeProfile: resolveShareHomeProfile3 } = require_share_home_profiles();
var { buildShortId, injectSocialMeta } = require_social();
var { applyPresetToOptions } = require_presets();
var DEFAULT_SETTINGS = {
  exportFolder: "html-exports",
  setupCompleted: false,
  activeShareHomeProfileId: DEFAULT_SHARE_HOME_PROFILE_ID,
  shareHomeProfiles: [buildDefaultShareHomeProfile({
    githubPublishPath: "marktl",
    githubShareHomeTitle: "\uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8"
  })],
  artifactGoal: "read",
  artifactType: "faithful-note",
  template: "minimal",
  exportGenre: "construction-daily",
  exportDepth: "standard",
  exportPurpose: "field-review",
  referenceContextNotePath: "",
  aiProvider: "none",
  conversionMode: "preserve",
  failurePolicy: "strict",
  previewSecurity: "sanitized",
  contextPackMode: "none",
  readerFeedbackMode: "none",
  shareTarget: "local-link",
  githubRepo: "",
  githubBranch: "main",
  githubToken: "",
  githubPagesBaseUrl: "",
  githubPublishPath: "marktl",
  githubShareHomeTitle: "\uC720\uB124\uCF54 \uC9C0\uC218 \uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5 \uD504\uB85C\uC81D\uD2B8",
  giscusRepo: "",
  giscusRepoId: "",
  giscusCategory: "Announcements",
  giscusCategoryId: "",
  giscusMapping: "pathname",
  giscusTheme: "preferred_color_scheme",
  timeoutMs: 9e5,
  claudePath: "",
  codexPath: "",
  geminiPath: "",
  copyShareLinkAfterExport: false
};
var MarktlExternalHtmlThumbnailModal = class extends import_obsidian8.Modal {
  constructor(app, htmlFileName, onChooseThumbnail, onContinueWithoutThumbnail) {
    super(app);
    this.htmlFileName = htmlFileName;
    this.onChooseThumbnail = onChooseThumbnail;
    this.onContinueWithoutThumbnail = onContinueWithoutThumbnail;
    this.modalEl.addClass("marktl-thumbnail-modal");
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("\uC378\uB124\uC77C \uC774\uBBF8\uC9C0 \uC120\uD0DD");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "\uC120\uD0DD\uD55C HTML\uC744 \uAC8C\uC2DC\uD558\uAE30 \uC804\uC5D0 \uACF5\uC720 \uD5C8\uBE0C \uCE74\uB4DC\uC5D0 \uC0AC\uC6A9\uD560 \uB300\uD45C \uC774\uBBF8\uC9C0\uB97C \uC120\uD0DD\uD558\uC138\uC694. \uC378\uB124\uC77C \uC5C6\uC774\uB3C4 \uAC8C\uC2DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
    });
    const selected = contentEl.createDiv({ cls: "marktl-reference-row" });
    selected.createEl("span", { text: `\uC120\uD0DD\uD55C HTML: ${this.htmlFileName}` });
    const actions = contentEl.createDiv({ cls: "marktl-result-actions" });
    const choose = actions.createEl("button", { text: "\uC378\uB124\uC77C \uC774\uBBF8\uC9C0 \uC120\uD0DD", type: "button" });
    choose.addClass("mod-cta");
    choose.addEventListener("click", () => {
      this.onChooseThumbnail();
      this.close();
    });
    actions.createEl("button", { text: "\uC378\uB124\uC77C \uC5C6\uC774 \uAC8C\uC2DC", type: "button" }).addEventListener("click", () => {
      this.close();
      this.onContinueWithoutThumbnail();
    });
    actions.createEl("button", { text: "\uCDE8\uC18C", type: "button" }).addEventListener("click", () => this.close());
  }
  onClose() {
    this.contentEl.empty();
  }
};
function resolveHomePath(command) {
  const value = String(command || "").trim();
  if (!value) {
    return "";
  }
  if (value === "~") {
    return String(process.env.HOME || value);
  }
  if (value.startsWith("~/")) {
    const home = String(process.env.HOME || "");
    return home ? `${home}${value.slice(1)}` : value;
  }
  return value;
}
function isExecutableFile(filePath) {
  const resolvedPath = resolveHomePath(filePath);
  try {
    const stat = (0, import_node_fs.statSync)(resolvedPath);
    return stat.isFile() && Boolean(stat.mode & 73);
  } catch (e) {
    return false;
  }
}
function isStaleCliPath(command) {
  const value = resolveHomePath(command);
  if (!value) {
    return false;
  }
  if (value.startsWith("/Volumes/")) {
    return true;
  }
  const home = String(process.env.HOME || "");
  const match = value.match(/^\/Users\/[^/]+\//);
  return Boolean(match && home && !value.startsWith(`${home}/`));
}
function isManagedMarktlCodexPath(command) {
  return /\/\.local\/bin\/marktl-codex$/.test(resolveHomePath(command));
}
function detectCodexCliPath(preferred = "") {
  const candidates = [
    preferred,
    "~/.local/bin/marktl-codex"
  ].map((value) => String(value || "").trim()).filter(Boolean);
  for (const candidate of candidates) {
    if (isManagedMarktlCodexPath(candidate) && !isStaleCliPath(candidate) && isExecutableFile(candidate)) {
      return candidate;
    }
  }
  return "";
}
function cleanPreflightOutput(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
function runCliPreflight(command, args, timeoutMs = 15e3) {
  return new Promise((resolve) => {
    const child = (0, import_node_child_process.spawn)(resolveHomePath(command), args, {
      env: {
        ...process.env,
        PATH: [
          process.env.PATH || "",
          "/opt/homebrew/bin",
          "/usr/local/bin"
        ].filter(Boolean).join(":")
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      resolve({ code: -1, output: `Timed out after ${timeoutMs}ms.` });
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve({ code: -1, output: error.message });
    });
    child.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve({ code: code != null ? code : -1, output });
    });
  });
}
var MarktlPlugin = class extends import_obsidian8.Plugin {
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
        const canRun = file instanceof import_obsidian8.TFile && file.extension === "md";
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
        const canRun = file instanceof import_obsidian8.TFile && file.extension === "md";
        if (canRun && !checking) {
          void this.exportActiveNote();
        }
        return canRun;
      }
    });
    this.addCommand({
      id: "manage-published-html",
      name: "Manage published MarkTL HTML",
      callback: () => {
        this.openPublishedHtmlManager();
      }
    });
    this.addCommand({
      id: "repair-all-share-hub-indexes",
      name: "Repair all MarkTL share hub indexes",
      callback: async () => {
        try {
          const result = await this.repairAllPublishedShareIndexes();
          new import_obsidian8.Notice(`MarkTL \uACF5\uC720 \uD5C8\uBE0C ${result.repairedCount}\uAC1C\uB97C \uBCF5\uAD6C\uD588\uC2B5\uB2C8\uB2E4.`);
        } catch (error) {
          new import_obsidian8.Notice(error instanceof Error ? error.message : String(error));
        }
      }
    });
    this.addCommand({
      id: "upload-existing-html-to-share-hub",
      name: "Upload existing HTML to MarkTL share hub...",
      callback: () => {
        this.openExportModal();
      }
    });
    this.addCommand({
      id: "open-marktl-setup",
      name: "Open Flytothesky MarkTL setup wizard",
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
    var _a;
    const migratedSettings = migrateSettings(DEFAULT_SETTINGS, await this.loadData());
    this.settings = migratedSettings.settings;
    let shouldSave = migratedSettings.migrated;
    if (["gemini"].includes(this.settings.aiProvider)) {
      this.settings.aiProvider = "none";
      shouldSave = true;
    }
    if (!["read", "decide", "review", "compare", "tune", "explain-code", "publish"].includes(this.settings.artifactGoal)) {
      this.settings.artifactGoal = DEFAULT_SETTINGS.artifactGoal;
      shouldSave = true;
    }
    if (!Number.isFinite(this.settings.timeoutMs) || this.settings.timeoutMs <= 3e5) {
      this.settings.timeoutMs = DEFAULT_SETTINGS.timeoutMs;
      shouldSave = true;
    }
    const normalizedSelection = normalizeExportSelection(this.settings);
    if (this.settings.exportGenre !== normalizedSelection.exportGenre) {
      this.settings.exportGenre = normalizedSelection.exportGenre;
      shouldSave = true;
    }
    if (this.settings.exportDepth !== normalizedSelection.exportDepth) {
      this.settings.exportDepth = normalizedSelection.exportDepth;
      shouldSave = true;
    }
    if (this.settings.exportPurpose !== normalizedSelection.exportPurpose) {
      this.settings.exportPurpose = normalizedSelection.exportPurpose;
      shouldSave = true;
    }
    if (typeof this.settings.referenceContextNotePath !== "string") {
      this.settings.referenceContextNotePath = "";
      shouldSave = true;
    }
    if (!["none", "linked-notes", "reference-note"].includes(this.settings.contextPackMode)) {
      this.settings.contextPackMode = DEFAULT_SETTINGS.contextPackMode;
      shouldSave = true;
    }
    if (!["none", "giscus"].includes(this.settings.readerFeedbackMode)) {
      this.settings.readerFeedbackMode = DEFAULT_SETTINGS.readerFeedbackMode;
      shouldSave = true;
    }
    if (!["fallback", "strict"].includes(this.settings.failurePolicy)) {
      this.settings.failurePolicy = DEFAULT_SETTINGS.failurePolicy;
      shouldSave = true;
    }
    if (this.settings.shareTarget === "github-pages" && this.settings.failurePolicy !== "strict") {
      this.settings.failurePolicy = "strict";
      shouldSave = true;
    }
    if (!String(this.settings.githubShareHomeTitle || "").trim() || this.settings.githubShareHomeTitle === "MarkTL Shared HTML") {
      this.settings.githubShareHomeTitle = DEFAULT_SETTINGS.githubShareHomeTitle;
      shouldSave = true;
    }
    const shareHomeProfiles = normalizeShareHomeProfiles3(this.settings.shareHomeProfiles, this.settings);
    if (JSON.stringify(this.settings.shareHomeProfiles) !== JSON.stringify(shareHomeProfiles)) {
      this.settings.shareHomeProfiles = shareHomeProfiles;
      shouldSave = true;
    }
    if (!shareHomeProfiles.some((profile) => profile.id === this.settings.activeShareHomeProfileId)) {
      this.settings.activeShareHomeProfileId = ((_a = shareHomeProfiles[0]) == null ? void 0 : _a.id) || DEFAULT_SHARE_HOME_PROFILE_ID;
      shouldSave = true;
    }
    if (this.settings.aiProvider === "codex") {
      const detectedCodex = detectCodexCliPath(this.settings.codexPath);
      const currentCodex = String(this.settings.codexPath || "").trim();
      if (detectedCodex && (!currentCodex || currentCodex === "codex" || isStaleCliPath(currentCodex) || currentCodex.startsWith("/") && !isManagedMarktlCodexPath(currentCodex) || isManagedMarktlCodexPath(currentCodex) && !isExecutableFile(currentCodex))) {
        this.settings.codexPath = detectedCodex;
        shouldSave = true;
      }
    }
    if (shouldSave) {
      await this.saveSettings();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async refreshSettingsFromDisk() {
    const previousSettings = this.settings;
    await this.loadSettings();
    if (!String(this.settings.githubToken || "").trim() && String((previousSettings == null ? void 0 : previousSettings.githubToken) || "").trim()) {
      this.settings.githubToken = previousSettings.githubToken;
    }
  }
  openSetupWizard() {
    new MarktlSetupModal(this.app, this).open();
  }
  openExportModal() {
    new MarktlExportModal(this.app, this, (options) => {
      void this.exportActiveNote(options);
    }, (options, includeThumbnail) => {
      this.chooseAndPublishExternalHtml(options, Boolean(includeThumbnail));
    }).open();
  }
  openPublishedHtmlManager(shareHomeProfileId = "") {
    new MarktlPublishedHtmlModal(this.app, this, shareHomeProfileId).open();
  }
  repairHtmlHead(html) {
    let value = String(html || "").trim();
    if (!value) {
      return '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>MarkTL Export</title>\n</head>\n<body></body>\n</html>';
    }
    if (!/<html\b/i.test(value)) {
      value = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
${value}
</body>
</html>`;
    }
    if (!/<!doctype\s+html/i.test(value)) {
      value = `<!doctype html>
${value}`;
    }
    value = value.replace(/<html\b([^>]*)>/i, (_match, attrs) => {
      const cleanAttrs = String(attrs || "").replace(/\s+lang=(["']).*?\1/i, "").trim();
      return `<html${cleanAttrs ? ` ${cleanAttrs}` : ""} lang="ko">`;
    });
    if (!/<head\b/i.test(value)) {
      value = value.replace(/<html\b[^>]*>/i, (match) => `${match}
<head></head>`);
    }
    if (!/<meta\s+charset=/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}
<meta charset="utf-8">`);
    }
    if (!/<meta\s+name=(["'])viewport\1/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}
<meta name="viewport" content="width=device-width, initial-scale=1">`);
    }
    return value;
  }
  async renderMermaidBlocksToStaticHtml(html, sourcePath) {
    let value = String(html || "");
    value = value.replace(/```mermaid\s*\n([\s\S]*?)```/gi, (_match, code) => `<pre class="marktl-mermaid-source"><code class="language-mermaid" data-marktl-mermaid="true">${this.escapeHtmlValue(code)}</code></pre>`);
    value = this.normalizeMermaidSourceBlocks(value);
    const pattern = /<pre\b([^>]*)>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
    let output = "";
    let lastIndex = 0;
    let rendered = 0;
    const warnings = [];
    for (const match of value.matchAll(pattern)) {
      const full = match[0];
      const attrs = `${match[1] || ""} ${match[2] || ""}`;
      if (!/language-mermaid|data-marktl-mermaid/i.test(attrs)) {
        continue;
      }
      output += value.slice(lastIndex, match.index);
      lastIndex = (match.index || 0) + full.length;
      const source = this.decodeHtmlEntities(match[3]).trim();
      if (!source) {
        output += full;
        continue;
      }
      try {
        output += await this.renderMermaidSvgFromMarkdown(source, sourcePath || "");
        rendered += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`\uCC38\uACE0: Mermaid \uB2E4\uC774\uC5B4\uADF8\uB7A8 \uB80C\uB354\uB9C1 \uC2E4\uD328, \uC6D0\uBB38 \uCF54\uB4DC\uB85C \uB300\uCCB4\uD588\uC2B5\uB2C8\uB2E4. ${message}`);
        output += `<details class="marktl-mermaid-source"><summary>\uB2E4\uC774\uC5B4\uADF8\uB7A8 \uC6D0\uBB38</summary><pre><code class="language-mermaid">${this.escapeHtmlValue(source)}</code></pre></details>`;
      }
    }
    if (lastIndex === 0) {
      return { html: value, rendered: 0, warnings };
    }
    output += value.slice(lastIndex);
    return { html: output, rendered, warnings };
  }
  normalizeMermaidSourceBlocks(html) {
    let value = String(html || "");
    const toMermaidPre = (code) => {
      const normalized = this.decodeHtmlEntities(String(code || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+>/g, "")).trim();
      if (!/^(gantt|graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gitGraph|pie|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|sankey-beta|xychart-beta|block-beta|packet-beta)\b/i.test(normalized)) {
        return null;
      }
      return `<pre class="marktl-mermaid-source"><code class="language-mermaid" data-marktl-mermaid="true">${this.escapeHtmlValue(normalized)}</code></pre>`;
    };
    value = value.replace(/<details\b[^>]*>\s*<summary\b[^>]*>[\s\S]*?mermaid[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi, (match, body) => {
      const pre = String(body || "").match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/i);
      if (!pre) {
        return match;
      }
      return toMermaidPre(pre[1]) || match;
    });
    value = value.replace(/<pre\b(?![^>]*marktl-mermaid-source)([^>]*)>([\s\S]*?)<\/pre>/gi, (match, _attrs, code) => {
      if (/<code\b/i.test(code)) {
        return match;
      }
      return toMermaidPre(code) || match;
    });
    return value;
  }
  async renderMermaidSvgFromMarkdown(source, sourcePath) {
    const renderer = import_obsidian8.MarkdownRenderer;
    if (!renderer) {
      throw new Error("Obsidian MarkdownRenderer\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }
    const container = document.createElement("div");
    container.classList.add("marktl-mermaid-render-host");
    container.setAttribute("style", "position:fixed;left:-10000px;top:0;width:1200px;max-width:1200px;opacity:0;pointer-events:none;");
    document.body.appendChild(container);
    try {
      const markdown = `\`\`\`mermaid
${source}
\`\`\``;
      if (typeof renderer.render === "function") {
        await renderer.render(this.app, markdown, container, sourcePath, this);
      } else if (typeof renderer.renderMarkdown === "function") {
        await renderer.renderMarkdown(markdown, container, sourcePath, this);
      } else {
        throw new Error("\uC9C0\uC6D0\uB418\uB294 MarkdownRenderer API\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const svg = container.querySelector("svg");
      if (!svg) {
        throw new Error("\uB80C\uB354\uB9C1\uB41C SVG\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      }
      this.sanitizeRenderedSvg(svg);
      svg.setAttribute("role", "img");
      svg.setAttribute("style", "display:block;max-width:100%;height:auto;margin:0 auto;");
      return `<figure class="marktl-mermaid-rendered">${svg.outerHTML}</figure>`;
    } finally {
      container.remove();
    }
  }
  sanitizeRenderedSvg(svg) {
    svg.querySelectorAll("script,foreignObject").forEach((node) => node.remove());
    svg.querySelectorAll("*").forEach((node) => {
      for (const attr of Array.from(node.attributes || [])) {
        if (/^on/i.test(attr.name)) {
          node.removeAttribute(attr.name);
        }
        if (/^(href|xlink:href)$/i.test(attr.name) && /^javascript:/i.test(attr.value || "")) {
          node.removeAttribute(attr.name);
        }
      }
    });
  }
  decodeHtmlEntities(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value || "");
    return textarea.value;
  }
  escapeHtmlValue(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  async ensureAiExportReady(options, progress) {
    if (options.shareTarget === "github-pages" && options.aiProvider === "none") {
      throw new Error("GitHub Pages \uAC8C\uC2DC\uC5D0\uB294 \uC791\uB3D9 \uC911\uC778 AI provider\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. Codex CLI\uB97C \uC120\uD0DD\uD558\uAC70\uB098 \uACF5\uC720 \uB300\uC0C1\uC744 \uB85C\uCEEC \uD30C\uC77C \uB9C1\uD06C\uB85C \uBC14\uAFB8\uC138\uC694.");
    }
    if (options.shareTarget === "github-pages" && options.failurePolicy !== "strict") {
      options.failurePolicy = "strict";
      this.settings.failurePolicy = "strict";
      await this.saveSettings();
      progress.addStep("GitHub Pages \uAC8C\uC2DC\uB97C \uC704\uD574 AI \uC2E4\uD328 \uC815\uCC45\uC744 strict\uB85C \uACE0\uC815\uD588\uC2B5\uB2C8\uB2E4.");
    }
    if (options.aiProvider !== "codex") {
      return;
    }
    const currentPath = String(this.settings.codexPath || "").trim();
    if (isManagedMarktlCodexPath(currentPath) && !isExecutableFile(currentPath)) {
      throw new Error(`MarkTL Codex wrapper\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4: ${currentPath}. \uACF5\uC720 \uC124\uC815\uC744 /opt/homebrew/bin/codex\uB85C \uBC14\uAFB8\uC9C0 \uB9D0\uACE0 \uC774 Mac\uC5D0 wrapper\uB97C \uC0DD\uC131\uD558\uC138\uC694.`);
    }
    const detectedPath = detectCodexCliPath(currentPath);
    const shouldRepairPath = !currentPath || currentPath === "codex" || isStaleCliPath(currentPath) || currentPath.startsWith("/") && !isManagedMarktlCodexPath(currentPath);
    if (shouldRepairPath) {
      if (!detectedPath) {
        throw new Error(`Codex CLI \uACBD\uB85C\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: ${currentPath || "(empty)"}. \uACF5\uC720 \uC124\uC815\uC5D0 /opt/homebrew/bin/codex\uB97C \uC800\uC7A5\uD558\uC9C0 \uB9D0\uACE0 \uC774 Mac\uC5D0 ~/.local/bin/marktl-codex wrapper\uB97C \uC0DD\uC131\uD558\uC138\uC694.`);
      }
      this.settings.codexPath = detectedPath;
      await this.saveSettings();
      progress.addStep(`Codex \uACBD\uB85C \uC790\uB3D9 \uBCF5\uAD6C: ${detectedPath}`);
    }
    const command = String(this.settings.codexPath || "codex").trim();
    let version = await runCliPreflight(command, ["--version"], 15e3);
    if (version.code !== 0) {
      const fallbackPath = isManagedMarktlCodexPath(command) ? "" : detectCodexCliPath();
      if (fallbackPath && fallbackPath !== command) {
        this.settings.codexPath = fallbackPath;
        await this.saveSettings();
        version = await runCliPreflight(fallbackPath, ["--version"], 15e3);
        if (version.code === 0) {
          progress.addStep(`Codex \uACBD\uB85C \uC790\uB3D9 \uBCF5\uAD6C: ${fallbackPath}`);
          progress.addStep(`Codex \uC0AC\uC804 \uC810\uAC80 \uD1B5\uACFC: ${cleanPreflightOutput(version.output) || fallbackPath}`);
          return;
        }
      }
      throw new Error(`Codex CLI \uC0AC\uC804 \uC810\uAC80 \uC2E4\uD328: ${command}: ${cleanPreflightOutput(version.output) || "\uC2E4\uD589\uD560 \uC218 \uC5C6\uC74C"}`);
    }
    progress.addStep(`Codex \uC0AC\uC804 \uC810\uAC80 \uD1B5\uACFC: ${cleanPreflightOutput(version.output) || command}`);
  }
  async exportActiveNote(overrides = {}) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian8.TFile) || file.extension !== "md") {
      new import_obsidian8.Notice("Open a Markdown note before exporting HTML.");
      return;
    }
    const options = this.resolveExportOptions(overrides);
    const shareHomeProfile = resolveShareHomeProfile3(this.settings, options.shareHomeProfileId);
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Share hub: ${shareHomeProfile.title} (${shareHomeProfile.basePath || "/"})`);
    progress.addStep(`Goal: ${options.artifactGoal}`);
    progress.addStep(`Artifact: ${options.artifactType}`);
    progress.addStep(`Template: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === "none" ? "local fallback" : options.aiProvider}`);
    const privacyNote = getProviderPrivacyNote2(options.aiProvider);
    if (privacyNote) {
      progress.addStep(`Privacy note: ${privacyNote}`);
    }
    progress.addStep(`Mode: ${options.conversionMode}; preview: ${options.previewSecurity}`);
    progress.addStep(`Timeout: ${Math.round(this.settings.timeoutMs / 1e3)}s`);
    try {
      await this.ensureAiExportReady(options, progress);
      progress.addStep("Reading active Markdown note...");
      const markdown = await this.app.vault.read(file);
      const outputPlan = await this.prepareOutputPlan(file, options);
      const assetResult = await this.resolveImageAssets(markdown, file, outputPlan);
      progress.addStep(assetResult.mappings.length > 0 ? `Resolved ${assetResult.mappings.length} local image asset(s).` : "No local image assets found.");
      const contextResult = await this.resolveContextPack(markdown, file, options);
      if (contextResult.count > 0) {
        progress.addStep(options.contextPackMode === "reference-note" ? `Loaded reference context note: ${options.referenceContextNotePath}` : `Loaded ${contextResult.count} linked context note(s).`);
      } else if (options.contextPackMode !== "none") {
        progress.addStep(options.contextPackMode === "reference-note" ? "No reference context note loaded." : "No linked context notes found.");
      }
      progress.addStep(options.aiProvider === "none" ? "Running local converter..." : `Running ${options.aiProvider} CLI...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        artifactGoal: options.artifactGoal,
        artifactType: options.artifactType,
        mode: options.conversionMode,
        template: options.template,
        exportGenre: options.exportGenre,
        exportDepth: options.exportDepth,
        exportPurpose: options.exportPurpose,
        referenceContextNotePath: options.referenceContextNotePath,
        trusted: options.previewSecurity === "trusted",
        strictAiFailures: options.failurePolicy === "strict" || options.shareTarget === "github-pages",
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        assetMappings: assetResult.mappings,
        contextPack: contextResult.markdown,
        cliPaths: {
          claude: this.settings.claudePath,
          codex: this.settings.codexPath
        }
      });
      if (options.shareTarget === "github-pages" && result.usedFallback) {
        throw new Error("GitHub Pages publishing blocked because AI conversion used local fallback.");
      }
      progress.addStep(result.usedFallback ? "Generated local fallback HTML." : "Generated AI HTML.");
      const shareMetadata = this.extractShareMetadata(markdown, outputPlan.basename);
      const shortId = buildShortId(outputPlan.basename);
      const socialUrl = options.shareTarget === "github-pages" ? buildShortPagesUrl(this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo), shareHomeProfile.basePath, shortId) : "";
      const socialImage = options.shareTarget === "github-pages" && assetResult.mappings[0] ? `${socialUrl}assets/${assetResult.mappings[0].destinationPath.split("/").pop() || ""}` : "";
      const socialHtml = injectSocialMeta(result.html, {
        title: shareMetadata.title,
        description: shareMetadata.excerpt,
        url: socialUrl,
        image: socialImage
      });
      const imageRewrittenHtml = rewriteHtmlImageSources(socialHtml, assetResult.mappings);
      const feedbackResult = this.applyReaderFeedback(imageRewrittenHtml, options);
      let html = this.repairHtmlHead(feedbackResult.html);
      if (feedbackResult.injected) {
        progress.addStep("Added Giscus reader feedback.");
      }
      const mermaidResult = await this.renderMermaidBlocksToStaticHtml(html, file.path);
      html = this.repairHtmlHead(mermaidResult.html);
      if (mermaidResult.rendered > 0) {
        progress.addStep(`Rendered ${mermaidResult.rendered} Mermaid diagram(s) to static HTML/SVG.`);
      }
      const repairedHtml = repairObsidianSyntaxResidue(html);
      if (repairedHtml !== html) {
        html = this.repairHtmlHead(repairedHtml);
        progress.addStep("Cleaned residual Obsidian-only syntax before HTML QA.");
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: options.previewSecurity === "trusted",
        artifactGoal: options.artifactGoal,
        exportGenre: options.exportGenre,
        exportDepth: options.exportDepth,
        assetMappings: assetResult.mappings
      });
      const fatalQaWarnings = qaWarnings.filter((warning) => /^HTML QA fatal:/i.test(warning));
      if (options.shareTarget === "github-pages" && fatalQaWarnings.length > 0) {
        throw new Error(`GitHub Pages publishing blocked by HTML QA: ${fatalQaWarnings[0]}`);
      }
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep("HTML QA passed basic checks.");
      }
      const warnings = [...result.warnings, ...assetResult.warnings, ...contextResult.warnings, ...feedbackResult.warnings, ...mermaidResult.warnings, ...qaWarnings];
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
        sourcePath: file.path,
        title: shareMetadata.title,
        warnings,
        trusted: options.previewSecurity === "trusted",
        previewSecurity: options.previewSecurity
      });
      if (options.copyShareLinkAfterExport) {
        progress.addStep(publicUrl ? "Copying public share link..." : "Copying local share link...");
        await this.copyShareLink(outputPath, publicUrl);
      }
      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        options,
        sourcePath: file.path,
        sourceTitle: shareMetadata.title,
        presetId: options.presetId,
        previewSecurity: options.previewSecurity,
        localPath: outputPath,
        outputPath,
        usedFallback: result.usedFallback,
        aiProvider: options.aiProvider,
        assetCount: assetResult.mappings.length,
        warnings,
        shareTarget: options.shareTarget,
        copiedShareLink: options.copyShareLinkAfterExport,
        commentsEnabled: feedbackResult.injected,
        commentsStatus: this.describeReaderFeedback(options, feedbackResult),
        shareTitle: shareMetadata.title,
        shareHomeTitle: shareHomeProfile.title,
        publicUrl,
        shareHomeUrl
      });
      if (result.usedFallback && options.aiProvider !== "none") {
        new import_obsidian8.Notice("AI conversion failed; local fallback HTML was generated.");
      } else {
        new import_obsidian8.Notice(`HTML exported to ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new import_obsidian8.Notice(`HTML export failed: ${message}`);
    }
  }
  chooseAndPublishExternalHtml(overrides = {}, includeThumbnail = false) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html,.htm,text/html";
    input.style.display = "none";
    input.addEventListener("change", () => {
      var _a;
      const file = (_a = input.files) == null ? void 0 : _a[0];
      input.remove();
      if (!file) {
        return;
      }
      if (!/\.html?$/i.test(file.name) && file.type !== "text/html") {
        new import_obsidian8.Notice("HTML \uD30C\uC77C\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
        return;
      }
      if (includeThumbnail) {
        this.openExternalHtmlThumbnailPrompt(file, overrides);
        return;
      }
      void this.publishExternalHtmlFile(file, overrides);
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  }
  openExternalHtmlThumbnailPrompt(htmlFile, overrides) {
    new MarktlExternalHtmlThumbnailModal(
      this.app,
      htmlFile.name,
      () => {
        this.chooseExternalHtmlThumbnail(
          (thumbnailFile) => {
            void this.publishExternalHtmlFile(htmlFile, overrides, thumbnailFile);
          },
          () => {
            new import_obsidian8.Notice("\uC378\uB124\uC77C \uC120\uD0DD\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC120\uD0DD\uD558\uAC70\uB098 \uC378\uB124\uC77C \uC5C6\uC774 \uAC8C\uC2DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
            this.openExternalHtmlThumbnailPrompt(htmlFile, overrides);
          },
          () => {
            new import_obsidian8.Notice("\uC378\uB124\uC77C\uC740 PNG, JPG, WebP, GIF, AVIF, SVG \uC774\uBBF8\uC9C0\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
            this.openExternalHtmlThumbnailPrompt(htmlFile, overrides);
          }
        );
      },
      () => {
        void this.publishExternalHtmlFile(htmlFile, overrides);
      }
    ).open();
  }
  chooseExternalHtmlThumbnail(onChoose, onCancel, onInvalid) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.webp,.gif,.avif,.svg,image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml";
    input.style.display = "none";
    let handled = false;
    input.addEventListener("change", () => {
      var _a;
      handled = true;
      const file = (_a = input.files) == null ? void 0 : _a[0];
      input.remove();
      if (!file) {
        onCancel == null ? void 0 : onCancel();
        return;
      }
      if (!this.isSupportedExternalThumbnail(file)) {
        onInvalid == null ? void 0 : onInvalid();
        return;
      }
      onChoose(file);
    }, { once: true });
    input.addEventListener("cancel", () => {
      if (handled) {
        return;
      }
      handled = true;
      input.remove();
      onCancel == null ? void 0 : onCancel();
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  }
  isSupportedExternalThumbnail(file) {
    if (!isSupportedExternalThumbnailFileName(file.name)) {
      return false;
    }
    return !file.type || file.type.startsWith("image/");
  }
  async publishExternalHtmlFile(file, overrides = {}, thumbnailFile) {
    const options = {
      ...this.resolveExportOptions(overrides),
      shareTarget: "github-pages",
      previewSecurity: "trusted",
      failurePolicy: "strict",
      aiProvider: "none",
      copyShareLinkAfterExport: true
    };
    const shareHomeProfile = resolveShareHomeProfile3(this.settings, options.shareHomeProfileId);
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`Share hub: ${shareHomeProfile.title} (${shareHomeProfile.basePath || "/"})`);
    progress.addStep(`HTML upload: ${file.name}`);
    if (thumbnailFile) {
      progress.addStep(`Thumbnail upload: ${thumbnailFile.name}`);
    }
    progress.addStep("AI conversion: skipped for existing HTML file.");
    try {
      progress.addStep("Reading selected HTML file...");
      const rawHtml = await file.text();
      if (!rawHtml.trim()) {
        throw new Error("\uC120\uD0DD\uD55C HTML \uD30C\uC77C\uC774 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.");
      }
      const outputPlan = await this.prepareExternalHtmlOutputPlan(file.name);
      const sourcePath = `External HTML file: ${file.name}`;
      const metadata = extractExternalHtmlMetadata(rawHtml, file.name);
      const shortId = buildShortId(outputPlan.basename);
      const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo);
      const socialUrl = buildShortPagesUrl(pagesBaseUrl, shareHomeProfile.basePath, shortId);
      const thumbnailMapping = thumbnailFile ? await this.writeExternalThumbnailAsset(outputPlan, thumbnailFile) : null;
      const assetMappings = thumbnailMapping ? [thumbnailMapping] : [];
      const thumbnailPublicUrl = thumbnailMapping ? `${socialUrl}assets/${encodeURIComponent(thumbnailMapping.destinationPath.split("/").pop() || "thumbnail")}` : "";
      if (thumbnailMapping) {
        progress.addStep("Stored thumbnail asset for the share hub card.");
      }
      progress.addStep(`Resolved title: ${metadata.title}`);
      let html = this.repairHtmlHead(rawHtml);
      html = this.ensureHtmlTitle(html, metadata.title);
      html = injectSocialMeta(html, {
        title: metadata.title,
        description: metadata.excerpt,
        url: socialUrl,
        image: thumbnailPublicUrl
      });
      const feedbackResult = this.applyReaderFeedback(html, options);
      html = this.repairHtmlHead(feedbackResult.html);
      if (feedbackResult.injected) {
        progress.addStep("Added Giscus reader feedback.");
      }
      const repairedHtml = repairObsidianSyntaxResidue(html);
      if (repairedHtml !== html) {
        html = this.repairHtmlHead(repairedHtml);
        progress.addStep("Cleaned residual Obsidian-only syntax before HTML QA.");
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: true,
        artifactGoal: "publish",
        externalHtml: true,
        assetMappings
      });
      const fatalQaWarnings = qaWarnings.filter((warning) => /^HTML QA fatal:/i.test(warning));
      if (fatalQaWarnings.length > 0) {
        throw new Error(`GitHub Pages publishing blocked by HTML QA: ${fatalQaWarnings[0]}`);
      }
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA produced ${qaWarnings.length} warning(s).`);
      } else {
        progress.addStep("HTML QA passed basic checks.");
      }
      const assetWarnings = findExternalHtmlAssetWarnings(html);
      if (assetWarnings.length > 0) {
        progress.addStep("HTML has relative asset reference warning(s).");
      }
      const warnings = [...assetWarnings, ...feedbackResult.warnings, ...qaWarnings];
      progress.addStep("Writing HTML upload bundle to vault...");
      const outputPath = await this.writeHtmlFile(outputPlan, html, options, sourcePath);
      progress.addStep("Publishing GitHub Pages HTML upload...");
      const publishResult = await this.publishGithubPages(outputPlan, assetMappings, sourcePath, "", options, shortId, metadata);
      progress.addStep(`Published: ${publishResult.publicUrl}`);
      progress.addStep("Opening internal preview pane...");
      await this.openPreview({
        html,
        filePath: outputPath,
        sourcePath,
        title: metadata.title,
        warnings,
        trusted: true,
        previewSecurity: "trusted"
      });
      progress.addStep("Copying public share link...");
      await this.copyShareLink(outputPath, publishResult.publicUrl);
      progress.complete(`Done: ${outputPath}`);
      this.openResultSummary({
        options,
        sourceKind: "html-file",
        sourcePath,
        sourceTitle: metadata.title,
        presetId: options.presetId,
        previewSecurity: "trusted",
        localPath: outputPath,
        outputPath,
        usedFallback: false,
        aiProvider: "none",
        assetCount: assetMappings.length,
        warnings,
        shareTarget: "github-pages",
        copiedShareLink: true,
        commentsEnabled: feedbackResult.injected,
        commentsStatus: this.describeReaderFeedback(options, feedbackResult),
        shareTitle: metadata.title,
        shareHomeTitle: shareHomeProfile.title,
        publicUrl: publishResult.publicUrl,
        shareHomeUrl: publishResult.shareHomeUrl
      });
      new import_obsidian8.Notice(`HTML uploaded to ${publishResult.publicUrl}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new import_obsidian8.Notice(`HTML upload failed: ${message}`);
    }
  }
  async prepareOutputPlan(source, options) {
    const folder = (0, import_obsidian8.normalizePath)(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!await this.app.vault.adapter.exists(folder)) {
      await this.app.vault.createFolder(folder);
    }
    const basename = slugify(source.basename);
    const bundled = options.shareTarget === "static-bundle" || options.shareTarget === "github-pages";
    const outputPath = bundled ? (0, import_obsidian8.normalizePath)(`${folder}/share/${basename}/index.html`) : (0, import_obsidian8.normalizePath)(`${folder}/${basename}.html`);
    const assetFolder = bundled ? (0, import_obsidian8.normalizePath)(`${folder}/share/${basename}/assets`) : (0, import_obsidian8.normalizePath)(`${folder}/${basename}-assets`);
    const assetRelativePrefix = bundled ? "assets" : `${basename}-assets`;
    return { folder, basename, outputPath, assetFolder, assetRelativePrefix };
  }
  async prepareExternalHtmlOutputPlan(fileName) {
    const folder = (0, import_obsidian8.normalizePath)(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!await this.app.vault.adapter.exists(folder)) {
      await this.app.vault.createFolder(folder);
    }
    const basename = basenameFromHtmlFileName(fileName);
    const outputPath = (0, import_obsidian8.normalizePath)(`${folder}/share/${basename}/index.html`);
    const assetFolder = (0, import_obsidian8.normalizePath)(`${folder}/share/${basename}/assets`);
    return {
      folder,
      basename,
      outputPath,
      assetFolder,
      assetRelativePrefix: "assets"
    };
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
      const destinationPath = (0, import_obsidian8.normalizePath)(`${plan.assetFolder}/${assetFileName}`);
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
          (0, import_obsidian8.normalizePath)(target)
        ]
      });
    }
    return { mappings, warnings };
  }
  async writeExternalThumbnailAsset(plan, file) {
    if (!this.isSupportedExternalThumbnail(file)) {
      throw new Error("\uC378\uB124\uC77C\uC740 PNG, JPG, WebP, GIF, AVIF, SVG \uC774\uBBF8\uC9C0\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    }
    const assetFileName = externalThumbnailAssetName(file.name);
    const destinationPath = (0, import_obsidian8.normalizePath)(`${plan.assetFolder}/${assetFileName}`);
    const relativeSrc = encodeURI(`${plan.assetRelativePrefix}/${assetFileName}`);
    const data = await file.arrayBuffer();
    await this.ensureParentFolder(destinationPath);
    await this.app.vault.adapter.writeBinary(destinationPath, data);
    return {
      original: file.name,
      sourcePath: `External thumbnail file: ${file.name}`,
      destinationPath,
      relativeSrc,
      aliases: [
        file.name,
        assetFileName
      ]
    };
  }
  ensureHtmlTitle(html, title) {
    const value = String(html || "");
    if (/<title\b/i.test(value)) {
      return value;
    }
    const safeTitle = this.escapeHtmlValue(title || "MarkTL HTML upload");
    if (/<\/head>/i.test(value)) {
      return value.replace(/<\/head>/i, `<title>${safeTitle}</title>
</head>`);
    }
    return `<title>${safeTitle}</title>
${value}`;
  }
  resolveImageFile(target, source) {
    var _a;
    const linked = this.app.metadataCache.getFirstLinkpathDest(target, source.path);
    if (linked instanceof import_obsidian8.TFile) {
      return linked;
    }
    const normalized = (0, import_obsidian8.normalizePath)(target);
    const direct = this.app.vault.getAbstractFileByPath(normalized);
    if (direct instanceof import_obsidian8.TFile) {
      return direct;
    }
    if ((_a = source.parent) == null ? void 0 : _a.path) {
      const relative = this.app.vault.getAbstractFileByPath((0, import_obsidian8.normalizePath)(`${source.parent.path}/${target}`));
      if (relative instanceof import_obsidian8.TFile) {
        return relative;
      }
    }
    const byName = this.app.vault.getFiles().find((file) => file.name === target || file.path.endsWith(`/${target}`));
    return byName instanceof import_obsidian8.TFile ? byName : null;
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
    var _a, _b;
    return {
      template: overrides.template || this.settings.template,
      presetId: overrides.presetId,
      shareHomeProfileId: overrides.shareHomeProfileId || this.settings.activeShareHomeProfileId,
      artifactGoal: overrides.artifactGoal || this.settings.artifactGoal,
      artifactType: overrides.artifactType || this.settings.artifactType,
      exportGenre: overrides.exportGenre || this.settings.exportGenre,
      exportDepth: overrides.exportDepth || this.settings.exportDepth,
      exportPurpose: overrides.exportPurpose || this.settings.exportPurpose,
      referenceContextNotePath: (_a = overrides.referenceContextNotePath) != null ? _a : this.settings.referenceContextNotePath,
      aiProvider: overrides.aiProvider || this.settings.aiProvider,
      conversionMode: overrides.conversionMode || this.settings.conversionMode,
      failurePolicy: overrides.failurePolicy || this.settings.failurePolicy,
      previewSecurity: overrides.previewSecurity || this.settings.previewSecurity,
      contextPackMode: overrides.contextPackMode || this.settings.contextPackMode,
      readerFeedbackMode: overrides.readerFeedbackMode || this.settings.readerFeedbackMode,
      shareTarget: overrides.shareTarget || this.settings.shareTarget,
      copyShareLinkAfterExport: (_b = overrides.copyShareLinkAfterExport) != null ? _b : this.settings.copyShareLinkAfterExport
    };
  }
  applyReaderFeedback(html, options) {
    if (!shouldAttachReaderFeedback(options)) {
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
  describeReaderFeedback(options, feedback) {
    if (options.readerFeedbackMode !== "giscus") {
      return "Reader comments disabled";
    }
    if (!shouldAttachReaderFeedback(options)) {
      return "Reader comments skipped for local file link";
    }
    if (feedback.injected) {
      return "Giscus GitHub comments enabled";
    }
    return feedback.warnings.length > 0 ? `Giscus setup needed: ${feedback.warnings[0]}` : "Giscus comments were not added";
  }
  async resolveContextPack(markdown, source, options) {
    if (options.contextPackMode === "reference-note") {
      const referencePath = String(options.referenceContextNotePath || "").trim();
      if (!referencePath) {
        return { markdown: "", count: 0, warnings: ["Reference context note is not selected."] };
      }
      const linked = this.resolveMarkdownContextFile(referencePath, source);
      if (!linked) {
        return { markdown: "", count: 0, warnings: [`Reference context note not found: ${referencePath}`] };
      }
      if (linked.path === source.path) {
        return { markdown: "", count: 0, warnings: ["Reference context note is the active note; skipped duplicate context."] };
      }
      try {
        const items2 = [{
          target: referencePath,
          path: linked.path,
          content: await this.app.vault.read(linked)
        }];
        return {
          markdown: buildContextPackMarkdown(items2, { kind: "reference" }),
          count: 1,
          warnings: []
        };
      } catch (e) {
        return { markdown: "", count: 0, warnings: [`Reference context note unreadable: ${referencePath}`] };
      }
    }
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
    const candidates = this.buildMarkdownContextTargetVariants(target);
    for (const candidate of candidates) {
      const linked = this.app.metadataCache.getFirstLinkpathDest(candidate, source.path);
      if (linked instanceof import_obsidian8.TFile && linked.extension === "md") {
        return linked;
      }
    }
    for (const candidate of candidates) {
      const normalized = (0, import_obsidian8.normalizePath)(candidate.endsWith(".md") ? candidate : `${candidate}.md`);
      const direct = this.app.vault.getAbstractFileByPath(normalized);
      if (direct instanceof import_obsidian8.TFile && direct.extension === "md") {
        return direct;
      }
      if ((_a = source.parent) == null ? void 0 : _a.path) {
        const relative = this.app.vault.getAbstractFileByPath((0, import_obsidian8.normalizePath)(`${source.parent.path}/${normalized}`));
        if (relative instanceof import_obsidian8.TFile && relative.extension === "md") {
          return relative;
        }
      }
    }
    const candidateKeys = new Set(candidates.flatMap((candidate) => {
      const noExt = candidate.replace(/\.md$/i, "");
      const withExt = candidate.endsWith(".md") ? candidate : `${candidate}.md`;
      return [
        noExt,
        noExt.normalize("NFC"),
        noExt.normalize("NFD"),
        withExt,
        withExt.normalize("NFC"),
        withExt.normalize("NFD")
      ].map((value) => (0, import_obsidian8.normalizePath)(value));
    }));
    const byName = this.app.vault.getFiles().find((file) => {
      if (file.extension !== "md") {
        return false;
      }
      const fileKeys = [
        file.basename,
        file.basename.normalize("NFC"),
        file.basename.normalize("NFD"),
        file.name,
        file.name.normalize("NFC"),
        file.name.normalize("NFD"),
        file.path,
        file.path.normalize("NFC"),
        file.path.normalize("NFD")
      ].map((value) => (0, import_obsidian8.normalizePath)(value));
      return fileKeys.some((key) => candidateKeys.has(key) || [...candidateKeys].some((candidate) => key.endsWith(`/${candidate}`)));
    });
    return byName instanceof import_obsidian8.TFile ? byName : null;
  }
  buildMarkdownContextTargetVariants(target) {
    const raw = String(target || "").replace(/\\/g, "/").replace(/^\.\//, "").trim();
    if (!raw) {
      return [];
    }
    const withoutHash = raw.split("#")[0].trim();
    const withoutAlias = withoutHash.split("|")[0].trim();
    const values = [
      raw,
      withoutHash,
      withoutAlias,
      withoutAlias.replace(/\.md$/i, "")
    ].filter(Boolean);
    const expanded = [];
    for (const value of values) {
      expanded.push(value, value.normalize("NFC"), value.normalize("NFD"));
      try {
        const decoded = decodeURI(value);
        expanded.push(decoded, decoded.normalize("NFC"), decoded.normalize("NFD"));
      } catch (e) {
      }
    }
    return [...new Set(expanded.map((value) => (0, import_obsidian8.normalizePath)(value)).filter(Boolean))];
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
    const readmePath = (0, import_obsidian8.normalizePath)(`${folder}/share/${basename}/README.md`);
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
  getGithubPagesContext(shareHomeProfileId = this.settings.activeShareHomeProfileId) {
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error("GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.");
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error("GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.");
    }
    const branch = this.settings.githubBranch.trim() || "main";
    const shareHomeProfile = resolveShareHomeProfile3(this.settings, shareHomeProfileId);
    const basePath = shareHomeProfile.basePath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo);
    return {
      ...repo,
      branch,
      basePath,
      pagesBaseUrl,
      indexPath: buildPublishPath(basePath, "", "index.json"),
      indexHtmlPath: buildPublishPath(basePath, "", "index.html"),
      shareHomeProfile
    };
  }
  async loadPublishedShareIndex(shareHomeProfileId = "") {
    await this.refreshSettingsFromDisk();
    const context = this.getGithubPagesContext(shareHomeProfileId || this.settings.activeShareHomeProfileId);
    const existing = await this.getGithubJson(context.owner, context.repo, context.branch, context.indexPath);
    return {
      context,
      index: repairShareIndex(existing || { items: [] })
    };
  }
  async repairPublishedShareIndex(shareHomeProfileId = "") {
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    await this.writePublishedShareIndex(context, index);
    return index;
  }
  async repairAllPublishedShareIndexes() {
    await this.refreshSettingsFromDisk();
    const profiles = normalizeShareHomeProfiles3(this.settings.shareHomeProfiles, this.settings);
    const results = [];
    let itemCount = 0;
    for (const profile of profiles) {
      const index = await this.repairPublishedShareIndex(profile.id);
      results.push({
        profileId: profile.id,
        title: profile.title,
        itemCount: index.items.length
      });
      itemCount += index.items.length;
    }
    return {
      repairedCount: results.length,
      itemCount,
      results
    };
  }
  async writePublishedShareIndex(context, index) {
    const html = renderShareIndexHtml(index, {
      title: context.shareHomeProfile.title,
      eyebrow: context.shareHomeProfile.eyebrow,
      description: context.shareHomeProfile.description,
      baseUrl: buildShareHomeUrl(context.pagesBaseUrl, context.basePath).replace(/\/+$/g, "")
    });
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexHtmlPath, html);
  }
  async deletePublishedShareItem(target, shareHomeProfileId = "") {
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    const targetKeys = this.shareDeleteKeys(target);
    const removed = [];
    const kept = [];
    for (const item of index.items) {
      const keys = this.shareDeleteKeys(item);
      const matches = keys.some((key) => targetKeys.includes(key));
      if (matches) {
        removed.push(item);
      } else {
        kept.push(item);
      }
    }
    if (!removed.length) {
      throw new Error("No matching published artifact was found.");
    }
    const nextIndex = repairShareIndex({
      ...index,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      items: kept
    });
    for (const item of removed) {
      if (item.slug) {
        await this.deleteGithubPathRecursive(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, item.slug, ""));
      }
      if (item.shortId) {
        await this.deleteGithubPathRecursive(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, `s/${item.shortId}`, ""));
      }
    }
    await this.writePublishedShareIndex(context, nextIndex);
    return { removedCount: removed.length, index: nextIndex };
  }
  async replacePublishedShareThumbnail(target, file, shareHomeProfileId = "") {
    if (!this.isSupportedExternalThumbnail(file)) {
      throw new Error("\uC378\uB124\uC77C\uC740 PNG, JPG, WebP, GIF, AVIF, SVG \uC774\uBBF8\uC9C0\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    }
    const extension = externalThumbnailExtension(file.name);
    const assetName = `thumbnail-${Date.now().toString(36)}${extension}`;
    const { context, index } = await this.loadPublishedShareIndex(shareHomeProfileId);
    const targetKeys = this.shareDeleteKeys(target);
    const data = await file.arrayBuffer();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    let updatedCount = 0;
    let lastThumbnailUrl = "";
    for (const item of index.items) {
      const keys = this.shareDeleteKeys(item);
      const matches = keys.some((key) => targetKeys.includes(key));
      if (!matches) {
        continue;
      }
      if (!item.slug && !item.shortId) {
        throw new Error("\uC120\uD0DD\uD55C \uAC8C\uC2DC\uBB3C\uC5D0 slug \uB610\uB294 shortId\uAC00 \uC5C6\uC5B4 \uC378\uB124\uC77C\uC744 \uAD50\uCCB4\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
      }
      if (item.slug) {
        await this.putGithubFile(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, item.slug, `assets/${assetName}`), data);
      }
      if (item.shortId) {
        await this.putGithubFile(context.owner, context.repo, context.branch, buildPublishPath(context.basePath, `s/${item.shortId}`, `assets/${assetName}`), data);
      }
      const thumbnailUrl = item.shortId ? `${buildShortPagesUrl(context.pagesBaseUrl, context.basePath, item.shortId)}assets/${encodeURIComponent(assetName)}` : `${buildPagesUrl(context.pagesBaseUrl, context.basePath, item.slug || "")}assets/${encodeURIComponent(assetName)}`;
      item.thumbnailUrl = thumbnailUrl;
      item.updatedAt = now;
      item.schemaVersion = Math.max(Number(item.schemaVersion || 0), 2);
      lastThumbnailUrl = thumbnailUrl;
      updatedCount += 1;
    }
    if (!updatedCount) {
      throw new Error("No matching published artifact was found.");
    }
    const nextIndex = repairShareIndex({
      ...index,
      updatedAt: now,
      items: index.items
    });
    await this.writePublishedShareIndex(context, nextIndex);
    return { updatedCount, index: nextIndex, thumbnailUrl: lastThumbnailUrl };
  }
  shareDeleteKeys(item) {
    return [
      (item == null ? void 0 : item.shortId) ? `short:${item.shortId}` : "",
      (item == null ? void 0 : item.url) ? `url:${String(item.url).replace(/\/+$/g, "")}` : "",
      (item == null ? void 0 : item.canonicalUrl) ? `canonical:${String(item.canonicalUrl).replace(/\/+$/g, "")}` : "",
      (item == null ? void 0 : item.sourcePathKey) ? `source:${item.sourcePathKey}` : "",
      (item == null ? void 0 : item.slug) ? `slug:${item.slug}` : ""
    ].filter(Boolean);
  }
  async deleteGithubPathRecursive(owner, repo, branch, publishPath) {
    var _a;
    const cleanPath = String(publishPath || "").replace(/^\/+|\/+$/g, "");
    if (!cleanPath) {
      return;
    }
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, cleanPath);
    const existing = await (0, import_obsidian8.requestUrl)({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: "GET",
      headers: this.githubHeaders(token),
      throw: false
    });
    if (existing.status === 404) {
      return;
    }
    if (existing.status < 200 || existing.status >= 300) {
      const message = ((_a = existing.json) == null ? void 0 : _a.message) || existing.text || `GitHub lookup failed with HTTP ${existing.status}`;
      throw new Error(`GitHub lookup failed for ${cleanPath}: ${message}`);
    }
    const content = existing.json;
    if (Array.isArray(content)) {
      for (const child of content) {
        if (child == null ? void 0 : child.path) {
          await this.deleteGithubPathRecursive(owner, repo, branch, child.path);
        }
      }
      return;
    }
    await this.deleteGithubFile(owner, repo, branch, cleanPath, content == null ? void 0 : content.sha);
  }
  async deleteGithubFile(owner, repo, branch, publishPath, sha) {
    var _a;
    if (!sha) {
      return;
    }
    const token = this.settings.githubToken.trim();
    const response = await (0, import_obsidian8.requestUrl)({
      url: this.githubContentsUrl(owner, repo, publishPath),
      method: "DELETE",
      headers: {
        ...this.githubHeaders(token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Delete MarkTL export ${publishPath}`,
        sha,
        branch
      }),
      throw: false
    });
    if (response.status < 200 || response.status >= 300) {
      const message = ((_a = response.json) == null ? void 0 : _a.message) || response.text || `GitHub delete failed with HTTP ${response.status}`;
      throw new Error(`GitHub delete failed for ${publishPath}: ${message}`);
    }
  }
  async publishGithubPages(plan, mappings, sourcePath, markdown, options, shortId = buildShortId(plan.basename), metadata = this.extractShareMetadata(markdown, plan.basename)) {
    var _a;
    await this.refreshSettingsFromDisk();
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error("GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.");
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error("GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.");
    }
    const branch = this.settings.githubBranch.trim() || "main";
    const shareHomeProfile = resolveShareHomeProfile3(this.settings, options.shareHomeProfileId);
    const basePath = shareHomeProfile.basePath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo);
    const canonicalUrl = buildPagesUrl(pagesBaseUrl, basePath, plan.basename);
    const publicUrl = buildShortPagesUrl(pagesBaseUrl, basePath, shortId);
    const shareHomeUrl = buildShareHomeUrl(pagesBaseUrl, basePath);
    const thumbnailAssetName = ((_a = mappings.find((mapping) => /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(mapping.destinationPath))) == null ? void 0 : _a.destinationPath.split("/").pop()) || "";
    const thumbnailUrl = thumbnailAssetName ? `${publicUrl}assets/${encodeURIComponent(thumbnailAssetName)}` : "";
    const canonicalFiles = [
      { localPath: plan.outputPath, publishPath: buildPublishPath(basePath, plan.basename, "index.html") },
      { localPath: (0, import_obsidian8.normalizePath)(`${plan.folder}/share/${plan.basename}/README.md`), publishPath: buildPublishPath(basePath, plan.basename, "README.md") },
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
      sourcePathKey: sourcePath.normalize("NFC").replace(/\\/g, "/").trim().toLowerCase(),
      artifactType: options.artifactType,
      thumbnailUrl,
      schemaVersion: 2,
      publishedByHost: String(typeof process !== "undefined" && process.env && process.env.HOSTNAME || ""),
      ...metadata
    }, pagesBaseUrl, shareHomeProfile);
    return { publicUrl, shareHomeUrl };
  }
  extractShareMetadata(markdown, fallbackTitle) {
    var _a, _b, _c, _d;
    const value = String(markdown || "");
    const frontmatter = ((_a = /^---\n([\s\S]*?)\n---/.exec(value)) == null ? void 0 : _a[1]) || "";
    const cleanScalar = (text) => String(text || "").trim().replace(/^["']|["']$/g, "");
    const title = cleanScalar(((_b = /^title:[ \t]*(.+?)[ \t]*$/m.exec(frontmatter)) == null ? void 0 : _b[1]) || ((_c = /^#\s+(.+)$/m.exec(value)) == null ? void 0 : _c[1]) || fallbackTitle);
    const tagLine = ((_d = /^tags:[ \t]*(.+)$/m.exec(frontmatter)) == null ? void 0 : _d[1]) || "";
    const inlineTags = tagLine.replace(/^\[|\]$/g, "").split(",").map(cleanScalar).filter(Boolean);
    const tagBlock = /^tags:\s*\n((?:\s+-\s*.+(?:\n|$))*)/m.exec(frontmatter);
    const yamlListTags = tagBlock ? [...tagBlock[1].matchAll(/^\s*-\s*(.+?)\s*$/gm)].map((match) => cleanScalar(match[1])) : [];
    const readerTagMap = {
      "project/\uC9C0\uC218\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5": "\uC9C0\uC218\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5",
      "topic/\uC9C0\uC218\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5": "\uC9C0\uC218\uD1B5\uD569\uC120\uBCC4\uACF5\uC7A5",
      "construction/daily-report": "\uACF5\uC0AC\uC77C\uBCF4",
      "construction/\uCC29\uACF5": "\uCC29\uACF5",
      "construction/\uCF58\uD06C\uB9AC\uD2B8\uCCA0\uAC70": "\uCF58\uD06C\uB9AC\uD2B8\uCCA0\uAC70",
      "construction/\uC639\uBCBD\uAE30\uCD08": "\uC639\uBCBD\uAE30\uCD08",
      "risk/\uC900\uACF5\uAC80\uC0AC": "\uC900\uACF5\uB9AC\uC2A4\uD06C",
      "risk/\uBC29\uC218": "\uBC29\uC218\uBC30\uC218",
      "obsidian/project-management": "\uD504\uB85C\uC81D\uD2B8\uAD00\uB9AC",
      "obsidian/dataviewjs": "",
      "obsidian/mermaid": "",
      dataviewjs: "",
      gantt: "\uC77C\uC815\uAD00\uB9AC",
      budget: "\uC608\uC0B0",
      risk: "\uB9AC\uC2A4\uD06C",
      "function/ops": "\uC6B4\uC601\uAD00\uB9AC",
      "doc/\uBCF4\uACE0\uC11C": "\uBCF4\uACE0\uC11C",
      "doc/meeting": "\uD68C\uC758\uB85D"
    };
    const toReaderTag = (tag) => {
      const raw = String(tag || "").replace(/^#/, "").trim();
      if (!raw) {
        return "";
      }
      if (Object.prototype.hasOwnProperty.call(readerTagMap, raw)) {
        return readerTagMap[raw];
      }
      const last = raw.includes("/") ? raw.split("/").filter(Boolean).pop() || "" : raw;
      return /[가-힣]/.test(last) ? last.replace(/^업무\//, "").replace(/^프로젝트\//, "").slice(0, 18) : "";
    };
    const body = value.replace(/^---\n[\s\S]*?\n---\s*/, "").replace(/```(?:dataviewjs|dataview|mermaid|gantt)?[\s\S]*?```/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<![^>]*>/g, " ").replace(/^#\s+.+$/m, "").replace(/\[!abstract]\+?/gi, " ").replace(/한 줄\s*(요약|브리프)/g, " ").replace(/!\[\[[^\]]+]]/g, "").replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[#*_`>~-]/g, "").split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
    return {
      title: title.trim(),
      excerpt: body.slice(0, 180),
      tags: [...new Set([...inlineTags, ...yamlListTags].map(toReaderTag).filter(Boolean))].slice(0, 8)
    };
  }
  async publishShareIndex(owner, repo, branch, basePath, entry, pagesBaseUrl, shareHomeProfile) {
    const indexPath = buildPublishPath(basePath, "", "index.json");
    const existing = await this.getGithubJson(owner, repo, branch, indexPath);
    const index = updateShareIndex(existing, entry);
    const html = renderShareIndexHtml(index, {
      title: shareHomeProfile.title,
      eyebrow: shareHomeProfile.eyebrow,
      description: shareHomeProfile.description,
      baseUrl: buildShareHomeUrl(pagesBaseUrl, basePath).replace(/\/+$/g, "")
    });
    await this.putGithubTextFile(owner, repo, branch, indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(owner, repo, branch, buildPublishPath(basePath, "", "index.html"), html);
  }
  async getGithubJson(owner, repo, branch, publishPath) {
    var _a;
    const token = this.settings.githubToken.trim();
    const url = this.githubContentsUrl(owner, repo, publishPath);
    const response = await (0, import_obsidian8.requestUrl)({
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
    const existing = await (0, import_obsidian8.requestUrl)({
      url: `${url}?ref=${encodeURIComponent(branch)}`,
      method: "GET",
      headers: this.githubHeaders(token),
      throw: false
    });
    const existingJson = existing.status >= 200 && existing.status < 300 ? existing.json : null;
    const response = await (0, import_obsidian8.requestUrl)({
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
    new MarktlResultModal(
      this.app,
      summary,
      (outputPath, preferredLink) => this.copyShareLink(outputPath, preferredLink),
      (presetId) => {
        void this.exportActiveNote(applyPresetToOptions(summary.options, presetId));
      }
    ).open();
  }
  async copyShareLink(outputPath, preferredLink = "") {
    if (preferredLink) {
      await navigator.clipboard.writeText(preferredLink);
      new import_obsidian8.Notice("HTML share link copied.");
      return preferredLink;
    }
    const adapter = this.app.vault.adapter;
    const fullPath = adapter.getFullPath ? adapter.getFullPath(outputPath) : outputPath;
    const link = fullPath.startsWith("/") ? `file://${encodeURI(fullPath)}` : outputPath;
    await navigator.clipboard.writeText(link);
    new import_obsidian8.Notice("HTML share link copied.");
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
