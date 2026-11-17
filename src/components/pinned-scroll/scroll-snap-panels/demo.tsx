import { ScrollSnapPanels } from './ScrollSnapPanels';

const PANELS = [
  { content: <span className="font-serif text-6xl italic">Snap 01</span> },
  { content: <span className="font-serif text-6xl italic">Snap 02</span>, className: 'bg-ink text-paper' },
  { content: <span className="font-serif text-6xl italic">Snap 03</span>, className: 'bg-accent text-paper' },
];

export default function ScrollSnapPanelsDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">pure css — scroll inside the box</p>
      <ScrollSnapPanels panels={PANELS} height="55vh" />
      <p className="font-serif text-lg italic">scroll-snap-type: y mandatory. No JavaScript at all.</p>
    </section>
  );
}
