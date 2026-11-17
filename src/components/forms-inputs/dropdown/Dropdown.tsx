// ui-114 — Dropdown
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface DropdownItem {
  /** Stable value committed on select; falls back to `label` when omitted. */
  value?: string;
  label: string;
  icon?: ReactNode;
}

export interface DropdownProps {
  items: DropdownItem[];
  /** Controlled value. Omit to run uncontrolled from `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Trigger + menu width in px. Default 224. */
  width?: number;
  placeholder?: string;
  className?: string;
}

const keyOf = (it: DropdownItem) => it.value ?? it.label;

const Chevron = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="block">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="block">
    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Select-style dropdown: the trigger reveals a menu whose items stagger in on a
 * spring while the chevron flips. Works controlled (`value` + `onChange`) or
 * uncontrolled (`defaultValue`); closes on outside click or Escape.
 */
export function Dropdown({
  items,
  value,
  defaultValue,
  onChange,
  width = 224,
  placeholder = 'Select…',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? keyOf(items[0]));
  const ref = useRef<HTMLDivElement>(null);

  const current = value ?? internal;
  const selected = items.find((it) => keyOf(it) === current) ?? null;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (it: DropdownItem) => {
    const key = keyOf(it);
    if (value === undefined) setInternal(key);
    onChange?.(key);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`} style={{ width }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 border-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
          open ? 'border-ink bg-ink text-bone' : 'border-ink bg-bone text-ink hover:bg-ink/5'
        }`}
      >
        {selected?.icon && <span className="flex shrink-0">{selected.icon}</span>}
        <span className="flex-1 text-left">{selected?.label ?? placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex shrink-0"
        >
          <Chevron />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 border-2 border-ink bg-bone p-1.5"
          >
            {items.map((it, i) => {
              const active = keyOf(it) === current;
              return (
                <motion.li
                  key={keyOf(it)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 420, damping: 30 }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => select(it)}
                    className={`group flex w-full items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-150 ${
                      active ? 'bg-ink text-bone' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    {it.icon && (
                      <span className="flex shrink-0 transition-transform duration-200 group-hover:scale-110">
                        {it.icon}
                      </span>
                    )}
                    <span className="flex-1 text-left">{it.label}</span>
                    {active && (
                      <span className="flex shrink-0">
                        <Check />
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
