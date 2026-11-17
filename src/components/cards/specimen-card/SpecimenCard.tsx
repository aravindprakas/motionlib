import { CornerMarks } from '@/components/decor/corner-marks/CornerMarks'
import type { Specimen } from '@/lib/types'

interface SpecimenCardProps {
  item: Specimen
  onOpen?: () => void
  onQuickAdd?: () => void
  onToggleWish?: () => void
}

/** Product card with a hover-invert plate: a dark-ink text layer and a cream text layer sit on
 *  the same block, and swapping the block's background on hover is what reveals one over the other. */
export function SpecimenCard({ item, onOpen, onQuickAdd, onToggleWish }: SpecimenCardProps) {
  return (
    <article className="relative flex h-full flex-col border border-ink/15 bg-paper">
      <button onClick={onOpen} aria-label="View specimen" className="block cursor-pointer text-left">
        <div className="relative aspect-[4/5] overflow-hidden border-b border-ink/15 bg-paper transition-colors duration-[420ms] ease-out hover:bg-ink">
          <div className="absolute inset-0 flex flex-col justify-between p-3.5 font-mono text-[10px] tracking-[0.14em] text-ink/55">
            <div className="flex justify-between">
              <span>
                {item.type} · {item.idx}
              </span>
              <span>{item.season}</span>
            </div>
            <div className="-ml-0.5 font-serif text-[clamp(56px,8vw,104px)] leading-[0.78] text-ink/10">{item.idx}</div>
            <div className="text-ink/50">FIG.01 · FRONTAL</div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-3.5 font-mono text-[11px] tracking-[0.08em] text-paper">
            <div className="flex justify-between">
              <span>{item.catLabel}</span>
              <span>SPECIMEN</span>
            </div>
            <div className="flex flex-col gap-2 leading-[1.45]">
              <span className="text-sm tracking-[0.04em]">{item.colorway}</span>
              <span className="text-paper/55">{item.materials}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{item.origin}</span>
              <span className="font-bold">VIEW SPECIMEN →</span>
            </div>
          </div>
          <CornerMarks />
        </div>
      </button>
      <div className="flex items-start justify-between gap-3 px-3.5 pt-[13px] pb-3">
        <div className="min-w-0">
          <div className="font-sans text-sm leading-[1.15] font-semibold">{item.name}</div>
          <div className="mt-[5px] font-mono text-[10px] tracking-[0.08em] text-ink/50">{item.sku}</div>
        </div>
        <div className="font-mono text-[13px] whitespace-nowrap">{item.priceFmt}</div>
      </div>
      <div className="mt-auto flex border-t border-ink/15 font-mono text-[10px] tracking-[0.12em]">
        <button
          onClick={onQuickAdd}
          className="flex-1 cursor-pointer px-2.5 py-[11px] text-center transition-colors hover:bg-ink hover:text-paper"
        >
          + QUICK ADD
        </button>
        <button
          onClick={onToggleWish}
          aria-label="Toggle wishlist"
          className="cursor-pointer border-l border-ink/15 px-3.5 py-[11px] text-ink/60 transition-colors hover:text-accent"
        >
          {item.wishLabel}
        </button>
      </div>
    </article>
  )
}
