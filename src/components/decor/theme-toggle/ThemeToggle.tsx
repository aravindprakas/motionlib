// ui-113 — ThemeToggle
import { useState } from 'react';

export interface ThemeToggleProps {
  /** Start in the dark position. Default true. */
  defaultDark?: boolean;
  /** Called with the next mode whenever the toggle flips. */
  onChange?: (dark: boolean) => void;
  /** Also toggle the `dark` class on <html>. Off by default so the widget stays self-contained. */
  applyToDocument?: boolean;
  className?: string;
}

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

/**
 * Day/night switch with a knob that slides between a moon and a sun. Hard-edged
 * to match the brutalist scale (no pill radius). Uncontrolled by default; pass
 * `applyToDocument` to also flip the `dark` class on the document root.
 */
export function ThemeToggle({ defaultDark = true, onChange, applyToDocument = false, className = '' }: ThemeToggleProps) {
  const [dark, setDark] = useState(defaultDark);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (applyToDocument) document.documentElement.classList.toggle('dark', next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light' : 'Switch to dark'}
      className={`relative flex h-8 w-16 cursor-pointer items-center border border-ink bg-ink/5 p-1 ${className}`}
    >
      {/* Sliding knob */}
      <span
        className="absolute top-1 h-6 w-6 bg-ink transition-[left] duration-300 ease-out"
        style={{ left: dark ? '0.25rem' : 'calc(100% - 1.75rem)' }}
      />
      {/* Fixed icons */}
      <span className="relative z-10 flex w-full items-center justify-between px-1">
        <span className={dark ? 'text-bone' : 'text-ink/35'}>
          <MoonIcon />
        </span>
        <span className={!dark ? 'text-vermilion' : 'text-ink/35'}>
          <SunIcon />
        </span>
      </span>
    </button>
  );
}
