// Rewind — edit the board, then drag the rail back through what you did
import { useRef, useState } from 'react';
import { TimeScrubber, useFlipGroup, useRewind } from './Rewind';

interface Chip {
  id: string;
  label: string;
}

const POOL = ['linen', 'poplin', 'twill', 'oxford', 'seersucker', 'chambray', 'gauze', 'canvas', 'flannel'];

let seq = 0;
const make = (label: string): Chip => ({ id: `${label}-${seq++}`, label });

export default function RewindDemo() {
  const [chips, setChips] = useState<Chip[]>(() => POOL.slice(0, 5).map(make));
  const board = useRef<HTMLDivElement>(null);

  const history = useRewind(chips, { limit: 40 });
  // Re-flow whenever the rendered frame changes — live edit or scrub, same path.
  useFlipGroup(board, history.display);

  const add = () => setChips((c) => [...c, make(POOL[Math.floor(Math.random() * POOL.length)])]);
  const remove = () => setChips((c) => (c.length ? c.filter((_, i) => i !== Math.floor(Math.random() * c.length)) : c));
  const shuffle = () =>
    setChips((c) => {
      const next = [...c];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          add, drop, shuffle — then drag the rail backwards
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          {history.frames.length} frames kept
        </span>
      </div>

      <div
        ref={board}
        className="flex min-h-[13rem] flex-wrap content-start gap-2 border border-ink p-4"
        style={{ opacity: history.scrubbing ? 0.72 : 1, transition: 'opacity 200ms linear' }}
      >
        {history.display.map((c) => (
          <span
            key={c.id}
            data-flip-id={c.id}
            className="border border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            {c.label}
          </span>
        ))}
      </div>

      <TimeScrubber api={history} label={(f, i) => `frame ${i + 1} · ${f.length} chips`} />

      <div className="flex flex-wrap items-center gap-3 border-t border-ink pt-8">
        {[
          { label: 'add', fn: add },
          { label: 'drop one', fn: remove },
          { label: 'shuffle', fn: shuffle },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.fn}
            disabled={history.scrubbing}
            className="cursor-pointer border border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-30"
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setChips(history.pick());
            history.release();
          }}
          disabled={!history.scrubbing}
          className="cursor-pointer border border-vermilion bg-vermilion px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone disabled:cursor-not-allowed disabled:opacity-30"
        >
          keep this frame
        </button>
        <button
          type="button"
          onClick={history.release}
          disabled={!history.scrubbing}
          className="cursor-pointer border border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-30"
        >
          back to live
        </button>
      </div>

      <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        the chips travel to their old positions instead of cutting there — same FLIP path for a live edit and for a
        scrub, so history looks like the thing it is replaying
      </p>
    </section>
  );
}
