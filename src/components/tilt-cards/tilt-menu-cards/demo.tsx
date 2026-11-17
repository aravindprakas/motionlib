// ui-11 — TiltMenuCards
import { TiltMenuCards, type TiltDish } from './TiltMenuCards';
import aetheris from '@/assets/projects/aetheris.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';
import vitrum from '@/assets/projects/vitrum.jpg';

const DISHES: TiltDish[] = [
  { name: 'Ember Beets', sub: 'Coal-roasted beets, smoked yogurt, dill oil, rye crumble.', price: '14', tag: 'Starter', image: aetheris },
  { name: 'Cinder Duck', sub: 'Dry-aged breast, charred plum, black garlic jus.', price: '34', tag: 'Main', image: obsidian },
  { name: 'Burnt Honey Tart', sub: 'Caramelised honey custard, bee pollen, crème fraîche.', price: '12', tag: 'Dessert', image: vitrum },
];

export default function TiltMenuCardsDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-6 py-16">
      <div className="w-full max-w-5xl">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
          02 / tilt cards
        </p>
        <TiltMenuCards dishes={DISHES} />
      </div>
    </section>
  );
}
