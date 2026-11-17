// ui-112 — CornerMarks
import { CornerMarks } from './CornerMarks';

export default function CornerMarksDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">specimen crop marks</p>
        <div className="relative flex h-72 w-96 items-center justify-center border border-ink/15">
          <CornerMarks />
          <span className="font-serif text-4xl italic text-ink/40">FIG. 01</span>
        </div>
        <p className="max-w-sm text-center font-serif text-lg italic">
          Decorative corners dropped over any relative container — see them in the wild on SpecimenCard.
        </p>
      </div>
    </section>
  );
}
