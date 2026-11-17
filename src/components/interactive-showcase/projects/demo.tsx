// ui-122 — Projects
import { useCallback, useEffect, useState } from 'react';
import { useScroller } from '@/lib/SmoothScroll';
import { ProgressRail } from './ProgressRail';
import { ProjectSection, type Project } from './ProjectSection';

import aetheris from '@/assets/projects/aetheris.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import helios from '@/assets/projects/helios.jpg';

const PROJECTS: Project[] = [
  {
    index: 0,
    name: 'AETHERIS',
    year: '2026',
    category: 'Infrastructure',
    role: 'Lead Systems Architect',
    stack: 'WebGL · Rust · GLSL',
    status: 'In Deployment',
    description:
      'A distributed rendering substrate for real-time simulation of atmospheric physics. Compiled to metal, wielded through the browser.',
    cover: aetheris,
    coverAlt: 'A brutalist concrete monolith emerging from thick fog.',
  },
  {
    index: 1,
    name: 'OBSIDIAN',
    year: '2025',
    category: 'Intelligence',
    role: 'Creative Director',
    stack: 'Next.js · PyTorch · GSAP',
    status: 'Live',
    description:
      'An editorial platform where large language models argue with themselves in public. Long-form debate, rendered as living manuscript.',
    cover: obsidian,
    coverAlt: 'A dark obsidian sculpture standing in a desert at dusk.',
  },
  {
    index: 2,
    name: 'VITRUM',
    year: '2025',
    category: 'Commerce',
    role: 'Interactive Designer',
    stack: 'Three.js · React · Node',
    status: 'Live',
    description:
      'A commerce surface for architectural glass. Every product page is a physically-based simulation you can rotate under the storm.',
    cover: vitrum,
    coverAlt: 'A modern glass skyscraper reflecting dark stormy clouds.',
  },
  {
    index: 3,
    name: 'MERIDIAN',
    year: '2024',
    category: 'Cartography',
    role: 'Product Lead',
    stack: 'Mapbox · Deck.gl · Go',
    status: 'Shipped',
    description:
      'Terrain intelligence for expedition planning. Multi-layer topography, red-line routing, satellite overlays synced to weather feeds.',
    cover: meridian,
    coverAlt: 'Topographic contour lines lit by thin red laser beams.',
  },
  {
    index: 4,
    name: 'HELIOS',
    year: '2024',
    category: 'Energy',
    role: 'Systems Designer',
    stack: 'Rust · WASM · D3',
    status: 'Archived',
    description:
      'A monitoring console for concentrated solar farms. Fifty thousand mirrors, tracked at millisecond granularity, made legible at a glance.',
    cover: helios,
    coverAlt: 'A vast array of solar mirrors reflecting the dawn sun.',
  },
];

export default function ProjectsDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const scrollerRef = useScroller();

  // Overall scroll progress, read from the ambient Lenis scroller (falls back
  // to the window when the component is used outside SmoothScroll).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scroller = scrollerRef?.current ?? null;
    const listenTarget: EventTarget = scroller ?? window;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (scroller) {
          const max = scroller.scrollHeight - scroller.clientHeight;
          setProgress(max > 0 ? scroller.scrollTop / max : 0);
        } else {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(max > 0 ? window.scrollY / max : 0);
        }
      });
    };
    update();
    listenTarget.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      listenTarget.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, [scrollerRef]);

  const handleActivate = useCallback((i: number) => setActiveIndex(i), []);

  return (
    <main className="relative bg-ink text-bone">
      <ProgressRail count={PROJECTS.length} activeIndex={activeIndex} progress={progress} />

      {/* Top identity bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-6 mix-blend-difference lg:px-12">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-bone">
          Monolith / Studio
        </span>
        <span className="hidden font-mono text-xs uppercase tracking-[0.25em] text-bone md:inline">
          Index 2026
        </span>
      </div>

      {/* Hero */}
      <header className="relative flex min-h-screen flex-col justify-center px-6 pb-24 pt-32 lg:px-24">
        <div className="max-w-6xl">
          <p
            className="mb-8 font-mono text-xs uppercase tracking-[0.35em] text-accent"
            style={{ animation: 'reveal-up 0.9s var(--ease-out-expo) both' }}
          >
            Selected Works 2020 — 2026
          </p>
          <h1
            className="text-balance font-display uppercase leading-[0.82] tracking-tighter text-bone"
            style={{
              fontSize: 'clamp(4.5rem, 13vw, 15rem)',
              animation: 'reveal-up 1s var(--ease-out-expo) 80ms both',
            }}
          >
            Chronicles
            <br />
            <span className="text-bone/40">of Form</span>
          </h1>
        </div>
        <div
          className="mt-14 max-w-xl"
          style={{ animation: 'reveal-up 0.9s var(--ease-out-expo) 260ms both' }}
        >
          <p className="text-pretty text-lg leading-relaxed text-bone/60 lg:text-xl">
            A digital monograph documenting five architectural responses to digital entropy.
            Each project a testament to the weight of pixels and the gravity of code.
          </p>
        </div>

        <div
          className="absolute bottom-10 left-6 flex items-center gap-3 lg:left-24"
          style={{ animation: 'soft-bounce 2.4s ease-in-out 1.2s infinite' }}
        >
          <span className="h-6 w-px bg-bone/30" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
            Scroll to explore
          </span>
        </div>
      </header>

      {/* Project chapters */}
      {PROJECTS.map((p) => (
        <ProjectSection key={p.name} project={p} onActivate={handleActivate} />
      ))}

      {/* Closing panel (inverted) */}
      <footer className="relative z-10 flex min-h-screen flex-col justify-between border-t border-bone/10 bg-bone p-6 text-ink lg:p-24">
        <div className="max-w-5xl">
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.3em] opacity-50">Colophon</p>
          <h3
            className="text-balance font-display uppercase leading-[0.85] tracking-tighter"
            style={{ fontSize: 'clamp(3rem, 9vw, 10rem)' }}
          >
            Let&apos;s build
            <br />
            the next monument.
          </h3>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-50">
                General Inquiries
              </p>
              <a
                href="#project-01"
                onClick={(e) => e.preventDefault()}
                className="text-2xl font-semibold transition-colors hover:text-accent lg:text-3xl"
              >
                hello@monolith.studio
              </a>
            </div>
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-50">
                New Business
              </p>
              <a
                href="#project-01"
                onClick={(e) => e.preventDefault()}
                className="text-2xl font-semibold transition-colors hover:text-accent lg:text-3xl"
              >
                Request the deck →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-ink/10 pt-8 font-mono text-[10px] uppercase tracking-widest md:flex-row md:items-end">
          <span className="opacity-40">© 2026 Monolith Studio · All rights reserved</span>
          <div className="flex gap-8">
            <span className="opacity-60">Instagram</span>
            <span className="opacity-60">LinkedIn</span>
            <span className="opacity-60">Are.na</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
