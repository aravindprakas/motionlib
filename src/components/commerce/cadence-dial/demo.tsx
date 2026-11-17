// CadenceDial
import { CadenceDial } from './CadenceDial';

export default function CadenceDialDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        turn it — the calendar answers while you're still choosing
      </p>
      <CadenceDial />
    </div>
  );
}
