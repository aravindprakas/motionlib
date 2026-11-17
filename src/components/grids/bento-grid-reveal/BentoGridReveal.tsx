// ui-79 — BentoGridReveal
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef } from "react";
import { BarChart3, Lock, Palette, Pointer, Type, Wind } from "lucide-react";


const tiles = [
  {
    icon: Palette,
    title: "Tokens",
    description: "Color, type, and spacing defined once and used everywhere.",
    span: "col-span-1 row-span-1 md:col-span-2",
  },
  {
    icon: Type,
    title: "Typography",
    description: "System fonts at generous sizes.",
    span: "col-span-1 row-span-1",
  },
  {
    icon: Wind,
    title: "Motion",
    description: "Every animation has a reason.",
    span: "col-span-1 row-span-1",
  },
  {
    icon: Pointer,
    title: "Interaction",
    description: "Hover, click, and scroll are first-class inputs.",
    span: "col-span-1 row-span-1 md:row-span-2",
  },
  {
    icon: Lock,
    title: "Accessible",
    description: "Focus states, reduced motion support, and semantic markup.",
    span: "col-span-1 row-span-1 md:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Performance",
    description: "GPU-friendly transforms and no layout thrashing.",
    span: "col-span-1 row-span-1",
  },
];

export function BentoGridReveal() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const ctx = gsap.context(() => {
      const tiles = grid.querySelectorAll(".bento-tile");
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            scroller: scrollerRef?.current ?? undefined,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="bento" ref={sectionRef} className="relative w-full bg-background py-32 md:py-40">
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          07 — Bento Grid
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            System in pieces
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A modular grid where each tile reveals itself as you scroll.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid auto-rows-[minmax(180px,auto)] gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.title}
                className={`bento-tile group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-accent/30 ${tile.span}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">{tile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-card-foreground/70">
                  {tile.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
