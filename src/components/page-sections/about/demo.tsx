import { About } from './About';

export default function AboutDemo() {
  return (
    <div>
      <section className="grid min-h-[70vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓</p>
      </section>
      <About />
      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
