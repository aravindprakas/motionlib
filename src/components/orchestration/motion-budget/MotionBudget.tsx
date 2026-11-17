// MotionBudget — a hard ceiling on how much may animate at once
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface BudgetStats {
  running: number;
  queued: number;
  /** Admitted since the field mounted — useful for a live readout. */
  admitted: number;
}

interface Ticket {
  priority: number;
  duration: number;
  start: () => void;
  seq: number;
}

interface BudgetApi {
  request: (t: Omit<Ticket, 'seq'>) => () => void;
}

const BudgetContext = createContext<BudgetApi | null>(null);

export interface MotionBudgetProps {
  children: ReactNode;
  /** How many things may be animating at the same instant. */
  limit?: number;
  /** Minimum ms between two admissions, so a slot opening does not fire a burst. */
  minGap?: number;
  onStats?: (s: BudgetStats) => void;
  className?: string;
}

/**
 * Rations concurrency: at most `limit` children may animate at once, the rest
 * wait their turn.
 *
 * Reveal-on-scroll is written per element, which means the page has no idea how
 * many elements are mid-animation — land on a dense grid and forty things move
 * simultaneously, which reads as noise and costs a frame budget nobody measured.
 * A stagger does not fix it either; a fixed delay is a guess made before anyone
 * knew what would be on screen. This is the other approach: elements *ask* to
 * animate, a scheduler admits as many as the budget allows in priority order,
 * and each returns its slot when it finishes. The result self-tunes — six items
 * on screen all go at once, sixty arrive in orderly waves — and the same field
 * stays legible on a phone that cannot afford the sixty.
 *
 * Under reduced motion the budget lifts entirely: with nothing to watch there is
 * nothing to ration, so every element is admitted on the spot.
 */
export function MotionBudget({
  children,
  limit = 5,
  minGap = 90,
  onStats,
  className = '',
}: MotionBudgetProps) {
  const queue = useRef<Ticket[]>([]);
  const running = useRef(0);
  const admitted = useRef(0);
  const lastAdmit = useRef(0);
  const timer = useRef<number>(0);
  const seq = useRef(0);
  const reduced = useReducedMotion();
  const statsRef = useRef(onStats);
  statsRef.current = onStats;

  const api = useMemo<BudgetApi>(() => {
    const report = () =>
      statsRef.current?.({
        running: running.current,
        queued: queue.current.length,
        admitted: admitted.current,
      });

    const pump = () => {
      window.clearTimeout(timer.current);
      const cap = reduced ? Infinity : limit;
      const gap = reduced ? 0 : minGap;

      while (running.current < cap && queue.current.length) {
        const wait = gap - (performance.now() - lastAdmit.current);
        if (wait > 0) {
          timer.current = window.setTimeout(pump, wait);
          break;
        }
        // Highest priority first; ties fall back to who asked first.
        let pick = 0;
        for (let i = 1; i < queue.current.length; i++) {
          const a = queue.current[i];
          const b = queue.current[pick];
          if (a.priority > b.priority || (a.priority === b.priority && a.seq < b.seq)) pick = i;
        }
        const [ticket] = queue.current.splice(pick, 1);
        running.current += 1;
        admitted.current += 1;
        lastAdmit.current = performance.now();
        ticket.start();
        window.setTimeout(() => {
          running.current -= 1;
          pump();
        }, ticket.duration);
      }
      report();
    };

    return {
      request(t) {
        const ticket: Ticket = { ...t, seq: seq.current++ };
        queue.current.push(ticket);
        pump();
        return () => {
          const i = queue.current.indexOf(ticket);
          if (i >= 0) queue.current.splice(i, 1);
          report();
        };
      },
    };
  }, [limit, minGap, reduced]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <BudgetContext.Provider value={api}>
      <div className={className}>{children}</div>
    </BudgetContext.Provider>
  );
}

export interface BudgetedProps {
  children: ReactNode;
  /** Ask now (`true`) or not yet. Omit to ask the moment it enters the viewport. */
  when?: boolean;
  /** Higher goes first. Hero copy 10, a thumbnail in row nine, 0. */
  priority?: number;
  /** How long this element holds its slot, ms. Match your own transition. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * One claim on the budget. Renders `data-admit="out"` until its turn comes and
 * `data-admit="in"` afterwards — style the two states however you like, the
 * component itself animates nothing.
 */
export function Budgeted({
  children,
  when,
  priority = 0,
  duration = 520,
  className = '',
  style,
}: BudgetedProps) {
  const budget = useContext(BudgetContext);
  const el = useRef<HTMLDivElement>(null);
  const [admitted, setAdmitted] = useState(false);
  const [eligible, setEligible] = useState(when ?? false);

  // No `when` given: the element asks for itself as it comes into view.
  useEffect(() => {
    if (when !== undefined) {
      setEligible(when);
      return;
    }
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEligible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [when]);

  useEffect(() => {
    if (!eligible || admitted || !budget) return;
    return budget.request({ priority, duration, start: () => setAdmitted(true) });
  }, [eligible, admitted, budget, priority, duration]);

  return (
    <div ref={el} data-admit={admitted ? 'in' : 'out'} className={className} style={style}>
      {children}
    </div>
  );
}
