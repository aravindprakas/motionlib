import { Reveal } from '@/components/reveal-entrance/reveal/Reveal'
import { SpecimenCard } from '@/components/cards/specimen-card/SpecimenCard'
import type { Specimen } from '@/lib/types'

interface FeaturedGridProps {
  items: Specimen[]
  onViewAll?: () => void
}

/** Heading + "view all" pair over a hairline grid of SpecimenCards. */
export function FeaturedGrid({ items, onViewAll }: FeaturedGridProps) {
  return (
    <div className="border-t border-ink">
      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,64px)] py-[clamp(40px,6vw,96px)]">
        <Reveal className="mb-[clamp(28px,4vw,48px)] flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="mb-3.5 font-mono text-[11px] tracking-[0.16em] text-ink/55">03 — FEATURED SPECIMENS</div>
            <h2 className="font-serif text-[clamp(36px,5vw,68px)] leading-[0.95] tracking-[-0.015em]">Selected entries.</h2>
          </div>
          <button onClick={onViewAll} className="cursor-pointer border-b border-ink pb-[5px] font-mono text-xs tracking-[0.14em] hover:text-accent">
            ALL SPECIMENS →
          </button>
        </Reveal>
        <Reveal className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-px border border-ink/15 bg-ink/15">
          {items.map((item) => (
            <SpecimenCard key={item.sku} item={item} />
          ))}
        </Reveal>
      </div>
    </div>
  )
}
