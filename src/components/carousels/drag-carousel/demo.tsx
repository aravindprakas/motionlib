// ui-17 — DragCarousel
import { DragCarousel } from './DragCarousel';

const SLIDES = [
  { n: '01', title: 'Pointer + touch drag' },
  { n: '02', title: 'Momentum & snap' },
  { n: '03', title: 'Accessible buttons' },
  { n: '04', title: 'Headless embla core' },
];

export default function DragCarouselDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">drag me — embla momentum + snap</p>
      <DragCarousel
        slides={SLIDES.map((s) => (
          <div key={s.n} className="p-5">
            <span className="font-serif text-4xl italic text-accent">{s.n}</span>
            <h4 className="mt-2 text-xl font-medium tracking-[-0.02em]">{s.title}</h4>
          </div>
        ))}
      />
    </section>
  );
}
