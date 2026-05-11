# MarkTL HTML Exporter

[![YouTube: 배움의 달인](https://img.shields.io/badge/YouTube-%EB%B0%B0%EC%9B%80%EC%9D%98%20%EB%8B%AC%EC%9D%B8-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v)
[![X: @reallygood83](https://img.shields.io/badge/X-@reallygood83-black?style=for-the-badge&logo=x)](https://x.com/reallygood83)

MarkTL is an Obsidian plugin that turns Markdown notes into readable, visual, share-ready HTML artifacts.

It is inspired by the idea that HTML is often a better medium than Markdown for reviewing long AI-generated notes, strategy documents, research reports, decision memos, and interactive explainers.

---

## English

### Purpose

Markdown is excellent for writing, but long Markdown notes are often hard to read, compare, present, or share. MarkTL helps you convert the active Obsidian note into a purpose-built HTML artifact with stronger visual structure, optional AI transformation, internal preview, and share preparation.

MarkTL is not just a "pretty Markdown exporter." The goal is to help you create HTML artifacts that have a job: help someone read, decide, review, compare, tune, explain, publish, and then bring the result back into an AI session.

The core idea is simple:

> Markdown is where you write. HTML is where an AI-made artifact can become a small interactive surface.

MarkTL artifacts are designed to be:

- easier to read than long Markdown files
- visually structured with sections, cards, tables, and navigation
- interactive when trusted, with local controls, captured state, and copy-back-to-AI prompts
- optionally transformed by AI into strategy briefs, research reports, decision memos, explainers, or slide-like documents
- previewable inside Obsidian
- exportable as self-contained static HTML
- prepared for sharing through local links or static hosting bundles

### What It Does

- Opens an export modal from the ribbon icon or command palette.
- Opens a setup wizard on first run so beginners can choose local export, Claude, Codex, or share-ready bundles.
- Lets you choose the artifact goal, artifact type, template, AI provider, conversion mode, preview security, and sharing behavior.
- Converts the currently active Markdown note into HTML.
- Saves the result to a vault folder, defaulting to `html-exports/`.
- Opens the generated HTML in an internal Obsidian preview pane.
- Shows a progress modal so you can see whether AI or local fallback produced the result.
- Works without AI through local Markdown-to-HTML conversion.
- Supports AI conversion through verified providers:
  - Claude Code CLI
  - Codex CLI
- Creates static hosting bundles for GitHub Pages, S3/R2, Netlify, Vercel, or any static host.

### Artifact Goals

Start with what the HTML should do:

- `Readable artifact`: make a long note easier to read, navigate, and share.
- `Decision room`: extract the question, options, criteria, tradeoffs, risks, recommendation, and decision log.
- `Review room`: help readers leave structured feedback and copy it back into Claude/Codex.
- `Compare options`: lay out alternatives side by side with scorecards and tradeoff summaries.
- `Prompt playground`: create editable controls and copyable state for the next AI iteration.
- `PR / code explainer`: explain code, diffs, plans, risks, and reviewer checklists.
- `Public article`: prepare a polished hosted page with social-preview-friendly framing.

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
- `playground`

`interactive-report` can include trusted-mode interactive controls such as progress, generated TOC, collapsible sections, "copy as prompt", "copy as markdown", and "copy summary".
`playground` adds an editable working-notes area, an emphasis slider, "copy prompt", and "copy state JSON" so the HTML file can act as a small review interface.

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
   - `Use Codex`: checks Codex CLI installation and login.
   - `Prepare sharing`: creates static-hosting-ready bundles.
3. Click the MarkTL ribbon icon, or run `Export active note to HTML...` from the command palette.
4. Choose an HTML preset such as `Readable Note`, `Interactive Report`, `Presentation`, `Decision Room`, `Shareable Article`, `Prompt Playground`, `Compare Options`, or `PR / Code Explainer`.
5. In the export modal, adjust:
   - Artifact goal
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

HTML lets MarkTL add things Markdown alone cannot reliably provide as a portable artifact: responsive layouts, cards, bundled local images, generated navigation, collapsible sections, scorecards, sliders, editable review notes, copy buttons, slide-like reading flows, and static-hosting-ready folders.

The kick is the review loop: a reader can open the hosted HTML, navigate it, interact with it, leave comments, copy structured feedback or state, and paste that back into Claude/Codex for the next iteration.

### Context Packs

The export modal includes a `Context pack` option:

- `Active note only`: sends only the current note to the converter.
- `Include linked notes`: lets AI read local Markdown notes referenced by wikilinks or Markdown links, capped and compacted for safety.

Context packs are supporting material only. The active note remains the source of truth. Missing or unreadable linked notes are reported as export warnings.

### Interactive Controls

In `Trusted interactive preview`, the `interactive-report` template can add local-only controls such as generated contents, collapsible sections, reading progress, section filtering, expand all, copy as prompt, copy as markdown, copy summary, and copy outline JSON. The `playground` template adds editable review notes, an emphasis slider, and copyable state JSON for iterative work. Artifact goals push AI-generated HTML toward stronger purpose-built interfaces such as decision rooms, review rooms, comparison boards, prompt playgrounds, and PR explainers.

### Reader Feedback With Giscus

MarkTL can append a `Reader feedback` section powered by Giscus. Readers sign in with GitHub inside the Giscus comment box, then leave public comments and reactions stored in GitHub Discussions.

To use it:

1. Enable GitHub Discussions on the feedback repository.
2. Install/configure Giscus for that repository at `https://giscus.app`.
3. Copy the generated `repo`, `repo-id`, `category`, and `category-id` values into MarkTL settings.
4. Set `Reader feedback mode` to `Giscus GitHub comments`.
5. Export with `Trusted preview/export`.

Giscus loads an external script from `https://giscus.app/client.js`, so it is intentionally disabled for sanitized exports.

### Export QA

MarkTL runs a basic post-generation HTML QA pass before writing and previewing the result. It warns about missing document structure, missing responsive viewport, missing CSS, trusted exports with no script, dynamic markup in sanitized mode, missing bundled image references, and missing image alt text. The internal preview also runs a render QA pass after the iframe loads to flag nearly empty output, missing H1, broken images, unusually short renders, or trusted previews with no controls.

### AI Providers

Currently verified:

- Claude Code CLI
- Codex CLI

Codex runs through `codex exec --json --sandbox read-only --skip-git-repo-check -` and reads the generated prompt from stdin. If Obsidian cannot find the command, set the full Codex CLI path in settings.
Gemini CLI is hidden for now because the local plugin-style probe did not complete reliably.

On Windows, set CLI paths explicitly if Obsidian cannot find global npm commands. MarkTL supports Windows npm shim locations and uses shell execution for Windows CLI shims.

Rich AI artifacts can take several minutes. MarkTL defaults the CLI timeout to 15 minutes and migrates older 5-minute settings upward because Claude Code can exceed 300 seconds on long Korean notes and interactive HTML artifacts.

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

The canonical public URL is:

```text
<GitHub Pages base URL>/<Publish path>/<slug>/
```

MarkTL also publishes the same document at a shorter share URL and copies that shorter URL after export:

```text
<GitHub Pages base URL>/<Publish path>/s/<short-id>/
```

For social sharing, MarkTL injects Open Graph and Twitter card metadata into the exported HTML. The preview title comes from frontmatter `title` or the first H1, the description comes from the opening note text, and the image uses the first bundled local image when available.

MarkTL also maintains a share home page and machine-readable index:

```text
<GitHub Pages base URL>/<Publish path>/
<GitHub Pages base URL>/<Publish path>/index.json
```

Each GitHub Pages publish adds or updates one entry by `<slug>`. Re-exporting the same note updates that entry; publishing a different note adds a new entry. The share home is an archive page with searchable cards, tag filters, excerpts, artifact type labels, source paths, and newest-first ordering.

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

MarkTL은 단순한 "예쁜 Markdown 변환기"가 아닙니다. 목표는 읽기, 의사결정, 리뷰, 비교, 튜닝, 코드 설명, 공개 공유처럼 분명한 역할을 가진 HTML artifact를 만드는 것입니다.

핵심 아이디어는 단순합니다.

> Markdown은 쓰는 곳이고, HTML은 AI가 만든 결과물이 작은 인터랙티브 작업면이 되는 곳입니다.

MarkTL artifact는 다음을 목표로 합니다.

- 긴 Markdown보다 읽기 쉬운 문서
- 섹션, 카드, 표, 목차, 시각적 위계가 있는 문서
- trusted mode에서는 로컬 컨트롤, 상태 저장, AI에게 다시 붙여넣을 수 있는 copy-back prompt가 있는 문서
- AI가 전략 브리프, 리서치 리포트, 의사결정 메모, 인터랙티브 설명서, 슬라이드형 문서로 재구성할 수 있는 문서
- Obsidian 내부에서 바로 미리보기 가능한 문서
- 하나의 정적 HTML 파일로 보관 가능한 문서
- 로컬 링크 또는 정적 호스팅 번들로 공유 준비가 되는 문서

### 주요 기능

- 리본 아이콘 또는 명령 팔레트에서 export 모달을 엽니다.
- 첫 실행 시 setup wizard를 열어 local export, Claude, Codex, share-ready bundle 중 쉽게 선택할 수 있습니다.
- artifact goal, artifact type, 템플릿, AI provider, 변환 모드, preview 보안, 공유 방식을 선택할 수 있습니다.
- 현재 열려 있는 Markdown 노트를 HTML로 변환합니다.
- 기본적으로 vault 안의 `html-exports/` 폴더에 저장합니다.
- 생성된 HTML을 Obsidian 내부 preview pane에서 보여줍니다.
- 진행 모달을 통해 AI 결과인지 local fallback인지 확인할 수 있습니다.
- AI 없이도 local Markdown-to-HTML 변환으로 동작합니다.
- 검증된 AI provider를 지원합니다.
  - Claude Code CLI
  - Codex CLI
- GitHub Pages, S3/R2, Netlify, Vercel 같은 정적 호스팅에 올릴 수 있는 bundle을 만들 수 있습니다.

### Artifact Goal

먼저 HTML이 무엇을 해야 하는지 선택합니다.

- `Readable artifact`: 긴 노트를 읽고 탐색하고 공유하기 쉽게 변환
- `Decision room`: 질문, 선택지, 기준, tradeoff, risk, recommendation, decision log 중심
- `Review room`: 독자가 구조화된 피드백을 남기고 Claude/Codex로 다시 가져갈 수 있는 리뷰 화면
- `Compare options`: 여러 선택지를 나란히 비교하고 scorecard와 tradeoff를 보여주는 화면
- `Prompt playground`: 수정 가능한 컨트롤과 copyable state를 가진 다음 AI iteration용 작업면
- `PR / code explainer`: 코드, diff, 기술 계획, risk, reviewer checklist를 설명하는 화면
- `Public article`: 공유와 SNS preview를 고려한 공개 글 화면

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
- `playground`

`interactive-report`는 trusted mode에서 progress bar, 자동 목차, 섹션 접기/펼치기, `copy as prompt`, `copy as markdown`, `copy summary` 같은 기능을 포함할 수 있습니다.
`playground`는 편집 가능한 working notes, 강조도 slider, `copy prompt`, `copy state JSON`을 제공해서 HTML 파일을 작은 리뷰 인터페이스처럼 사용할 수 있게 합니다.

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
   - `Use Codex`: Codex CLI 설치와 로그인 상태 확인
   - `Prepare sharing`: 정적 호스팅용 bundle 생성
3. MarkTL 리본 아이콘을 클릭하거나 명령 팔레트에서 `Export active note to HTML...`을 실행합니다.
4. `Readable Note`, `Interactive Report`, `Presentation`, `Decision Room`, `Shareable Article`, `Prompt Playground`, `Compare Options`, `PR / Code Explainer` 같은 HTML preset을 선택합니다.
5. Export 모달에서 다음을 조정합니다.
   - Artifact goal
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

HTML을 사용하면 Markdown만으로는 휴대 가능한 artifact로 만들기 어려운 기능을 넣을 수 있습니다. 반응형 레이아웃, 카드형 섹션, 로컬 이미지 bundle, 자동 목차, 접기/펼치기, scorecard, slider, 편집 가능한 리뷰 메모, copy button, 슬라이드형 읽기 흐름, 정적 호스팅 준비 폴더를 만들 수 있습니다.

진짜 kick은 review loop입니다. 독자는 공유된 HTML 링크를 열고, 읽고, 조작하고, 댓글을 남기고, 구조화된 피드백이나 상태를 복사해서 다시 Claude/Codex에 넣을 수 있습니다.

### Context Pack

Export 모달에는 `Context pack` 옵션이 있습니다.

- `Active note only`: 현재 노트만 변환기에 보냅니다.
- `Include linked notes`: wikilink 또는 Markdown link로 연결된 로컬 Markdown 노트를 AI가 참고하도록 합니다. 안전을 위해 개수와 길이를 제한하고 압축합니다.

Context pack은 보조 자료입니다. 현재 열린 노트가 항상 기준이며, 찾을 수 없거나 읽을 수 없는 linked note는 export warning으로 표시됩니다.

### 인터랙티브 컨트롤

`Trusted interactive preview`에서 `interactive-report` 템플릿은 자동 목차, 접기/펼치기, 읽기 progress, 섹션 필터, 전체 펼치기, copy as prompt, copy as markdown, copy summary, copy outline JSON 같은 로컬 전용 컨트롤을 넣을 수 있습니다. `playground` 템플릿은 편집 가능한 리뷰 메모, 강조도 slider, copyable state JSON을 제공합니다. Artifact goal은 AI가 decision room, review room, comparison board, prompt playground, PR explainer처럼 목적이 분명한 HTML 인터페이스를 만들도록 유도합니다.

### Giscus 독자 피드백

MarkTL은 Giscus 기반 `Reader feedback` 섹션을 HTML 하단에 붙일 수 있습니다. 독자는 Giscus 댓글창 안에서 GitHub로 로그인하고, 댓글과 reaction을 GitHub Discussions에 남깁니다.

사용 방법:

1. 피드백을 저장할 GitHub repo에서 Discussions를 활성화합니다.
2. `https://giscus.app`에서 해당 repo의 Giscus 설정을 만듭니다.
3. 생성된 `repo`, `repo-id`, `category`, `category-id` 값을 MarkTL 설정에 입력합니다.
4. `Reader feedback mode`를 `Giscus GitHub comments`로 설정합니다.
5. `Trusted preview/export`로 export합니다.

Giscus는 `https://giscus.app/client.js` 외부 스크립트를 로드하므로 sanitized export에서는 의도적으로 비활성화됩니다.

### Export QA

MarkTL은 HTML을 저장하고 preview하기 전에 기본 QA를 실행합니다. 문서 구조, responsive viewport, inline CSS, trusted mode의 script 유무, sanitized mode의 동적 markup, bundled image 참조 누락, image alt 누락을 warning으로 알려줍니다. 내부 preview는 iframe 로드 후 render QA도 실행해서 거의 빈 화면, H1 누락, 깨진 이미지, 비정상적으로 짧은 렌더, trusted preview인데 컨트롤이 없는 경우를 표시합니다.

### AI Provider

현재 검증된 provider:

- Claude Code CLI
- Codex CLI

Codex는 `codex exec --json --sandbox read-only --skip-git-repo-check -` 형태로 실행되며 생성 prompt를 stdin으로 전달합니다. Obsidian이 명령을 찾지 못하면 설정에 Codex CLI 전체 경로를 입력하세요.
Gemini CLI는 현재 로컬 plugin-style probe가 안정적으로 완료되지 않아 UI에서 제외했습니다.

Windows에서는 Obsidian이 전역 npm 명령을 찾지 못하면 CLI 전체 경로를 직접 입력하세요. MarkTL은 Windows npm shim 경로와 Windows CLI shim 실행 방식을 지원합니다.

풍부한 AI artifact는 몇 분이 걸릴 수 있습니다. MarkTL은 CLI timeout 기본값을 15분으로 두며, 기존 5분 설정은 자동으로 15분으로 올립니다. 긴 한국어 노트와 인터랙티브 HTML artifact에서는 Claude Code가 300초를 넘는 경우가 있기 때문입니다.

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

정식 공개 URL은 아래처럼 만들어집니다.

```text
<GitHub Pages base URL>/<Publish path>/<slug>/
```

MarkTL은 같은 문서를 짧은 공유 URL에도 함께 발행하고, export 후에는 이 짧은 URL을 복사합니다.

```text
<GitHub Pages base URL>/<Publish path>/s/<short-id>/
```

SNS 공유를 위해 exported HTML에는 Open Graph와 Twitter card metadata가 들어갑니다. 미리보기 제목은 frontmatter `title` 또는 첫 H1에서 가져오고, 설명은 노트 앞부분에서 만들며, 이미지는 가능한 경우 첫 번째 bundled local image를 사용합니다.

MarkTL은 공유 홈 페이지와 기계가 읽을 수 있는 index도 함께 관리합니다.

```text
<GitHub Pages base URL>/<Publish path>/
<GitHub Pages base URL>/<Publish path>/index.json
```

GitHub Pages publish를 할 때마다 `<slug>` 기준으로 항목이 추가되거나 갱신됩니다. 같은 노트를 다시 export하면 해당 항목이 최신본으로 바뀌고, 다른 노트를 publish하면 목록에 새 항목이 추가됩니다. 공유 홈은 검색 가능한 카드형 아카이브 페이지이며 태그 필터, 요약, artifact type, 원본 경로, 최신순 정렬을 제공합니다.

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
