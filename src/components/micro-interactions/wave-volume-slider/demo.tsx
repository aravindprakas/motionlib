// ui-88 — WaveVolumeSlider
import { WaveVolumeSlider } from './WaveVolumeSlider';

export default function WaveVolumeSliderDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">turn it up</p>

        <WaveVolumeSlider />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          The filled track is a live sine wave — louder means taller, and the thumb surfs the crest. Drag to zero and the sea goes flat.
        </p>
      </div>
    </section>
  );
}
