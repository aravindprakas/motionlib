// ui-113 — ThemeToggle
import { ThemeToggle } from './ThemeToggle';

export default function ThemeToggleDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">day / night</p>
        <ThemeToggle />
        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          A knob that slides between moon and sun — hard-edged, uncontrolled, with an optional document-class hook.
        </p>
      </div>
    </section>
  );
}
