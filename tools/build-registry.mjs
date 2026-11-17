#!/usr/bin/env node
/**
 * Builds the Arvi UI registry.
 *
 * Walks src/components/<group>/<id>/ and, for each component, records the files
 * it is made of plus everything it needs to survive being copied into a
 * different codebase: npm packages, internal @/lib modules (resolved
 * transitively), the Tailwind colour tokens it references and any named
 * keyframes it animates.
 *
 * The point of resolving all of that here rather than in the CLI is that this
 * runs inside the repo where the answers are knowable. The CLI then only has to
 * copy files and rewrite one import alias.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const COMPONENTS = join(SRC, 'components');
const OUT = join(ROOT, 'registry');

const TOKENS = [
  'ink', 'bone', 'paper', 'accent', 'vermilion', 'navy', 'cream',
  'coral', 'moss', 'gold', 'violet', 'background', 'foreground',
];
const TOKEN_RE = new RegExp(
  `\\b(?:bg|text|border|stroke|fill|decoration|divide|outline|accent|from|via|to|ring|shadow)-(${TOKENS.join('|')})\\b`,
  'g',
);
const NAMED_ANIM_RE = /animate-\[?([a-z][a-z0-9-]*)/g;
const BUILT_IN_ANIM = new Set(['none', 'spin', 'ping', 'pulse', 'bounce']);
const IMPORT_RE = /(?:from\s+|import\s*)['"]([^'"]+)['"]/g;

const read = (p) => readFileSync(p, 'utf8');
const dirs = (p) => readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

/** Resolve an `@/lib/x` specifier to a real file on disk. */
function resolveInternal(spec) {
  const rel = spec.replace(/^@\//, '');
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const p = join(SRC, rel + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

function scan(content) {
  const npm = new Set();
  const internal = new Set();
  const assets = new Set();
  const local = new Set();
  for (const m of content.matchAll(IMPORT_RE)) {
    const s = m[1];
    if (s.startsWith('@/assets/')) assets.add(s);
    else if (s.startsWith('@/')) internal.add(s);
    else if (s.startsWith('.')) local.add(s);
    else if (s === 'react' || s === 'react-dom' || s.startsWith('react/')) continue;
    else npm.add(s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0]);
  }
  return { npm, internal, assets, local };
}

/** Walk @/lib dependencies transitively — SmoothScroll pulls gsap and lenis. */
function collectLib(specs, seen = new Map(), npm = new Set()) {
  for (const spec of specs) {
    if (seen.has(spec)) continue;
    const file = resolveInternal(spec);
    if (!file) {
      seen.set(spec, null);
      continue;
    }
    const content = read(file);
    seen.set(spec, { path: file.slice(SRC.length + 1), content });
    const found = scan(content);
    found.npm.forEach((n) => npm.add(n));
    collectLib(found.internal, seen, npm);
  }
  return { seen, npm };
}

function meta(content) {
  const tokens = new Set();
  for (const m of content.matchAll(TOKEN_RE)) tokens.add(m[1]);
  const keyframes = new Set();
  for (const m of content.matchAll(NAMED_ANIM_RE)) {
    if (!BUILT_IN_ANIM.has(m[1])) keyframes.add(m[1]);
  }
  return { tokens: [...tokens].sort(), keyframes: [...keyframes].sort() };
}

/** Pull name / description / tags out of registry.ts so the CLI can list them. */
function registryMeta() {
  const src = read(join(SRC, 'lib', 'registry.ts'));
  const out = {};
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']*)',\s*tags:\s*\[([^\]]*)\]/g;
  for (const m of src.matchAll(re)) {
    out[m[1]] = {
      name: m[2],
      description: m[3],
      tags: m[4].split(',').map((t) => t.trim().replace(/^'|'$/g, '')).filter(Boolean),
    };
  }
  return out;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const listed = registryMeta();
const index = [];
const seenIds = new Map();

for (const group of dirs(COMPONENTS)) {
  for (const id of dirs(join(COMPONENTS, group))) {
    const dir = join(COMPONENTS, group, id);
    const files = readdirSync(dir).filter((f) => /\.(tsx|ts)$/.test(f));
    if (files.length === 0) continue;

    if (seenIds.has(id)) {
      console.warn(`  ! duplicate id "${id}" (${seenIds.get(id)} and ${group}) — skipping second`);
      continue;
    }
    seenIds.set(id, group);

    const npm = new Set();
    const internal = new Set();
    const tokens = new Set();
    const keyframes = new Set();
    const payload = [];
    let demo = null;

    for (const f of files) {
      const content = read(join(dir, f));
      const found = scan(content);
      found.npm.forEach((n) => npm.add(n));
      const m = meta(content);

      if (f === 'demo.tsx') {
        // The demo is opt-in; its deps are tracked separately so a plain
        // `add` never drags in demo-only assets.
        const demoLib = collectLib(found.internal);
        demo = { name: f, content, assets: [...found.assets], lib: [...demoLib.seen.values()].filter(Boolean), dependencies: [...new Set([...found.npm, ...demoLib.npm])].sort() };
        continue;
      }
      found.internal.forEach((s) => internal.add(s));
      m.tokens.forEach((t) => tokens.add(t));
      m.keyframes.forEach((k) => keyframes.add(k));
      payload.push({ name: f, content });
    }

    const lib = collectLib(internal, new Map(), npm);
    const libFiles = [...lib.seen.values()].filter(Boolean);
    lib.npm.forEach((n) => npm.add(n));
    for (const lf of libFiles) {
      const m = meta(lf.content);
      m.tokens.forEach((t) => tokens.add(t));
      m.keyframes.forEach((k) => keyframes.add(k));
    }

    const entry = {
      id,
      group,
      ...(listed[id] ?? { name: basename(id), description: '', tags: [] }),
      dependencies: [...npm].sort(),
      files: payload,
      lib: libFiles,
      tokens: [...tokens].sort(),
      keyframes: [...keyframes].sort(),
      demo,
      registered: Boolean(listed[id]),
    };

    writeFileSync(join(OUT, `${id}.json`), JSON.stringify(entry, null, 2));
    index.push({
      id,
      group,
      name: entry.name,
      description: entry.description,
      tags: entry.tags,
      dependencies: entry.dependencies,
      tokens: entry.tokens,
      keyframes: entry.keyframes,
      registered: entry.registered,
    });
  }
}

index.sort((a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id));
writeFileSync(join(OUT, 'index.json'), JSON.stringify({ version: 1, components: index }, null, 2));

const unregistered = index.filter((c) => !c.registered).length;
console.log(`registry: ${index.length} components across ${new Set(index.map((c) => c.group)).size} groups`);
if (unregistered) console.log(`  (${unregistered} exist on disk but are not wired into registry.ts)`);
