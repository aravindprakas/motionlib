// ui-55 — SvgDraw
import { SvgDraw } from './SvgDraw';

export default function SvgDrawDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-ink px-8 text-bone">
      <div className="flex flex-col items-center gap-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60">stroke draw · on view</p>

        <SvgDraw className="text-bone" />

        <p className="max-w-md border-t border-bone/30 pt-6 font-serif text-lg italic text-bone/80">
          Each glyph is one path, drawn on by animating its dash offset from full length to zero.
        </p>
      </div>
    </section>
  );
}
