import { useState, type ReactNode } from 'react';
import { ShellPortalProvider } from './PortalContext';

export interface ShellStageProps {
  children: ReactNode;
  /** Short line explaining what to try. Rendered in the stage's status bar. */
  hint?: string;
  /** Remove the default page padding — for demos that are full-bleed chrome. */
  bleed?: boolean;
  className?: string;
}

const Sun = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden
  >
    <circle cx="10" cy="10" r="3.6" />
    <path
      d="M10 2v2M10 16v2M2 10h2M16 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M15.4 4.6L14 6M6 14l-1.4 1.4"
      strokeLinecap="round"
    />
  </svg>
);

const Moon = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden
  >
    <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z" strokeLinejoin="round" />
  </svg>
);

/**
 * The stage every App Shell demo is mounted in — not part of the set itself.
 *
 * It does three jobs. It opens the `.shell-theme` scope, which is what keeps
 * this set's soft surfaces (24px radii, real shadows, white/near-black grounds)
 * from leaking onto the brutalist library around it. It owns the `dark` class,
 * because the set ships a genuine light/dark pair and a demo you cannot flip is
 * a demo of half the work. And it nominates itself as the portal target, so an
 * overlay is dark when the app is dark — a portal escapes the theme wrapper
 * along with everything else it is escaping, and that is a bug you only notice
 * once theming is scoped rather than global.
 *
 * The toggle writes a class on this element rather than on `<html>`, so two
 * stages could sit side by side in different themes and switching demos never
 * leaves the preview shell itself in the dark.
 */
export function ShellStage({ children, hint, bleed = false, className = '' }: ShellStageProps) {
  const [dark, setDark] = useState(false);
  // State, not a ref: the provider has to re-render once the element exists,
  // and a ref's `.current` changing never triggers that.
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setRoot} className={`shell-theme ${dark ? 'dark' : ''} ${className}`}>
      <ShellPortalProvider container={root}>
        <div className="relative min-h-[calc(100vh-3.5rem)] bg-white text-gray-900 transition-colors duration-500 ease-out dark:bg-[#0b0b0d] dark:text-gray-100">
          <div className={bleed ? '' : 'px-6 py-10 md:px-10'}>{children}</div>

          <div className="pointer-events-none sticky bottom-0 z-40 flex items-end justify-between gap-4 px-6 pb-5 pt-10 md:px-10">
            {hint ? (
              <p className="pointer-events-auto max-w-md rounded-[999px] border border-gray-200/80 bg-white/80 px-4 py-2 text-[11px] leading-relaxed text-gray-500 shadow-[0_8px_28px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-black/70 dark:text-gray-400">
                {hint}
              </p>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-pressed={dark}
              className="pointer-events-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-[999px] border border-gray-200/80 bg-white/80 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 shadow-[0_8px_28px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-black/70 dark:text-gray-300 dark:focus-visible:ring-offset-[#0b0b0d]"
            >
              <span className="relative grid h-4 w-4 place-items-center">
                <span
                  className={`absolute transition-all duration-300 ease-out ${
                    dark ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
                  }`}
                >
                  <Sun />
                </span>
                <span
                  className={`absolute transition-all duration-300 ease-out ${
                    dark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                >
                  <Moon />
                </span>
              </span>
              {dark ? 'dark' : 'light'}
            </button>
          </div>
        </div>
      </ShellPortalProvider>
    </div>
  );
}
