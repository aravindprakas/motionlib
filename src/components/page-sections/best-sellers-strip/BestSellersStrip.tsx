import { Marquee } from '@/components/marquee-ticker/marquee/Marquee'
import { SpecimenCard } from '@/components/cards/specimen-card/SpecimenCard'
import type { Specimen } from '@/lib/types'

interface BestSellersStripProps {
  items: Specimen[]
}

/** Oversized-type marquee banner sitting above a horizontally snap-scrolling row of cards. */
export function BestSellersStrip({ items }: BestSellersStripProps) {
  return (
    <div className="border-t border-ink">
      <Marquee speed={30} className="border-b border-ink/15">
        <span className="px-7 font-serif text-[clamp(32px,4.5vw,60px)]">
          BEST SELLERS · ON RECORD · BEST SELLERS · ON RECORD ·{' '}
        </span>
      </Marquee>
      <div className="mx-auto max-w-[1480px] py-[clamp(28px,4vw,56px)]">
        <div className="flex gap-px overflow-x-auto px-[clamp(16px,4vw,64px)]" style={{ scrollSnapType: 'x mandatory' }}>
          {items.map((item) => (
            <div key={item.sku} className="w-[clamp(240px,30vw,320px)] shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <SpecimenCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
