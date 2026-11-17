// ui-75 — GenerativeMesh
import { useState, type ReactNode } from 'react';

interface Toggle {
  label: string;
  on: boolean;
  set: (v: boolean) => void;
}

function ToggleSwitch({ label, on, set }: Toggle) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-mono text-[10px] uppercase leading-tight tracking-widest text-ink/60">{label}</span>
      <button
        type="button"
        onClick={() => set(!on)}
        aria-pressed={on}
        aria-label={label}
        className={`flex h-6 w-12 items-center border p-1 transition-colors duration-300 ${
          on ? 'justify-end border-vermilion bg-vermilion' : 'justify-start border-ink/40 bg-ink/5'
        }`}
      >
        <span className={`h-4 w-4 transition-colors ${on ? 'bg-bone' : 'bg-ink'}`} />
      </button>
    </div>
  );
}

function Slider({ label, value, display, min, max, step = 1, onChange }: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between">
        <label className="font-mono text-[10px] uppercase tracking-widest text-ink/60">{label}</label>
        <span className="font-mono text-[10px] text-vermilion">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none bg-ink/15 accent-vermilion"
      />
    </div>
  );
}

/**
 * Interactive "simulation" playground: three sliders (viscosity, refractive
 * index, mesh density) and two toggles (gravity, auto-drape) drive a generated
 * SVG wireframe in real time — the mesh's wave amplitude, line frequency,
 * opacity and drape all recompute from the current parameter values.
 */
export function GenerativeMesh() {
  const [viscosity, setViscosity] = useState(82);
  const [refractiveIndex, setRefractiveIndex] = useState(1.42);
  const [meshDensity, setMeshDensity] = useState(64);
  const [gravity, setGravity] = useState(true);
  const [autoDrape, setAutoDrape] = useState(false);

  const renderMesh = () => {
    const lines: ReactNode[] = [];
    const step = Math.max(12, 100 - meshDensity);
    const waveAmp = (viscosity / 100) * 45;
    const yOffset = gravity ? 20 : -10;

    for (let i = 20; i <= 280; i += step) {
      lines.push(
        <path
          key={`v-${i}`}
          d={`M ${i} 40 Q ${i - waveAmp} ${150 + yOffset} ${i + waveAmp * 0.5} 320 T ${i} 360`}
          fill="none"
          stroke="#ff4d23"
          strokeWidth={autoDrape ? 2 : 1.2}
          strokeOpacity={Math.min(1, refractiveIndex - 0.5)}
          className={`transition-all duration-300 ${autoDrape ? 'animate-[pulse_1.5s_infinite]' : ''}`}
        />,
      );
    }
    const hStep = Math.max(20, 120 - meshDensity);
    for (let j = 60; j <= 340; j += hStep) {
      lines.push(
        <path
          key={`h-${j}`}
          d={`M 20 ${j} C 100 ${j - waveAmp * 0.5} 200 ${j + waveAmp + yOffset} 280 ${j}`}
          fill="none"
          stroke="#ff4d23"
          strokeWidth={0.8}
          strokeOpacity={Math.min(0.8, (refractiveIndex - 0.4) * 0.5)}
          strokeDasharray="4 4"
          className="transition-all duration-300"
        />,
      );
    }
    return lines;
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      {/* Controls */}
      <div className="flex flex-col gap-8 border border-ink bg-ink/[0.03] p-8">
        <Slider label="Viscosity Level" value={viscosity} display={`${viscosity}%`} min={0} max={100} onChange={setViscosity} />
        <Slider label="Refractive Index" value={refractiveIndex} display={refractiveIndex.toFixed(2)} min={1} max={2} step={0.01} onChange={setRefractiveIndex} />
        <Slider label="Mesh Density" value={meshDensity} display={`${meshDensity}%`} min={10} max={90} onChange={setMeshDensity} />
        <div className="mt-auto flex flex-col gap-6 border-t border-ink/15 pt-6">
          <ToggleSwitch label="Physics / Gravity" on={gravity} set={setGravity} />
          <ToggleSwitch label="Auto-Generate Drape" on={autoDrape} set={setAutoDrape} />
        </div>
      </div>

      {/* Render output */}
      <div className="flex flex-col justify-between border border-ink bg-ink p-8 text-bone">
        <div className="relative flex h-64 items-center justify-center overflow-hidden border border-bone/15">
          <svg width="300" height="400" viewBox="0 0 300 400" className={`h-full max-h-[220px] w-full transition-transform duration-1000 ${autoDrape ? 'scale-105' : 'scale-100'}`}>
            <g>{renderMesh()}</g>
          </svg>
          {autoDrape && <div className="pointer-events-none absolute inset-0 animate-[pulse_1.5s_infinite] border border-vermilion/40" />}
        </div>
        <div className="space-y-2 pt-6">
          <div className="h-1 bg-vermilion transition-all duration-500" style={{ opacity: refractiveIndex - 0.8 }} />
          <div className="h-1 bg-vermilion transition-all duration-700" style={{ width: `${meshDensity}%` }} />
          <div className="h-1 bg-vermilion transition-all duration-300" style={{ width: `${viscosity / 2}%` }} />
          <p className="pt-4 font-mono text-[10px] uppercase tracking-widest text-bone/60">
            {autoDrape ? 'System simulation active // draught computing…' : 'System stable // rendering assets…'}
          </p>
        </div>
      </div>
    </div>
  );
}
