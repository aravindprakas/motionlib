// ui-68 — AnimatedCounters
import { AnimatedCounters } from "./AnimatedCounters";

export default function AnimatedCountersDemo() {
  return (
    <div className="ss-theme min-h-full">
      <section className="flex h-[70vh] flex-col items-center justify-center gap-3 bg-background text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Scroll Secrets</p>
        <p className="text-lg text-muted-foreground">Keep scrolling</p>
      </section>
      <AnimatedCounters />
      <section className="flex h-[60vh] items-center justify-center bg-background">
        <p className="text-base text-muted-foreground">Fin.</p>
      </section>
    </div>
  );
}
