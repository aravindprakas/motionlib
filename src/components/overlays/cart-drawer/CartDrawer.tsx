import { CartLineItem } from '@/components/cards/cart-line-item/CartLineItem'

interface CartLine {
  idx: string
  name: string
  sku: string
  size: string
  qty: number
  lineFmt: string
  onDec?: () => void
  onInc?: () => void
  onRemove?: () => void
}

interface CartDrawerProps {
  lines: CartLine[]
  subtotalFmt?: string
  freeShipText?: string
  onClose?: () => void
  onCheckout?: () => void
  onBrowse?: () => void
}

/** Right-side slide-over: scrollable line items, empty state, and a subtotal + checkout footer. */
export function CartDrawer({ lines, subtotalFmt, freeShipText, onClose, onCheckout, onBrowse }: CartDrawerProps) {
  const empty = lines.length === 0

  return (
    <div className="fixed inset-0 z-50">
      <button onClick={onClose} aria-label="Close cart" className="absolute inset-0 cursor-pointer border-none bg-ink/50" />
      <aside className="absolute top-0 right-0 flex h-full w-[min(440px,92vw)] flex-col border-l border-ink bg-paper">
        <div className="flex items-center justify-between border-b border-ink px-[clamp(16px,3vw,28px)] py-5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-ink/55">ORDER MANIFEST</div>
            <div className="mt-[3px] font-sans text-[19px] font-bold">Cart — {lines.length} items</div>
          </div>
          <button onClick={onClose} className="cursor-pointer border border-ink px-3 py-2 font-mono text-xs tracking-[0.1em]">
            CLOSE ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {empty ? (
            <div className="p-12 text-center">
              <div className="mb-3.5 font-serif text-4xl leading-none">Empty file.</div>
              <p className="mb-6 font-mono text-xs leading-[1.6] text-ink/60">No specimens on the manifest yet.</p>
              <button onClick={onBrowse} className="cursor-pointer bg-ink px-[22px] py-3.5 font-mono text-xs tracking-[0.12em] text-paper">
                BROWSE THE INDEX →
              </button>
            </div>
          ) : (
            lines.map((line) => <CartLineItem key={line.sku} {...line} />)
          )}
        </div>

        {!empty && (
          <div className="border-t border-ink px-[clamp(16px,3vw,28px)] py-[18px]">
            <div className="mb-1.5 flex justify-between font-mono text-[13px]">
              <span>SUBTOTAL</span>
              <span>{subtotalFmt}</span>
            </div>
            <div className="mb-3.5 font-mono text-[10px] tracking-[0.06em] text-ink/55">{freeShipText}</div>
            <button
              onClick={onCheckout}
              className="mb-2.5 block w-full cursor-pointer bg-accent py-4 text-center font-mono text-xs font-bold tracking-[0.14em] text-ink"
            >
              PROCEED TO CHECKOUT →
            </button>
            <button className="block w-full cursor-pointer border border-ink py-3.5 text-center font-mono text-[11px] tracking-[0.12em]">
              VIEW FULL MANIFEST
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
