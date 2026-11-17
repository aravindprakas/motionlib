// ui-98 — Buttons
import type { ButtonHTMLAttributes } from 'react'

/** Text-only button with a hairline underline that turns accent-colored on hover. Used for nav links and inline CTAs. */
export function UnderlineButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`cursor-pointer border-b border-ink pb-[5px] font-mono text-xs tracking-[0.14em] transition-colors hover:border-accent hover:text-accent ${className}`}
      {...props}
    />
  )
}
