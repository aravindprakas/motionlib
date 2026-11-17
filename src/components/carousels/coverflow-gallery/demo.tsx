// ui-19 — CoverflowGallery
import { CoverflowGallery, type CoverItem } from './CoverflowGallery';
import aetheris from '@/assets/projects/aetheris.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import meridian from '@/assets/projects/meridian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';
import helios from '@/assets/projects/helios.jpg';

const ITEMS: CoverItem[] = [
  { caption: 'The hearth at full burn', image: aetheris },
  { caption: 'Dining room, dusk', image: obsidian },
  { caption: 'Cinder duck, plated', image: meridian },
  { caption: 'The cellar wall', image: vitrum },
  { caption: 'Rooftop garden, June', image: helios },
];

export default function CoverflowGalleryDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-6 py-16">
      <div className="w-full max-w-4xl">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
          09 / coverflow · click a photo
        </p>
        <CoverflowGallery items={ITEMS} />
      </div>
    </section>
  );
}
