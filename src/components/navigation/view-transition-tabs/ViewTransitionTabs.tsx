import { useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ViewTransitionTab {
  title: string;
  body: ReactNode;
}

export interface ViewTransitionTabsProps {
  tabs: ViewTransitionTab[];
  className?: string;
}

/**
 * Tab switcher wrapped in `document.startViewTransition`, with an instant
 * swap where the API is missing or reduced motion is set.
 *
 * Fix vs. the Store original: tabs are a prop instead of hardcoded.
 */
export function ViewTransitionTabs({ tabs, className = '' }: ViewTransitionTabsProps) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  function select(i: number) {
    const apply = () => setActive(i);
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !reduced) {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  }

  return (
    <div className={className}>
      <div className="flex w-max border border-ink/15" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.title}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => select(i)}
            className={`cursor-pointer border-r border-ink/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] last:border-r-0 ${
              active === i ? 'bg-ink text-paper' : ''
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div
        className="mt-3 min-h-[160px] border border-ink/15 p-6"
        style={{ viewTransitionName: 'vt-panel' } as CSSProperties}
      >
        <h4 className="font-serif text-3xl italic">{tabs[active].title}</h4>
        <div className="mt-3 max-w-[46ch] text-ink/60">{tabs[active].body}</div>
      </div>
    </div>
  );
}
