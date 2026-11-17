import type { ReactNode } from 'react'
import { Reveal } from '@/components/reveal-entrance/reveal/Reveal'

interface ManifestoPoint {
  label: string
  text: string
}

interface ManifestoProps {
  eyebrow?: ReactNode
  quote?: ReactNode
  points: ManifestoPoint[]
}

const DEFAULT_QUOTE = (
  <>
    We don't cut corners. We <span className="text-accent italic">build</span> things properly — measured, tested, and
    made to last.
  </>
)

/** Dark, full-bleed statement section: eyebrow, large serif pull-quote, and a row of labeled points. */
export function Manifesto({ eyebrow = 'STATEMENT', quote = DEFAULT_QUOTE, points }: ManifestoProps) {
  return (
    <div className="border-t border-ink bg-ink text-paper">
      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,64px)] py-[clamp(64px,12vw,180px)]">
        <Reveal className="mb-[clamp(28px,4vw,48px)] font-mono text-[11px] tracking-[0.16em] text-paper/50">
          {eyebrow}
        </Reveal>
        <Reveal>
          <p className="max-w-[20ch] font-serif text-[clamp(30px,5.2vw,76px)] leading-[1.04] tracking-[-0.01em]">
            {quote}
          </p>
        </Reveal>
        <Reveal className="mt-[clamp(40px,6vw,80px)] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 font-mono text-xs leading-[1.7] tracking-[0.06em] text-paper/70">
          {points.map((p) => (
            <div key={p.label}>
              <div className="mb-2 text-paper">{p.label}</div>
              {p.text}
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  )
}
