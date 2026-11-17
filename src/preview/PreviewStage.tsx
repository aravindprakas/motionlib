import { SmoothScroll } from '@/lib/SmoothScroll';
import type { RegistryEntry } from '@/lib/registry';
import { ArrowLeft } from 'lucide-react';

export interface PreviewStageProps {
  entry: RegistryEntry;
  onBack?: () => void;
}

/**
 * Main stage. The demo is keyed by entry id and wrapped in its own
 * SmoothScroll, so every component gets a fresh, isolated Lenis context —
 * ScrollTriggers from the previous demo are fully torn down on switch.
 */
export function PreviewStage({ entry, onBack }: PreviewStageProps) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-ink px-4 py-3 md:px-6">
        {onBack && <button onClick={onBack} className="shrink-0 border border-ink p-2" aria-label="Back to Gemini overview"><ArrowLeft size={15} /></button>}
        <h2 className="min-w-0 break-words font-display text-sm font-bold uppercase tracking-tight">{entry.name}</h2>
        <p className="hidden truncate font-serif text-base italic xl:block">{entry.description}</p>
        <div className="ml-auto hidden shrink-0 gap-2 lg:flex">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <SmoothScroll key={entry.id}>
          <entry.Demo />
        </SmoothScroll>
      </div>
    </main>
  );
}
