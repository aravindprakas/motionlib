// ZoomLoupe
import { ZoomLoupe } from './ZoomLoupe';
import vitrum from '@/assets/projects/vitrum.jpg';

export default function ZoomLoupeDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        move across the shot — the lens tracks 1:1, no easing
      </p>
      <ZoomLoupe
        src={vitrum}
        alt="Product detail"
        caption="18oz canvas · 2.6× · bar-tacked stress points"
      />
    </div>
  );
}
