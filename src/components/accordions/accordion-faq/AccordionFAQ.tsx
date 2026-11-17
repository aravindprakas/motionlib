// ui-111 — AccordionFAQ
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Why scroll-driven instead of auto-playing animations?",
    answer:
      "Scroll-driven animation hands control to the reader. The pace matches their attention, and nothing moves while they are not looking.",
  },
  {
    question: "How do you keep motion from becoming distracting?",
    answer:
      "By tying every movement to a meaningful change: a reveal, a transition, a state update. Decorative motion is removed.",
  },
  {
    question: "Does this work on mobile?",
    answer:
      "Yes. The same scroll triggers work on touch devices. Pinned sections are kept shorter, and horizontal scroll still responds to vertical swipe.",
  },
  {
    question: "What about accessibility?",
    answer:
      "We respect prefers-reduced-motion, keep focus outlines visible, and use semantic markup so the page is navigable without animation.",
  },
];

export function AccordionFAQ() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      [".faq-header", ".faq-accordion"].forEach((sel, i) => {
        gsap.fromTo(
          section.querySelector(sel),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
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
    <section id="faq" ref={sectionRef} className="relative w-full bg-background py-32 md:py-40">
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          08 — FAQ
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6">
        <div className="faq-header mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Answers that expand when asked.</p>
        </div>

        <div className="faq-accordion w-full">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={index} className="border-b border-border">
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg text-foreground transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-base leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
