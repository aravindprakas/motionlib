// ui-122 — Projects
export interface ProgressRailProps {
  count: number;
  activeIndex: number;
  /** Overall scroll progress, 0..1. */
  progress: number;
}

/**
 * Left-edge chapter index + a vertical fill that tracks overall scroll
 * progress. Presentational — the parent feeds it `activeIndex` and `progress`.
 *
 * Pinned via a zero-height `sticky` wrapper (rather than `position: fixed`) so
 * it stays scoped to its scroll container instead of the whole window — the
 * same furniture pattern the ScrollRails element uses.
 */
export function ProgressRail({ count, activeIndex, progress }: ProgressRailProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <nav
      aria-label="Scroll progress"
      className="pointer-events-none sticky top-0 z-40 hidden h-0 lg:block"
    >
      <div className="absolute left-6 top-[50vh] flex -translate-y-1/2 flex-col items-center gap-10 mix-blend-difference">
        <div className="flex flex-col items-center gap-4">
          <span className="rotate-180 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 [writing-mode:vertical-lr]">
            Progress
          </span>
          <div className="relative h-32 w-px overflow-hidden bg-white/20">
            <div
              className="absolute left-0 top-0 w-full bg-accent transition-[height] duration-200 ease-out"
              style={{ height: `${clamped * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: count }, (_, i) => {
            const isActive = i === activeIndex;
            return (
              <span
                key={i}
                className={`font-mono text-xs tabular-nums transition-colors ${
                  isActive ? 'text-accent' : 'text-white/40'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
