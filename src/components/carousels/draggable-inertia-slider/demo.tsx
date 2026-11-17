// ui-16 — DraggableInertiaSlider
import { DraggableInertiaSlider } from './DraggableInertiaSlider';

const ITEMS = ['Drift', 'Momentum', 'Decay', 'Wrap', 'Loop', 'Snap'].map((t, i) => (
  <div
    key={t}
    className="flex h-56 w-64 flex-col justify-between border border-ink bg-bone p-5"
  >
    <span className="font-mono text-xs text-ink/50">{String(i + 1).padStart(2, '0')} / 06</span>
    <h4 className="font-display text-2xl font-bold uppercase tracking-tight">{t}</h4>
  </div>
));

export default function DraggableInertiaSliderDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10">
      <p className="px-10 font-mono text-xs uppercase tracking-[0.3em]">grab & fling — hand-rolled inertia, infinite wrap</p>
      <DraggableInertiaSlider items={ITEMS} gap={16} className="border-y border-ink py-8" />
      <p className="px-10 font-mono text-xs uppercase tracking-[0.3em] text-ink/50">with snap:</p>
      <DraggableInertiaSlider items={ITEMS} gap={16} snap className="border-y border-ink py-8" />
    </div>
  );
}
