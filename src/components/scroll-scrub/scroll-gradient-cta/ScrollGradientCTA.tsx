// ui-45 — ScrollGradientCTA
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";


export function ScrollGradientCTA() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector(".cta-content"),
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            scroller: scrollerRef?.current ?? undefined,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.to(section, {
        backgroundPosition: "100% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scroller: scrollerRef?.current ?? undefined,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-secondary"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.957 0.012 79.784) 0%, oklch(0.92 0.05 85) 50%, oklch(0.9 0.08 80) 100%)",
        backgroundSize: "200% 200%",
        backgroundPosition: "0% 0%",
      }}
    >
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          09 — CTA
        </p>
      </div>

      <div className="cta-content mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Start building with intention.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Scroll-based design is not about effects. It is about giving the reader control over the
          pace of discovery.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-4 text-base font-medium text-primary-foreground transition-transform duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-secondary"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          >
            <span className="relative z-10">Get the components</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="story-link text-base font-medium text-foreground"
          >
            Back to top
          </a>
        </div>
      </div>
    </section>
  );
}
