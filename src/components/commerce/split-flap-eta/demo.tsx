// SplitFlapETA
import { SplitFlapETA } from './SplitFlapETA';

export default function SplitFlapETADemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        enter any 6 digits — the date resolves, it doesn't just appear
      </p>
      <SplitFlapETA />
    </div>
  );
}
