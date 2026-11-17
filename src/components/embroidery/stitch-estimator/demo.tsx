// StitchEstimator
import { StitchEstimator } from './StitchEstimator';

export default function StitchEstimatorDemo() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        double the width and the price roughly quadruples — here is why
      </p>
      <StitchEstimator />
    </div>
  );
}
