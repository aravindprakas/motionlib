// ui-40 — ParallaxHeader
import { ParallaxHeader } from './ParallaxHeader';

export default function ParallaxHeaderDemo() {
  return (
    <div>
      <ParallaxHeader wordOne="Motion" wordTwo="Lib" />
      <section className="grid min-h-[120vh] place-items-center border-t border-ink bg-bone">
        <div className="max-w-md text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em]">keep scrolling</p>
          <p className="mt-4 font-serif text-2xl italic">
            The wordmark parallaxes up and the backdrop fades as the page content slides over the sticky header.
          </p>
        </div>
      </section>
    </div>
  );
}
