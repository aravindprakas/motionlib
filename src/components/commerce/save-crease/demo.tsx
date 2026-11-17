// SaveCrease
import { useState } from 'react';
import { SaveCrease } from './SaveCrease';
import aetheris from '@/assets/projects/aetheris.jpg';
import helios from '@/assets/projects/helios.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';

const grid = [
  { name: 'Foundry Parka', price: '₹18,900', src: aetheris },
  { name: 'Index Runner', price: '₹12,900', src: helios },
  { name: 'Manifest Tote', price: '₹7,400', src: obsidian },
  { name: 'Plinth Boot', price: '₹16,500', src: vitrum },
];

export default function SaveCreaseDemo() {
  const [saved, setSaved] = useState<string[]>(['Index Runner']);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        save one — then find it again without reading anything
      </p>
      <div className="grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
        {grid.map((g) => (
          <SaveCrease
            key={g.name}
            saved={saved.includes(g.name)}
            onToggle={(on) =>
              setSaved((s) => (on ? [...s, g.name] : s.filter((n) => n !== g.name)))
            }
          >
            <img src={g.src} alt={g.name} className="aspect-[3/4] w-full object-cover" />
            <div className="flex items-baseline justify-between gap-2 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em]">{g.name}</p>
              <p className="font-mono text-[10px]">{g.price}</p>
            </div>
          </SaveCrease>
        ))}
      </div>
    </div>
  );
}
