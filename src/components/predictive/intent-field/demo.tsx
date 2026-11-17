// IntentField — move fast at a tile and watch it commit before you arrive
import { useRef, useState } from 'react';
import { IntentField } from './IntentField';

const TILES = [
  'archive',
  'studio',
  'index',
  'stockists',
  'journal',
  'contact',
  'lookbook',
  'sizing',
  'returns',
];

export default function IntentFieldDemo() {
  const [predicted, setPredicted] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const warmed = useRef<Set<string>>(new Set());
  const [warmCount, setWarmCount] = useState(0);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          sweep at a tile — it leans in before the cursor lands
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">
          heading for:{' '}
          <span className="text-vermilion">{predicted ?? '—'}</span>
          <span className="ml-3 tabular-nums opacity-60">{confidence.toFixed(2)}</span>
        </p>
      </div>

      <IntentField
        debug
        lookahead={0.5}
        className="grid grid-cols-3 gap-3 border border-ink p-3 text-vermilion"
        onPredict={(id, c) => {
          setPredicted(id);
          setConfidence(c);
          if (id && !warmed.current.has(id)) {
            // Where a real app would prefetch the route or decode the image.
            warmed.current.add(id);
            setWarmCount(warmed.current.size);
          }
        }}
      >
        {TILES.map((t) => (
          <button
            key={t}
            type="button"
            data-intent={t}
            className="group h-28 border border-ink bg-bone text-ink"
            style={{
              transform:
                'translate(calc(var(--intent-x, 0) * var(--intent, 0) * 7px), calc(var(--intent-y, 0) * var(--intent, 0) * 7px))',
              backgroundColor:
                'color-mix(in srgb, var(--color-vermilion) calc(var(--intent, 0) * 14%), var(--color-bone))',
              boxShadow: 'inset 0 0 0 calc(var(--intent, 0) * 2px) var(--color-vermilion)',
              transition: 'transform 120ms linear',
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{t}</span>
            <span
              className="mx-auto mt-3 block h-px bg-vermilion"
              style={{ width: 'calc(12% + var(--intent, 0) * 60%)' }}
            />
          </button>
        ))}
      </IntentField>

      <p className="max-w-2xl border-t border-ink pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        {warmCount} tiles warmed ahead of contact · the dashed ray is the projected trajectory the score is computed
        against — park the cursor and every score decays to zero
      </p>
    </section>
  );
}
