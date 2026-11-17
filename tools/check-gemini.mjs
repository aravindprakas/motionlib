import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const luminance = hex => {
  const channels = hex.replace('#', '').match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
};
const pairs = [
  ['Body text', '#eef3ff', '#111725'],
  ['Secondary text', '#a4b3cc', '#192136'],
  ['Highlighted command', '#eef3ff', '#343960'],
  ['Primary action', '#080b14', '#8aeeed'],
  ['Liquid navigation', '#0a1322', '#a999ef'],
  ['Glass card description', '#d6e3fb', '#61448c'],
];
for (const [name, foreground, background] of pairs) {
  const first = luminance(foreground); const second = luminance(background);
  const contrast = (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
  assert.ok(contrast >= 4.5, `${name} contrast is ${contrast.toFixed(2)}, below 4.5`);
  console.log(`${name}: ${contrast.toFixed(2)}:1`);
}
const index = JSON.parse(readFileSync(resolve(root, 'registry/index.json'), 'utf8'));
const entries = index.components.filter(entry => entry.group === 'gemini');
assert.equal(entries.length, 10, 'Gemini must export all ten components');
for (const entry of entries) {
  const payload = JSON.parse(readFileSync(resolve(root, `registry/${entry.id}.json`), 'utf8'));
  assert.equal(payload.registered, true, `${entry.id} must be wired into the preview`);
  assert.ok(payload.files.length > 0 && payload.demo, `${entry.id} must have a component and demo`);
  assert.ok(payload.lib.some(file => file.path.replaceAll('\\', '/') === 'lib/gemini/aura.css'), `${entry.id} must carry its CSS when copied`);
  assert.ok(payload.demo.lib.some(file => file.path.replaceAll('\\', '/') === 'lib/gemini/AuraDemo.tsx'), `${entry.id} must carry its demo frame when copied`);
}
console.log('10 Gemini exports include their styles, shared hooks and demo frame.');
