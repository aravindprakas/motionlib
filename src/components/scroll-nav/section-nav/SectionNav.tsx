// ui-48 — SectionNav
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useEffect, useState } from "react";


const sections = [
  { id: "hero", label: "Hero" },
  { id: "gallery", label: "Gallery" },
  { id: "cards", label: "Cards" },
  { id: "timeline", label: "Timeline" },
  { id: "split", label: "Reveal" },
  { id: "counters", label: "Stats" },
  { id: "carousel", label: "Carousel" },
  { id: "bento", label: "Bento" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "CTA" },
];

export function SectionNav() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const handleClick = (index: number) => {
      const target = document.getElementById(sections[index]?.id ?? "");
      if (target) {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
    };
    (window as unknown as { __sectionNavClick?: (i: number) => void }).__sectionNavClick =
      handleClick;
  }, []);

  useGSAP(() => {
    if (reduced) return;
    const triggers = sections.map((section, index) => {
      return ScrollTrigger.create({
        trigger: `#${section.id}`,
        scroller: scrollerRef?.current ?? undefined,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => {
            const target = document.getElementById(section.id);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="group relative flex items-center justify-end gap-3 outline-none"
          aria-label={`Scroll to ${section.label}`}
        >
          <span className="text-xs font-medium text-foreground/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100">
            {section.label}
          </span>
          <span
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              active === index
                ? "bg-foreground scale-125"
                : "bg-foreground/25 hover:bg-foreground/50"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
