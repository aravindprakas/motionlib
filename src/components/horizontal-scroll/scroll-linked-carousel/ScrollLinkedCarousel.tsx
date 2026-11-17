// ui-34 — ScrollLinkedCarousel
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScroller } from "@/lib/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useRef, useState } from "react";


const testimonials = [
  {
    quote:
      "The scroll behavior feels like the page is reading my mind. Every transition arrives exactly when I expect it.",
    author: "Elena M.",
    role: "Product Designer",
  },
  {
    quote:
      "Finally, a showcase that respects motion. Nothing is decorative; everything communicates.",
    author: "Sam K.",
    role: "Creative Director",
  },
  {
    quote:
      "I kept scrolling just to see what the next section would do. That is the definition of interactive design.",
    author: "Jordan P.",
    role: "Frontend Engineer",
  },
  {
    quote: "Minimal, warm, and precise. This is how I want every landing page to feel.",
    author: "Avery L.",
    role: "Founder",
  },
];

export function ScrollLinkedCarousel() {
  const scrollerRef = useScroller();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - (scrollerRef?.current?.clientWidth ?? window.innerWidth);

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scroller: scrollerRef?.current ?? undefined,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const index = Math.min(
              testimonials.length - 1,
              Math.floor(self.progress * testimonials.length),
            );
            setActive(index);
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="carousel"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-secondary"
    >
      <div className="absolute left-6 top-6 z-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          06 — Scroll Carousel
        </p>
      </div>

      <div ref={trackRef} className="flex h-full items-center gap-8 px-[15vw]">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="w-[70vw] flex-shrink-0 md:w-[50vw]">
            <blockquote className="rounded-3xl bg-background p-8 shadow-lg sm:p-12">
              <p className="text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
                "{testimonial.quote}"
              </p>
              <footer className="mt-8">
                <p className="text-base font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </footer>
            </blockquote>
          </div>
        ))}
      </div>

      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const section = sectionRef.current;
              if (!section) return;
              const scrollTop =
                section.offsetTop +
                (index / testimonials.length) * (section.scrollHeight - (scrollerRef?.current?.clientHeight ?? window.innerHeight));
              scrollerRef?.current?.scrollTo({ top: scrollTop, behavior: "smooth" });
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === index ? "w-8 bg-foreground" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
