// Conductor — one clock for the whole subtree; many elements, zero re-renders
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface Tick {
  /** Seconds since the conductor started. */
  time: number;
  /** Whole beats elapsed. */
  beat: number;
  /** Position inside the current beat, 0 → 1. */
  phase: number;
  /** Whole bars elapsed. */
  bar: number;
  /** Live tempo, so subscribers can scale their own maths. */
  bpm: number;
}

type Subscriber = (t: Tick) => void;

interface ClockApi {
  subscribe: (fn: Subscriber) => () => void;
  beatsPerBar: number;
}

const ClockContext = createContext<ClockApi | null>(null);

export type PulseShape = 'sine' | 'triangle' | 'saw' | 'square' | 'spike';

/** Map a 0→1 position inside a cycle onto a 0→1 amplitude. */
function shapeValue(p: number, shape: PulseShape, duty: number): number {
  switch (shape) {
    case 'sine':
      return (1 - Math.cos(p * Math.PI * 2)) / 2;
    case 'triangle':
      return 1 - Math.abs(p * 2 - 1);
    case 'saw':
      return p;
    case 'square':
      return p < duty ? 1 : 0;
    case 'spike':
    default:
      return Math.exp(-p * 6);
  }
}

export interface ConductorProps {
  children: ReactNode;
  /** Tempo in beats per minute. Changing it never restarts the phase. */
  bpm?: number;
  beatsPerBar?: number;
  /** Pause the clock without unmounting; subscribers keep their last value. */
  running?: boolean;
}

/**
 * A tempo source that every descendant animates against.
 *
 * The usual way to make ten things breathe together is ten `requestAnimationFrame`
 * loops — which is ten sets of timers that started at ten different moments, so
 * they drift apart within seconds and can never be re-phased. `Conductor` runs
 * exactly one loop and hands every subscriber the same `beat` and `phase`, so a
 * dot in the corner and a headline at the top of the page are provably in step,
 * and a tempo change re-tunes all of them mid-flight without a restart.
 *
 * Subscribers receive the tick as a callback and write to the DOM themselves —
 * nothing here calls `setState`, so the frame cost is flat no matter how many
 * elements are listening. Reduced motion emits one tick at phase 0 and stops.
 */
export function Conductor({ children, bpm = 72, beatsPerBar = 4, running = true }: ConductorProps) {
  const subs = useRef(new Set<Subscriber>());
  const beatsRef = useRef(0);
  const timeRef = useRef(0);
  const bpmRef = useRef(bpm);
  const reduced = useReducedMotion();

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const currentTick = (): Tick => {
    const beats = beatsRef.current;
    return {
      time: timeRef.current,
      beat: Math.floor(beats),
      phase: beats - Math.floor(beats),
      bar: Math.floor(beats / beatsPerBar),
      bpm: bpmRef.current,
    };
  };

  const api = useMemo<ClockApi>(
    () => ({
      beatsPerBar,
      subscribe(fn) {
        subs.current.add(fn);
        // Late subscribers get a value immediately rather than waiting a frame.
        fn(currentTick());
        return () => {
          subs.current.delete(fn);
        };
      },
    }),
    // `currentTick` reads refs only; beatsPerBar is the sole real input.
    [beatsPerBar],
  );

  useEffect(() => {
    const emit = () => {
      const tick = currentTick();
      subs.current.forEach((fn) => fn(tick));
    };

    if (!running || reduced) {
      emit();
      return;
    }

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Clamp so a backgrounded tab does not fast-forward the whole piece.
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      timeRef.current += dt;
      beatsRef.current += (dt * bpmRef.current) / 60;
      emit();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, reduced, beatsPerBar]);

  return <ClockContext.Provider value={api}>{children}</ClockContext.Provider>;
}

/**
 * Subscribe to the nearest `Conductor`. The callback runs on every frame with
 * the shared tick; keep it imperative — this is deliberately not state.
 */
export function usePulse(fn: Subscriber) {
  const clock = useContext(ClockContext);
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    if (!clock) return;
    return clock.subscribe((t) => ref.current(t));
  }, [clock]);
}

export interface PulseProps {
  children?: ReactNode;
  /** Cycles per beat. 2 = twice a beat, 0.25 = once every four beats. */
  division?: number;
  /** Offset in beats — the whole point of a shared clock is phase, not delay. */
  offset?: number;
  shape?: PulseShape;
  /** Duty cycle for `square`. */
  duty?: number;
  /** Shape the response curve: 2 makes the swell late and sharp. */
  curve?: number;
  /** Output range, so `--pulse` can drive a scale or an opacity directly. */
  from?: number;
  to?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Publishes the clock to one element as the CSS custom property `--pulse`,
 * plus `--pulse-beat` and a `data-beat` attribute that flips only on the beat
 * (so it is safe to hang a CSS transition off it). Style the element however
 * you like: `transform: scale(var(--pulse))`, `opacity: var(--pulse)`, colour
 * mixes — the component takes no view on what the pulse means.
 */
export function Pulse({
  children,
  division = 1,
  offset = 0,
  shape = 'sine',
  duty = 0.5,
  curve = 1,
  from = 0,
  to = 1,
  className = '',
  style,
}: PulseProps) {
  const el = useRef<HTMLDivElement>(null);
  const lastBeat = useRef(-1);

  usePulse(({ beat, phase }) => {
    const node = el.current;
    if (!node) return;
    const beats = beat + phase;
    const local = ((beats * division + offset) % 1 + 1) % 1;
    const raw = shapeValue(local, shape, duty);
    const shaped = curve === 1 ? raw : Math.pow(raw, curve);
    node.style.setProperty('--pulse', (from + (to - from) * shaped).toFixed(4));

    const localBeat = Math.floor(beats * division + offset);
    if (localBeat !== lastBeat.current) {
      lastBeat.current = localBeat;
      node.style.setProperty('--pulse-beat', String(localBeat));
      node.dataset.beat = String(((localBeat % 2) + 2) % 2);
    }
  });

  return (
    <div ref={el} className={className} style={style}>
      {children}
    </div>
  );
}
