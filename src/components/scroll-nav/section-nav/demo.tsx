// ui-48 — SectionNav
import { SectionNav } from "./SectionNav";

export default function SectionNavDemo() {
  return (
    <div className="ss-theme relative min-h-full">
      <SectionNav />
      <section id="hero" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Hero</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Hero section</h2>
      </section>
      <section id="gallery" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Gallery</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Gallery section</h2>
      </section>
      <section id="cards" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Cards</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Cards section</h2>
      </section>
      <section id="timeline" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Timeline</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Timeline section</h2>
      </section>
      <section id="split" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Reveal</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Reveal section</h2>
      </section>
      <section id="counters" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Stats</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Stats section</h2>
      </section>
      <section id="carousel" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Carousel</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Carousel section</h2>
      </section>
      <section id="bento" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Bento</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Bento section</h2>
      </section>
      <section id="faq" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">FAQ</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">FAQ section</h2>
      </section>
      <section id="cta" className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">CTA</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">CTA section</h2>
      </section>
    </div>
  );
}
