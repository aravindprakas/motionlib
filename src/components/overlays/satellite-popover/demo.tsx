// SatellitePopover — leave the trigger *toward* the panel and it stays; veer off and it goes
import { useState } from 'react';
import { SatellitePopover } from './SatellitePopover';

const CARD = (title: string, body: string, tag: string) => (
  <>
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vermilion">{tag}</p>
    <h4 className="mt-1.5 font-display text-sm font-bold uppercase tracking-tight">{title}</h4>
    <p className="mt-2 font-serif text-sm italic leading-snug opacity-80">{body}</p>
    <button
      type="button"
      className="mt-3 border border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
    >
      an actual control
    </button>
  </>
);

export default function SatellitePopoverDemo() {
  const [openCount, setOpenCount] = useState(0);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-6 md:px-10">
      <p className="max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
        move slowly from a trigger to its panel — it holds. wander off the corridor and it closes
        immediately.
      </p>

      <p className="max-w-2xl font-serif text-xl italic leading-relaxed md:text-2xl">
        The panel is reachable: hover{' '}
        <SatellitePopover
          side="top"
          content={CARD(
            'Corridor, not delay',
            'The exit point and the panel’s near edge span a triangle. Inside it, the panel stays up for as long as you take.',
            'mechanism',
          )}
          onOpenChange={(o) => o && setOpenCount((c) => c + 1)}
        >
          <span className="cursor-help border-b border-vermilion text-vermilion">this term</span>
        </SatellitePopover>{' '}
        and take your time crossing the gap, then press the button inside. Dwell on{' '}
        <SatellitePopover
          side="bottom"
          pinAfter={550}
          content={CARD(
            'Dwell pins it',
            'Hold still and the hairline fills; the preview becomes a dialog with focus, Escape and click-outside.',
            'time',
          )}
          onOpenChange={(o) => o && setOpenCount((c) => c + 1)}
        >
          <span className="cursor-help border-b border-vermilion text-vermilion">this one</span>
        </SatellitePopover>{' '}
        instead, and reading it long enough is what keeps it.
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink pt-8">
        {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
          <SatellitePopover
            key={s}
            side={s}
            content={CARD(
              'Prefers ' + s,
              'Falls through the other three sides when it will not fit, then shifts along the cross axis to stay on screen.',
              'placement',
            )}
          >
            <button
              type="button"
              className="border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
            >
              {s}
            </button>
          </SatellitePopover>
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
          opened {openCount}×
        </span>
      </div>

      <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        narrow the window under 600px and every one of these becomes a bottom sheet you can drag
        down to dismiss — same component, no second code path.
      </p>
    </section>
  );
}
