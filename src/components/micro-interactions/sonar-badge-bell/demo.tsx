// ui-96 — SonarBadgeBell
import { SonarBadgeBell } from './SonarBadgeBell';

export default function SonarBadgeBellDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">ring it · click the badge to clear</p>

        <SonarBadgeBell />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          A damped clapper swing, two sonar ripples, and a badge that rolls its count like a scoreboard. Clearing it is a tiny poof.
        </p>
      </div>
    </section>
  );
}
