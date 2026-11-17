// ui-112 — CornerMarks
/** Decorative crop-mark corners, dropped over an image or card to evoke a specimen plate. */
export function CornerMarks({ className = '' }: { className?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`absolute top-2 right-2 h-[9px] w-[9px] border-t border-r border-ink/40 ${className}`}
      />
      <span
        aria-hidden="true"
        className={`absolute bottom-2 left-2 h-[9px] w-[9px] border-b border-l border-ink/40 ${className}`}
      />
    </>
  )
}
