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
      }
    ];
    function listTemplates2() {
      return templates.map(({ id, name, description }) => ({ id, name, description }));
    }
    function getTemplate(id) {
      return templates.find((template) => template.id === id) || templates[0];
    }
    function wrapWithTemplate(bodyHtml, options = {}) {
      const template = getTemplate(options.template);
      const title = options.title || "Exported note";
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
</body>
</html>`;
    }
    module2.exports = {
      getTemplate,
      listTemplates: listTemplates2,
      wrapWithTemplate
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
        title
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
      return escapeHtml(value).replace(/!\[\[([^\]]+)]]/g, (_match, target) => `<img src="${escapeHtml(target)}" alt="${escapeHtml(target)}">`).replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_match, alt, src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`).replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
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
    var { execFile } = require("node:child_process");
    var { promisify } = require("node:util");
    var { convertMarkdownToHtml } = require_converter();
    var { looksLikeHtmlDocument, sanitizeHtml } = require_sanitizer();
    var execFileAsync = promisify(execFile);
    var providerCommands = {
      codex: { command: "codex", args: ["exec", "--ask-for-approval", "never", "-"] },
      claude: { command: "claude", args: ["-p"] },
      gemini: { command: "gemini", args: ["-p"] }
    };
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
        const aiHtml = await runProvider(markdown, options);
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
      const timeout = Number(options.timeoutMs || 6e4);
      const command = options.cliPaths && options.cliPaths[options.provider] ? options.cliPaths[options.provider] : provider.command;
      const { stdout } = await execFileAsync(command, provider.args, {
        input: prompt,
        timeout,
        maxBuffer: 10 * 1024 * 1024
      });
      return stdout;
    }
    function buildPrompt(markdown, options = {}) {
      const modeInstruction = {
        preserve: "Preserve the source content. Improve only HTML structure, semantics, and styling.",
        presentation: "Create a presentation-style HTML document. Summaries and visual emphasis are allowed.",
        blog: "Create a polished blog-style HTML article. Light restructuring is allowed.",
        landing: "Create a landing-page-style HTML document. Strong restructuring and emphasis copy are allowed."
      }[options.mode || "preserve"];
      return `Convert this Obsidian Markdown note to a complete standalone HTML document.
Template: ${options.template || "minimal"}
Mode: ${options.mode || "preserve"}
Instruction: ${modeInstruction}
Return only HTML. Do not wrap it in Markdown fences.

${markdown}`;
    }
    module2.exports = {
      buildPrompt,
      convertWithAiFallback: convertWithAiFallback2,
      runCliProvider
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MarktlPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/preview-view.ts
var import_obsidian = require("obsidian");
var VIEW_TYPE_MARKTL_PREVIEW = "marktl-html-preview";
var emptyState = {
  html: "<!doctype html><html><body><p>No preview loaded.</p></body></html>",
  filePath: "",
  warnings: [],
  trusted: false
};
var MarktlPreviewView = class extends import_obsidian.ItemView {
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
    const frame = container.createEl("iframe", {
      cls: "marktl-preview-frame",
      attr: {
        sandbox: this.state.trusted ? "allow-same-origin allow-scripts" : ""
      }
    });
    frame.srcdoc = this.state.html;
  }
};

// src/settings-tab.ts
var import_obsidian2 = require("obsidian");
var import_templates = __toESM(require_templates());
var MarktlSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "MarkTL HTML Exporter" });
    new import_obsidian2.Setting(containerEl).setName("Export folder").setDesc("Vault-relative folder for generated HTML files.").addText((text) => text.setPlaceholder("html-exports").setValue(this.plugin.settings.exportFolder).onChange(async (value) => {
      this.plugin.settings.exportFolder = value.trim() || "html-exports";
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Template").setDesc("Default HTML style template.").addDropdown((dropdown) => {
      for (const template of (0, import_templates.listTemplates)()) {
        dropdown.addOption(template.id, template.name);
      }
      dropdown.setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("AI provider").setDesc("Optional CLI provider for high-quality AI conversion.").addDropdown((dropdown) => dropdown.addOption("none", "None / local fallback").addOption("codex", "Codex CLI").addOption("claude", "Claude Code CLI").addOption("gemini", "Gemini CLI").setValue(this.plugin.settings.aiProvider).onChange(async (value) => {
      this.plugin.settings.aiProvider = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Conversion mode").setDesc("Preserve mode keeps the note faithful. Other modes allow AI restructuring.").addDropdown((dropdown) => dropdown.addOption("preserve", "Preserve content").addOption("presentation", "Presentation").addOption("blog", "Blog article").addOption("landing", "Landing page").setValue(this.plugin.settings.conversionMode).onChange(async (value) => {
      this.plugin.settings.conversionMode = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Preview security").setDesc("Sanitized mode blocks scripts, iframes, external assets, and event handlers.").addDropdown((dropdown) => dropdown.addOption("sanitized", "Sanitized static preview").addOption("trusted", "Trusted preview/export").setValue(this.plugin.settings.previewSecurity).onChange(async (value) => {
      this.plugin.settings.previewSecurity = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("AI failure policy").setDesc("Fallback creates local HTML with a warning. Strict stops generation.").addDropdown((dropdown) => dropdown.addOption("fallback", "Fallback with warning").addOption("strict", "Stop on AI failure").setValue(this.plugin.settings.failurePolicy).onChange(async (value) => {
      this.plugin.settings.failurePolicy = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("CLI timeout").setDesc("Maximum AI CLI runtime in milliseconds.").addText((text) => text.setPlaceholder("60000").setValue(String(this.plugin.settings.timeoutMs)).onChange(async (value) => {
      const parsed = Number(value);
      this.plugin.settings.timeoutMs = Number.isFinite(parsed) && parsed > 0 ? parsed : 6e4;
      await this.plugin.saveSettings();
    }));
    this.addCliPathSetting(containerEl, "Codex CLI path", "codexPath", "codex");
    this.addCliPathSetting(containerEl, "Claude Code CLI path", "claudePath", "claude");
    this.addCliPathSetting(containerEl, "Gemini CLI path", "geminiPath", "gemini");
  }
  addCliPathSetting(containerEl, name, key, placeholder) {
    new import_obsidian2.Setting(containerEl).setName(name).setDesc("Leave blank to use the command from PATH.").addText((text) => text.setPlaceholder(placeholder).setValue(this.plugin.settings[key]).onChange(async (value) => {
      this.plugin.settings[key] = value.trim();
      await this.plugin.saveSettings();
    }));
  }
};

// src/main.ts
var { convertWithAiFallback } = require_ai();
var { slugify } = require_html();
var DEFAULT_SETTINGS = {
  exportFolder: "html-exports",
  template: "minimal",
  aiProvider: "none",
  conversionMode: "preserve",
  failurePolicy: "fallback",
  previewSecurity: "sanitized",
  timeoutMs: 6e4,
  codexPath: "",
  claudePath: "",
  geminiPath: ""
};
var MarktlPlugin = class extends import_obsidian3.Plugin {
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
      void this.exportActiveNote();
    });
    this.addCommand({
      id: "export-active-note-to-html",
      name: "Export active note to HTML",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const canRun = file instanceof import_obsidian3.TFile && file.extension === "md";
        if (canRun && !checking) {
          void this.exportActiveNote();
        }
        return canRun;
      }
    });
    this.addSettingTab(new MarktlSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_MARKTL_PREVIEW);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async exportActiveNote() {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian3.TFile) || file.extension !== "md") {
      new import_obsidian3.Notice("Open a Markdown note before exporting HTML.");
      return;
    }
    try {
      const markdown = await this.app.vault.read(file);
      const result = await convertWithAiFallback(markdown, {
        provider: this.settings.aiProvider,
        mode: this.settings.conversionMode,
        template: this.settings.template,
        trusted: this.settings.previewSecurity === "trusted",
        strictAiFailures: this.settings.failurePolicy === "strict",
        timeoutMs: this.settings.timeoutMs,
        sourcePath: file.path,
        cliPaths: {
          codex: this.settings.codexPath,
          claude: this.settings.claudePath,
          gemini: this.settings.geminiPath
        }
      });
      const outputPath = await this.writeHtmlFile(file, result.html);
      await this.openPreview({
        html: result.html,
        filePath: outputPath,
        warnings: result.warnings,
        trusted: this.settings.previewSecurity === "trusted"
      });
      if (result.usedFallback && this.settings.aiProvider !== "none") {
        new import_obsidian3.Notice("AI conversion failed; local fallback HTML was generated.");
      } else {
        new import_obsidian3.Notice(`HTML exported to ${outputPath}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new import_obsidian3.Notice(`HTML export failed: ${message}`);
    }
  }
  async writeHtmlFile(source, html) {
    const folder = (0, import_obsidian3.normalizePath)(this.settings.exportFolder || DEFAULT_SETTINGS.exportFolder);
    if (!await this.app.vault.adapter.exists(folder)) {
      await this.app.vault.createFolder(folder);
    }
    const basename = slugify(source.basename);
    const outputPath = (0, import_obsidian3.normalizePath)(`${folder}/${basename}.html`);
    await this.app.vault.adapter.write(outputPath, html);
    return outputPath;
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
