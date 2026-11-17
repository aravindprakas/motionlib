// ui-122 — Projects
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface Project {
  index: number;
  name: string;
  year: string;
  category: string;
  role: string;
  stack: string;
  status: string;
  description: string;
  cover: string;
  coverAlt: string;
}

export interface ProjectSectionProps {
  project: Project;
  /** Called when this chapter passes the activation threshold in view. */
  onActivate: (index: number) => void;
}

/**
 * One project "chapter": a 220vh section whose inner panel is pinned via
 * `sticky top-0`. The cover image drifts vertically across the sticky stage
 * for a parallax read, and the meta block reveals on entry.
 *
 * Fixes vs. the upstream original: the parallax handler and IntersectionObserver
 * bind to the ambient Lenis scroller (via useScroller) instead of the window —
 * window scroll never fires inside the library's scroll container — and reduced
 * motion is read through the shared hook so the drift is skipped cleanly.
 */
export function ProjectSection({ project, onActivate }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || typeof window === 'undefined') return;

    const scroller = scrollerRef?.current ?? null;
    const listenTarget: EventTarget = scroller ?? window;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            section.setAttribute('data-in-view', 'true');
            if (entry.intersectionRatio > 0.4) onActivate(project.index);
          }
        }
      },
      { root: scroller, threshold: [0, 0.4, 0.6] },
    );
    io.observe(section);

    let raf = 0;
    const onScroll = () => {
      if (reduced || !image) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = scroller ? scroller.clientHeight : window.innerHeight;
        const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
        const rect = section.getBoundingClientRect();
        // Progress through the sticky stage: 0 as the section enters, 1 as it leaves.
        const total = rect.height - vh;
        const traveled = Math.min(Math.max(viewTop - rect.top, 0), total);
        const t = total > 0 ? traveled / total : 0;
        // Subtle drift: the cover shifts ~120px across the stage while staying scaled.
        const shift = (t - 0.5) * 120;
        image.style.transform = `translate3d(0, ${shift}px, 0) scale(1.15)`;
      });
    };
    onScroll();
    listenTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      io.disconnect();
      listenTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [onActivate, project.index, reduced, scrollerRef]);

  const num = String(project.index + 1).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      id={`project-${num}`}
      data-in-view="false"
      className="relative h-[220vh] border-t border-bone/10"
      aria-label={`Project ${num}: ${project.name}`}
    >
      <div className="sticky top-0 flex h-screen w-full items-end overflow-hidden">
        {/* Parallax cover */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-bone/5">
          <img
            ref={imageRef}
            src={project.cover}
            alt={project.coverAlt}
            width={1920}
            height={1080}
            loading={project.index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0) scale(1.15)' }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20"
          />
        </div>

        {/* Chapter number, top-left */}
        <div className="absolute left-6 top-8 z-10 flex items-center gap-3 lg:left-24 lg:top-12">
          <span
            className="reveal-item font-mono text-xs text-bone/50"
            style={{ ['--reveal-delay' as string]: '200ms' }}
          >
            Chapter
          </span>
          <span
            className="reveal-item font-mono text-xs text-accent"
            style={{ ['--reveal-delay' as string]: '260ms' }}
          >
            {num} / 05
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 grid w-full grid-cols-12 gap-6 px-6 pb-16 lg:gap-8 lg:px-24 lg:pb-24">
          <div className="col-span-12 lg:col-span-8">
            <p
              className="reveal-item mb-4 font-mono text-xs uppercase tracking-[0.3em] text-accent"
              style={{ ['--reveal-delay' as string]: '300ms' }}
            >
              {project.year} — {project.category}
            </p>
            <h2
              className="reveal-item font-display uppercase leading-[0.85] tracking-tighter text-bone"
              style={{
                ['--reveal-delay' as string]: '400ms',
                fontSize: 'clamp(4rem, 11vw, 12rem)',
              }}
            >
              {project.name}
            </h2>
            <p
              className="reveal-item mt-6 max-w-xl text-pretty text-base leading-relaxed text-bone/80 lg:text-lg"
              style={{ ['--reveal-delay' as string]: '550ms' }}
            >
              {project.description}
            </p>
          </div>

          <div
            className="reveal-item col-span-12 flex flex-col gap-8 border-t border-bone/10 pt-8 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
            style={{ ['--reveal-delay' as string]: '700ms' }}
          >
            <MetaItem label="Role" value={project.role} />
            <MetaItem label="Stack" value={project.stack} />
            <MetaItem label="Status" value={project.status} />
            <a
              href={`#project-${num}`}
              className="group mt-2 inline-flex items-center gap-4"
              onClick={(e) => e.preventDefault()}
            >
              <span className="font-mono text-xs uppercase tracking-widest text-bone transition-colors group-hover:text-accent">
                View case study
              </span>
              <span
                aria-hidden
                className="h-px w-8 bg-bone transition-all duration-300 group-hover:w-16 group-hover:bg-accent"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-bone/50">
        {label}
      </span>
      <p className="text-sm text-bone">{value}</p>
    </div>
  );
}
