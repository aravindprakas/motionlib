// ui-60 — ClipPathReveal
import { ClipPathReveal, type ClipRevealDirection } from './ClipPathReveal';

const DIRECTIONS: ClipRevealDirection[] = ['up', 'left', 'right'];

function Plate({ label }: { label: string }) {
  return (
    <div
      className="flex h-[46vh] items-end border border-ink bg-ink p-6"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(236,230,216,0.08) 0 16px, transparent 16px 32px)',
      }}
    >
      <span className="font-serif text-4xl italic text-paper">{label}</span>
    </div>
  );
}

export default function ClipPathRevealDemo() {
  return (
    <div className="px-10 pb-24">
      <section className="flex min-h-[50vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">clip-path wipe</p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight">Curtains, not fades</h1>
      </section>
      {DIRECTIONS.map((dir) => (
        <section key={dir} className="border-t border-ink py-24">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">direction: {dir}</p>
          <ClipPathReveal direction={dir}>
            <Plate label={`wipe ${dir}`} />
          </ClipPathReveal>
        </section>
      ))}
    </div>
  );
}
