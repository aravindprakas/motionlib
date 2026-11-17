// ui-4 — SpotlightGrid
import { SpotlightGrid } from './SpotlightGrid';

const CARDS = ['Trace', 'Ledger', 'Counter', 'Register', 'Manifest', 'Index'].map((t, i) => (
  <div key={t} className="flex h-48 flex-col justify-between p-5">
    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
      {String(i + 1).padStart(2, '0')} / module
    </span>
    <h4 className="font-display text-2xl font-bold uppercase tracking-tight">{t}</h4>
  </div>
));

export default function SpotlightGridDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em]">pointer spotlight</p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">One listener, zero re-renders</h1>
      </div>
      <SpotlightGrid cards={CARDS} columns={3} />
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
        the glow rides css custom properties — react never re-renders on move
      </p>
    </div>
  );
}
