// ui-119 — LoadingScreen
import { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';

export default function LoadingScreenDemo() {
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(true);

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {running && (
        <LoadingScreen
          key={runId}
          contained
          firstName="Motion"
          lastName="Library"
          onComplete={() => setRunning(false)}
        />
      )}

      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8 text-center">
        <div className="flex flex-col items-center gap-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em]">intro loader</p>
          <button
            type="button"
            onClick={() => {
              setRunId((n) => n + 1);
              setRunning(true);
            }}
            className="cursor-pointer border border-ink bg-vermilion px-10 py-5 font-display text-lg font-bold uppercase tracking-tight text-ink transition-colors hover:bg-vermilion-hover"
          >
            Replay loader
          </button>
          <p className="max-w-md font-serif text-lg italic">
            The wordmark auto-sizes to fill the panel width; the corner links scramble into place before it fades away.
          </p>
        </div>
      </div>
    </section>
  );
}
