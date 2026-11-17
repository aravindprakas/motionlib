// ui-32 — HorizontalScrollGallery
import { HorizontalScrollGallery } from './HorizontalScrollGallery';

const TITLES = ['Vertical → horizontal', 'Pinned translate', 'Snap on touch', 'No jank', 'Transform only', 'Lift & reuse'];

const PANELS = TITLES.map((t, i) => (
  <div
    key={t}
    className="flex h-[min(60vh,460px)] w-[clamp(240px,30vw,380px)] flex-col justify-between border border-ink bg-bone p-6"
  >
    <span className="font-serif text-5xl italic text-accent">{String(i + 1).padStart(2, '0')}</span>
    <h4 className="font-display text-2xl font-bold uppercase tracking-tight">{t}</h4>
  </div>
));

export default function HorizontalScrollGalleryDemo() {
  return (
    <div>
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">pinned horizontal</p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight">Scroll down. Travel right.</h1>
      </section>
      <HorizontalScrollGallery panels={PANELS} className="border-y border-ink" />
      <section className="grid min-h-[50vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
