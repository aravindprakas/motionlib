// LightRays
import { LightRays } from './LightRays';

export default function LightRaysDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10 py-16">
      <section className="relative h-[420px] w-full overflow-hidden border border-bone/20 bg-ink">
        <LightRays />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-bone">
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-bone/60">Ambient glow</span>
          <h1 className="font-display text-5xl font-bold">Light Rays</h1>
          <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.15em] text-bone/70">
            Drop it into any relative container — it fills the space with softly animated light
            shining in from above.
          </p>
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section className="relative h-[300px] overflow-hidden border border-bone/20 bg-navy-900">
          <LightRays
            color={['#e8a23d', '#ff5a3c', '#e8a23d']}
            rays={22}
            spread={80}
            intensity={0.28}
            blur={20}
            speed={0.7}
          />
          <div className="relative z-10 flex h-full items-end p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cream/70">
              warm ramp · 22 rays · spread 80
            </p>
          </div>
        </section>

        <section className="relative h-[300px] overflow-hidden border border-bone/20 bg-ink">
          <LightRays
            color="#7b6cf6"
            origin={[1.1, 0.5]}
            angle={175}
            spread={40}
            rays={10}
            length={1.4}
            intensity={0.3}
            speed={1.6}
          />
          <div className="relative z-10 flex h-full items-end p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone/70">
              side source · angle 175 · fast
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
