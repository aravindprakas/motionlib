// Deform — the same wrapper, three unrelated sources of movement
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Deform } from './Deform';

const SLOTS = ['one', 'two', 'three', 'four'];

export default function DeformDemo() {
  const [slot, setSlot] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: drag.x, y: drag.y, px: e.clientX, py: e.clientY };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setDrag({
      x: start.current.x + (e.clientX - start.current.px),
      y: start.current.y + (e.clientY - start.current.py),
    });
  };

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-12 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        nothing here tells the wrapper it is moving — it measures itself
      </p>

      {/* Source one: a plain CSS transition with overshoot. */}
      <div>
        <div className="relative h-28 border border-ink">
          <Deform
            amount={0.26}
            className="absolute left-0 top-0 h-28 w-1/4 p-2"
            style={{
              transform: `translateX(${slot * 100}%)`,
              transition: 'transform 620ms cubic-bezier(0.34,1.42,0.5,1)',
            }}
          >
            <div className="grid h-full w-full place-items-center bg-ink text-bone">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">css transition</span>
            </div>
          </Deform>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SLOTS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(i)}
              className="cursor-pointer border border-ink py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
            >
              send to {s}
            </button>
          ))}
        </div>
      </div>

      {/* Source two: a pointer drag, no transition at all. */}
      <div className="border-t border-ink pt-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          drag this one — the stretch tracks the flick, the squash follows the stop
        </p>
        {/* The move goes on the Deform box itself — that is the box it measures. */}
        <Deform
          amount={0.2}
          lean={1}
          className="w-fit"
          style={{ transform: `translate(${drag.x}px, ${drag.y}px)` }}
        >
          <div
            onPointerDown={onDown}
            onPointerMove={onMove}
            className="cursor-grab touch-none select-none border border-ink bg-vermilion px-7 py-5 text-bone active:cursor-grabbing"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">drag</span>
          </div>
        </Deform>
      </div>
    </section>
  );
}
