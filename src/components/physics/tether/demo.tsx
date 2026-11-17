// Tether — drag the plug; the cables carry on swinging after you let go
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { TetherField, anchor, type TetherLink } from './Tether';

// Kept outside the component: a new array identity would reseed the ropes.
const LINKS: TetherLink[] = [
  // A little slack goes a long way: sag runs to roughly a quarter of the span.
  { from: 'plug', to: 'jack-a', slack: 0.22, width: 3 },
  { from: 'plug', to: 'jack-b', slack: 0.12, width: 3 },
  { from: 'jack-b', to: 'jack-c', slack: 0.18, width: 2 },
];

export default function TetherDemo() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: pos.x, y: pos.y, px: e.clientX, py: e.clientY };
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setPos({
      x: start.current.x + (e.clientX - start.current.px),
      y: start.current.y + (e.clientY - start.current.py),
    });
  };

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        drag the plug — sweep the pointer through a cable to shoulder it aside
      </p>

      <TetherField
        links={LINKS}
        gravity={1700}
        pointerRadius={110}
        className="h-[62vh] border border-ink text-vermilion"
      >
        {/* Three fixed jacks along the top. */}
        <div className="flex justify-between px-16 pt-12">
          {[
            { id: 'jack-a', label: 'send' },
            { id: 'jack-b', label: 'return' },
            { id: 'jack-c', label: 'thru' },
          ].map((j) => (
            <div key={j.id} {...anchor(j.id)} className="grid h-14 w-14 place-items-center border border-ink bg-bone">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink">{j.label}</span>
            </div>
          ))}
        </div>

        {/* The draggable end. */}
        <button
          type="button"
          {...anchor('plug')}
          onPointerDown={onDown}
          onPointerMove={onMove}
          className="absolute left-1/2 top-[58%] cursor-grab touch-none border border-ink bg-ink px-6 py-4 text-bone active:cursor-grabbing"
          style={{ transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">drag me</span>
        </button>
      </TetherField>

      <p className="max-w-2xl border-t border-ink pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        verlet chain pinned to two rects — sag, whip, taut and overshoot are all the solver, none of them keyframed
      </p>
    </section>
  );
}
