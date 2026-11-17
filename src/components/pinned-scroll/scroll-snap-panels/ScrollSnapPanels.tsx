import type { ReactNode } from 'react';

export interface ScrollSnapPanel {
  content: ReactNode;
  className?: string;
}

export interface ScrollSnapPanelsProps {
  panels: ScrollSnapPanel[];
  /** Height of the snap viewport (CSS size). Default '50vh'. */
  height?: string;
  className?: string;
}

/**
 * Vertical `scroll-snap-type: y mandatory` container — pure CSS, no JS.
 * This one intentionally keeps its own scrollbox: the snap container IS the
 * component. Panels are a prop (the Store version hardcoded them).
 */
export function ScrollSnapPanels({ panels, height = '50vh', className = '' }: ScrollSnapPanelsProps) {
  return (
    // data-lenis-prevent: the ambient Lenis instance must not hijack wheel
    // events over this box, or the inner native scroll never receives them.
    <div
      data-lenis-prevent
      className={`snap-y snap-mandatory overflow-y-auto border border-ink/15 ${className}`}
      style={{ height }}
    >
      {panels.map((panel, i) => (
        <div
          key={i}
          className={`flex snap-start items-center justify-center border-b border-ink/15 last:border-b-0 ${panel.className ?? ''}`}
          style={{ height }}
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
