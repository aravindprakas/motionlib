// Rewind — state keeps a history, and the history can be played backwards
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface RewindOptions<T> {
  /** How many frames to keep. Older ones fall off the back. */
  limit?: number;
  /** Custom equality, if identity is too strict for your state shape. */
  equals?: (a: T, b: T) => boolean;
}

export interface RewindApi<T> {
  frames: T[];
  index: number;
  scrubbing: boolean;
  /** The frame to render: the scrubbed one while scrubbing, else the live value. */
  display: T;
  scrubTo: (i: number) => void;
  /** Drop the scrub and snap back to the present. */
  release: () => void;
  /** The frame currently on screen — feed it back into your own setState. */
  pick: () => T;
}

/**
 * Records every distinct value it is handed and lets you move back through them.
 *
 * Undo is a stack of inverse operations, which is a lot of code to write per
 * feature and impossible to preview: you press it and hope. This is the other
 * model — keep the *values*, not the operations — and the moment you have the
 * values you can also scrub them, which turns undo from a discrete jump into a
 * thing you can look through before committing to. It is state, so it composes
 * with anything; what makes it motion is [useFlipGroup], which animates the
 * layout difference between two frames rather than cutting to it.
 */
export function useRewind<T>(value: T, { limit = 60, equals }: RewindOptions<T> = {}): RewindApi<T> {
  const [frames, setFrames] = useState<T[]>([value]);
  const [index, setIndex] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const same = equals ?? ((a: T, b: T) => a === b);
  const sameRef = useRef(same);
  sameRef.current = same;

  useEffect(() => {
    setFrames((prev) => {
      const last = prev[prev.length - 1];
      if (last !== undefined && sameRef.current(last, value)) return prev;
      const next = [...prev, value];
      return next.length > limit ? next.slice(next.length - limit) : next;
    });
    // A new value is a new present: stop looking at the past.
    setScrubbing(false);
  }, [value, limit]);

  useEffect(() => {
    if (!scrubbing) setIndex(frames.length - 1);
  }, [frames.length, scrubbing]);

  const scrubTo = useCallback(
    (i: number) => {
      setScrubbing(true);
      setIndex(Math.max(0, Math.min(frames.length - 1, i)));
    },
    [frames.length],
  );

  const release = useCallback(() => {
    setScrubbing(false);
    setIndex(frames.length - 1);
  }, [frames.length]);

  const display = scrubbing ? frames[index] : value;

  return {
    frames,
    index,
    scrubbing,
    display,
    scrubTo,
    release,
    pick: () => frames[index],
  };
}

export interface FlipOptions {
  duration?: number;
  easing?: string;
  /** Entering items fade up from this scale. */
  enterScale?: number;
}

/**
 * Animates the layout difference between renders for every `[data-flip-id]`
 * inside `ref`: measure after paint, compare against the previous measurement,
 * invert the delta and play it out. Pass whatever value identifies the render —
 * a scrub index, a sort key, a filter string.
 */
export function useFlipGroup(
  ref: RefObject<HTMLElement>,
  key: unknown,
  { duration = 420, easing = 'cubic-bezier(0.22,1,0.36,1)', enterScale = 0.94 }: FlipOptions = {},
) {
  const prev = useRef(new Map<string, DOMRect>());
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const next = new Map<string, DOMRect>();

    root.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      const id = el.dataset.flipId ?? '';
      const rect = el.getBoundingClientRect();
      next.set(id, rect);
      if (reduced) return;

      const before = prev.current.get(id);
      if (!before) {
        el.animate(
          [
            { opacity: 0, transform: `scale(${enterScale})` },
            { opacity: 1, transform: 'none' },
          ],
          { duration, easing },
        );
        return;
      }
      const dx = before.left - rect.left;
      const dy = before.top - rect.top;
      if (Math.hypot(dx, dy) < 0.5) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration, easing },
      );
    });

    prev.current = next;
  }, [key, ref, duration, easing, enterScale, reduced]);
}

export interface TimeScrubberProps<T> {
  api: RewindApi<T>;
  /** Label for each tick, e.g. what changed. */
  label?: (frame: T, i: number) => string;
  className?: string;
}

/**
 * A rail with one tick per recorded frame. Drag it to move through the history;
 * the ticks ahead of the playhead are the future you are currently ignoring.
 */
export function TimeScrubber<T>({ api, label, className = '' }: TimeScrubberProps<T>) {
  const rail = useRef<HTMLDivElement>(null);

  const seek = (clientX: number) => {
    const el = rail.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    api.scrubTo(Math.round(t * (api.frames.length - 1)));
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seek(e.clientX);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seek(e.clientX);
  };

  return (
    <div className={className}>
      <div
        ref={rail}
        onPointerDown={onDown}
        onPointerMove={onMove}
        className="flex h-12 cursor-ew-resize touch-none items-end gap-[3px] border border-ink px-2 pb-2 pt-2"
        role="slider"
        tabIndex={0}
        aria-label="History position"
        aria-valuemin={0}
        aria-valuemax={api.frames.length - 1}
        aria-valuenow={api.index}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') api.scrubTo(api.index - 1);
          if (e.key === 'ArrowRight') api.scrubTo(api.index + 1);
          if (e.key === 'Escape') api.release();
        }}
      >
        {api.frames.map((f, i) => (
          <div
            key={i}
            title={label?.(f, i)}
            className="w-full origin-bottom"
            style={{
              height: i === api.index ? '100%' : i < api.index ? '58%' : '32%',
              backgroundColor:
                i === api.index ? 'var(--color-vermilion)' : i < api.index ? 'var(--color-ink)' : 'rgba(12,11,14,0.22)',
              transition: 'height 180ms cubic-bezier(0.22,1,0.36,1), background-color 180ms linear',
            }}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        frame {api.index + 1} of {api.frames.length}
        {api.scrubbing ? ' · scrubbing the past' : ' · live'}
      </p>
    </div>
  );
}
