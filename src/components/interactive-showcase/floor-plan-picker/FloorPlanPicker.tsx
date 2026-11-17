// ui-123 — FloorPlanPicker
import { useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface FloorTable {
  id: string;
  /** Position on the floor, as a percentage (0–100). */
  x: number;
  y: number;
  /** Table-top size in px. */
  size: number;
  shape: 'round' | 'square';
  seats: number;
  reserved?: boolean;
}

export interface FloorPlanPickerProps {
  /** Tables laid out on the floor. */
  tables?: FloorTable[];
  /** Reservation slots offered once a table is picked. */
  times?: string[];
  className?: string;
}

const DEFAULT_TABLES: FloorTable[] = [
  { id: 'T1', x: 12, y: 16, size: 56, shape: 'round', seats: 2 },
  { id: 'T2', x: 30, y: 12, size: 56, shape: 'round', seats: 2, reserved: true },
  { id: 'T3', x: 52, y: 16, size: 72, shape: 'square', seats: 4 },
  { id: 'T4', x: 78, y: 20, size: 76, shape: 'round', seats: 4 },
  { id: 'T5', x: 14, y: 54, size: 72, shape: 'square', seats: 4, reserved: true },
  { id: 'T6', x: 38, y: 60, size: 56, shape: 'round', seats: 2 },
  { id: 'T7', x: 64, y: 56, size: 96, shape: 'round', seats: 6 },
  { id: 'T8', x: 86, y: 64, size: 56, shape: 'round', seats: 2 },
];

const DEFAULT_TIMES = ['5:30', '6:15', '7:00', '7:45', '8:30', '9:15'];

const FLOOR_BG =
  'linear-gradient(rgba(236,230,216,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(236,230,216,0.12) 1px, transparent 1px)';

/**
 * The dining room as a tilted 3D floor plan. Free tables lift on hover; pick
 * one, choose a time, and confirm. Reserved tables are dimmed and inert.
 * Table-top labels counter-rotate against the 55° floor tilt to face the camera.
 *
 * Reduced motion: table lifts are instant (no tween).
 */
export function FloorPlanPicker({
  tables = DEFAULT_TABLES,
  times = DEFAULT_TIMES,
  className = '',
}: FloorPlanPickerProps) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<FloorTable | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ table: FloorTable; time: string } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const pick = (t: FloorTable) => {
    if (t.reserved) return;
    setConfirmed(null);
    setSelected(selected && selected.id === t.id ? null : t);
  };
  const reserve = () => {
    if (!selected || !time) return;
    setConfirmed({ table: selected, time });
    setSelected(null);
    setTime(null);
  };

  return (
    <div className={`grid items-center gap-10 md:grid-cols-[1fr_300px] ${className}`}>
      <div className="grid h-[460px] place-items-center" style={{ perspective: '1300px' }}>
        <div
          className="relative h-[400px] w-[620px] border border-ink bg-ink"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg)',
            backgroundImage: FLOOR_BG,
            backgroundSize: '40px 40px, 40px 40px',
          }}
        >
          <span className="absolute left-3 top-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">Window</span>
          <span className="absolute bottom-1.5 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">Hearth</span>
          <span className="absolute right-3 top-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/45">Bar</span>

          {tables.map((t) => {
            const isSelected = selected?.id === t.id;
            const isHovered = hovered === t.id && !t.reserved && !isSelected;
            const z = isSelected ? 46 : isHovered ? 42 : 26;
            const bg = isSelected ? 'bg-vermilion' : t.reserved ? 'bg-bone/30' : 'bg-bone';
            return (
              <div
                key={t.id}
                className={`absolute ${t.reserved ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ left: `${t.x}%`, top: `${t.y}%`, transformStyle: 'preserve-3d' }}
                onClick={() => pick(t)}
                onPointerEnter={() => setHovered(t.id)}
                onPointerLeave={() => setHovered((h) => (h === t.id ? null : h))}
              >
                <div
                  className={`grid place-items-center border border-ink ${bg}`}
                  style={{
                    width: t.size,
                    height: t.size,
                    borderRadius: t.shape === 'round' ? '50%' : '0',
                    transform: `translateZ(${z}px)`,
                    transition: reduced ? 'none' : 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  <span
                    className={`font-mono text-xs ${t.reserved ? 'text-ink/45' : 'text-ink'}`}
                    style={{ transform: 'rotateX(-55deg) translateY(-4px)' }}
                  >
                    {t.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-display text-3xl font-medium text-ink">
          {selected ? `Table ${selected.id}` : 'Pick a table'}
        </h3>
        <p className="mb-5 text-[13.5px] leading-snug text-ink/60">
          {selected
            ? `Seats ${selected.seats} · ${
                selected.seats > 4 ? "chef's counter view" : selected.y < 40 ? 'by the window' : 'near the hearth'
              }. Choose a time below.`
            : 'Tap any free table on the floor. Greyed tables are already spoken for tonight.'}
        </p>

        {selected && (
          <div className="mb-6 flex flex-wrap gap-2">
            {times.map((tm) => (
              <button
                key={tm}
                type="button"
                onClick={() => setTime(tm)}
                className={`border px-3.5 py-2 text-[12.5px] transition-colors ${
                  time === tm ? 'border-vermilion bg-vermilion text-ink' : 'border-ink text-ink hover:border-vermilion'
                }`}
              >
                {tm}
              </button>
            ))}
          </div>
        )}

        {confirmed ? (
          <div className="border border-vermilion bg-vermilion/10 p-[18px] text-sm leading-snug text-ink">
            <strong className="font-display text-lg font-medium">Confirmed.</strong>
            <br />
            Table {confirmed.table.id} for {confirmed.table.seats}, tonight at {confirmed.time}. We'll hold it for
            fifteen minutes.
          </div>
        ) : (
          <button
            type="button"
            disabled={!selected || !time}
            onClick={reserve}
            className="w-full border border-vermilion bg-vermilion p-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
          >
            Reserve table
          </button>
        )}

        <div className="mt-5 flex gap-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 border border-ink bg-bone" style={{ borderRadius: '50%' }} />
            Free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 bg-vermilion" style={{ borderRadius: '50%' }} />
            Selected
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 bg-ink/40" style={{ borderRadius: '50%' }} />
            Reserved
          </span>
        </div>
      </div>
    </div>
  );
}
