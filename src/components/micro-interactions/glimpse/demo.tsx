// ui-97 — Glimpse
import { Glimpse } from './Glimpse';

export default function GlimpseDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">hover a link — peek before you leap</p>

        <p className="max-w-xl text-left font-serif text-xl leading-relaxed">
          Built on the shoulders of{' '}
          <Glimpse href="https://github.com/framer/motion">Framer Motion</Glimpse>{' '}
          and{' '}
          <Glimpse href="https://gsap.com">GSAP</Glimpse>, this library leans on{' '}
          <Glimpse href="https://tailwindcss.com">Tailwind CSS</Glimpse> for its
          brutalist skin and{' '}
          <Glimpse href="https://vitejs.dev">Vite</Glimpse> for the dev loop. Each
          preview is fetched live the first time you hover, then cached.
        </p>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic text-ink/70">
          A hand-rolled hover-card on framer-motion; OpenGraph data pulled at
          runtime through a CORS-friendly metadata API, since the browser can't
          scrape cross-origin pages itself.
        </p>
      </div>
    </section>
  );
}
