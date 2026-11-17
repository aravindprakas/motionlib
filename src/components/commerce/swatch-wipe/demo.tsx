// SwatchWipe
import { SwatchWipe } from './SwatchWipe';
import aetheris from '@/assets/projects/aetheris.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import helios from '@/assets/projects/helios.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';

const colorways = [
  { label: 'Bone / Vermilion', hex: '#ece6d8', src: aetheris },
  { label: 'Ink', hex: '#0c0b0e', src: obsidian },
  { label: 'Moss', hex: '#2f9e7f', src: meridian },
  { label: 'Gold', hex: '#e8a23d', src: helios },
  { label: 'Navy', hex: '#0c394a', src: vitrum },
];

export default function SwatchWipeDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em]">
          press a chip — the shot wipes in from that chip
        </p>
        <p className="mb-8 max-w-md text-sm text-ink/60">
          Foundry Shell Parka · AR-OUT-0042 · ₹18,900
        </p>
        <SwatchWipe colorways={colorways} />
      </div>
    </div>
  );
}
