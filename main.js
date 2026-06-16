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
          label.textContent = '복사됨';
          setTimeout(() => { label.textContent = label.dataset.label; }, 1200);
        } catch {
          label.textContent = '복사 실패';
        }
      };
      const toolbox = document.createElement('div');
      toolbox.className = 'toolbox';
      const filter = document.createElement('input');
      filter.type = 'search';
      filter.placeholder = '섹션 필터';
      filter.setAttribute('aria-label', '섹션 필터');
      toolbox.append(filter);
      const makeButton = (label, getText) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.label = label;
        button.addEventListener('click', () => copyText(button, getText()));
        toolbox.append(button);
      };
      makeButton('프롬프트로 복사', () => '이 HTML 산출물을 맥락으로 삼아 결정과 구조를 이어서 개선해 주세요:\\n\\n' + document.body.innerText);
      makeButton('Markdown 복사', () => document.querySelector('article').innerText);
      makeButton('요약 복사', () => [...document.querySelectorAll('h1,h2,h3')].map((h) => '- ' + h.textContent).join('\\n'));
      makeButton('목차 JSON 복사', () => JSON.stringify([...document.querySelectorAll('h1,h2,h3')].map((h) => ({ level: h.tagName, text: h.textContent.trim(), id: h.id || '' })), null, 2));
      const expandButton = document.createElement('button');
      expandButton.type = 'button';
      expandButton.textContent = '모두 펼치기';
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
        toc.innerHTML = '<strong>목차</strong> ';
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
      panel.innerHTML = '<label><span class="playground-muted">강조도</span><input type="range" min="1" max="3" value="2" aria-label="강조도"></label><button type="button" data-action="copy-prompt">프롬프트 복사</button><button type="button" data-action="copy-state">상태 JSON 복사</button>';
      document.querySelector('main').prepend(panel);
      const note = document.createElement('section');
      note.innerHTML = '<h2>작업 메모</h2><div class="playground-note" contenteditable="true" role="textbox" aria-label="작업 메모">산출물을 검토하며 이 영역을 편집하세요. 프롬프트 복사 또는 상태 JSON 복사로 AI 세션에 다시 전달할 수 있습니다.</div>';
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
          button.textContent = '복사됨';
        } catch {
          button.textContent = '복사 실패';
        }
        setTimeout(() => { button.textContent = original; }, 1200);
      };
      panel.querySelector('[data-action="copy-state"]').addEventListener('click', (event) => copy(event.currentTarget, JSON.stringify(state(), null, 2)));
      panel.querySelector('[data-action="copy-prompt"]').addEventListener('click', (event) => copy(event.currentTarget, '검토한 HTML 산출물 상태를 다음 개선 작업의 피드백으로 사용해 주세요:\\n\\n' + JSON.stringify(state(), null, 2)));
    `
      }
    ];
    function listTemplates3() {
      return templates.map(({ id, name, description }) => ({ id, name, description }));
    }
    function getTemplate(id) {
      return templates.find((template) => template.id === id) || templates[0];
    }
    function getCommonExportCss() {
      return `
      .marktl-mermaid-rendered { margin: 24px 0; padding: 12px; border: 1px solid rgba(37, 99, 235, 0.18); border-radius: 16px; background: rgba(255,255,255,0.72); overflow-x: auto; }
      .marktl-mermaid-rendered svg { display: block; max-width: 100%; height: auto; margin: 0 auto; }
      .marktl-mermaid-source { margin: 20px 0; border-radius: 14px; overflow: hidden; }
      .marktl-skipped-links { margin: 18px 0; padding: 12px 14px; border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 12px; color: #64748b; background: rgba(248,250,252,0.82); font-size: 0.92rem; }
      `;
    }
    function wrapWithTemplate(bodyHtml, options = {}) {
      const template = getTemplate(options.template);
      const title = options.title || "Exported note";
      const script = options.trusted && template.script ? `<script>${template.script}</script>` : "";
      return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${template.css}
${getCommonExportCss()}</style>
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
          const normalizedLanguage = language.toLowerCase().trim().split(/\s+/)[0];
          const languageClass = language ? ` class="language-${escapeHtml(language)}"` : "";
          const mermaidAttr = normalizedLanguage === "mermaid" ? ` class="marktl-mermaid-source"><code class="language-mermaid" data-marktl-mermaid="true"` : `><code${languageClass}`;
          blocks.push(`<pre${mermaidAttr}>${escapeHtml(code.join("\n"))}</code></pre>`);
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
      const command = resolveCliCommandPath(options.cliPaths && options.cliPaths[options.provider] ? options.cliPaths[options.provider] : provider.command);
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
    function resolveCliCommandPath(command) {
      const value = String(command || "").trim();
      if (value === "~") {
        return os.homedir();
      }
      if (value.startsWith("~/")) {
        return path.join(os.homedir(), value.slice(2));
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
        const child = spawn(command, args, {
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
      const interactionStandard = getInteractionStandard(artifactGoal, options.template || "minimal", Boolean(options.trusted));
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
    function getInteractionStandard(artifactGoal, template, trusted) {
      if (!trusted) {
        return "Keep interaction affordances static: anchors, tables, checklists, and copy-ready text blocks only. Do not add editable playground controls, state JSON panels, or scripts.";
      }
      if (template === "construction-daily") {
        return "Build a Korean construction daily report, not a generic article. On desktop, use a first-screen two-column hero where the left side contains the title and concise project summary and the right side renders the primary infographic or lead image at comparable visual weight. On mobile, do not preserve the desktop side-by-side composition; stack the hero in this reader order: kicker/date, primary infographic or lead image, title, then summary. Convert Obsidian callouts, DataviewJS, and raw markdown syntax into clean reader-facing HTML; never show raw markers such as [!abstract]+, dataviewjs, frontmatter, or code used only for Obsidian rendering. Include concise Mermaid-style flow maps for overall structure and staff/contractor handling with short node labels only, keeping detailed commentary outside nodes. Include an HTML/CSS execution-gate Gantt section for permit, funding/bond, kickoff, retaining wall, gate/fence, and expansion work. Use Korean-only reader tags and card-ready summary text around 50 characters. Keep all controls local-only and self-contained.";
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
      runCliProvider,
      cleanProviderError
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
    function listExportPresets2() {
      return exportPresets.slice();
    }
    function findExportPreset2(id) {
      return exportPresets.find((preset) => preset.id === id) || null;
    }
    function applyPresetToOptions2(baseOptions, presetId) {
      const preset = findExportPreset2(presetId);
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
    function findPresetForOptions2(options = {}) {
      const preset = exportPresets.find((item) => item.artifactGoal === options.artifactGoal && item.artifactType === options.artifactType && item.template === options.template && item.mode === options.conversionMode && item.previewSecurity === options.previewSecurity);
      return preset ? preset.id : "custom";
    }
    module2.exports = {
      applyPresetToOptions: applyPresetToOptions2,
      findExportPreset: findExportPreset2,
      findPresetForOptions: findPresetForOptions2,
      listExportPresets: listExportPresets2
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
      const merged = nextEntry ? [
        nextEntry,
        ...repairShareItems(current).filter((item) => !shareItemsMatch(item, nextEntry))
      ] : repairShareItems(current);
      const items = dedupeShareItems(merged).sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
      return {
        version: 2,
        updatedAt: now,
        items
      };
    }
    function repairShareIndex2(existingIndex) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const current = Array.isArray(existingIndex == null ? void 0 : existingIndex.items) ? existingIndex.items : [];
      const items = dedupeShareItems(repairShareItems(current)).sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")));
      return {
        version: 2,
        updatedAt: (existingIndex == null ? void 0 : existingIndex.updatedAt) || now,
        items
      };
    }
    function renderShareIndexHtml2(index, options = {}) {
      const title = options.title || "MarkTL Shared HTML";
      const baseUrl = String(options.baseUrl || "").replace(/\/+$/g, "");
      const items = repairShareItems(Array.isArray(index == null ? void 0 : index.items) ? index.items : []);
      const tagCounts = /* @__PURE__ */ new Map();
      for (const item of items) {
        for (const tag of normalizeTags(item.tags)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      const tagButtons = [...tagCounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 14).map(([tag, count]) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} <span>${count}</span></button>`).join("");
      const list = items.map((item) => {
        const href = item.url || item.canonicalUrl || (baseUrl ? `${baseUrl}/${encodeURIComponent(item.slug)}/` : `${encodeURIComponent(item.slug)}/`);
        const tags = normalizeTags(item.tags);
        const itemTitle = recoverShareTitle(item);
        const excerpt = truncateArchiveText(cleanArchiveText(item.excerpt || item.sourcePath || "", ""), 58);
        const sourcePath = cleanArchiveText(item.sourcePath || "", "");
        const artifactType = cleanArchiveText(item.artifactType || "HTML artifact", "HTML artifact");
        const searchText = [
          itemTitle,
          item.slug,
          excerpt,
          sourcePath,
          artifactType,
          ...tags
        ].filter(Boolean).join(" ").toLowerCase();
        return `<article class="item" data-search="${escapeHtml(searchText)}" data-tags="${escapeHtml(tags.join(" "))}">
${item.thumbnail ? `<a class="thumb" href="${escapeHtml(href)}"><img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.thumbnailAlt || itemTitle)}" loading="lazy"></a>` : ""}
<div class="item-top"><a href="${escapeHtml(href)}">${escapeHtml(itemTitle)}</a><span>${escapeHtml(formatDate(item.updatedAt))}</span></div>
${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ""}
<div class="item-meta"><span>${escapeHtml(artifactType)}</span>${sourcePath ? `<span>${escapeHtml(sourcePath)}</span>` : ""}</div>
${tags.length ? `<div class="tags">${tags.map((tag) => `<button type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}</div>` : ""}
<a class="open-link" href="${escapeHtml(href)}">문서 열기</a>
</article>`;
      }).join("\n");
      return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f4;color:#172033;overflow-x:hidden}
main{max-width:1180px;margin:0 auto;padding:44px 22px 72px}
.hero{display:grid;gap:14px;margin-bottom:22px}.eyebrow{color:#8a4b64;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.08em}
h1{font-size:clamp(34px,6vw,72px);line-height:.98;margin:0;overflow-wrap:anywhere}.meta{color:#68737d;margin:0;font-size:18px}
.toolbar{position:sticky;top:0;z-index:2;display:grid;gap:12px;background:rgba(246,247,244,.94);backdrop-filter:blur(12px);border-bottom:1px solid #dde2e6;padding:14px 0;margin-bottom:22px}
.toolbar input{width:100%;border:1px solid #cfd8e5;border-radius:8px;padding:12px 14px;font-size:16px;background:#fff;color:#172033}
.tagbar{display:flex;flex-wrap:nowrap;gap:6px;max-height:28px;overflow:hidden}.tagbar button,.tags button{border:1px solid #d6dfeb;background:#fff;color:#33506d;border-radius:999px;padding:4px 8px;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.tagbar button.active,.tags button:hover{background:#174ea6;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px;align-items:stretch}
.item{display:flex;min-width:0;min-height:260px;flex-direction:column;gap:12px;background:#fff;border:1px solid #dde2e6;border-radius:8px;padding:18px;box-shadow:0 12px 32px rgba(23,32,51,.05);overflow:hidden}
.thumb{display:flex;align-items:center;justify-content:center;height:150px;margin:-18px -18px 4px;background:#f3f6fb;border-bottom:1px solid #dde2e6;overflow:hidden}.thumb img{width:100%;height:100%;object-fit:cover}
.item-top{display:grid;gap:8px}.item a{color:#174ea6;font-size:20px;font-weight:800;line-height:1.25;text-decoration:none;overflow-wrap:anywhere}.item a:hover{text-decoration:underline}
.item-top span,.item-meta{color:#68737d;font-size:13px}.item p{color:#344054;line-height:1.55;margin:0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.item-meta{display:grid;gap:4px;margin-top:auto;overflow-wrap:anywhere}.tags{display:flex;flex-wrap:wrap;gap:6px;max-height:78px;overflow:hidden}
.open-link{align-self:flex-start;border:1px solid #d6dfeb;border-radius:999px;padding:7px 11px;background:#f8fbff;font-size:13px!important;font-weight:800!important}
.empty{background:#fff;border:1px dashed #cfd8e5;border-radius:8px;padding:24px;color:#68737d}
@media(max-width:640px){main{padding:28px 14px 56px}.toolbar{position:static}.item{min-height:auto}}
</style>
</head>
<body><main>
<section class="hero"><div class="eyebrow">통합선별공장 Archive</div><h1>${escapeHtml(title)}</h1><p class="meta">공유 문서 <span id="count">${items.length}</span>건. 검색, 필터, 날짜별로 HTML 산출물을 열 수 있습니다.</p></section>
<section class="toolbar" aria-label="Archive controls"><input id="search" type="search" placeholder="문서, 태그, 출처 검색..." aria-label="문서 검색"><div class="tagbar"><button type="button" data-tag="">전체</button>${tagButtons}</div></section>
<section class="grid" id="items">${list || '<p class="empty">게시된 문서가 없습니다.</p>'}</section>
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
      return "제목 없는 HTML 산출물";
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
      } catch (error) {
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
      return cleanArchiveText(cleaned, "");
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
      for (let index = 0; index < 2; index++) {
        try {
          const decoded = decodeURIComponent(text);
          if (decoded === text) {
            break;
          }
          text = decoded;
        } catch (error) {
          break;
        }
      }
      return text;
    }
    function normalizeTags(tags) {
      const values = Array.isArray(tags) ? tags : String(tags || "").split(",");
      return [...new Set(values.map((tag) => cleanArchiveText(String(tag || "").replace(/^\s*-\s*/, "").replace(/^#/, "").replace(/^["']|["']$/g, "").trim(), "")).filter(Boolean).filter((tag) => !looksLikeMojibake(tag)).map((tag) => tag.length > 44 ? `${tag.slice(0, 41)}...` : tag))].slice(0, 8);
    }
    function cleanArchiveText(value, fallback = "") {
      const cleaned = repairMojibake(String(value || "")).replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<iframe\b[\s\S]*?<\/iframe>/gi, " ").replace(/<[^>]+>/g, " ").replace(/<[^>]*$/g, " ").replace(/\s+/g, " ").trim();
      if (!cleaned || looksLikeMojibake(cleaned)) {
        return fallback;
      }
      return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
    }
    function truncateArchiveText(value, limit = 58) {
      const text = String(value || "").trim();
      if (!text || text.length <= limit) {
        return text;
      }
      return `${text.slice(0, limit).trim()}...`;
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
      if (text.includes("�")) {
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
    var { spawn } = require("node:child_process");
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
        const child = spawn(command, args, {
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
      if (!config.repo) warnings.push("Giscus 댓글 저장소가 설정되지 않았습니다.");
      if (!config.repoId) warnings.push("Giscus 저장소 ID가 설정되지 않았습니다.");
      if (!config.category) warnings.push("Giscus discussion category가 설정되지 않았습니다.");
      if (!config.categoryId) warnings.push("Giscus category ID가 설정되지 않았습니다.");
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

// src/core/html-qa.js
var require_html_qa = __commonJS({
  "src/core/html-qa.js"(exports2, module2) {
    "use strict";
    function validateHtmlArtifact2(html, options = {}) {
      const warnings = [];
      const value = String(html || "");
      if (!/<!doctype\s+html/i.test(value)) {
        warnings.push("참고: HTML doctype이 없습니다.");
      }
      if (!/<meta\s+name=["']viewport["']/i.test(value)) {
        warnings.push("참고: responsive viewport meta가 없습니다.");
      }
      if (!/<style\b/i.test(value)) {
        warnings.push("참고: 내장 CSS가 없어 산출물이 단조로울 수 있습니다.");
      }
      if (!/<h1\b/i.test(value)) {
        warnings.push("참고: H1 제목을 찾지 못했습니다.");
      }
      const trusted = Boolean(options.trusted);
      const artifactGoal = String(options.artifactGoal || "");
      if (trusted && !/<script\b/i.test(value)) {
        warnings.push("참고: 신뢰 인터랙티브 모드이지만 스크립트가 없어 정적 산출물일 수 있습니다.");
      }
      if (!trusted && /<script\b|<iframe\b|\son[a-z]+\s*=/i.test(value)) {
        warnings.push("배포 차단: 정적 안전 모드 산출물에 동적 마크업이 남아 있습니다.");
      }
      if (trusted && ["review", "compare", "tune"].includes(artifactGoal) && !/<button\b|<input\b|<select\b|<textarea\b|contenteditable=/i.test(value)) {
        warnings.push(`주의: ${artifactGoal} 산출물에 명확한 복사/인터랙션 컨트롤이 없습니다.`);
      }
      const expectedAssets = Array.isArray(options.assetMappings) ? options.assetMappings.map((mapping) => mapping.relativeSrc).filter(Boolean) : [];
      for (const src of expectedAssets) {
        if (!value.includes(src)) {
          warnings.push(`주의: 포함한 이미지가 최종 HTML에서 참조되지 않습니다: ${src}`);
        }
      }
      if (/<img\b/i.test(value) && !/<img\b[^>]*\balt\s*=/i.test(value)) {
        warnings.push("주의: alt 텍스트가 없는 이미지가 있습니다.");
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

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MarktlPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");
var import_node_fs = require("node:fs");
var import_node_child_process = require("node:child_process");

// src/export-modal.ts
var import_obsidian = require("obsidian");
var import_artifact_goals = __toESM(require_artifact_goals());
var import_ai = __toESM(require_ai());
var import_presets = __toESM(require_presets());
var import_templates = __toESM(require_templates());
var MarktlExportModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.selectedPreset = "custom";
    this.showAdvanced = false;
    this.plugin = plugin;
    this.onSubmit = onSubmit;
    this.options = {
      presetId: "custom",
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
    this.selectedPreset = (0, import_presets.findPresetForOptions)(this.options);
    this.options.presetId = this.selectedPreset;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("노트를 HTML로 내보내기");
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "HTML 문서의 목적과 시각 스타일을 선택하세요. MarkTL은 업무노트를 공유 가능한 HTML 문서로 변환합니다."
    });
    this.renderPresetCards(contentEl);
    new import_obsidian.Setting(contentEl).setName("고급 설정").setDesc("AI CLI, 보안, 공유, 산출물 세부 설정을 조정합니다.").addButton((button) => button.setButtonText(this.showAdvanced ? "고급 설정 숨기기" : "고급 설정 보기").onClick(() => {
      this.showAdvanced = !this.showAdvanced;
      this.onOpen();
    }));
    if (!this.showAdvanced) {
      this.renderActions(contentEl);
      return;
    }
    new import_obsidian.Setting(contentEl).setName("HTML 프리셋").setDesc("목적에 맞는 기본값을 적용합니다. 아래에서 개별 설정을 계속 조정할 수 있습니다.").addDropdown((dropdown) => {
      dropdown.addOption("custom", "직접 설정");
      for (const preset of (0, import_presets.listExportPresets)()) {
        dropdown.addOption(preset.id, preset.name);
      }
      dropdown.setValue(this.selectedPreset).onChange((value) => {
        this.applyPreset(value);
      });
    });
    new import_obsidian.Setting(contentEl).setName("HTML 목적").setDesc("읽기, 발표, 검토, 비교, 공유 등 HTML 문서의 역할을 정합니다.").addDropdown((dropdown) => {
      for (const goal of (0, import_artifact_goals.listArtifactGoals)()) {
        dropdown.addOption(goal.id, goal.name);
      }
      dropdown.setValue(this.options.artifactGoal).onChange((value) => {
        this.selectedPreset = "custom";
        this.options.presetId = "custom";
        this.options.artifactGoal = value;
      });
    });
    new import_obsidian.Setting(contentEl).setName("문서 유형").setDesc("단순 스타일이 아니라 정보 구조를 정합니다.").addDropdown((dropdown) => dropdown.addOption("faithful-note", "원문 충실 노트").addOption("strategy-brief", "전략 브리프").addOption("research-report", "리서치 보고서").addOption("decision-memo", "의사결정 메모").addOption("interactive-explainer", "인터랙티브 설명서").addOption("slide-deck", "슬라이드형 문서").setValue(this.options.artifactType).onChange((value) => {
      this.selectedPreset = "custom";
      this.options.presetId = "custom";
      this.options.artifactType = value;
    }));
    new import_obsidian.Setting(contentEl).setName("템플릿").setDesc("시각 방향과 로컬 fallback 스타일을 정합니다.").addDropdown((dropdown) => {
      for (const template of (0, import_templates.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.options.template).onChange((value) => {
        this.selectedPreset = "custom";
        this.options.presetId = "custom";
        this.options.template = value;
      });
    });
    new import_obsidian.Setting(contentEl).setName("AI CLI").setDesc((0, import_ai.getProviderPrivacyNote)(this.options.aiProvider) || "실행 검증을 통과한 provider만 표시합니다.").addDropdown((dropdown) => dropdown.addOption("none", "사용 안 함 / 로컬 변환").addOption("claude", "Claude Code CLI").addOption("codex", "Codex CLI").setValue(this.options.aiProvider).onChange((value) => {
      this.options.aiProvider = value;
      this.onOpen();
    }));
    new import_obsidian.Setting(contentEl).setName("변환 모드").setDesc("보존 모드는 원문에 충실하고, 다른 모드는 AI가 구조를 재배치할 수 있습니다.").addDropdown((dropdown) => dropdown.addOption("preserve", "내용 보존").addOption("presentation", "발표형").addOption("blog", "블로그 글").addOption("landing", "랜딩 페이지").setValue(this.options.conversionMode).onChange((value) => {
      this.selectedPreset = "custom";
      this.options.presetId = "custom";
      this.options.conversionMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("미리보기 보안").setDesc("신뢰 모드는 인터랙티브 HTML용 inline JavaScript를 허용합니다.").addDropdown((dropdown) => dropdown.addOption("sanitized", "정적 안전 미리보기").addOption("trusted", "신뢰 인터랙티브 미리보기").setValue(this.options.previewSecurity).onChange((value) => {
      this.selectedPreset = "custom";
      this.options.presetId = "custom";
      this.options.previewSecurity = value;
    }));
    new import_obsidian.Setting(contentEl).setName("컨텍스트 묶음").setDesc("필요하면 AI가 연결된 Markdown 노트를 참고 자료로 읽습니다.").addDropdown((dropdown) => dropdown.addOption("none", "현재 노트만").addOption("linked-notes", "연결 노트 포함").setValue(this.options.contextPackMode).onChange((value) => {
      this.options.contextPackMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("독자 피드백").setDesc("Giscus는 신뢰 모드 export에 GitHub 댓글/반응을 붙입니다.").addDropdown((dropdown) => dropdown.addOption("none", "댓글 없음").addOption("giscus", "Giscus GitHub 댓글").setValue(this.options.readerFeedbackMode).onChange((value) => {
      this.options.readerFeedbackMode = value;
    }));
    new import_obsidian.Setting(contentEl).setName("AI 실패 처리").setDesc("Fallback은 계속 내보내고, strict는 CLI 실패 시 중단합니다.").addDropdown((dropdown) => dropdown.addOption("fallback", "경고 후 fallback").addOption("strict", "AI 실패 시 중단").setValue(this.options.failurePolicy).onChange((value) => {
      this.options.failurePolicy = value;
    }));
    new import_obsidian.Setting(contentEl).setName("공유 대상").setDesc("GitHub Pages는 share/<slug>/index.html로 배포하고 공개 URL을 복사합니다.").addDropdown((dropdown) => dropdown.addOption("local-link", "로컬 파일 링크").addOption("static-bundle", "정적 호스팅 번들").addOption("github-pages", "GitHub Pages 링크").setValue(this.options.shareTarget).onChange((value) => {
      this.options.shareTarget = value;
      if (value === "github-pages") {
        this.options.previewSecurity = "trusted";
        this.options.readerFeedbackMode = "giscus";
        this.options.copyShareLinkAfterExport = true;
      }
    }));
    new import_obsidian.Setting(contentEl).setName("공유 링크 복사").setDesc("배포 후 공개 Pages URL 또는 로컬 file:// 링크를 복사합니다.").addToggle((toggle) => toggle.setValue(this.options.copyShareLinkAfterExport).onChange((value) => {
      this.options.copyShareLinkAfterExport = value;
    }));
    this.renderActions(contentEl);
  }
  onClose() {
    this.contentEl.empty();
  }
  renderPresetCards(container) {
    const cards = container.createDiv({ cls: "marktl-purpose-cards" });
    const labels = {
      "readable-note": "읽기 좋게",
      presentation: "발표하기",
      "interactive-report": "검토하기",
      "construction-daily-report": "공사일보",
      "compare-options": "옵션 비교",
      "shareable-article": "게시/공유",
      playground: "AI로 다시 작업"
    };
    const descriptions = {
      "readable-note": "더 나은 타이포그래피로 원문을 충실하고 깔끔하게 보여줍니다.",
      presentation: "노트를 발표나 리뷰에 맞는 섹션형 HTML로 구성합니다.",
      "interactive-report": "목차, 접힘 섹션, 복사 버튼을 포함한 HTML 검토 화면입니다.",
      "construction-daily-report": "대표 인포그래픽, 현장 흐름도, 실행 게이트 간트를 포함한 공사일보 HTML입니다.",
      "compare-options": "선택지, 점수표, 필터, 비교 요약에 적합합니다.",
      "shareable-article": "이미지를 묶어 정적 호스팅에 바로 올릴 수 있는 기사형 레이아웃입니다.",
      playground: "슬라이더와 복사 가능한 상태를 가진 재작업용 인터랙티브 화면입니다."
    };
    const order = ["readable-note", "presentation", "interactive-report", "construction-daily-report", "compare-options", "shareable-article", "playground"];
    for (const id of order) {
      const preset = (0, import_presets.findExportPreset)(id);
      if (!preset) {
        continue;
      }
      const card = cards.createDiv({
        cls: `marktl-purpose-card${this.selectedPreset === id ? " is-selected" : ""}`
      });
      card.createEl("h3", { text: labels[id] || preset.name });
      card.createEl("p", { text: descriptions[id] || preset.description });
      card.createEl("span", {
        cls: "marktl-purpose-meta",
        text: preset.previewSecurity === "trusted" ? "인터랙티브 HTML" : "안전한 정적 HTML"
      });
      card.addEventListener("click", () => this.applyPreset(id));
    }
  }
  applyPreset(id) {
    const preset = (0, import_presets.findExportPreset)(id);
    if (!preset) {
      this.selectedPreset = "custom";
      this.options.presetId = "custom";
      this.onOpen();
      return;
    }
    this.selectedPreset = preset.id;
    this.options.presetId = preset.id;
    this.options.artifactGoal = preset.artifactGoal;
    this.options.artifactType = preset.artifactType;
    this.options.template = preset.template;
    this.options.conversionMode = preset.mode;
    this.options.previewSecurity = preset.previewSecurity;
    this.onOpen();
  }
  renderActions(container) {
    new import_obsidian.Setting(container).addButton((button) => button.setButtonText("내보내기").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.options);
    })).addButton((button) => button.setButtonText("기본값으로 저장").onClick(async () => {
      const { presetId: _presetId, ...settings } = this.options;
      Object.assign(this.plugin.settings, settings);
      await this.plugin.saveSettings();
      this.close();
      this.onSubmit(this.options);
    }));
  }
};

// src/progress-modal.ts
var import_obsidian2 = require("obsidian");
var MarktlProgressModal = class extends import_obsidian2.Modal {
  constructor(app) {
    super(app);
    this.listEl = null;
    this.statusEl = null;
    this.barEl = null;
    this.steps = [];
  }
  onOpen() {
    this.contentEl.empty();
    this.setTitle("내보내기 진행 상황");
    this.contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: "MarkTL이 현재 노트를 HTML로 변환하고 있습니다."
    });
    const visualEl = this.contentEl.createDiv({ cls: "marktl-progress-visual" });
    this.statusEl = visualEl.createDiv({
      cls: "marktl-progress-status",
      text: "내보내기 준비 중..."
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
      this.statusEl.setText("내보내기 완료.");
      this.statusEl.removeClass("marktl-progress-status-error");
      this.statusEl.addClass("marktl-progress-status-done");
    }
    if (this.barEl) {
      this.barEl.setAttr("style", "width: 100%;");
    }
    this.contentEl.createEl("p", {
      cls: "marktl-progress-done",
      text: "이 창을 닫아도 됩니다."
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
      this.statusEl.setText(`내보내기 중단: ${text}`);
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
var import_obsidian3 = require("obsidian");
var VIEW_TYPE_MARKTL_PREVIEW = "marktl-html-preview";
var emptyState = {
  html: "<!doctype html><html><body><p>No preview loaded.</p></body></html>",
  filePath: "",
  warnings: [],
  trusted: false,
  previewSecurity: "sanitized"
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
    return "HTML 미리보기";
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
    header.createEl("strong", { text: this.state.filePath || "HTML 미리보기" });
    header.createSpan({
      cls: this.state.trusted ? "marktl-preview-trusted" : "marktl-preview-sanitized",
      text: this.state.trusted ? "신뢰 인터랙티브" : "정적 안전"
    });
    let frame;
    const tools = container.createDiv({ cls: "marktl-preview-tools" });
    this.addToolButton(tools, "프롬프트로 복사", () => this.copyPrompt(frame));
    this.addToolButton(tools, "목차 복사", () => this.copyOutline(frame));
    this.addToolButton(tools, "섹션 피드백 복사", () => this.copySectionFeedback(frame));
    this.addToolButton(tools, "생성 파일 열기", () => this.openGeneratedFile());
    for (const warning of this.state.warnings) {
      const severity = this.classifyPreviewWarning(warning);
      container.createDiv({ cls: `marktl-preview-warning marktl-preview-warning-${severity}`, text: this.formatPreviewWarning(warning) });
    }
    const renderQa = container.createDiv({ cls: "marktl-preview-render-qa", text: "렌더 QA: 미리보기 대기 중..." });
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
  classifyPreviewWarning(warning) {
    const value = String(warning || "");
    if (/배포 차단|failed|blocked|sanitized mode output still contains|AI conversion failed/i.test(value)) {
      return "fatal";
    }
    if (/참고|건너뜀|skipped|Context note not found|Reader comments disabled|Giscus feedback requires|trusted interactive mode produced no script|no H1 heading|missing responsive viewport|no inline CSS/i.test(value)) {
      return "info";
    }
    return "warning";
  }
  formatPreviewWarning(warning) {
    const value = String(warning || "");
    return value.replace(/^Context note not found:\s*/i, "참고 링크 건너뜀: ").replace(/^Context note unreadable:\s*/i, "참고 링크를 읽지 못함: ").replace(/^HTML QA: missing <!doctype html>\.$/i, "참고: HTML doctype이 자동 보정되었습니다.").replace(/^HTML QA: missing responsive viewport meta tag\.$/i, "참고: viewport meta가 자동 보정되었습니다.").replace(/^HTML QA: no H1 heading found\.$/i, "참고: H1 제목을 찾지 못했습니다.").replace(/^HTML QA: no inline CSS found; output may be too plain\.$/i, "참고: 내장 CSS를 찾지 못했습니다.").replace(/^Giscus feedback requires Trusted preview\/export because it loads an external comments script\.$/i, "참고: 정적 안전 모드에서는 Giscus 댓글을 제외했습니다.");
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
      "다음 MarkTL HTML 개선 작업의 참고자료로 이 산출물을 사용하세요.",
      "",
      `Artifact: ${this.state.title || this.state.filePath || "HTML 미리보기"}`,
      `Preview security: ${this.state.previewSecurity}`,
      "",
      text
    ].join("\n"));
    new import_obsidian3.Notice("미리보기 프롬프트를 복사했습니다.");
  }
  async copyOutline(frame) {
    const outline = this.getOutline(frame);
    if (!outline) {
      await navigator.clipboard.writeText(this.state.title || this.state.filePath || "HTML 미리보기");
      new import_obsidian3.Notice("제목 구조를 찾지 못해 문서 제목을 복사했습니다.");
      return;
    }
    await navigator.clipboard.writeText(outline);
    new import_obsidian3.Notice("미리보기 목차를 복사했습니다.");
  }
  async copySectionFeedback(frame) {
    const section = this.getFirstSection(frame);
    const fallback = this.getFrameText(frame) || this.stripHtml(this.state.html);
    await navigator.clipboard.writeText([
      "이 MarkTL HTML 산출물의 섹션 개선 피드백을 작성하세요.",
      "",
      `Artifact: ${this.state.title || this.state.filePath || "HTML 미리보기"}`,
      `Section: ${section.heading || "전체 문서"}`,
      "",
      section.text || fallback,
      "",
      "더 명확하게, 더 시각적으로, 더 공유하기 좋게 만들 부분에 집중하세요."
    ].join("\n"));
    new import_obsidian3.Notice(section.heading ? "섹션 피드백 프롬프트를 복사했습니다." : "전체 문서 피드백 프롬프트를 복사했습니다.");
  }
  openGeneratedFile() {
    if (!this.state.filePath) {
      new import_obsidian3.Notice("생성된 파일 경로가 없습니다.");
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
        statusEl.setText("렌더 QA: 미리보기 문서를 검사할 수 없습니다.");
        statusEl.addClass("marktl-preview-render-qa-warning");
        return;
      }
      const warnings = [];
      const bodyText = ((_b = (_a = doc.body) == null ? void 0 : _a.innerText) == null ? void 0 : _b.trim()) || "";
      if (bodyText.length < 20) {
        warnings.push("미리보기 내용이 거의 비어 있음");
      }
      if (!doc.querySelector("h1")) {
        warnings.push("보이는 H1 제목 없음");
      }
      const brokenImages = Array.from(doc.images).filter((image) => image.complete && image.naturalWidth === 0);
      if (brokenImages.length > 0) {
        warnings.push(`깨진 이미지 ${brokenImages.length}개`);
      }
      if (this.state.trusted && !doc.querySelector('button,input,select,textarea,[contenteditable="true"]') && !doc.querySelector('script[src*="giscus.app/client.js"]')) {
        warnings.push("신뢰 미리보기에 인터랙티브 컨트롤 없음");
      }
      const scrollHeight = ((_c = doc.scrollingElement) == null ? void 0 : _c.scrollHeight) || ((_d = doc.body) == null ? void 0 : _d.scrollHeight) || 0;
      if (scrollHeight > 0 && scrollHeight < 120) {
        warnings.push("렌더링된 내용이 비정상적으로 짧음");
      }
      statusEl.setText(warnings.length > 0 ? `렌더 QA: ${warnings.join("; ")}.` : "렌더 QA: 미리보기, 본문, 에셋이 정상적으로 로드되었습니다.");
      statusEl.toggleClass("marktl-preview-render-qa-warning", warnings.length > 0);
    } catch (error) {
      statusEl.setText("렌더 QA: iframe 보안으로 미리보기 검사가 차단되었습니다.");
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
var import_obsidian4 = require("obsidian");
var MarktlResultModal = class extends import_obsidian4.Modal {
  constructor(app, summary, copyLink, regenerate) {
    super(app);
    this.summary = summary;
    this.copyLink = copyLink;
    this.regenerate = regenerate;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle("HTML 내보내기 완료");
    if (this.summary.publicUrl) {
      const shareCard = contentEl.createDiv({ cls: "marktl-share-card" });
      shareCard.createEl("span", { cls: "marktl-share-eyebrow", text: "이 페이지 공유" });
      const link = shareCard.createEl("a", {
        cls: "marktl-share-link",
        href: this.summary.publicUrl,
        text: this.summary.publicUrl
      });
      link.setAttr("target", "_blank");
      link.setAttr("rel", "noopener noreferrer");
      shareCard.createEl("p", {
        text: this.summary.commentsEnabled ? "독자는 이 링크를 열고 Giscus GitHub 댓글을 남길 수 있습니다." : "독자는 이 링크를 열 수 있습니다. 댓글은 Giscus 설정이 완료된 뒤 표시됩니다."
      });
    }
    const facts = contentEl.createDiv({ cls: "marktl-summary-grid" });
    this.addFact(facts, "출력", this.summary.outputPath);
    this.addFact(facts, "미리보기", this.summary.previewSecurity === "trusted" ? "신뢰 인터랙티브" : "정적 안전");
    this.addFact(facts, "AI", this.summary.aiProvider === "none" ? "로컬 변환" : this.summary.usedFallback ? `${this.summary.aiProvider} 실패, 로컬 변환 사용` : `${this.summary.aiProvider} HTML 생성`);
    this.addFact(facts, "이미지", `로컬 이미지 ${this.summary.assetCount}개 포함`);
    this.addFact(facts, "공유 대상", this.describeShareTarget());
    this.addFact(facts, "댓글", this.summary.commentsStatus);
    if (this.summary.publicUrl) {
      this.addFact(facts, "공개 URL", this.summary.publicUrl);
    }
    if (this.summary.shareHomeUrl) {
      this.addFact(facts, "공유 홈", this.summary.shareHomeUrl);
    }
    if (this.summary.warnings.length > 0) {
      contentEl.createEl("h3", { text: "주의 및 참고" });
      const list = contentEl.createEl("ul", { cls: "marktl-summary-warnings" });
      for (const warning of this.summary.warnings) {
        list.createEl("li", { text: warning });
      }
    }
    contentEl.createEl("p", {
      cls: "marktl-modal-intro",
      text: this.summary.publicUrl ? "이 공개 URL은 바로 공유할 수 있습니다." : this.summary.shareTarget === "static-bundle" ? "이 폴더는 정적 호스팅에 올릴 준비가 되어 있습니다. 공개 업로드는 별도 단계로 남겨둡니다." : "이 링크는 현재 컴퓨터의 생성 파일을 엽니다. 공개 공유 링크는 정적 호스팅이 필요합니다."
    });
    const actions = contentEl.createDiv({ cls: "marktl-result-actions" });
    this.addActionButton(actions, this.summary.publicUrl ? "공개 링크 복사" : "로컬 링크 복사", async () => {
      const link = await this.copyLink(this.summary.outputPath, this.summary.publicUrl);
      new import_obsidian4.Notice(`복사됨: ${link}`);
    });
    if (this.summary.publicUrl) {
      this.addActionButton(actions, "공유 문구 복사", async () => {
        const text = [this.summary.shareTitle, this.summary.publicUrl].filter(Boolean).join("\n");
        await navigator.clipboard.writeText(text);
        new import_obsidian4.Notice("공유 문구를 복사했습니다.");
      });
      this.addActionButton(actions, "페이지 열기", () => {
        window.open(this.summary.publicUrl, "_blank", "noopener,noreferrer");
      });
    }
    if (this.summary.shareHomeUrl) {
      this.addActionButton(actions, "아카이브 열기", () => {
        window.open(this.summary.shareHomeUrl, "_blank", "noopener,noreferrer");
      });
    }
    this.addActionButton(actions, "AI 전달문 복사", async () => {
      await navigator.clipboard.writeText(this.buildAiHandoffPrompt());
      new import_obsidian4.Notice("AI 전달 프롬프트를 복사했습니다.");
    });
    this.addActionButton(actions, "발표형으로 다시 생성", () => {
      this.close();
      this.regenerate("presentation");
    });
    this.addActionButton(actions, "검토형으로 다시 생성", () => {
      this.close();
      this.regenerate("interactive-report");
    });
    this.addActionButton(actions, "닫기", () => this.close(), true);
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
      return "GitHub Pages 링크";
    }
    return this.summary.shareTarget === "static-bundle" ? "정적 호스팅 번들" : "로컬 파일 링크";
  }
  buildAiHandoffPrompt() {
    return [
      "이 MarkTL HTML 산출물을 다음 개선 작업의 맥락으로 사용해 주세요.",
      "",
      `원본 노트: ${this.summary.sourcePath || this.summary.sourceTitle || "알 수 없는 원본 노트"}`,
      `HTML 출력: ${this.summary.publicUrl || this.summary.localPath || this.summary.outputPath}`,
      `미리보기 보안: ${this.summary.previewSecurity}`,
      `공유 대상: ${this.describeShareTarget()}`,
      this.summary.publicUrl ? `공개 URL: ${this.summary.publicUrl}` : "",
      "",
      "작업:",
      "- Markdown 텍스트가 아니라 시각 HTML 산출물로 검토해 주세요.",
      "- 더 명확하거나 시각적이거나 인터랙티브해야 할 부분을 찾아 주세요.",
      "- 다음에 적용할 구체적인 수정안을 제안해 주세요."
    ].filter(Boolean).join("\n");
  }
};

// src/settings-tab.ts
var import_obsidian5 = require("obsidian");
var import_artifact_goals2 = __toESM(require_artifact_goals());
var import_templates2 = __toESM(require_templates());
var { inferPagesBaseUrl } = require_github_pages();
var { buildGiscusSetupChecklist, buildPagesSetupChecklist } = require_setup_guidance();
var MarktlSettingTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Flytothesky MarkTL HTML Exporter" });
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
    new import_obsidian5.Setting(containerEl).setName("AI failure policy").setDesc("Fallback creates local HTML with a warning. Strict stops generation. GitHub Pages always requires strict AI success.").addDropdown((dropdown) => dropdown.addOption("fallback", "Fallback with warning").addOption("strict", "Stop on AI failure").setValue(this.plugin.settings.failurePolicy).onChange(async (value) => {
      this.plugin.settings.failurePolicy = this.plugin.settings.shareTarget === "github-pages" && value === "fallback" ? "strict" : value;
      await this.plugin.saveSettings();
      if (this.plugin.settings.shareTarget === "github-pages" && value === "fallback") {
        new import_obsidian5.Notice("GitHub Pages export requires strict AI success. Fallback was not enabled.");
        this.display();
      }
    }));
    new import_obsidian5.Setting(containerEl).setName("CLI timeout").setDesc("Maximum AI CLI runtime in milliseconds. Rich HTML artifacts can take 5-15 minutes on long notes.").addText((text) => text.setPlaceholder("900000").setValue(String(this.plugin.settings.timeoutMs)).onChange(async (value) => {
      const parsed = Number(value);
      this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 9e5;
      await this.plugin.saveSettings();
    }));
    this.addCliPathSetting(containerEl, "Claude Code CLI path", "claudePath", "claude");
    this.addCliPathSetting(containerEl, "Codex CLI path", "codexPath", "codex");
    new import_obsidian5.Setting(containerEl).setName("Share target").setDesc("GitHub Pages publishes only after successful AI conversion. Fallback HTML is never published.").addDropdown((dropdown) => dropdown.addOption("local-link", "Local file link").addOption("static-bundle", "Static hosting bundle").addOption("github-pages", "GitHub Pages link").setValue(this.plugin.settings.shareTarget).onChange(async (value) => {
      this.plugin.settings.shareTarget = value;
      if (value === "github-pages" && this.plugin.settings.failurePolicy !== "strict") {
        this.plugin.settings.failurePolicy = "strict";
        new import_obsidian5.Notice("GitHub Pages export now uses strict AI failure policy.");
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
    new import_obsidian5.Setting(containerEl).setName("Giscus setup helper").setDesc("Install the Giscus GitHub App first, then use giscus.app to get repository ID and category ID.").addButton((button) => button.setButtonText("Install Giscus app").onClick(() => {
      window.open("https://github.com/apps/giscus", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Open giscus.app").onClick(() => {
      window.open("https://giscus.app", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Copy checklist").onClick(async () => {
      await navigator.clipboard.writeText(buildGiscusSetupChecklist(this.plugin.settings));
      new import_obsidian5.Notice("Giscus setup checklist copied.");
    }));
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
    new import_obsidian5.Setting(containerEl).setName("GitHub Pages setup helper").setDesc("For owner/repo, the usual Pages URL is https://owner.github.io/repo. The final page becomes <base>/<publish path>/<slug>/.").addButton((button) => button.setButtonText("Create token").onClick(() => {
      window.open("https://github.com/settings/personal-access-tokens/new", "_blank", "noopener,noreferrer");
    })).addButton((button) => button.setButtonText("Fill base URL").onClick(async () => {
      const inferred = inferPagesBaseUrl(this.plugin.settings.githubRepo);
      if (!inferred) {
        new import_obsidian5.Notice("Enter GitHub repository as owner/repo first.");
        return;
      }
      this.plugin.settings.githubPagesBaseUrl = inferred;
      await this.plugin.saveSettings();
      this.display();
      new import_obsidian5.Notice(`GitHub Pages base URL set to ${inferred}`);
    })).addButton((button) => button.setButtonText("Copy checklist").onClick(async () => {
      await navigator.clipboard.writeText(buildPagesSetupChecklist(this.plugin.settings));
      new import_obsidian5.Notice("GitHub Pages setup checklist copied.");
    }));
    this.addTextSetting(containerEl, "GitHub repository", "owner/repo for the Pages repository.", "githubRepo", "reallygood83/marktl-shares");
    this.addTextSetting(containerEl, "GitHub branch", "Branch to write files to.", "githubBranch", "main");
    this.addTextSetting(containerEl, "GitHub Pages base URL", "Public Pages root URL. Leave blank to infer https://owner.github.io/repo.", "githubPagesBaseUrl", "https://reallygood83.github.io/marktl-shares");
    this.addTextSetting(containerEl, "Publish path", "Folder path inside the repository. Exports go to <path>/<slug>/index.html.", "githubPublishPath", "marktl");
    this.addTextSetting(containerEl, "Share home title", "Title for the generated index page that lists published exports.", "githubShareHomeTitle", "MarkTL Shared HTML");
    this.addTextSetting(containerEl, "GitHub token", "Fine-grained token with Contents read/write permission for the repository.", "githubToken", "github_pat_...", true);
    new import_obsidian5.Setting(containerEl).setName("Copy share link by default").setDesc("Copies the public GitHub Pages URL after publish, or a local file:// link for local exports.").addToggle((toggle) => toggle.setValue(this.plugin.settings.copyShareLinkAfterExport).onChange(async (value) => {
      this.plugin.settings.copyShareLinkAfterExport = value;
      await this.plugin.saveSettings();
    }));
  }
  addCliPathSetting(containerEl, name, key, placeholder) {
    const setting = new import_obsidian5.Setting(containerEl).setName(name).setDesc("Leave blank to use the command from PATH.").addText((text) => text.setPlaceholder(placeholder).setValue(this.plugin.settings[key]).onChange(async (value) => {
      this.plugin.settings[key] = value.trim();
      await this.plugin.saveSettings();
    }));
    if (key === "codexPath") {
      setting.addButton((button) => button.setButtonText("Detect MarkTL Codex").onClick(async () => {
        const detected = detectCodexCliPath(this.plugin.settings.codexPath);
        if (!detected) {
          new import_obsidian5.Notice("MarkTL Codex wrapper was not found. Create ~/.local/bin/marktl-codex on this Mac.");
          return;
        }
        this.plugin.settings.codexPath = detected;
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian5.Notice(`Codex CLI path set to ${detected}`);
      }));
    }
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
var { checkClaudeProvider, checkCodexProvider } = require_provider_doctor();
var MarktlSetupModal = class extends import_obsidian6.Modal {
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
    new import_obsidian6.Setting(agentBox).addButton((button) => button.setButtonText("Copy Codex setup prompt").onClick(() => this.copyAgentPrompt("codex"))).addButton((button) => button.setButtonText("Copy Claude setup prompt").onClick(() => this.copyAgentPrompt("claude")));
    new import_obsidian6.Setting(contentEl).addButton((button) => button.setButtonText("Check Claude CLI").onClick(() => {
      void this.runDoctor("claude");
    })).addButton((button) => button.setButtonText("Check Codex CLI").onClick(() => {
      void this.runDoctor("codex");
    })).addButton((button) => button.setButtonText("Finish setup").setCta().onClick(async () => {
      this.plugin.settings.setupCompleted = true;
      await this.plugin.saveSettings();
      this.close();
      new import_obsidian6.Notice("Flytothesky MarkTL setup saved.");
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
    new import_obsidian6.Notice(`${agent === "codex" ? "Codex" : "Claude"} setup prompt copied.`);
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
    let result;
    if (provider === "codex") {
      const currentPath = String(this.plugin.settings.codexPath || "").trim();
      const detectedPath = detectCodexCliPath(currentPath);
      const shouldRepairPath = !currentPath || currentPath === "codex" || isStaleCliPath(currentPath) || currentPath.startsWith("/") && !isManagedMarktlCodexPath(currentPath);
      if (shouldRepairPath && detectedPath) {
        this.plugin.settings.codexPath = detectedPath;
        await this.plugin.saveSettings();
      }
      const command = this.plugin.settings.codexPath || "codex";
      if (isStaleCliPath(command) || isManagedMarktlCodexPath(command) && !isExecutableFile(command) || command.startsWith("/") && !isManagedMarktlCodexPath(command)) {
        result = {
          ok: false,
          status: "missing",
          message: `MarkTL Codex wrapper is missing or invalid: ${command}. Create ~/.local/bin/marktl-codex on this Mac instead of saving /opt/homebrew/bin/codex in shared settings.`,
          version: ""
        };
      } else {
        result = await checkCodexProvider({
          command: resolveHomePath(command),
          timeoutMs: 15e3
        });
      }
    } else {
      result = await checkClaudeProvider({
      command: this.plugin.settings.claudePath || "claude",
      timeoutMs: 15e3
      });
    }
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
var { injectReaderFeedback, shouldAttachReaderFeedback, validateGiscusConfig } = require_feedback();
var { buildPagesUrl, buildPublishPath, buildShareHomeUrl, buildShortPagesUrl, inferPagesBaseUrl: inferPagesBaseUrl2, parseRepo, repairShareIndex, renderShareIndexHtml, updateShareIndex } = require_github_pages();
var { validateHtmlArtifact } = require_html_qa();
var { slugify } = require_html();
var { migrateSettings } = require_settings();
var { buildShortId, injectSocialMeta } = require_social();
var { applyPresetToOptions } = require_presets();
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
    const stat = import_node_fs.statSync(resolvedPath);
    return stat.isFile() && Boolean(stat.mode & 73);
  } catch (error) {
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
var DEFAULT_SETTINGS = {
  exportFolder: "html-exports",
  setupCompleted: false,
  artifactGoal: "read",
  artifactType: "faithful-note",
  template: "minimal",
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
  githubShareHomeTitle: "MarkTL Shared HTML",
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
var MarktlPublishedHtmlModal = class extends import_obsidian7.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    void this.render();
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "게시된 MarkTL HTML" });
    const description = contentEl.createEl("p", {
      text: "GitHub Pages 인덱스 메타데이터를 여기서 복구합니다. 중복 카드는 공개 아카이브와 내보낸 폴더에서 함께 제거할 수 있습니다."
    });
    description.addClass("setting-item-description");
    const statusEl = contentEl.createEl("div");
    const controls = contentEl.createDiv();
    new import_obsidian7.Setting(controls).addButton((button) => button.setButtonText("새로고침").onClick(() => void this.render())).addButton((button) => button.setButtonText("인덱스 메타데이터 복구").setCta().onClick(async () => {
      statusEl.setText("공개 인덱스를 복구하는 중...");
      try {
        const index = await this.plugin.repairPublishedShareIndex();
        new import_obsidian7.Notice(`MarkTL 인덱스를 복구했습니다: ${index.items.length}개 항목.`);
        await this.render();
      } catch (error) {
        statusEl.setText(error instanceof Error ? error.message : String(error));
      }
    }));
    const listEl = contentEl.createDiv();
    statusEl.setText("게시 인덱스를 불러오는 중...");
    try {
      const { index } = await this.plugin.loadPublishedShareIndex();
      statusEl.setText(`게시 항목 ${index.items.length}개.`);
      if (!index.items.length) {
        listEl.createEl("p", { text: "게시된 문서가 없습니다." });
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
    const title = String(item.title || item.slug || "제목 없는 HTML 산출물");
    const url = String(item.url || item.canonicalUrl || "");
    new import_obsidian7.Setting(card).setName(title).setDesc([
      item.updatedAt ? `갱신일: ${String(item.updatedAt).slice(0, 10)}` : "",
      item.sourcePath || "",
      item.shortId ? `shortId: ${item.shortId}` : "",
      url
    ].filter(Boolean).join("\n")).addButton((button) => button.setButtonText("열기").onClick(() => {
      if (url) {
        window.open(url);
      }
    })).addButton((button) => button.setButtonText("URL 복사").onClick(async () => {
      if (url) {
        await navigator.clipboard.writeText(url);
        new import_obsidian7.Notice("MarkTL URL을 복사했습니다.");
      }
    })).addButton((button) => button.setButtonText("완전 삭제").setWarning().onClick(async () => {
      const confirmed = window.confirm(`게시된 MarkTL 산출물을 삭제하고 아카이브에서도 제거할까요?\n\n${title}`);
      if (!confirmed) {
        return;
      }
      try {
        const result = await this.plugin.deletePublishedShareItem(item);
        new import_obsidian7.Notice(`아카이브 항목 ${result.removedCount}개를 삭제했습니다.`);
        await this.render();
      } catch (error) {
        new import_obsidian7.Notice(error instanceof Error ? error.message : String(error));
      }
    }));
  }
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
      id: "manage-published-html",
      name: "Manage published MarkTL HTML",
      callback: () => {
        new MarktlPublishedHtmlModal(this.app, this).open();
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
    if (!["none", "linked-notes"].includes(this.settings.contextPackMode)) {
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
  openSetupWizard() {
    new MarktlSetupModal(this.app, this).open();
  }
  openExportModal() {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md") {
      new import_obsidian7.Notice("HTML로 내보낼 Markdown 노트를 먼저 여세요.");
      return;
    }
    new MarktlExportModal(this.app, this, (options) => {
      void this.exportActiveNote(options);
    }).open();
  }
  repairHtmlHead(html) {
    let value = String(html || "").trim();
    if (!value) {
      return "<!doctype html>\n<html lang=\"ko\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>MarkTL Export</title>\n</head>\n<body></body>\n</html>";
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
      value = `<!doctype html>\n${value}`;
    }
    value = value.replace(/<html\b([^>]*)>/i, (match, attrs) => {
      const cleanAttrs = String(attrs || "").replace(/\s+lang=(["']).*?\1/i, "").trim();
      return `<html${cleanAttrs ? ` ${cleanAttrs}` : ""} lang="ko">`;
    });
    if (!/<head\b/i.test(value)) {
      value = value.replace(/<html\b[^>]*>/i, (match) => `${match}\n<head></head>`);
    }
    if (!/<meta\s+charset=/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}\n<meta charset="utf-8">`);
    }
    if (!/<meta\s+name=(["'])viewport\1/i.test(value)) {
      value = value.replace(/<head\b[^>]*>/i, (match) => `${match}\n<meta name="viewport" content="width=device-width, initial-scale=1">`);
    }
    return value;
  }
  async renderMermaidBlocksToStaticHtml(html, sourcePath, options = {}) {
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
        warnings.push(`참고: Mermaid 다이어그램 렌더링 실패, 원문 코드로 대체했습니다. ${message}`);
        output += `<details class="marktl-mermaid-source"><summary>다이어그램 원문</summary><pre><code class="language-mermaid">${this.escapeHtmlValue(source)}</code></pre></details>`;
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
    value = value.replace(/<pre\b(?![^>]*marktl-mermaid-source)([^>]*)>([\s\S]*?)<\/pre>/gi, (match, attrs, code) => {
      if (/<code\b/i.test(code)) {
        return match;
      }
      return toMermaidPre(code) || match;
    });
    return value;
  }
  async renderMermaidSvgFromMarkdown(source, sourcePath) {
    const renderer = import_obsidian7.MarkdownRenderer;
    if (!renderer) {
      throw new Error("Obsidian MarkdownRenderer를 찾을 수 없습니다.");
    }
    const container = document.createElement("div");
    container.classList.add("marktl-mermaid-render-host");
    container.setAttribute("style", "position:fixed;left:-10000px;top:0;width:1200px;max-width:1200px;opacity:0;pointer-events:none;");
    document.body.appendChild(container);
    try {
      const markdown = `\`\`\`mermaid\n${source}\n\`\`\``;
      if (typeof renderer.render === "function") {
        await renderer.render(this.app, markdown, container, sourcePath, this);
      } else if (typeof renderer.renderMarkdown === "function") {
        await renderer.renderMarkdown(markdown, container, sourcePath, this);
      } else {
        throw new Error("지원되는 MarkdownRenderer API가 없습니다.");
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const svg = container.querySelector("svg");
      if (!svg) {
        throw new Error("렌더링된 SVG를 찾지 못했습니다.");
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
      throw new Error("GitHub Pages 게시에는 작동 중인 AI provider가 필요합니다. Codex CLI를 선택하거나 공유 대상을 로컬 파일 링크로 바꾸세요.");
    }
    if (options.shareTarget === "github-pages" && options.failurePolicy !== "strict") {
      options.failurePolicy = "strict";
      this.settings.failurePolicy = "strict";
      await this.saveSettings();
      progress.addStep("GitHub Pages 게시를 위해 AI 실패 정책을 strict로 고정했습니다.");
    }
    if (options.aiProvider !== "codex") {
      return;
    }
    const currentPath = String(this.settings.codexPath || "").trim();
    if (isManagedMarktlCodexPath(currentPath) && !isExecutableFile(currentPath)) {
      throw new Error(`MarkTL Codex wrapper가 없습니다: ${currentPath}. 공유 설정을 /opt/homebrew/bin/codex로 바꾸지 말고 이 Mac에 wrapper를 생성하세요.`);
    }
    const detectedPath = detectCodexCliPath(currentPath);
    const shouldRepairPath = !currentPath || currentPath === "codex" || isStaleCliPath(currentPath) || currentPath.startsWith("/") && !isManagedMarktlCodexPath(currentPath);
    if (shouldRepairPath) {
      if (!detectedPath) {
        throw new Error(`Codex CLI 경로가 유효하지 않습니다: ${currentPath || "(empty)"}. 공유 설정에 /opt/homebrew/bin/codex를 저장하지 말고 이 Mac에 ~/.local/bin/marktl-codex wrapper를 생성하세요.`);
      }
      this.settings.codexPath = detectedPath;
      await this.saveSettings();
      progress.addStep(`Codex 경로 자동 복구: ${detectedPath}`);
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
          progress.addStep(`Codex 경로 자동 복구: ${fallbackPath}`);
          progress.addStep(`Codex 사전 점검 통과: ${cleanPreflightOutput(version.output) || fallbackPath}`);
          return;
        }
      }
      throw new Error(`Codex CLI 사전 점검 실패: ${command}: ${cleanPreflightOutput(version.output) || "실행할 수 없음"}`);
    }
    progress.addStep(`Codex 사전 점검 통과: ${cleanPreflightOutput(version.output) || command}`);
  }
  async exportActiveNote(overrides = {}) {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian7.TFile) || file.extension !== "md") {
      new import_obsidian7.Notice("HTML로 내보낼 Markdown 노트를 먼저 여세요.");
      return;
    }
    const options = this.resolveExportOptions(overrides);
    const progress = new MarktlProgressModal(this.app);
    progress.open();
    progress.addStep(`목적: ${options.artifactGoal}`);
    progress.addStep(`산출물: ${options.artifactType}`);
    progress.addStep(`템플릿: ${options.template}`);
    progress.addStep(`AI CLI: ${options.aiProvider === "none" ? "로컬 변환" : options.aiProvider}`);
    const privacyNote = getProviderPrivacyNote2(options.aiProvider);
    if (privacyNote) {
      progress.addStep(`개인정보 안내: ${privacyNote}`);
    }
    progress.addStep(`모드: ${options.conversionMode}; 미리보기: ${options.previewSecurity}`);
    progress.addStep(`제한시간: ${Math.round(this.settings.timeoutMs / 1e3)}초`);
    try {
      await this.ensureAiExportReady(options, progress);
      progress.addStep("현재 Markdown 노트를 읽는 중...");
      const markdown = await this.app.vault.read(file);
      const outputPlan = await this.prepareOutputPlan(file, options);
      const assetResult = await this.resolveImageAssets(markdown, file, outputPlan);
      progress.addStep(assetResult.mappings.length > 0 ? `로컬 이미지 ${assetResult.mappings.length}개를 연결했습니다.` : "연결할 로컬 이미지가 없습니다.");
      const contextResult = await this.resolveContextPack(markdown, file, options);
      if (contextResult.count > 0) {
        progress.addStep(`연결 컨텍스트 노트 ${contextResult.count}개를 읽었습니다.`);
      } else if (options.contextPackMode !== "none") {
        progress.addStep("읽을 수 있는 연결 컨텍스트 노트가 없습니다.");
      }
      progress.addStep(options.aiProvider === "none" ? "로컬 변환기를 실행하는 중..." : `${options.aiProvider} CLI를 실행하는 중...`);
      const result = await convertWithAiFallback(markdown, {
        provider: options.aiProvider,
        artifactGoal: options.artifactGoal,
        artifactType: options.artifactType,
        mode: options.conversionMode,
        template: options.template,
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
      progress.addStep(result.usedFallback ? "로컬 fallback HTML을 생성했습니다." : "AI HTML을 생성했습니다.");
      const shareMetadata = this.extractShareMetadata(markdown, outputPlan.basename);
      const shortId = buildShortId(outputPlan.basename);
      const socialUrl = options.shareTarget === "github-pages" ? buildShortPagesUrl(this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo), this.settings.githubPublishPath, shortId) : "";
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
        progress.addStep("Giscus 독자 피드백을 추가했습니다.");
      }
      const mermaidResult = await this.renderMermaidBlocksToStaticHtml(html, file.path, options);
      html = this.repairHtmlHead(mermaidResult.html);
      if (mermaidResult.rendered > 0) {
        progress.addStep(`Mermaid 다이어그램 ${mermaidResult.rendered}개를 정적 HTML/SVG로 렌더링했습니다.`);
      }
      const qaWarnings = validateHtmlArtifact(html, {
        trusted: options.previewSecurity === "trusted",
        artifactGoal: options.artifactGoal,
        assetMappings: assetResult.mappings
      });
      if (qaWarnings.length > 0) {
        progress.addStep(`HTML QA 참고사항 ${qaWarnings.length}개를 확인했습니다.`);
      } else {
        progress.addStep("HTML QA 기본 검사를 통과했습니다.");
      }
      const warnings = [...result.warnings, ...assetResult.warnings, ...contextResult.warnings, ...feedbackResult.warnings, ...mermaidResult.warnings, ...qaWarnings];
      let publicUrl = "";
      let shareHomeUrl = "";
      progress.addStep("HTML 파일을 vault에 저장하는 중...");
      await this.copyImageAssets(assetResult.mappings);
      const outputPath = await this.writeHtmlFile(outputPlan, html, options, file.path);
      if (options.shareTarget === "github-pages") {
        progress.addStep("GitHub Pages 번들을 게시하는 중...");
        const publishResult = await this.publishGithubPages(outputPlan, assetResult.mappings, file.path, markdown, options, shortId, shareMetadata);
        publicUrl = publishResult.publicUrl;
        shareHomeUrl = publishResult.shareHomeUrl;
        progress.addStep(`게시 완료: ${publicUrl}`);
      }
      progress.addStep("내부 미리보기 패널을 여는 중...");
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
        progress.addStep(publicUrl ? "공개 공유 링크를 복사하는 중..." : "로컬 공유 링크를 복사하는 중...");
        await this.copyShareLink(outputPath, publicUrl);
      }
      progress.complete(`완료: ${outputPath}`);
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
        publicUrl,
        shareHomeUrl
      });
      if (result.usedFallback && options.aiProvider !== "none") {
        new import_obsidian7.Notice("AI 변환에 실패해 로컬 fallback HTML을 생성했습니다.");
      } else {
        new import_obsidian7.Notice(`HTML 내보내기 완료: ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      progress.fail(message);
      new import_obsidian7.Notice(`HTML 내보내기 실패: ${message}`);
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
      presetId: overrides.presetId,
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
    if (!shouldAttachReaderFeedback(options)) {
      return { html, warnings: [], injected: false };
    }
    if (options.previewSecurity !== "trusted") {
      return {
        html,
        warnings: ["참고: 정적 안전 모드에서는 외부 댓글 스크립트를 포함하지 않아 Giscus 댓글을 제외했습니다."],
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
      return "독자 댓글 비활성화";
    }
    if (!shouldAttachReaderFeedback(options)) {
      return "로컬 파일 링크에서는 독자 댓글을 건너뜀";
    }
    if (feedback.injected) {
      return "Giscus GitHub 댓글 활성화";
    }
    return feedback.warnings.length > 0 ? `Giscus 설정 확인 필요: ${feedback.warnings[0]}` : "Giscus 댓글이 추가되지 않음";
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
        warnings.push(`참고 링크 건너뜀: ${target}`);
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
        warnings.push(`참고 링크를 읽지 못함: ${target}`);
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
      if (linked instanceof import_obsidian7.TFile && linked.extension === "md") {
        return linked;
      }
    }
    for (const candidate of candidates) {
      const normalized = (0, import_obsidian7.normalizePath)(candidate.endsWith(".md") ? candidate : `${candidate}.md`);
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
      ].map((value) => (0, import_obsidian7.normalizePath)(value));
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
      ].map((value) => (0, import_obsidian7.normalizePath)(value));
      return fileKeys.some((key) => candidateKeys.has(key) || [...candidateKeys].some((candidate) => key.endsWith(`/${candidate}`)));
    });
    return byName instanceof import_obsidian7.TFile ? byName : null;
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
      } catch (error) {
      }
    }
    return [...new Set(expanded.map((value) => (0, import_obsidian7.normalizePath)(value)).filter(Boolean))];
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
  getGithubPagesContext() {
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error("GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.");
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error("GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.");
    }
    const branch = this.settings.githubBranch.trim() || "main";
    const basePath = this.settings.githubPublishPath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo);
    return {
      ...repo,
      branch,
      basePath,
      pagesBaseUrl,
      indexPath: buildPublishPath(basePath, "", "index.json"),
      indexHtmlPath: buildPublishPath(basePath, "", "index.html")
    };
  }
  async loadPublishedShareIndex() {
    const context = this.getGithubPagesContext();
    const existing = await this.getGithubJson(context.owner, context.repo, context.branch, context.indexPath);
    return {
      context,
      index: repairShareIndex(existing || { items: [] })
    };
  }
  async repairPublishedShareIndex() {
    const { context, index } = await this.loadPublishedShareIndex();
    await this.writePublishedShareIndex(context, index);
    return index;
  }
  async writePublishedShareIndex(context, index) {
    const html = renderShareIndexHtml(index, {
      title: this.settings.githubShareHomeTitle || "MarkTL Shared HTML",
      baseUrl: buildShareHomeUrl(context.pagesBaseUrl, context.basePath).replace(/\/+$/g, "")
    });
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexPath, JSON.stringify(index, null, 2));
    await this.putGithubTextFile(context.owner, context.repo, context.branch, context.indexHtmlPath, html);
  }
  async deletePublishedShareItem(target) {
    const { context, index } = await this.loadPublishedShareIndex();
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
  shareDeleteKeys(item) {
    return [
      item == null ? void 0 : item.shortId ? `short:${item.shortId}` : "",
      item == null ? void 0 : item.url ? `url:${String(item.url).replace(/\/+$/g, "")}` : "",
      item == null ? void 0 : item.canonicalUrl ? `canonical:${String(item.canonicalUrl).replace(/\/+$/g, "")}` : "",
      item == null ? void 0 : item.sourcePathKey ? `source:${item.sourcePathKey}` : "",
      item == null ? void 0 : item.slug ? `slug:${item.slug}` : ""
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
    const existing = await (0, import_obsidian7.requestUrl)({
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
    const response = await (0, import_obsidian7.requestUrl)({
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
    const repo = parseRepo(this.settings.githubRepo);
    if (!repo) {
      throw new Error("GitHub Pages repo is not configured. Use owner/repo in MarkTL settings.");
    }
    if (!this.settings.githubToken.trim()) {
      throw new Error("GitHub token is not configured. Add a token with Contents write permission in MarkTL settings.");
    }
    const branch = this.settings.githubBranch.trim() || "main";
    const basePath = this.settings.githubPublishPath;
    const pagesBaseUrl = this.settings.githubPagesBaseUrl.trim() || inferPagesBaseUrl2(this.settings.githubRepo);
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
      sourcePathKey: sourcePath.normalize("NFC").replace(/\\/g, "/").trim().toLowerCase(),
      artifactType: options.artifactType,
      schemaVersion: 2,
      publishedByHost: String((typeof process !== "undefined" && process.env && process.env.HOSTNAME) || ""),
      ...metadata
    }, pagesBaseUrl);
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
      "project/지수통합선별공장": "지수통합선별공장",
      "topic/지수통합선별공장": "지수통합선별공장",
      "construction/daily-report": "공사일보",
      "construction/착공": "착공",
      "construction/콘크리트철거": "콘크리트철거",
      "construction/옹벽기초": "옹벽기초",
      "risk/준공검사": "준공리스크",
      "risk/방수": "방수배수",
      "obsidian/project-management": "프로젝트관리",
      "obsidian/dataviewjs": "",
      "obsidian/mermaid": "",
      dataviewjs: "",
      gantt: "일정관리",
      budget: "예산",
      risk: "리스크",
      "function/ops": "운영관리",
      "doc/보고서": "보고서",
      "doc/meeting": "회의록"
    };
    const toReaderTag = (tag) => {
      const raw = String(tag || "").replace(/^#/, "").trim();
      if (!raw) {
        return "";
      }
      if (Object.prototype.hasOwnProperty.call(readerTagMap, raw)) {
        return readerTagMap[raw];
      }
      const last = raw.includes("/") ? raw.split("/").filter(Boolean).pop() : raw;
      return /[가-힣]/.test(last) ? last.replace(/^업무\//, "").replace(/^프로젝트\//, "").slice(0, 18) : "";
    };
    const body = value.replace(/^---\n[\s\S]*?\n---\s*/, "").replace(/```(?:dataviewjs|dataview|mermaid|gantt)?[\s\S]*?```/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<![^>]*>/g, " ").replace(/^#\s+.+$/m, "").replace(/\[!abstract]\+?/gi, " ").replace(/한 줄\s*(요약|브리프)/g, " ").replace(/!\[\[[^\]]+]]/g, "").replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/[#*_`>~-]/g, "").split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
    return {
      title: title.trim(),
      excerpt: body.slice(0, 180),
      tags: [...new Set([...inlineTags, ...yamlListTags].map(toReaderTag).filter(Boolean))].slice(0, 8)
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
