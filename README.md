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
- Opens a setup wizard on first run so beginners can choose local export, Claude AI, or share-ready bundles.
- Lets you choose HTML presets, artifact type, template, AI provider, conversion mode, preview security, and sharing behavior.
- Converts the currently active Markdown note into HTML.
- Saves the result to a vault folder, defaulting to `html-exports/`.
- Opens the generated HTML in an internal Obsidian preview pane.
- Shows a progress modal so you can see whether AI or local fallback produced the result.
- Works without AI through local Markdown-to-HTML conversion.
- Supports AI conversion through the verified provider:
  - Claude Code CLI
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
2. If this is your first run, choose a setup path:
   - `Start simple`: no AI required.
   - `Use Claude`: checks Claude Code CLI installation and login.
   - `Prepare sharing`: creates static-hosting-ready bundles.
3. Click the MarkTL ribbon icon, or run `Export active note to HTML...` from the command palette.
4. Choose an HTML preset such as `Readable Note`, `Interactive Report`, `Presentation`, `Decision Memo`, or `Shareable Article`.
5. In the export modal, adjust:
   - Artifact type
   - Template
   - AI CLI or local fallback
   - Conversion mode
   - Sanitized or trusted preview
   - Sharing target
6. Click `Export`.
7. Watch the progress modal and result summary.
8. Review the generated HTML inside Obsidian.

### Why HTML?

HTML lets MarkTL add things Markdown alone cannot reliably provide as a portable artifact: responsive layouts, cards, bundled local images, generated navigation, collapsible sections, copy buttons, slide-like reading flows, and static-hosting-ready folders.

### Context Packs

The export modal includes a `Context pack` option:

- `Active note only`: sends only the current note to the converter.
- `Include linked notes`: lets AI read local Markdown notes referenced by wikilinks or Markdown links, capped and compacted for safety.

Context packs are supporting material only. The active note remains the source of truth. Missing or unreadable linked notes are reported as export warnings.

### Interactive Controls

In `Trusted interactive preview`, the `interactive-report` template can add local-only controls such as generated contents, collapsible sections, reading progress, section filtering, expand all, copy as prompt, copy as markdown, copy summary, and copy outline JSON.

### Export QA

MarkTL runs a basic post-generation HTML QA pass before writing and previewing the result. It warns about missing document structure, missing responsive viewport, missing CSS, trusted exports with no script, dynamic markup in sanitized mode, missing bundled image references, and missing image alt text.

### AI Providers

Currently verified:

- Claude Code CLI

Codex CLI is intentionally not shown in the UI for now because plugin-style child-process probes were not stable enough.
Gemini CLI is also hidden for now because the local plugin-style probe did not complete reliably.

Rich AI artifacts can take several minutes. MarkTL defaults the CLI timeout to 5 minutes and migrates older 60-second settings upward because Claude Code can exceed 60 seconds on long Korean notes.

### Preview Security

- `Sanitized static preview`: removes scripts, iframes, remote assets, and dangerous handlers.
- `Trusted interactive preview`: allows self-contained inline JavaScript for local-only interactive artifacts.

Use trusted mode only for content you intentionally generated and trust.

### Sharing

MarkTL supports three sharing targets:

- `Local file link`: copies a `file://` link to the generated HTML.
- `Static hosting bundle`: writes:
- `GitHub Pages link`: writes the same bundle locally, uploads it to GitHub, and copies the public Pages URL.

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/README.md
html-exports/share/<slug>/assets/<image>.png
```

`Local file link` stores files at:

```text
html-exports/<slug>.html
html-exports/<slug>-assets/<image>.png
```

`Static hosting bundle` and `GitHub Pages link` always store files at:

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/assets/<image>.png
```

For GitHub Pages publishing, fill these settings:

- `GitHub repository`: `owner/repo`
- `GitHub branch`: usually `main`
- `GitHub Pages base URL`: for example `https://owner.github.io/repo`
- `Publish path`: folder inside the repository, for example `marktl`
- `GitHub token`: fine-grained token with Contents read/write permission for that repository

The public URL becomes:

```text
<GitHub Pages base URL>/<Publish path>/<slug>/
```

MarkTL also maintains a share home page and machine-readable index:

```text
<GitHub Pages base URL>/<Publish path>/
<GitHub Pages base URL>/<Publish path>/index.json
```

Each GitHub Pages publish adds or updates one entry by `<slug>`. Re-exporting the same note updates that entry; publishing a different note adds a new entry.

GitHub tokens are stored in the plugin data file. Use a dedicated repository and a narrow fine-grained token. Public publishing should always be intentional.

Private repository Pages depends on the GitHub account or organization plan. If GitHub Pages cannot be enabled for a private repository, either make the share repository public, upgrade to a plan that supports private Pages, or use a different static host that can deploy from private repositories.

### Local Images

MarkTL bundles local note images during export. It detects Obsidian embeds and Markdown images such as:

```markdown
![[diagram.png]]
![[Attachments/chart.webp|Chart]]
![Chart](images/chart.png)
```

Resolved image files are copied next to the generated HTML and image `src` values are rewritten to the bundled asset path:

```text
html-exports/<note>.html
html-exports/<note>-assets/<image>.png
```

For static bundles, images are written under `share/<slug>/assets/`. Remote images and data URLs are left unchanged.

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
- 첫 실행 시 setup wizard를 열어 local export, Claude AI, share-ready bundle 중 쉽게 선택할 수 있습니다.
- HTML preset, artifact type, 템플릿, AI provider, 변환 모드, preview 보안, 공유 방식을 선택할 수 있습니다.
- 현재 열려 있는 Markdown 노트를 HTML로 변환합니다.
- 기본적으로 vault 안의 `html-exports/` 폴더에 저장합니다.
- 생성된 HTML을 Obsidian 내부 preview pane에서 보여줍니다.
- 진행 모달을 통해 AI 결과인지 local fallback인지 확인할 수 있습니다.
- AI 없이도 local Markdown-to-HTML 변환으로 동작합니다.
- 검증된 AI provider를 지원합니다.
  - Claude Code CLI
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
2. 첫 실행이라면 setup path를 선택합니다.
   - `Start simple`: AI 없이 바로 사용
   - `Use Claude`: Claude Code CLI 설치와 로그인 상태 확인
   - `Prepare sharing`: 정적 호스팅용 bundle 생성
3. MarkTL 리본 아이콘을 클릭하거나 명령 팔레트에서 `Export active note to HTML...`을 실행합니다.
4. `Readable Note`, `Interactive Report`, `Presentation`, `Decision Memo`, `Shareable Article` 같은 HTML preset을 선택합니다.
5. Export 모달에서 다음을 조정합니다.
   - Artifact type
   - Template
   - AI CLI 또는 local fallback
   - Conversion mode
   - Sanitized preview 또는 Trusted preview
   - Sharing target
6. `Export`를 누릅니다.
7. 진행 모달과 결과 요약을 확인합니다.
8. Obsidian 내부 HTML Preview에서 결과를 확인합니다.

### 왜 HTML인가?

HTML을 사용하면 Markdown만으로는 휴대 가능한 artifact로 만들기 어려운 기능을 넣을 수 있습니다. 반응형 레이아웃, 카드형 섹션, 로컬 이미지 bundle, 자동 목차, 접기/펼치기, copy button, 슬라이드형 읽기 흐름, 정적 호스팅 준비 폴더를 만들 수 있습니다.

### Context Pack

Export 모달에는 `Context pack` 옵션이 있습니다.

- `Active note only`: 현재 노트만 변환기에 보냅니다.
- `Include linked notes`: wikilink 또는 Markdown link로 연결된 로컬 Markdown 노트를 AI가 참고하도록 합니다. 안전을 위해 개수와 길이를 제한하고 압축합니다.

Context pack은 보조 자료입니다. 현재 열린 노트가 항상 기준이며, 찾을 수 없거나 읽을 수 없는 linked note는 export warning으로 표시됩니다.

### 인터랙티브 컨트롤

`Trusted interactive preview`에서 `interactive-report` 템플릿은 자동 목차, 접기/펼치기, 읽기 progress, 섹션 필터, 전체 펼치기, copy as prompt, copy as markdown, copy summary, copy outline JSON 같은 로컬 전용 컨트롤을 넣을 수 있습니다.

### Export QA

MarkTL은 HTML을 저장하고 preview하기 전에 기본 QA를 실행합니다. 문서 구조, responsive viewport, inline CSS, trusted mode의 script 유무, sanitized mode의 동적 markup, bundled image 참조 누락, image alt 누락을 warning으로 알려줍니다.

### AI Provider

현재 검증된 provider:

- Claude Code CLI

Codex CLI는 현재 플러그인 child-process 실행 안정성이 충분하지 않아 UI에서 제외했습니다.
Gemini CLI도 현재 로컬 plugin-style probe가 안정적으로 완료되지 않아 UI에서 제외했습니다.

풍부한 AI artifact는 몇 분이 걸릴 수 있습니다. MarkTL은 CLI timeout 기본값을 5분으로 두며, 기존 60초 설정은 자동으로 5분으로 올립니다. 긴 한국어 노트에서 Claude Code가 60초를 넘는 경우가 있었기 때문입니다.

### Preview 보안

- `Sanitized static preview`: script, iframe, remote asset, 위험한 handler를 제거합니다.
- `Trusted interactive preview`: 사용자가 명시적으로 신뢰한 경우 self-contained inline JavaScript를 허용합니다.

Trusted mode는 의도적으로 생성하고 신뢰하는 문서에만 사용하세요.

### 공유

MarkTL은 세 가지 공유 방식을 지원합니다.

- `Local file link`: 생성된 HTML의 `file://` 링크를 복사합니다.
- `Static hosting bundle`: 아래 구조를 생성합니다.
- `GitHub Pages link`: 같은 bundle을 로컬에 만들고 GitHub에 업로드한 뒤 공개 Pages URL을 복사합니다.

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/README.md
html-exports/share/<slug>/assets/<image>.png
```

`Local file link`는 아래 경로에 저장합니다.

```text
html-exports/<slug>.html
html-exports/<slug>-assets/<image>.png
```

`Static hosting bundle`과 `GitHub Pages link`는 항상 아래 경로에 저장합니다.

```text
html-exports/share/<slug>/index.html
html-exports/share/<slug>/assets/<image>.png
```

GitHub Pages publish를 쓰려면 설정에 아래 값을 입력합니다.

- `GitHub repository`: `owner/repo`
- `GitHub branch`: 보통 `main`
- `GitHub Pages base URL`: 예 `https://owner.github.io/repo`
- `Publish path`: repo 안의 폴더, 예 `marktl`
- `GitHub token`: 해당 repo에 Contents read/write 권한이 있는 fine-grained token

공개 URL은 아래처럼 만들어집니다.

```text
<GitHub Pages base URL>/<Publish path>/<slug>/
```

MarkTL은 공유 홈 페이지와 기계가 읽을 수 있는 index도 함께 관리합니다.

```text
<GitHub Pages base URL>/<Publish path>/
<GitHub Pages base URL>/<Publish path>/index.json
```

GitHub Pages publish를 할 때마다 `<slug>` 기준으로 항목이 추가되거나 갱신됩니다. 같은 노트를 다시 export하면 해당 항목이 최신본으로 바뀌고, 다른 노트를 publish하면 목록에 새 항목이 추가됩니다.

GitHub token은 플러그인 데이터 파일에 저장됩니다. 전용 repo와 권한이 좁은 fine-grained token을 쓰세요. 공개 publish는 항상 사용자가 명시적으로 선택해야 합니다.

Private repo에서 GitHub Pages를 쓸 수 있는지는 GitHub 계정 또는 조직 플랜에 따라 달라집니다. private repo에서 Pages를 켤 수 없다면 share repo를 public으로 바꾸거나, private Pages를 지원하는 플랜을 쓰거나, private repo 배포를 지원하는 다른 정적 호스팅을 사용해야 합니다.

### 로컬 이미지

MarkTL은 export 과정에서 노트의 로컬 이미지를 함께 bundle로 만듭니다. 아래 문법을 감지합니다.

```markdown
![[diagram.png]]
![[Attachments/chart.webp|Chart]]
![Chart](images/chart.png)
```

찾은 이미지 파일은 생성된 HTML 옆으로 복사되고, HTML의 이미지 `src`는 bundle 안의 asset 경로로 바뀝니다.

```text
html-exports/<note>.html
html-exports/<note>-assets/<image>.png
```

Static bundle에서는 이미지가 `share/<slug>/assets/` 아래에 저장됩니다. 원격 이미지와 data URL은 그대로 둡니다.

### 개발

```bash
npm install
npm test
npm run typecheck
npm run build
```

빌드하면 BRAT에서 사용하는 `main.js`가 생성됩니다. `manifest.json`, `styles.css`와 함께 배포됩니다.
