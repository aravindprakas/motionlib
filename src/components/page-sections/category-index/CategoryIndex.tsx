import { Reveal } from '@/components/reveal-entrance/reveal/Reveal'
import { CategoryRow } from '@/components/cards/category-row/CategoryRow'

interface Category {
  no: string
  label: string
  countText: string
  onClick?: () => void
}

interface CategoryIndexProps {
  categories: Category[]
}

/** Numbered list of category rows framed by a heading strip and a closing rule. */
export function CategoryIndex({ categories }: CategoryIndexProps) {
  return (
    <div className="border-t border-ink">
      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,64px)] pt-[clamp(36px,5vw,64px)] pb-[clamp(20px,3vw,40px)]">
        <Reveal className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
          <div className="font-mono text-[11px] tracking-[0.16em] text-ink/55">02 — INDEX OF CATEGORIES</div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-ink/55">{categories.length} ENTRIES</div>
        </Reveal>
      </div>
      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,64px)] pb-[clamp(40px,6vw,96px)]">
        {categories.map((c) => (
          <Reveal key={c.label}>
            <CategoryRow no={c.no} label={c.label} countText={c.countText} onClick={c.onClick} />
          </Reveal>
        ))}
        <div className="border-t border-ink/15" />
      </div>
    </div>
  )
}
