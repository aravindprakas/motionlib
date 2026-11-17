// ui-120 — PullQuote
import { useEffect, useRef } from 'react'

interface PullQuoteProps {
  quote?: string
  cite?: string
}

/** Editorial pull-quote with a hairline rule that draws in via scaleX once it scrolls into view. */
export function PullQuote({
  quote = 'Whitespace is not empty. It is the loudest element on the page when you let it speak.',
  cite = 'Field notes, on negative space',
}: PullQuoteProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="group grid gap-4">
      <div className="h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-[1100ms] [transition-delay:150ms] ease-[cubic-bezier(.76,0,.24,1)] group-[.in]:scale-x-100" />
      <blockquote className="text-balance font-serif text-[clamp(1.8rem,5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] italic">
        {quote}
      </blockquote>
      <cite className="font-mono text-[11px] text-ink/50 tracking-[0.16em] uppercase not-italic">— {cite}</cite>
    </div>
  )
}
