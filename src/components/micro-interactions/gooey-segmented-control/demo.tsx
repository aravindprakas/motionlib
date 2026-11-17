// ui-94 — GooeySegmentedControl
import { GooeySegmentedControl } from './GooeySegmentedControl';

export default function GooeySegmentedControlDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">switch segments — jump far</p>

        <GooeySegmentedControl />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Two springs, one goo filter: the fast blob leads, the lazy one trails, and the filter fuses them into stretching mercury.
        </p>
      </div>
    </section>
  );
}
