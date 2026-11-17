// ui-59 — Reveal & Blink
import { Reveal } from './Reveal';
import { Blink } from '../blink/Blink';

export default function RevealDemo() {
  return (
    <div className="px-10 pb-24">
      <section className="flex min-h-[50vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">reveal & blink</p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight">Enter, once, politely</h1>
        <Blink className="w-max font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">scroll to browse ↓</Blink>
      </section>
      {[0, 1, 2, 3].map((i) => (
        <section key={i} className="border-t border-ink py-20">
          <Reveal delay={i * 60}>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">block {String(i + 1).padStart(2, '0')}</p>
            <p className="mt-3 max-w-xl font-serif text-3xl italic leading-snug">
              Each block fades and slides up the first time it crosses the viewport — IntersectionObserver, one shot.
            </p>
          </Reveal>
        </section>
      ))}
    </div>
  );
}
