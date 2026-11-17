// ui-98 — Buttons
import type { ButtonHTMLAttributes } from 'react'

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`cursor-pointer bg-accent px-[26px] py-4 font-mono text-xs font-bold tracking-[0.14em] text-ink ${className}`}
      {...props}
    />
  )
}
