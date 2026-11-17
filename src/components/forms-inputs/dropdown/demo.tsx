// ui-114 — Dropdown
import { useState } from 'react';
import { Dropdown, type DropdownItem } from './Dropdown';

const items: DropdownItem[] = [
  {
    label: 'Think',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="block">
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.7.6 1.2v.5h6v-.5c0-.5.2-.9.6-1.2A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 18.5h5M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="block">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H9l-4 4v-4H6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Agentic',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="block">
        <rect x="5" y="8" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 5v3M9.5 12.5h.01M14.5 12.5h.01M8 18v2M16 18v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function DropdownDemo() {
  const [mode, setMode] = useState('Think');

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">choose a mode</p>

        <Dropdown items={items} value={mode} onChange={setMode} />

        <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
          active — {mode}
        </span>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Items stagger in on a spring while the chevron flips; closes on outside click or Escape.
          Controlled or uncontrolled, with an active check.
        </p>
      </div>
    </section>
  );
}
