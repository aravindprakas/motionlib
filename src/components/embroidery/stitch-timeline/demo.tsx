// StitchTimeline
import { StitchTimeline } from './StitchTimeline';

export default function StitchTimelineDemo() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-md content-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        the axis is stitches — that is why the bloom takes so long
      </p>
      <StitchTimeline />
    </div>
  );
}
