// ui-107 — Header + UtilityBar
import { useState } from 'react'

interface NavLink {
  label: string
  active?: boolean
  onClick?: () => void
}

interface HeaderProps {
  links: NavLink[]
  brandName?: string
  brandTag?: string
  wishCount?: number
  cartCount?: number
  onWishlist?: () => void
  onCart?: () => void
  onMenuToggle?: () => void
}

/** Sticky top nav: full link row on desktop, cart + hamburger on mobile (swap driven by the `md:` breakpoint). */
export function Header({
  links,
  brandName = 'Brand',
  brandTag,
  wishCount = 0,
  cartCount = 0,
  onWishlist,
  onCart,
  onMenuToggle,
}: HeaderProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-[clamp(16px,4vw,64px)] py-4">
        <button className="flex cursor-pointer items-baseline gap-2.5">
          <span className="font-sans text-xl font-bold tracking-[-0.01em]">{brandName}</span>
          {brandTag && <span className="font-mono text-[10px] tracking-[0.18em] text-ink/50">{brandTag}</span>}
        </button>

        <nav className="hidden items-center gap-[30px] font-mono text-[11.5px] tracking-[0.12em] md:flex">
          {links.map((link, i) => (
            <button
              key={link.label}
              onClick={link.onClick}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer border-b pb-0.5 transition-colors"
              style={{
                borderColor: link.active || hovered === i ? 'var(--color-accent)' : 'transparent',
                color: link.active ? 'var(--color-accent)' : undefined,
              }}
            >
              {link.label}
            </button>
          ))}
          <span className="h-4 w-px bg-ink/15" />
          <button onClick={onWishlist} className="cursor-pointer transition-colors hover:text-accent">
            SAVED ({wishCount})
          </button>
          <button onClick={onCart} className="cursor-pointer bg-ink px-[15px] py-2.5 text-paper">
            CART ({cartCount})
          </button>
        </nav>

        <div className="flex items-center gap-3.5 font-mono text-[11px] tracking-[0.12em] md:hidden">
          <button onClick={onCart} className="cursor-pointer bg-ink px-[13px] py-2.5 text-paper">
            CART ({cartCount})
          </button>
          <button onClick={onMenuToggle} aria-label="Menu" className="cursor-pointer border border-ink px-[13px] py-2.5">
            MENU
          </button>
        </div>
      </div>
    </header>
  )
}
