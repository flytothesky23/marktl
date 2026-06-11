# Flytothesky MarkTL BRAT Fork Development

## Current Rule

This repository is prepared as the Flytothesky fork of MarkTL. Do not apply it to the active Obsidian plugin install until the next feature-development cycle is finished and verified.

## Identity

| Field | Value |
|---|---|
| GitHub repo | `flytothesky23/marktl` |
| Obsidian plugin id | `marktl` |
| Display name after future release | `Flytothesky MarkTL HTML Exporter` |
| Original upstream | `reallygood83/marktl` |

The plugin id stays `marktl` so existing Obsidian settings and BRAT tracking do not break. The display name carries the Flytothesky fork identity.

## BRAT Release Assets

Future releases must include:

- `main.js`
- `manifest.json`
- `styles.css`
- `versions.json`

Do not release or commit `data.json`, tokens, local vault paths, OAuth files, or logs.

## Development Flow

1. Change code in this repository first.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `node --check main.js`.
5. Run `npm run verify:release-assets`.
6. Only after the feature is complete, tag the manifest version and let GitHub Actions create the BRAT release.

```bash
git tag 0.17.8
git push origin 0.17.8
```

The tag must match `manifest.json` version exactly. Do not use a `v` prefix unless the workflow is changed.

Do not run `npm run build` as a release step until the installed-bundle customizations have been fully migrated into `src/`. For now, the top-level `main.js` is the release asset of record.

## Obsidian Install Rule

The current MacBook plugin install remains untouched until a completed feature release exists. When ready, install or update through BRAT from:

```text
https://github.com/flytothesky23/marktl
```
