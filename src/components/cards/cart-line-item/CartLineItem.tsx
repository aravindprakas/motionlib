import { QuantityStepper } from '@/components/forms-inputs/quantity-stepper/QuantityStepper'

interface CartLineItemProps {
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

export function CartLineItem({ idx, name, sku, size, qty, lineFmt, onDec, onInc, onRemove }: CartLineItemProps) {
  return (
    <div className="flex gap-3.5 border-b border-ink/15 px-[clamp(16px,3vw,28px)] py-4">
      <div className="flex h-[66px] w-[54px] shrink-0 items-center justify-center border border-ink/20 font-serif text-2xl text-ink/30">
        {idx}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <span className="font-sans text-sm font-semibold">{name}</span>
          <span className="font-mono text-[13px] whitespace-nowrap">{lineFmt}</span>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.08em] text-ink/55">
          {sku} · SIZE {size}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <QuantityStepper qty={qty} onDec={onDec} onInc={onInc} />
          <button onClick={onRemove} className="cursor-pointer font-mono text-[10px] tracking-[0.08em] text-ink/55 transition-colors hover:text-accent">
            REMOVE
          </button>
        </div>
      </div>
    </div>
  )
}
