interface MobileBottomNavProps {
  active: 'index' | 'shop' | 'search' | 'saved'
  cartCount?: number
  onIndex?: () => void
  onShop?: () => void
  onSearch?: () => void
  onSaved?: () => void
  onCart?: () => void
}

/** Fixed 5-column tab bar for small viewports: three nav tabs, saved, and a cart tab pinned dark. */
export function MobileBottomNav({ active, cartCount = 0, onIndex, onShop, onSearch, onSaved, onCart }: MobileBottomNavProps) {
  const tab = (key: MobileBottomNavProps['active']) =>
    `cursor-pointer text-center px-1 py-3.5 ${active === key ? 'text-accent' : ''}`

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 grid grid-cols-5 border-t border-ink bg-paper font-mono text-[9px] tracking-[0.08em]">
      <button onClick={onIndex} className={tab('index')}>
        INDEX
      </button>
      <button onClick={onShop} className={`${tab('shop')} border-l border-ink/15`}>
        SHOP
      </button>
      <button onClick={onSearch} className={`${tab('search')} border-l border-ink/15`}>
        SEARCH
      </button>
      <button onClick={onSaved} className={`${tab('saved')} border-l border-ink/15`}>
        SAVED
      </button>
      <button onClick={onCart} className="cursor-pointer bg-ink px-1 py-3.5 text-center text-paper">
        CART {cartCount}
      </button>
    </div>
  )
}
