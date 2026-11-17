interface MobileMenuLink {
  label: string
  onClick?: () => void
}

interface MobileMenuProps {
  links: MobileMenuLink[]
  brandName?: string
  cartCount?: number
  onClose?: () => void
  onCheckout?: () => void
}

/** Fullscreen overlay nav for small viewports — large serif link list plus a full-width checkout CTA. */
export function MobileMenu({ links, brandName = 'Brand', cartCount = 0, onClose, onCheckout }: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-ink px-[clamp(16px,4vw,64px)] py-4">
        <span className="font-sans text-xl font-bold">{brandName}</span>
        <button onClick={onClose} className="cursor-pointer border border-ink px-[13px] py-2.5 font-mono text-xs">
          CLOSE ✕
        </button>
      </div>
      <nav className="flex flex-1 flex-col justify-center gap-0.5 px-[clamp(16px,4vw,64px)]">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={link.onClick}
            className="cursor-pointer text-left font-serif text-[48px] leading-[1.1]"
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="px-[clamp(16px,4vw,64px)] pb-7">
        <button
          onClick={onCheckout}
          className="block w-full cursor-pointer bg-ink py-4 text-center font-mono text-xs tracking-[0.14em] text-paper"
        >
          CART ({cartCount}) →
        </button>
      </div>
    </div>
  )
}
