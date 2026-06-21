const { escapeHtml } = require('./html.js');

const templates = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean readable document styling for faithful note exports.',
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
    `,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-like layout for polished long-form notes.',
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
    `,
  },
  {
    id: 'deck',
    name: 'Deck',
    description: 'Slide-like sections for presentation-style reading.',
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
    `,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Dense report dashboard with KPI-like sections and scan-friendly cards.',
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
    `,
  },
  {
    id: 'investor-brief',
    name: 'Investor Brief',
    description: 'Sharp memo style for strategy, market, and investment analysis.',
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
    `,
  },
  {
    id: 'research-memo',
    name: 'Research Memo',
    description: 'Academic memo styling for long-form reasoning and source-heavy notes.',
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
    `,
  },
  {
    id: 'interactive-report',
    name: 'Interactive Report',
    description: 'Self-contained report with progress, generated TOC, and collapsible sections in trusted mode.',
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
    `,
  },
  {
    id: 'saas-brief',
    name: 'SaaS Brief',
    description: 'Modern product-report surface with design tokens, strong hero, summary cards, and dense scan-friendly sections.',
    css: `
      :root { color-scheme: light; --bg:#f4f7fb; --surface:#ffffff; --surface-2:#eef6ff; --text:#0f172a; --muted:#56657a; --line:#d9e2ef; --accent:#0ea5e9; --accent-2:#22c55e; --warn:#f97316; --radius:8px; }
      body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--text); background: radial-gradient(circle at 8% 0%, #e0f2fe, transparent 30%), var(--bg); }
      main { max-width: 1180px; margin: 0 auto; padding: 34px 22px 72px; }
      article { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
      article > * { grid-column: 1 / -1; background: color-mix(in srgb, var(--surface) 94%, transparent); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px 22px; box-shadow: 0 12px 34px rgba(15, 23, 42, .06); }
      h1 { font-size: clamp(2.2rem, 6vw, 5.4rem); line-height: 1; margin: 0; border-top: 5px solid var(--accent); }
      h2 { font-size: clamp(1.45rem, 3vw, 2.4rem); color: #075985; }
      h3 { color: #164e63; }
      p, li { line-height: 1.65; color: var(--muted); }
      strong { color: var(--text); }
      table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
      th, td { border-bottom: 1px solid var(--line); padding: 11px 12px; text-align: left; vertical-align: top; }
      th { background: #0f172a; color: #f8fafc; }
      img { max-width: 100%; height: auto; border-radius: var(--radius); display: block; }
      pre { overflow: auto; background: #0f172a; color: #f8fafc; border-radius: var(--radius); padding: 16px; }
      blockquote, .callout { border-left: 5px solid var(--accent); background: var(--surface-2); border-radius: var(--radius); padding: 14px 18px; }
      @media (min-width: 860px) { article > h2 + p, article > h2 + ul, article > h2 + ol, article > h2 + table { grid-column: span 6; } }
      @media (max-width: 760px) { main { padding: 18px 12px 56px; } article > * { padding: 18px; } table { display: block; overflow-x: auto; } }
    `,
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Restrained research-paper layout for source-heavy technical notes and thesis-driven writing.',
    css: `
      :root { --bg:#f7f7f4; --paper:#fffefb; --text:#111827; --muted:#4b5563; --line:#d6d3cc; --accent:#374151; }
      body { margin: 0; font-family: "Source Serif 4", Georgia, "Times New Roman", serif; color: var(--text); background: var(--bg); }
      main { max-width: 940px; margin: 0 auto; padding: 58px 28px 86px; }
      article { background: var(--paper); border: 1px solid var(--line); padding: clamp(28px, 5vw, 58px); }
      h1 { font-size: clamp(2.2rem, 6vw, 4.8rem); line-height: 1.04; margin-top: 0; }
      h2 { margin-top: 44px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--accent); }
      p, li { font-size: 18px; line-height: 1.78; color: var(--muted); }
      blockquote, .callout { border-left: 4px solid var(--accent); background: #f1f5f9; padding: 14px 18px; }
      table { width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; background: white; }
      th, td { border: 1px solid var(--line); padding: 10px; }
      pre { overflow: auto; background: #111827; color: #f8fafc; padding: 16px; border-radius: 8px; }
      img { max-width: 100%; height: auto; display: block; margin: 22px auto; }
    `,
  },
  {
    id: 'newspaper',
    name: 'Newspaper',
    description: 'Newsletter/newspaper layout with headline hierarchy, decks, sidebars, and article rhythm.',
    css: `
      :root { --ink:#171717; --muted:#525252; --paper:#fffaf0; --line:#d7c7a5; --accent:#b45309; }
      body { margin: 0; background: #ede5d4; color: var(--ink); font-family: Georgia, "Times New Roman", serif; }
      main { max-width: 1180px; margin: 0 auto; padding: 32px 18px 72px; }
      article { background: var(--paper); border: 1px solid var(--line); padding: clamp(24px, 4vw, 48px); column-gap: 32px; }
      h1 { font-size: clamp(2.4rem, 7vw, 6rem); line-height: .96; margin: 0 0 18px; border-bottom: 4px double var(--ink); padding-bottom: 16px; }
      h2 { break-after: avoid; margin-top: 36px; color: var(--accent); font-size: 1.8rem; }
      h3 { font-family: ui-sans-serif, system-ui, sans-serif; text-transform: uppercase; font-size: .85rem; letter-spacing: .12em; }
      p, li { font-size: 18px; line-height: 1.72; color: var(--muted); }
      blockquote, .callout { border: 1px solid var(--line); background: #fff4d6; padding: 16px; font-size: 1.15rem; }
      table { width: 100%; border-collapse: collapse; background: #fff; font-family: ui-sans-serif, system-ui, sans-serif; }
      th, td { border-bottom: 1px solid var(--line); padding: 10px; text-align: left; }
      img { max-width: 100%; height: auto; display: block; margin: 22px auto; filter: saturate(.92); }
      pre { overflow: auto; background: #1c1917; color: #fff7ed; padding: 16px; }
      @media (min-width: 980px) { article { column-count: 2; } h1, h2, h3, table, pre, img, blockquote, .callout { column-span: all; } }
    `,
  },
  {
    id: 'social-feed',
    name: 'Social Feed',
    description: 'Compact feed-style layout for short updates, reusable snippets, and tag-driven summaries.',
    css: `
      :root { --bg:#f8fafc; --surface:#ffffff; --text:#111827; --muted:#64748b; --line:#e2e8f0; --accent:#7c3aed; --accent-2:#06b6d4; }
      body { margin: 0; background: linear-gradient(180deg, #eef2ff, var(--bg)); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { max-width: 860px; margin: 0 auto; padding: 28px 16px 70px; }
      article { display: grid; gap: 14px; }
      article > * { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 16px 18px; box-shadow: 0 10px 28px rgba(15, 23, 42, .05); }
      h1 { font-size: clamp(2rem, 7vw, 4.6rem); line-height: 1; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; }
      h2 { font-size: 1.25rem; color: var(--accent); }
      p, li { line-height: 1.55; color: var(--muted); }
      ul, ol { padding-left: 26px; }
      blockquote, .callout { border: 1px solid #ddd6fe; background: #f5f3ff; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border-bottom: 1px solid var(--line); padding: 8px; }
      img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
      pre { overflow: auto; background: #111827; color: #f8fafc; border-radius: 8px; padding: 14px; }
    `,
  },
  {
    id: 'community-blog',
    name: 'Community Blog',
    description: 'Readable community post layout for lessons, examples, comments, and follow-up questions.',
    css: `
      :root { --bg:#f4f8f7; --surface:#ffffff; --text:#10201b; --muted:#52645f; --line:#d8e5e1; --accent:#0f766e; --accent-2:#f59e0b; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { max-width: 980px; margin: 0 auto; padding: 36px 18px 76px; }
      article { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: clamp(22px, 4vw, 44px); }
      h1 { font-size: clamp(2.2rem, 7vw, 5rem); line-height: 1.02; margin-top: 0; }
      h2 { margin-top: 40px; color: var(--accent); }
      h3 { color: #134e4a; }
      p, li { font-size: 17px; line-height: 1.7; color: var(--muted); }
      blockquote, .callout { border-left: 5px solid var(--accent-2); background: #fffbeb; border-radius: 8px; padding: 14px 18px; }
      table { width: 100%; border-collapse: collapse; background: #fbfefd; }
      th, td { border-bottom: 1px solid var(--line); padding: 10px; text-align: left; }
      img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 20px auto; }
      pre { overflow: auto; background: #10201b; color: #ecfdf5; border-radius: 8px; padding: 16px; }
    `,
  },
  {
    id: 'playground',
    name: 'Playground',
    description: 'Purpose-built working surface with editable notes, sliders, and copyable state.',
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
    `,
  },
];

function listTemplates() {
  return templates.map(({ id, name, description }) => ({ id, name, description }));
}

function getTemplate(id) {
  return templates.find((template) => template.id === id) || templates[0];
}

function wrapWithTemplate(bodyHtml, options = {}) {
  const template = getTemplate(options.template);
  const title = options.title || 'Exported note';
  const script = options.trusted && template.script ? `<script>${template.script}</script>` : '';
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

module.exports = {
  getTemplate,
  listTemplates,
  wrapWithTemplate,
};
