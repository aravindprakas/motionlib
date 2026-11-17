// ui-124 — SpotlightPodium
import { SpotlightPodium, type Special } from './SpotlightPodium';
import meridian from '@/assets/projects/meridian.jpg';
import helios from '@/assets/projects/helios.jpg';
import obsidian from '@/assets/projects/obsidian.jpg';

const SPECIALS: [Special, Special, Special] = [
  { name: 'Charred Octopus', price: '26', blurb: "Galician octopus charred over white oak, with 'nduja butter and grilled bread. The chef's favourite thing on the menu this week.", image: meridian },
  { name: 'Bone Marrow Flatbread', price: '19', blurb: 'Hearth flatbread blistered to order, roasted marrow, pickled onion and parsley picked an hour before service.', image: helios },
  { name: 'Salt-Baked Celeriac', price: '22', blurb: 'A whole celeriac baked for four hours in a salt crust, carved tableside with brown butter and aged comté.', image: obsidian },
];

export default function SpotlightPodiumDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-6 py-16">
      <div className="w-full max-w-5xl">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
          08 / spotlight podium · click a pedestal
        </p>
        <SpotlightPodium specials={SPECIALS} />
      </div>
    </section>
  );
}
