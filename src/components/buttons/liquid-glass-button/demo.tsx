// ui-100 — LiquidGlassButton
import { LiquidGlassButton } from './LiquidGlassButton';

export default function LiquidGlassButtonDemo() {
  return (
    <section className="relative grid min-h-[calc(100vh-3.5rem)] place-items-center overflow-hidden px-8">
      {/* Backdrop for the glass to refract */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 30%, #ff4d23 0%, transparent 55%), radial-gradient(50% 50% at 75% 65%, #241a33 0%, #0b0a0d 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 38px, rgba(236,230,216,0.25) 38px 39px), repeating-linear-gradient(0deg, transparent 0 38px, rgba(236,230,216,0.25) 38px 39px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-bone/70">frosted refraction</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <LiquidGlassButton>Enter site →</LiquidGlassButton>
          <LiquidGlassButton strength={90} blur={4}>
            More liquid
          </LiquidGlassButton>
        </div>
        <p className="max-w-md font-serif text-lg italic text-bone/80">
          The grid behind the glass bends through an SVG turbulence + displacement filter.
        </p>
      </div>
    </section>
  );
}
