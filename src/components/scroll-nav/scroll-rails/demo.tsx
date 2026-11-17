// ui-46 — ScrollRails
import { useRef } from 'react';
import { ScrollRails } from './ScrollRails';

export default function ScrollRailsDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="relative h-[calc(100vh-3.5rem)] overflow-y-auto">
      <ScrollRails scrollRef={scrollRef} leftLabel="ARVI · IDX · 01 → 06" rightLabel="SCROLL · DOWN" />

      <div className="mx-auto max-w-2xl px-20 py-24">
        <p className="mb-10 font-mono text-xs uppercase tracking-[0.3em]">scroll this panel</p>
        {['Discover', 'Define', 'Design', 'Build', 'Ship', 'Reflect'].map((t, i) => (
          <div key={t} className="border-t border-ink py-16">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">0{i + 1}</p>
            <h3 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight">{t}</h3>
            <p className="mt-4 max-w-md font-serif text-lg italic text-ink/70">
              Watch the left rail's percentage climb as the panel scrolls. The rails stay pinned via sticky positioning.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
