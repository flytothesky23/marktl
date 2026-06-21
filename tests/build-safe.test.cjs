const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');

function readRepoFile(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

test('checked-in bundle is generated from source and keeps release markers', () => {
  const outfile = path.join(os.tmpdir(), `marktl-build-safe-${process.pid}-${Date.now()}.js`);
  try {
    esbuild.buildSync({
      entryPoints: [path.join(repoRoot, 'src/main.ts')],
      bundle: true,
      external: ['obsidian'],
      format: 'cjs',
      platform: 'node',
      target: 'es2018',
      outfile,
      logLevel: 'silent',
    });

    const generated = fs.readFileSync(outfile, 'utf8');
    const checkedIn = readRepoFile('main.js');
    assert.equal(checkedIn, generated, 'main.js must match a fresh source build');

    for (const marker of [
      'height:180px',
      'padding:9px 10px 12px',
      'renderShareIndexHtml',
      'Manage published MarkTL HTML',
      'Repair all MarkTL share hub indexes',
      'replacePublishedShareThumbnail',
      'deleteAllPublishedShareItems',
      'shareHomeProfileId',
      'deleteGithubPathRecursive',
      'repairShareIndex',
      'saas-brief',
      'community-blog',
      'data-marktl-share-home',
    ]) {
      assert.match(generated, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    assert.match(generated, /githubShareHomeTitle === "MarkTL Shared HTML"/);
  } finally {
    fs.rmSync(outfile, { force: true });
  }
});

test('source tree owns publish management and archive renderer hooks', () => {
  const mainSource = readRepoFile('src/main.ts');
  const modalSource = readRepoFile('src/published-html-modal.ts');
  const rendererSource = readRepoFile('src/core/github-pages.js');

  assert.match(mainSource, /MarktlPublishedHtmlModal/);
  assert.match(mainSource, /Manage published MarkTL HTML/);
  assert.match(mainSource, /loadPublishedShareIndex/);
  assert.match(mainSource, /repairPublishedShareIndex/);
  assert.match(mainSource, /repairAllPublishedShareIndexes/);
  assert.match(mainSource, /deletePublishedShareItem/);
  assert.match(mainSource, /replacePublishedShareThumbnail/);
  assert.match(mainSource, /getGithubPagesContext\(shareHomeProfileId/);
  assert.match(mainSource, /deleteGithubPathRecursive/);
  assert.match(readRepoFile('src/export-modal.ts'), /openPublishedHtmlManager\(selectedProfile\.id\)/);
  assert.match(mainSource, /githubShareHomeTitle === 'MarkTL Shared HTML'/);
  assert.match(modalSource, /게시된 MarkTL HTML/);
  assert.match(modalSource, /썸네일 교체/);
  assert.match(modalSource, /formatPublishedItemDescription/);
  assert.match(modalSource, /isNoisyPublishedMeta/);
  assert.doesNotMatch(modalSource, /item\.sourcePath \|\|/);
  assert.match(modalSource, /인덱스 메타데이터 복구/);
  assert.match(modalSource, /모든 허브 메인페이지 복구/);
  assert.match(modalSource, /현재 허브 전체 삭제/);
  assert.match(mainSource, /deleteAllPublishedShareItems/);
  assert.match(rendererSource, /function removeShareIndexItems/);
  assert.match(rendererSource, /function repairShareIndex/);
  assert.match(rendererSource, /통합선별공장 Archive/);
  assert.match(rendererSource, /repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(rendererSource, /repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(rendererSource, /minmax\(190px,222px\)/);
  assert.match(rendererSource, /height:180px;min-height:180px/);
  assert.match(rendererSource, /minmax\(142px,44%\) minmax\(0,1fr\);height:96px;min-height:0/);
  assert.doesNotMatch(rendererSource, /object-fit:contain/);
  assert.doesNotMatch(rendererSource, /tile\[data-type="공사일보"]/);
});
