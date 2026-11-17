// ui-62 — SplitRevealSection
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef } from "react";


export function SplitRevealSection() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            scroller: scrollerRef?.current ?? undefined,
            start: "top 70%",
            end: "top 20%",
            scrub: 1,
          },
        },
      );

      const lines = textRef.current?.querySelectorAll(".reveal-line");
      if (lines) {
        gsap.fromTo(
          lines,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              scroller: scrollerRef?.current ?? undefined,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="split"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background py-24 md:py-32"
    >
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          04 — Split Reveal
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
        <div
          ref={imageRef}
          className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-muted"
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-accent/20" />
              <p className="mt-4 text-sm text-muted-foreground">Revealed on scroll</p>
            </div>
          </div>
        </div>

        <div ref={textRef} className="max-w-xl">
          <p className="reveal-line text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Controlled disclosure
          </p>
          <h2 className="reveal-line mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Show only what the moment asks for.
          </h2>
          <p className="reveal-line mt-6 text-lg leading-relaxed text-muted-foreground">
            A split-screen layout lets the image and the words arrive on different schedules. The
            eye travels, then the mind catches up. The scroll sets the rhythm.
          </p>
          <p className="reveal-line mt-4 text-lg leading-relaxed text-muted-foreground">
            This is the opposite of an instant reveal. It builds patience into the interface.
          </p>
        </div>
      </div>
    </section>
  );
}
