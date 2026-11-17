import type { InputHTMLAttributes } from 'react'

export function EmailField({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="email"
      placeholder="EMAIL ADDRESS"
      className={`flex-1 px-[13px] py-[13px] font-mono text-[11px] tracking-[0.08em] outline-none placeholder:text-ink/40 ${className}`}
      {...props}
    />
  )
}
