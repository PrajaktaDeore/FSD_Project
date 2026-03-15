import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const RESOLVE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json'];

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function extractSpecifiers(code) {
  const specifiers = [];
  const patterns = [
    /\bimport\s+[^;]*?\s+from\s+['"]([^'"]+)['"]/g,
    /\bexport\s+[^;]*?\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code))) specifiers.push(match[1]);
  }
  return specifiers;
}

function resolveImport(fromFile, spec) {
  const fromDir = path.dirname(fromFile);
  const raw = path.resolve(fromDir, spec);

  const candidates = [];
  const ext = path.extname(raw);
  if (ext) {
    candidates.push(raw);
  } else {
    candidates.push(raw);
    for (const e of RESOLVE_EXTENSIONS) candidates.push(raw + e);
    for (const e of RESOLVE_EXTENSIONS) candidates.push(path.join(raw, 'index' + e));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function getActualChildName(parentDir, desiredName) {
  const entries = fs.readdirSync(parentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === desiredName) return desiredName;
  }
  for (const entry of entries) {
    if (entry.name.toLowerCase() === desiredName.toLowerCase()) return entry.name;
  }
  return null;
}

function checkPathCasing(absolutePath) {
  const normalized = path.normalize(absolutePath);
  const parts = normalized.split(path.sep);

  // Windows drive root like C:
  let cursor = parts[0].endsWith(':') ? parts[0] + path.sep : path.sep;
  let startIndex = parts[0].endsWith(':') ? 1 : 1;

  for (let i = startIndex; i < parts.length; i++) {
    const segment = parts[i];
    if (!segment) continue;
    const parent = cursor;
    const actual = getActualChildName(parent, segment);
    if (!actual) return { ok: false, at: parent, expected: segment, actual: null };
    if (actual !== segment) return { ok: false, at: parent, expected: segment, actual };
    cursor = path.join(parent, actual);
  }
  return { ok: true };
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

const files = fs.existsSync(srcRoot) ? listFiles(srcRoot) : [];
const problems = [];

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const specs = extractSpecifiers(code).filter((s) => s.startsWith('.'));

  for (const spec of specs) {
    const resolved = resolveImport(file, spec);
    if (!resolved) {
      problems.push({
        type: 'unresolved',
        file,
        spec,
      });
      continue;
    }

    const casing = checkPathCasing(resolved);
    if (!casing.ok) {
      problems.push({
        type: 'casing',
        file,
        spec,
        resolved,
        ...casing,
      });
    }
  }
}

if (problems.length) {
  console.error(`Import casing check failed (${problems.length} issue(s)):\n`);
  for (const p of problems) {
    if (p.type === 'unresolved') {
      console.error(`- Unresolved: ${toPosix(path.relative(projectRoot, p.file))} -> "${p.spec}"`);
      continue;
    }
    console.error(
      `- Casing: ${toPosix(path.relative(projectRoot, p.file))} -> "${p.spec}"\n` +
        `  resolved: ${toPosix(path.relative(projectRoot, p.resolved))}\n` +
        `  at:       ${toPosix(path.relative(projectRoot, p.at || projectRoot) || '.')}\n` +
        `  expected: ${p.expected}\n` +
        `  actual:   ${p.actual}`
    );
  }
  console.error('\nFix import path casing to match the filesystem (Linux is case-sensitive).');
  process.exit(1);
}

console.log('Import casing check passed.');

