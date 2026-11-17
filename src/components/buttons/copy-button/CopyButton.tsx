// ui-99 — CopyButton
import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent } from 'react';

type SizeVariant = 'sm' | 'default' | 'lg';

export interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text written to the clipboard on click. */
  value?: string;
  size?: SizeVariant;
}

const sizeMap: Record<SizeVariant, { box: string; icon: number }> = {
  sm: { box: 'h-8 w-8', icon: 14 },
  default: { box: 'h-9 w-9', icon: 16 },
  lg: { box: 'h-12 w-12', icon: 20 },
};

const CopyIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Copy-to-clipboard button. The copy and check glyphs are stacked and swapped
 * with a scale + blur crossfade; the copied state auto-resets after 1.5s.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ value, size = 'default', className = '', onClick, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const { box, icon } = sizeMap[size];

    const handleCopy = (e: MouseEvent<HTMLButtonElement>) => {
      if (value) navigator.clipboard?.writeText(value).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        disabled={copied}
        className={`relative inline-flex cursor-pointer items-center justify-center border border-ink text-ink transition-transform duration-200 ease-out active:scale-95 disabled:pointer-events-none ${box} ${className}`}
        {...props}
      >
        <span
          className={`transition-all duration-200 ${copied ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-[2px]'}`}
        >
          <CheckIcon size={icon} />
        </span>
        <span
          className={`absolute transition-all duration-200 ${copied ? 'scale-0 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-0'}`}
        >
          <CopyIcon size={icon} />
        </span>
      </button>
    );
  },
);

CopyButton.displayName = 'CopyButton';
