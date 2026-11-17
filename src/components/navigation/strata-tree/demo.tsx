// StrataTree — 4,000 nodes, ~20 in the DOM; expand everything and it stays quiet
import { useMemo, useState } from 'react';
import { StrataTree, type TreeNode } from './StrataTree';

const AREAS = ['platform', 'commerce', 'identity', 'editorial', 'analytics', 'infra'];
const PARTS = ['core', 'adapters', 'schema', 'runtime', 'workers', 'fixtures', 'contracts', 'gateway'];
const LEAVES = ['index.ts', 'client.ts', 'types.ts', 'guards.ts', 'cache.ts', 'stream.ts', 'errors.ts'];

/** Deterministic so the demo never reshuffles between renders. */
function build(): TreeNode[] {
  return AREAS.map((area, a) => ({
    id: 'a' + a,
    label: area,
    meta: 'package',
    children: PARTS.map((part, p) => ({
      id: 'a' + a + 'p' + p,
      label: part,
      meta: 'module',
      children: Array.from({ length: 7 + ((a + p) % 5) }, (_, m) => ({
        id: 'a' + a + 'p' + p + 'm' + m,
        label: part + '-' + String(m + 1).padStart(2, '0'),
        children: LEAVES.slice(0, 4 + ((a + p + m) % 4)).map((leaf, l) => ({
          id: 'a' + a + 'p' + p + 'm' + m + 'l' + l,
          label: leaf,
          meta: 1 + ((a * 7 + p * 5 + m * 3 + l) % 40) + ' kb',
        })),
      })),
    })),
  }));
}

export default function StrataTreeDemo() {
  const nodes = useMemo(build, []);
  const total = useMemo(() => {
    let n = 0;
    const walk = (list: TreeNode[]) => {
      for (const x of list) {
        n++;
        if (x.children) walk(x.children);
      }
    };
    walk(nodes);
    return n;
  }, [nodes]);

  const [path, setPath] = useState<string>('—');

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-6 md:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em]">
          {total.toLocaleString()} nodes · scroll deep and the ancestors stay stacked at the top
        </p>
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion">
          {path}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <StrataTree
          nodes={nodes}
          defaultOpen={['a0', 'a0p0', 'a0p0m0']}
          height="min(60vh, 30rem)"
          onSelect={(node, p) => setPath([...p, node].map((n) => n.label).join(' / '))}
        />

        {/* Same component, a third of the width: indent budget and meta adapt. */}
        <StrataTree
          nodes={nodes}
          defaultOpen={['a1', 'a1p2']}
          height="min(60vh, 30rem)"
          onSelect={(node, p) => setPath([...p, node].map((n) => n.label).join(' / '))}
          className="hidden lg:block"
        />
      </div>

      <p className="max-w-2xl border-t border-ink pt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        the row count in the header is the whole open tree; the second number is how many elements
        actually exist. the vermilion hairline on a closed row is sized to the number of descendants
        it is hiding — weight you can read without opening it.
      </p>
    </section>
  );
}
