# Flytothesky MarkTL Customization Baseline

This fork preserves the MarkTL copy that is actually running in the MacBook Obsidian proxy vault. The Obsidian display name is `Flytothesky MarkTL HTML Exporter`; the plugin id remains `marktl` for settings compatibility.

## Repository Role

- Upstream source: `reallygood83/marktl`
- Flytothesky fork: `flytothesky23/marktl`
- Local development clone: `/Users/flytothesky/Downloads/flytothesky-marktl`
- Active Obsidian install copied from: `/Users/flytothesky/Library/Application Support/ObsidianLocalConfigs/GoogleDrive-Obsidian-MacBook/plugins/marktl`

## Current Baseline

The top-level release assets in this fork were copied from the active Obsidian install:

- `main.js`
- `manifest.json`
- `styles.css`
- `versions.json` remains from upstream unless versioning is intentionally changed.

Do not commit `data.json`. It is a local Obsidian settings file and may contain machine-specific paths or private tokens.

## Preserved Custom Behavior

- Korean UX labels in trusted HTML export helpers.
- Mermaid export support:
  - Markdown fenced `mermaid` blocks are normalized to `marktl-mermaid-source`.
  - Rendered diagrams use `marktl-mermaid-rendered`.
  - Gantt and other Mermaid source blocks are preserved for troubleshooting.
- GitHub Pages archive repair:
  - published item identity is not based on `slug` alone.
  - `shortId`, `canonicalUrl`, `sourcePathKey`, URL, and slug are used to prevent duplicate/Untitled archive cards.
  - `repairShareIndex` restores old archive entries into the newer schema.
- Local Codex wrapper policy:
  - MarkTL must use `~/.local/bin/marktl-codex`.
  - Do not save `/opt/homebrew/bin/codex` into shared settings.
  - Each Mac owns its own wrapper and Codex auth state.

## Local Settings Policy

The active local setting is intentionally not committed, but this is the expected safe shape:

```json
{
  "codexPath": "~/.local/bin/marktl-codex",
  "githubToken": ""
}
```

Tokens belong in the local Obsidian plugin settings only, not in git.

## Development Rule

For now, `main.js` is the authoritative Flytothesky runtime snapshot. The original TypeScript/JS source under `src/` is still useful, but it does not yet fully explain every hotfix that was accumulated directly in the installed bundle.

Before replacing `main.js` from a fresh `npm run build`, migrate these custom behaviors into `src/` and verify the markers below still exist in the built artifact:

```bash
rg "marktl-mermaid-rendered|repairShareIndex|sourcePathKey|marktl-codex|renderMermaidBlocksToStaticHtml" main.js styles.css
```

## BRAT Release Assets

For BRAT, publish these release assets from this fork:

- `main.js`
- `manifest.json`
- `styles.css`
- `versions.json`
