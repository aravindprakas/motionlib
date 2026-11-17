// ui-87 — ElasticRangeSlider
import { ElasticRangeSlider } from './ElasticRangeSlider';

export default function ElasticRangeSliderDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">drag — then keep dragging</p>

        <ElasticRangeSlider />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Pull past either end and the whole track stretches away with resistance, then twangs back on a bounce curve.
        </p>
      </div>
    </section>
  );
}
