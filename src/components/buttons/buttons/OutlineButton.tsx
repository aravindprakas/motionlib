// ui-98 — Buttons
import type { ButtonHTMLAttributes } from 'react'

export function OutlineButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`cursor-pointer border border-ink px-[26px] py-4 font-mono text-xs tracking-[0.14em] ${className}`}
      {...props}
    />
  )
}
