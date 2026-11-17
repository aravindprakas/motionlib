// ui-68 — AnimatedCounters
import { useEffect, useRef, useState } from "react";

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(value * eased));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="text-5xl font-semibold tracking-tight text-card-foreground sm:text-6xl">
        {count}
        {suffix}
      </div>
      <p className="mt-3 text-base text-muted-foreground">{label}</p>
    </div>
  );
}

const stats = [
  { label: "Components", value: 10, suffix: "" },
  { label: "Scroll interactions", value: 24, suffix: "" },
  { label: "Hours of refinement", value: 48, suffix: "+" },
];

export function AnimatedCounters() {
  return (
    <section id="counters" className="relative w-full bg-background py-32 md:py-40">
      <div className="absolute left-6 top-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          05 — Animated Counters
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Numbers that arrive
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Counting up only when the section comes into view.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatItem key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
