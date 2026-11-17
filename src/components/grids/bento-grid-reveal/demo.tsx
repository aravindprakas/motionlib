// ui-79 — BentoGridReveal
import { BentoGridReveal } from "./BentoGridReveal";

export default function BentoGridRevealDemo() {
  return (
    <div className="ss-theme min-h-full">
      <section className="flex h-[70vh] flex-col items-center justify-center gap-3 bg-background text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Scroll Secrets</p>
        <p className="text-lg text-muted-foreground">Keep scrolling</p>
      </section>
      <BentoGridReveal />
      <section className="flex h-[60vh] items-center justify-center bg-background">
        <p className="text-base text-muted-foreground">Fin.</p>
      </section>
    </div>
  );
}
