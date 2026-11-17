// ui-43 — TokenSpectrum
import { TokenSpectrum } from './TokenSpectrum';

export default function TokenSpectrumDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="flex min-h-[40vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">32 / token spectrum</p>
        <p className="max-w-[46ch] font-serif text-2xl italic leading-snug text-navy-soft">
          The panel eases across every colour token as it scrolls — one continuous ramp, nothing
          off-system.
        </p>
      </section>

      <TokenSpectrum />

      <section className="grid min-h-[40vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">
          scroll back up to rewind the ramp
        </p>
      </section>
    </div>
  );
}
