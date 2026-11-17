// ui-118 — Hero
import type { ReactNode } from 'react'
import { Blink } from '@/components/reveal-entrance/blink/Blink'
import { PrimaryButton } from '@/components/buttons/buttons/PrimaryButton'
import { OutlineButton } from '@/components/buttons/buttons/OutlineButton'

interface HeroProps {
  eyebrow?: string
  countLabel?: ReactNode
  headline?: ReactNode
  blurb?: ReactNode
  primaryLabel?: ReactNode
  secondaryLabel?: ReactNode
  scrollHint?: ReactNode
  onPrimary?: () => void
  onSecondary?: () => void
}

const DEFAULT_HEADLINE = (
  <>
    Your headline
    <br />
    goes right
    <br />
    <span className="italic">
      here<span className="text-accent">.</span>
    </span>
  </>
)

/** Full-bleed editorial hero: eyebrow line, oversized serif headline, blurb + CTA pair, blinking scroll hint. */
export function Hero({
  eyebrow = 'Issue Nº 01',
  countLabel = (
    <>
      128 Items
      <br />
      In Stock
    </>
  ),
  headline = DEFAULT_HEADLINE,
  blurb = 'A short line of supporting copy that sets up what this page is about, and why it matters.',
  primaryLabel = 'PRIMARY ACTION →',
  secondaryLabel = 'SECONDARY ACTION',
  scrollHint = 'Scroll to browse ↓',
  onPrimary,
  onSecondary,
}: HeroProps) {
  return (
    <div className="relative mx-auto flex min-h-[clamp(540px,86vh,960px)] max-w-[1480px] flex-col justify-between overflow-hidden px-[clamp(16px,4vw,64px)] pt-[clamp(28px,5vw,64px)]">
      <div className="flex items-start justify-between gap-5 font-mono text-[11px] tracking-[0.16em] text-ink/55 uppercase">
        <span>{eyebrow}</span>
        <span className="text-right">{countLabel}</span>
      </div>

      <div className="py-[clamp(24px,5vw,40px)]">
        <h1 className="max-w-[16ch] font-serif text-[clamp(54px,12.5vw,184px)] leading-[0.86] tracking-[-0.02em]">
          {headline}
        </h1>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 pb-[clamp(20px,4vw,40px)]">
        <div className="max-w-[440px]">
          <p className="mb-[22px] font-mono text-[13px] leading-[1.7] text-ink/70">{blurb}</p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={onPrimary}>{primaryLabel}</PrimaryButton>
            <OutlineButton onClick={onSecondary}>{secondaryLabel}</OutlineButton>
          </div>
        </div>
        <div className="text-right font-mono text-[10.5px] tracking-[0.14em] text-ink/50 uppercase">
          <Blink>{scrollHint}</Blink>
        </div>
      </div>
    </div>
  )
}
