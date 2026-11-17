// ui-1 — CustomCursor
import { CustomCursor } from './CustomCursor';

export default function CustomCursorDemo() {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center p-8">
      <CustomCursor size={16} blend="difference" lerp={0.2} className="h-[70vh] w-full border border-ink/15">
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-2xl font-medium tracking-[-0.02em]">
            The dot lerps behind your pointer with <span className="italic text-accent">mix-blend-mode: difference</span>.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">hover the links to grow it</p>
          <div className="mt-2 flex gap-8">
            {['manifest', 'index', 'archive'].map((l) => (
              <a
                key={l}
                href="#"
                data-cursor
                onClick={(e) => e.preventDefault()}
                className="border-b border-ink pb-1 font-mono text-sm uppercase tracking-[0.1em]"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </CustomCursor>
    </div>
  );
}
