#!/usr/bin/env node
/**
 * arvi-ui — copy components out of Motion lib and into another project.
 *
 *   node tools/arvi-ui.mjs list [filter]
 *   node tools/arvi-ui.mjs add <id...> --dest ../shop/src [--alias @] [--with-demo] [--dry]
 *   node tools/arvi-ui.mjs theme --dest ../shop/src
 *
 * Deliberately a copy-in tool, not a package install: the component lands in
 * the target repo as ordinary source the client project owns and can restyle.
 * The cost of that model is that fixes do not propagate, so `add` refuses to
 * clobber an existing file unless --force is passed — an edited component is
 * assumed to have been edited on purpose.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REG = join(ROOT, 'registry');

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const has = (n) => args.includes(`--${n}`);
const C = { dim: '\x1b[2m', b: '\x1b[1m', y: '\x1b[33m', g: '\x1b[32m', r: '\x1b[31m', x: '\x1b[0m' };

if (!existsSync(join(REG, 'index.json'))) {
  console.error(`${C.r}No registry found. Run: node tools/build-registry.mjs${C.x}`);
  process.exit(1);
}
const index = JSON.parse(readFileSync(join(REG, 'index.json'), 'utf8')).components;

/* ------------------------------------------------------------------ list */
if (cmd === 'list' || !cmd) {
  const filter = (args[1] && !args[1].startsWith('--') ? args[1] : '').toLowerCase();
  let group = '';
  let n = 0;
  for (const c of index) {
    const hay = `${c.id} ${c.name} ${c.group} ${c.tags.join(' ')} ${c.description}`.toLowerCase();
    if (filter && !hay.includes(filter)) continue;
    if (c.group !== group) {
      group = c.group;
      console.log(`\n${C.b}${group}${C.x}`);
    }
    console.log(`  ${c.id.padEnd(32)}${C.dim}${c.description.slice(0, 68)}${C.x}`);
    n++;
  }
  console.log(`\n${n} component${n === 1 ? '' : 's'}${filter ? ` matching "${filter}"` : ''}`);
  process.exit(0);
}

/* ----------------------------------------------------------------- theme */
if (cmd === 'theme') {
  const dest = flag('dest');
  if (!dest) {
    console.error(`${C.r}--dest is required${C.x}`);
    process.exit(1);
  }
  const css = readFileSync(join(REG, 'arvi-theme.css'), 'utf8');
  const target = join(dest, 'arvi-theme.css');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, css);
  console.log(`${C.g}wrote${C.x} ${target}`);
  console.log(`\nImport it after Tailwind in your entry stylesheet:\n  ${C.dim}@import "tailwindcss";\n  @import "./arvi-theme.css";${C.x}`);
  process.exit(0);
}

/* ------------------------------------------------------------------- add */
if (cmd !== 'add') {
  console.error(`Unknown command "${cmd}". Try: list | add | theme`);
  process.exit(1);
}

const dest = flag('dest');
const alias = flag('alias', '@');
const dry = has('dry');
const force = has('force');
const withDemo = has('with-demo');
const wanted = args.slice(1).filter((a) => !a.startsWith('--') && a !== dest && a !== alias);

if (!dest || wanted.length === 0) {
  console.error(`${C.r}Usage: arvi-ui add <id...> --dest <dir> [--alias @] [--with-demo] [--dry] [--force]${C.x}`);
  process.exit(1);
}

/** Rewrite the source alias to whatever the target project uses. */
const rewrite = (code) => (alias === '@' ? code : code.replace(/(['"])@\//g, `$1${alias}/`));

const write = (path, content) => {
  const existed = existsSync(path);
  if (existed && !force) {
    console.log(`  ${C.y}skip ${C.x} ${path} ${C.dim}(exists — pass --force to overwrite)${C.x}`);
    return false;
  }
  if (!dry) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  console.log(`  ${existed ? `${C.y}over ` : `${C.g}write`}${C.x} ${path}`);
  return true;
};

const npm = new Set();
const tokens = new Set();
const keyframes = new Set();
const assets = new Set();
const libWritten = new Set();
let missing = 0;

for (const id of wanted) {
  const file = join(REG, `${id}.json`);
  if (!existsSync(file)) {
    // Match in both directions so typos with an extra character still suggest.
    const near = index
      .filter((c) => c.id.includes(id) || id.includes(c.id) || c.id.slice(0, 5) === id.slice(0, 5))
      .slice(0, 4)
      .map((c) => c.id);
    console.log(`${C.r}?${C.x} "${id}" not in registry${near.length ? ` — did you mean: ${near.join(', ')}` : ''}`);
    missing++;
    continue;
  }
  const c = JSON.parse(readFileSync(file, 'utf8'));
  console.log(`\n${C.b}${c.name}${C.x} ${C.dim}${c.group}/${c.id}${C.x}`);

  for (const f of c.files) write(join(dest, 'components', c.group, c.id, f.name), rewrite(f.content));

  // Shared lib modules land once, no matter how many components need them.
  for (const l of c.lib) {
    if (libWritten.has(l.path)) continue;
    libWritten.add(l.path);
    write(join(dest, l.path), rewrite(l.content));
  }

  if (withDemo && c.demo) {
    write(join(dest, 'components', c.group, c.id, c.demo.name), rewrite(c.demo.content));
    c.demo.assets.forEach((a) => assets.add(a));
    for (const l of c.demo.lib ?? []) {
      if (libWritten.has(l.path)) continue;
      libWritten.add(l.path);
      write(join(dest, l.path), rewrite(l.content));
    }
    (c.demo.dependencies ?? []).forEach((d) => npm.add(d));
  }

  c.dependencies.forEach((d) => npm.add(d));
  c.tokens.forEach((t) => tokens.add(t));
  c.keyframes.forEach((k) => keyframes.add(k));
}

console.log('');
if (npm.size) {
  console.log(`${C.b}Install${C.x}\n  npm i ${[...npm].join(' ')}`);
}
if (tokens.size) {
  console.log(`\n${C.b}Tailwind tokens required${C.x}\n  ${[...tokens].join(', ')}`);
  console.log(`  ${C.dim}run: node tools/arvi-ui.mjs theme --dest ${dest}${C.x}`);
}
if (keyframes.size) {
  console.log(`\n${C.b}Named keyframes required${C.x}\n  ${[...keyframes].join(', ')} ${C.dim}(included in arvi-theme.css)${C.x}`);
}
if (assets.size) {
  console.log(`\n${C.y}Demo assets not copied${C.x}\n  ${[...assets].join('\n  ')}`);
}
if (alias !== '@') console.log(`\n${C.dim}Imports rewritten from @/ to ${alias}/${C.x}`);
if (dry) console.log(`\n${C.y}Dry run — nothing was written.${C.x}`);
process.exit(missing ? 1 : 0);
