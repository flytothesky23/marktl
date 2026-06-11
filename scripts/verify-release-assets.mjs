import fs from 'node:fs';

const requiredFiles = ['main.js', 'manifest.json', 'styles.css', 'versions.json'];
let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    fail(`${file} is missing`);
    continue;
  }
  const size = fs.statSync(file).size;
  if (size <= 0) {
    fail(`${file} is empty`);
  } else {
    pass(`${file} exists (${size} bytes)`);
  }
}

let manifest;
let pkg;
let versions;

try {
  manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  pass('manifest.json parses');
} catch (error) {
  fail(`manifest.json is invalid JSON: ${error.message}`);
}

try {
  pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pass('package.json parses');
} catch (error) {
  fail(`package.json is invalid JSON: ${error.message}`);
}

try {
  versions = JSON.parse(fs.readFileSync('versions.json', 'utf8'));
  pass('versions.json parses');
} catch (error) {
  fail(`versions.json is invalid JSON: ${error.message}`);
}

if (manifest && pkg) {
  if (manifest.version !== pkg.version) {
    fail(`manifest version ${manifest.version} does not match package version ${pkg.version}`);
  } else {
    pass(`manifest/package version match ${manifest.version}`);
  }
}

if (manifest && versions) {
  if (!versions[manifest.version]) {
    fail(`versions.json does not contain manifest version ${manifest.version}`);
  } else {
    pass(`versions.json contains ${manifest.version}`);
  }
}

if (manifest) {
  if (manifest.id !== 'marktl') {
    fail(`manifest id must stay marktl, got ${manifest.id}`);
  } else {
    pass('manifest id stays marktl');
  }
  if (manifest.name !== 'Flytothesky MarkTL HTML Exporter') {
    fail(`manifest name is unexpected: ${manifest.name}`);
  } else {
    pass('manifest name is Flytothesky MarkTL HTML Exporter');
  }
}

if (fs.existsSync('data.json')) {
  fail('data.json must not be committed or released');
}

if (failed) {
  process.exit(1);
}
