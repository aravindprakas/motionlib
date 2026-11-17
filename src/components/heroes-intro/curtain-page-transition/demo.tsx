// ui-117 — CurtainPageTransition
import { useState } from 'react';
import { CurtainPageTransition } from './CurtainPageTransition';

const VIEWS = [
  { name: 'Index', className: 'bg-bone text-ink' },
  { name: 'Archive', className: 'bg-accent text-ink' },
  { name: 'Manifest', className: 'bg-bone text-accent' },
];

export default function CurtainPageTransitionDemo() {
  const [view, setView] = useState(0);
  const current = VIEWS[view];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-8">
      <div className="flex w-max border border-ink">
        {VIEWS.map((v, i) => (
          <button
            key={v.name}
            type="button"
            onClick={() => setView(i)}
            className={`cursor-pointer border-r border-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] last:border-r-0 ${
              view === i ? 'bg-vermilion' : 'hover:bg-ink hover:text-bone'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <CurtainPageTransition transitionKey={view} panelCount={5} duration={0.55} className="flex-1 border border-ink">
        <div className={`flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 ${current.className}`}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-60">view {String(view + 1).padStart(2, '0')}</p>
          <h1 className="font-display text-7xl font-bold uppercase tracking-tight">{current.name}</h1>
          <p className="font-serif text-xl italic">Swapped behind the curtain.</p>
        </div>
      </CurtainPageTransition>
    </div>
  );
}
