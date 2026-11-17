// SpecPins
import { SpecPins } from './SpecPins';
import obsidian from '@/assets/projects/obsidian.jpg';

const pins = [
  { x: 30, y: 20, label: 'Storm flap', detail: 'Full-length, press-studded every 90mm.' },
  { x: 68, y: 38, label: 'Bar tack', detail: 'Every pocket mouth, 42 stitches.' },
  { x: 24, y: 58, label: 'Cupro lining', detail: 'Bemberg, seam-bound rather than overlocked.' },
  { x: 60, y: 78, label: 'Hem draw', detail: 'Internal cord, cord-lock hidden in the seam.' },
];

export default function SpecPinsDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        every claim anchored to the millimetre it refers to
      </p>
      <SpecPins src={obsidian} alt="Foundry Shell Parka" pins={pins} />
    </div>
  );
}
