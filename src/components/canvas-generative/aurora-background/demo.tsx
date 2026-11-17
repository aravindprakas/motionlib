// ui-69 — AuroraBackground
import { AuroraBackground } from './AuroraBackground';

export default function AuroraBackgroundDemo() {
  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ink text-bone">
      <AuroraBackground />

      <div className="relative z-10 grid min-h-[calc(100vh-3.5rem)] place-items-center px-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-bone/70">webgl · shader backdrop</p>
          <h2 className="max-w-3xl font-serif text-5xl italic md:text-7xl">Aurora</h2>
          <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.15em] text-bone/70">
            Domain-warped light with a breathing core. Three.js loads from a CDN; reduced-motion falls back to a static disc.
          </p>
        </div>
      </div>
    </section>
  );
}
