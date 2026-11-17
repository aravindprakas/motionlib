// ui-50 — ScrollTimeline
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef } from "react";


const milestones = [
  {
    year: "2021",
    title: "The first idea",
    description: "A simple sketch of what scroll-driven design could feel like.",
  },
  {
    year: "2022",
    title: "Prototype",
    description: "Motion tied to progress, not timers. Components that listen instead of shout.",
  },
  {
    year: "2023",
    title: "Refinement",
    description: "Removing every animation that did not serve the content.",
  },
  {
    year: "2024",
    title: "Collection",
    description: "Ten components, each with its own scroll language, assembled into one page.",
  },
];

export function ScrollTimeline() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scroller: scrollerRef?.current ?? undefined,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 1,
          },
        },
      );

      const items = section.querySelectorAll(".timeline-item");
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              scroller: scrollerRef?.current ?? undefined,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative w-full bg-background py-32 md:py-40"
    >
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          03 — Timeline
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            A quiet history
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Progress measured in milestones, not noise.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <div
            ref={lineRef}
            className="absolute left-4 top-0 h-full w-px origin-top bg-accent md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-16">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`timeline-item relative flex items-center gap-8 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="flex-1 pl-12 md:px-20 md:text-center">
                  <div
                    className={`mx-auto ${index % 2 === 0 ? "md:ml-auto md:mr-12" : "md:mr-auto md:ml-12"} max-w-xs`}
                  >
                    <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                      {milestone.year}
                    </span>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                      {milestone.title}
                    </h3>
                    <p className="mt-2 text-base text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-4 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent md:left-1/2" />
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
