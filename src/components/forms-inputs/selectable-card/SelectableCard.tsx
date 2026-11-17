// ui-102 — SelectableCardGroup
import { useId } from 'react';

export interface SelectableCardOption {
  value: string;
  label: string;
  note?: string;
}

export interface SelectableCardGroupProps {
  options: SelectableCardOption[];
  /** Radio group name. Auto-generated when omitted, so multiple groups coexist. */
  name?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Radio cards whose border/fill react to their own checked input purely via
 * the CSS `:has()` selector — no JS state for the visuals.
 *
 * Fixes vs. the Store original: options are a prop instead of hardcoded, and
 * the radio `name` is auto-scoped with useId so two instances on one page
 * no longer steal each other's selection.
 */
export function SelectableCardGroup({
  options,
  name,
  defaultValue,
  onChange,
  className = '',
}: SelectableCardGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const initial = defaultValue ?? options[0]?.value;

  return (
    <div className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 ${className}`}>
      {options.map((opt) => (
        <div
          key={opt.value}
          className="group border border-ink/15 p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5"
        >
          <label className="flex cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.04em]">
            <input
              type="radio"
              name={groupName}
              value={opt.value}
              defaultChecked={opt.value === initial}
              onChange={() => onChange?.(opt.value)}
            />
            {opt.label}
          </label>
          {opt.note && (
            <div className="mt-2 font-mono text-[11px] text-ink/50 group-has-[:checked]:text-accent">
              <span className="hidden group-has-[:checked]:inline">● </span>
              <span className="inline group-has-[:checked]:hidden">○ </span>
              {opt.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
