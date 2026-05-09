# MarkTL HTML Exporter

[![YouTube: 배움의 달인](https://img.shields.io/badge/YouTube-%EB%B0%B0%EC%9B%80%EC%9D%98%20%EB%8B%AC%EC%9D%B8-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v)
[![X: @reallygood83](https://img.shields.io/badge/X-@reallygood83-black?style=for-the-badge&logo=x)](https://x.com/reallygood83)

MarkTL is an Obsidian plugin that turns Markdown notes into readable, visual, share-ready HTML artifacts.

It is inspired by the idea that HTML is often a better medium than Markdown for reviewing long AI-generated notes, strategy documents, research reports, decision memos, and interactive explainers.

---

## English

### Purpose

Markdown is excellent for writing, but long Markdown notes are often hard to read, compare, present, or share. MarkTL helps you convert the active Obsidian note into a purpose-built HTML artifact with stronger visual structure, optional AI transformation, internal preview, and share preparation.

MarkTL is not just a "pretty Markdown exporter." The goal is to help you create HTML artifacts that are:

- easier to read than long Markdown files
- visually structured with sections, cards, tables, and navigation
- optionally transformed by AI into strategy briefs, research reports, decision memos, explainers, or slide-like documents
- previewable inside Obsidian
- exportable as self-contained static HTML
- prepared for sharing through local links or static hosting bundles

### What It Does

- Opens an export modal from the ribbon icon or command palette.
- Lets you choose artifact type, template, AI provider, conversion mode, preview security, and sharing behavior.
- Converts the currently active Markdown note into HTML.
- Saves the result to a vault folder, defaulting to `html-exports/`.
- Opens the generated HTML in an internal Obsidian preview pane.
- Shows a progress modal so you can see whether AI or local fallback produced the result.
- Works without AI through local Markdown-to-HTML conversion.
- Supports AI conversion through verified providers:
  - Claude Code CLI
  - Gemini CLI
- Creates static hosting bundles for GitHub Pages, S3/R2, Netlify, Vercel, or any static host.

### Artifact Types

Choose an artifact type in the export modal:

- `Faithful Note`: preserve the note while improving readability.
- `Strategy Brief`: TL;DR, context, options, tradeoffs, risks, recommendation, next actions.
- `Research Report`: abstract, findings, evidence, implications, source notes.
- `Decision Memo`: question, criteria, options, comparison matrix, recommendation, dissenting view.
- `Interactive Explainer`: progressive disclosure, copy buttons, local-only controls.
- `Slide Deck`: sectioned, slide-like reading flow with one idea per section.

### Templates

Included templates:

- `minimal`
- `editorial`
- `deck`
- `dashboard`
- `investor-brief`
- `research-memo`
- `interactive-report`

`interactive-report` can include trusted-mode interactive controls such as progress, generated TOC, collapsible sections, "copy as prompt", "copy as markdown", and "copy summary".

### How To Install With BRAT

1. Install the Obsidian BRAT plugin.
2. Open BRAT settings.
3. Choose `Add Beta plugin`.
4. Paste this repository URL:

```text
https://github.com/reallygood83/marktl
```

5. Enable `MarkTL HTML Exporter` in Obsidian community plugin settings.

### How To Use

1. Open a Markdown note in Obsidian.
2. Click the MarkTL ribbon icon, or run `Export active note to HTML...` from the command palette.
3. In the export modal, choose:
   - Artifact type
   - Template
   - AI CLI or local fallback
   - Conversion mode
   - Sanitized or trusted preview
   - Sharing target
4. Click `Export`.
5. Watch the progress modal.
6. Review the generated HTML inside Obsidian.

### AI Providers

Currently verified:

- Claude Code CLI
- Gemini CLI

Codex CLI is intentionally not shown in the UI for now because plugin-style child-process probes were not stable enough.

### Preview Security

- `Sanitized static preview`: removes scripts, iframes, remote assets, and dangerous handlers.
- `Trusted interactive preview`: allows self-contained inline JavaScript for local-only interactive artifacts.

Use trusted mode only for content you intentionally generated and trust.

### Sharing

MarkTL supports two sharing targets:

- `Local file link`: copies a `file://` link to the generated HTML.
- `Static hosting bundle`: writes:

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/README.md
```

You can publish that folder with GitHub Pages, S3/R2, Netlify, Vercel, or any static host.

MarkTL does not upload vault content automatically. Public sharing should always be explicit.

### Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

The build creates `main.js`, which BRAT uses together with `manifest.json` and `styles.css`.

---

## 한국어

### 목적

Markdown은 작성하기에는 좋지만, 긴 노트나 AI가 만든 분석 문서를 읽고 비교하고 공유하기에는 한계가 있습니다. MarkTL은 Obsidian의 현재 노트를 읽기 쉽고, 시각적으로 구조화되어 있고, 공유 준비가 된 HTML artifact로 바꾸는 플러그인입니다.

MarkTL은 단순한 "예쁜 Markdown 변환기"가 아닙니다. 목표는 다음과 같은 HTML artifact를 만드는 것입니다.

- 긴 Markdown보다 읽기 쉬운 문서
- 섹션, 카드, 표, 목차, 시각적 위계가 있는 문서
- AI가 전략 브리프, 리서치 리포트, 의사결정 메모, 인터랙티브 설명서, 슬라이드형 문서로 재구성할 수 있는 문서
- Obsidian 내부에서 바로 미리보기 가능한 문서
- 하나의 정적 HTML 파일로 보관 가능한 문서
- 로컬 링크 또는 정적 호스팅 번들로 공유 준비가 되는 문서

### 주요 기능

- 리본 아이콘 또는 명령 팔레트에서 export 모달을 엽니다.
- artifact type, 템플릿, AI provider, 변환 모드, preview 보안, 공유 방식을 선택할 수 있습니다.
- 현재 열려 있는 Markdown 노트를 HTML로 변환합니다.
- 기본적으로 vault 안의 `html-exports/` 폴더에 저장합니다.
- 생성된 HTML을 Obsidian 내부 preview pane에서 보여줍니다.
- 진행 모달을 통해 AI 결과인지 local fallback인지 확인할 수 있습니다.
- AI 없이도 local Markdown-to-HTML 변환으로 동작합니다.
- 검증된 AI provider를 지원합니다.
  - Claude Code CLI
  - Gemini CLI
- GitHub Pages, S3/R2, Netlify, Vercel 같은 정적 호스팅에 올릴 수 있는 bundle을 만들 수 있습니다.

### Artifact Type

Export 모달에서 artifact type을 선택할 수 있습니다.

- `Faithful Note`: 원문을 최대한 보존하면서 읽기 쉽게 변환
- `Strategy Brief`: TL;DR, 맥락, 선택지, tradeoff, risk, recommendation, next action 중심
- `Research Report`: abstract, key findings, evidence, implication, source note 중심
- `Decision Memo`: 질문, 기준, 선택지, 비교표, 추천안, 반대 의견, decision log 중심
- `Interactive Explainer`: 목차, 접기/펼치기, copy button 등 상호작용 중심
- `Slide Deck`: 섹션별로 슬라이드처럼 읽히는 문서

### 템플릿

포함된 템플릿:

- `minimal`
- `editorial`
- `deck`
- `dashboard`
- `investor-brief`
- `research-memo`
- `interactive-report`

`interactive-report`는 trusted mode에서 progress bar, 자동 목차, 섹션 접기/펼치기, `copy as prompt`, `copy as markdown`, `copy summary` 같은 기능을 포함할 수 있습니다.

### BRAT으로 설치하는 방법

1. Obsidian에서 BRAT 플러그인을 설치합니다.
2. BRAT 설정을 엽니다.
3. `Add Beta plugin`을 선택합니다.
4. 아래 저장소 주소를 붙여넣습니다.

```text
https://github.com/reallygood83/marktl
```

5. Obsidian community plugin 설정에서 `MarkTL HTML Exporter`를 활성화합니다.

### 사용 방법

1. Obsidian에서 Markdown 노트를 엽니다.
2. MarkTL 리본 아이콘을 클릭하거나 명령 팔레트에서 `Export active note to HTML...`을 실행합니다.
3. Export 모달에서 다음을 선택합니다.
   - Artifact type
   - Template
   - AI CLI 또는 local fallback
   - Conversion mode
   - Sanitized preview 또는 Trusted preview
   - Sharing target
4. `Export`를 누릅니다.
5. 진행 모달에서 변환 과정을 확인합니다.
6. Obsidian 내부 HTML Preview에서 결과를 확인합니다.

### AI Provider

현재 검증된 provider:

- Claude Code CLI
- Gemini CLI

Codex CLI는 현재 플러그인 child-process 실행 안정성이 충분하지 않아 UI에서 제외했습니다.

### Preview 보안

- `Sanitized static preview`: script, iframe, remote asset, 위험한 handler를 제거합니다.
- `Trusted interactive preview`: 사용자가 명시적으로 신뢰한 경우 self-contained inline JavaScript를 허용합니다.

Trusted mode는 의도적으로 생성하고 신뢰하는 문서에만 사용하세요.

### 공유

MarkTL은 두 가지 공유 방식을 지원합니다.

- `Local file link`: 생성된 HTML의 `file://` 링크를 복사합니다.
- `Static hosting bundle`: 아래 구조를 생성합니다.

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/README.md
```

이 폴더를 GitHub Pages, S3/R2, Netlify, Vercel 등 정적 호스팅에 올릴 수 있습니다.

MarkTL은 vault 내용을 자동 업로드하지 않습니다. 공개 공유는 항상 사용자가 명시적으로 선택해야 합니다.

### 개발

```bash
npm install
npm test
npm run typecheck
npm run build
```

빌드하면 BRAT에서 사용하는 `main.js`가 생성됩니다. `manifest.json`, `styles.css`와 함께 배포됩니다.
