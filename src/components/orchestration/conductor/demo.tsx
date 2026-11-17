// Conductor — everything below runs off a single rAF loop
import { useRef, useState } from 'react';
import { Conductor, Pulse, usePulse } from './Conductor';

/** A readout that proves the clock is shared: it writes text, not state. */
function Readout() {
  const el = useRef<HTMLSpanElement>(null);
  usePulse(({ bar, beat, phase, bpm }) => {
    if (!el.current) return;
    el.current.textContent = `bar ${String(bar + 1).padStart(2, '0')} · beat ${
      (beat % 4) + 1
    } · ${phase.toFixed(2)} · ${Math.round(bpm)} bpm`;
  });
  return <span ref={el} className="font-mono text-[11px] uppercase tracking-[0.2em]" />;
}

const BARS = Array.from({ length: 16 }, (_, i) => i);

export default function ConductorDemo() {
  const [bpm, setBpm] = useState(88);
  const [running, setRunning] = useState(true);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-12 px-10">
      <Conductor bpm={bpm} running={running}>
        <div className="flex flex-wrap items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em]">one clock, many elements</p>
          <Readout />
        </div>

        {/* Four metronome dots, each a quarter-beat out of phase. */}
        <div className="flex items-end gap-4">
          {[0, 0.25, 0.5, 0.75].map((offset) => (
            <Pulse
              key={offset}
              offset={offset}
              shape="spike"
              className="h-16 w-16 border border-ink"
              style={{
                transform: 'scale(calc(0.72 + var(--pulse, 0) * 0.28))',
                backgroundColor: 'color-mix(in srgb, var(--color-vermilion) calc(var(--pulse, 0) * 100%), transparent)',
              }}
            />
          ))}
          <p className="ml-2 max-w-[16rem] font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
            same beat, four phase offsets — a stagger you can re-tune mid-flight
          </p>
        </div>

        {/* A wave across sixteen bars: phase offset by index, not by setTimeout. */}
        <div className="flex h-40 items-end gap-1.5">
          {BARS.map((i) => (
            <Pulse
              key={i}
              offset={i * 0.06}
              shape="sine"
              curve={2}
              className="w-full bg-ink"
              style={{ height: 'calc(12% + var(--pulse, 0) * 88%)' }}
            />
          ))}
        </div>

        {/* Half-tempo and double-tempo against the same beat. */}
        <div className="grid grid-cols-3 gap-4 border-t border-ink pt-8">
          {[
            { division: 0.5, label: 'half time' },
            { division: 1, label: 'on the beat' },
            { division: 2, label: 'double time' },
          ].map((d) => (
            <Pulse
              key={d.label}
              division={d.division}
              shape="triangle"
              className="border border-ink p-5"
              style={{ borderColor: 'color-mix(in srgb, var(--color-vermilion) calc(var(--pulse, 0) * 100%), var(--color-ink))' }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{d.label}</span>
              <div className="mt-3 h-1 bg-ink" style={{ transform: 'scaleX(var(--pulse, 0))', transformOrigin: 'left' }} />
            </Pulse>
          ))}
        </div>
      </Conductor>

      <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-8">
        <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          tempo
          <input
            type="range"
            min={30}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-56 accent-vermilion"
          />
          <span className="tabular-nums">{bpm} bpm</span>
        </label>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="cursor-pointer border border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
        >
          {running ? 'pause' : 'resume'}
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
          drag the tempo — nothing restarts, everything stays locked
        </p>
      </div>
    </section>
  );
}
