// ui-39 — ParallaxLayers
import { ParallaxLayers } from './ParallaxLayers';

export default function ParallaxLayersDemo() {
  return (
    <div>
      <section className="grid min-h-[80vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — three depths, one scrub</p>
      </section>
      <ParallaxLayers className="mx-10 h-[52vh] border border-ink">
        <div
          data-depth="0.06"
          className="absolute -inset-y-[10%] inset-x-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 38px, rgba(12,11,14,0.14) 38px 39px)',
          }}
        />
        <div
          data-depth="0.16"
          className="absolute -inset-y-[16%] inset-x-0 flex items-center justify-center text-[clamp(3rem,10vw,7rem)] font-bold tracking-[-0.03em] mix-blend-multiply"
        >
          DEPTH
        </div>
        <div
          data-depth="0.34"
          className="absolute -inset-y-[34%] inset-x-0 flex items-center justify-center font-serif text-[clamp(4rem,14vw,10rem)] leading-none text-accent italic"
        >
          2.5D
        </div>
      </ParallaxLayers>
      <section className="grid min-h-[80vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
