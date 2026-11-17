export function Toast({ message }: { message: string }) {
  return (
    <div role="status" className="flex items-center gap-2.5 bg-ink px-[18px] py-[13px] font-mono text-[11px] tracking-[0.1em] text-paper">
      <span className="text-accent">●</span>
      {message}
    </div>
  )
}
