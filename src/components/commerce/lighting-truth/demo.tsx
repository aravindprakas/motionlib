// LightingTruth
import { LightingTruth } from './LightingTruth';
import meridian from '@/assets/projects/meridian.jpg';

export default function LightingTruthDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        check the colour under the light you'll actually be in
      </p>
      <LightingTruth src={meridian} alt="Product in daylight" />
    </div>
  );
}
