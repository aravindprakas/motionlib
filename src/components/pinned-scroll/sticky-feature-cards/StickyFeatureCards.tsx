// ui-38 — StickyFeatureCards
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef } from "react";
import { ArrowRight, Layers, Sparkles, Zap } from "lucide-react";


const cards = [
  {
    icon: Layers,
    title: "Stacked",
    description:
      "Information layers on top of itself, letting the user absorb one idea before the next arrives.",
    cta: "Explore layers",
  },
  {
    icon: Sparkles,
    title: "Deliberate",
    description:
      "Every movement is chosen. Nothing drifts without purpose. The scroll becomes the narrator.",
    cta: "See the details",
  },
  {
    icon: Zap,
    title: "Responsive",
    description:
      "Components react to position, not just clicks. The page listens to where the reader is looking.",
    cta: "Try it",
  },
];

export function StickyFeatureCards() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const cardsContainer = cardsRef.current;
    if (!section || !cardsContainer) return;

    const cardEls = cardsContainer.querySelectorAll(".feature-card");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller: scrollerRef?.current ?? undefined,
          start: "top top",
          end: `+=${cardEls.length * 100}%`,
          pin: true,
          scrub: 1,
        },
      });

      cardEls.forEach((card, index) => {
        if (index === 0) return;
        tl.fromTo(
          card,
          { y: "100vh", opacity: 0.5 },
          { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
          index - 1,
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="cards"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      <div className="absolute left-6 top-6 z-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          02 — Sticky Cards
        </p>
      </div>

      <div
        ref={cardsRef}
        className="relative mx-auto flex h-full max-w-4xl items-center justify-center px-6"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="feature-card absolute inset-x-6 top-1/2 mx-auto max-w-3xl -translate-y-1/2 rounded-3xl bg-card p-8 shadow-xl sm:p-12 md:p-16"
              style={{ zIndex: index + 1 }}
            >
              <div className="flex flex-col items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl md:text-5xl">
                  {card.title}
                </h2>
                <p className="max-w-xl text-lg leading-relaxed text-card-foreground/70">
                  {card.description}
                </p>
                <button className="group inline-flex items-center gap-2 text-base font-medium text-foreground transition-colors hover:text-accent">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
