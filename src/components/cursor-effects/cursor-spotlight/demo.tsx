// ui-2 — CursorSpotlight
import { CursorSpotlight } from './CursorSpotlight';

export default function CursorSpotlightDemo() {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center p-8">
      <CursorSpotlight className="h-[70vh] w-full">
        <h4 className="text-[clamp(1.5rem,4vw,2.75rem)] font-semibold tracking-[-0.02em]">HOVER INSIDE</h4>
      </CursorSpotlight>
    </div>
  );
}
