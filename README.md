# MarkTL HTML Exporter

Obsidian plugin MVP for turning the currently open Markdown note into a templated HTML file and opening it in an internal preview pane.

## Features

- One-click export from the active Markdown note through the ribbon icon or command palette.
- Exports HTML into a configurable vault folder, defaulting to `html-exports/`.
- Opens the generated HTML in an Obsidian preview pane.
- Ships three templates: `minimal`, `editorial`, and `deck`.
- Works without AI through local Markdown-to-HTML conversion.
- Optional AI conversion through Codex CLI, Claude Code CLI, or Gemini CLI.
- Conversion modes: preserve content, presentation, blog, and landing page.
- Default sanitized preview blocks scripts, iframes, external assets, and inline event handlers.
- Trusted preview/export mode is available only by explicit setting.
- AI failures fallback to local conversion by default, with a strict failure option in settings.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

The build creates `main.js`. For manual Obsidian testing, copy or symlink this folder into:

```text
<vault>/.obsidian/plugins/marktl/
```

Then enable `MarkTL HTML Exporter` from Obsidian's community plugin settings.

## MVP Scope

Supported now: headings, paragraphs, lists, code blocks, tables, links, images, Obsidian image embeds, callouts, and frontmatter.

Deferred: advanced wikilink resolution, Mermaid rendering, math rendering, publishing/hosting, and live preview updates.
