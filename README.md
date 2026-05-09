# MarkTL HTML Exporter

Obsidian plugin MVP for turning the currently open Markdown note into a templated HTML file and opening it in an internal preview pane.

## Features

- One-click export from the active Markdown note through the ribbon icon or command palette.
- Exports HTML into a configurable vault folder, defaulting to `html-exports/`.
- Opens the generated HTML in an Obsidian preview pane.
- Shows an export modal from the ribbon or command palette to choose template, CLI, mode, preview security, and share-link behavior.
- Shows an export progress modal so you can see whether AI or local fallback produced the result.
- Ships templates: `minimal`, `editorial`, `deck`, `dashboard`, `investor-brief`, `research-memo`, and `interactive-report`.
- Works without AI through local Markdown-to-HTML conversion.
- Optional AI conversion through Claude Code CLI or Gemini CLI.
- Conversion modes: preserve content, presentation, blog, and landing page.
- AI CLI execution uses direct process invocation with prompt arguments instead of shell command strings.
- AI responses wrapped in explanations or Markdown code fences are unwrapped before validation.
- Default sanitized preview blocks scripts, iframes, external assets, and inline event handlers.
- Trusted preview/export mode is available only by explicit setting.
- AI failures fallback to local conversion by default, with a strict failure option in settings.
- Can copy a local `file://` share link for the generated self-contained HTML file.

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

## Sharing

The current sharing feature copies a local `file://` link to the generated HTML. This is useful for local review or sending the file directly.

Public web sharing still needs a hosting target. Good next options are GitHub Pages, a user-configured static hosting folder, or an export bundle that can be dropped into any static host.
