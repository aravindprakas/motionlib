// ShelfLift
import { ShelfLift } from './ShelfLift';
import aetheris from '@/assets/projects/aetheris.jpg';
import helios from '@/assets/projects/helios.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';

const items = [
  { name: 'Foundry Parka', price: '₹18,900', hex: '#ece6d8', src: aetheris, meta: 'Outerwear · AW26' },
  { name: 'Index Runner', price: '₹12,900', hex: '#0c394a', src: helios, meta: 'Footwear · AW26' },
  { name: 'Manifest Tote', price: '₹7,400', hex: '#e8a23d', src: obsidian, meta: 'Bags · 24L' },
  { name: 'Datum Knit', price: '₹9,200', hex: '#2f9e7f', src: meridian, meta: 'Knitwear · Merino' },
  { name: 'Ledger Wallet', price: '₹3,900', hex: '#0c0b0e', src: vitrum, meta: 'Leather · Bifold' },
  { name: 'Vector Cap', price: '₹2,400', hex: '#ff4d23', src: helios, meta: 'Headwear · 6-panel' },
  { name: 'Plinth Boot', price: '₹16,500', hex: '#7b6cf6', src: obsidian, meta: 'Footwear · Goodyear' },
  { name: 'Margin Scarf', price: '₹4,100', hex: '#f4f1e8', src: aetheris, meta: 'Accessories · Wool' },
];

export default function ShelfLiftDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        move across the grid — cards answer before you reach them
      </p>
      <ShelfLift items={items} />
    </div>
  );
}
