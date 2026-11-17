// ui-12 — CylinderCarousel
import { CylinderCarousel } from './CylinderCarousel';

export default function CylinderCarouselDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-6 py-16">
      <div className="w-full max-w-5xl">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
          04 / cylinder carousel · drag the ring
        </p>
        <CylinderCarousel />
      </div>
    </section>
  );
}
