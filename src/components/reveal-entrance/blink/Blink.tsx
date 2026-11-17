import type { ReactNode } from 'react'

/** Slow opacity blink, used for idle indicators like a "scroll to browse" hint. */
export function Blink({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`animate-blink motion-reduce:animate-none ${className}`}>{children}</div>
}
