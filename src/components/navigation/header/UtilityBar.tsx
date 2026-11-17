// ui-107 — Header + UtilityBar
interface UtilityBarProps {
  brandLine?: string
  freeText?: string
  location?: string
}

export function UtilityBar({
  brandLine = 'YOUR BRAND — TAGLINE HERE',
  freeText = 'FREE SHIPPING OVER $75',
  location = 'YOUR CITY · LAT / LONG',
}: UtilityBarProps) {
  return (
    <div className="border-b border-ink/15 font-mono text-[10.5px] tracking-[0.12em] uppercase">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-[clamp(16px,4vw,64px)] py-2">
        <span className="whitespace-nowrap">{brandLine}</span>
        <span className="overflow-hidden text-center text-ellipsis whitespace-nowrap text-accent">{freeText}</span>
        <span className="whitespace-nowrap text-ink/55">{location}</span>
      </div>
    </div>
  )
}
