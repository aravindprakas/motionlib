// BundleTally
import { BundleTally } from './BundleTally';
import aetheris from '@/assets/projects/aetheris.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import helios from '@/assets/projects/helios.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';

const items = [
  { name: 'Foundry Shell Parka', price: 18900, hex: '#ece6d8', src: aetheris, fixed: true },
  { name: 'Datum Merino Knit', price: 9200, hex: '#2f9e7f', src: meridian },
  { name: 'Margin Wool Scarf', price: 4100, hex: '#e8a23d', src: helios },
  { name: 'Vector 6-Panel Cap', price: 2400, hex: '#ff4d23', src: obsidian },
];

export default function BundleTallyDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        tick two add-ons — each one travels to the stack, then the total answers
      </p>
      <BundleTally items={items} />
    </div>
  );
}
