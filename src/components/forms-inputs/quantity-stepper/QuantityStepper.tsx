interface QuantityStepperProps {
  qty: number
  onDec?: () => void
  onInc?: () => void
}

export function QuantityStepper({ qty, onDec, onInc }: QuantityStepperProps) {
  return (
    <div className="flex items-center border border-ink font-mono text-xs">
      <button onClick={onDec} className="cursor-pointer px-2.5 py-1" aria-label="Decrease quantity">
        −
      </button>
      <span className="min-w-5 px-2 py-1 text-center">{qty}</span>
      <button onClick={onInc} className="cursor-pointer px-2.5 py-1" aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
