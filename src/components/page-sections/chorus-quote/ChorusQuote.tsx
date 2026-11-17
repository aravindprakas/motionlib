// ChorusQuote — successive quotes that keep the words they share
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand } from '@/lib/useSizeBand';

export interface ChorusEntry {
  id: string;
  text: string;
  author: string;
  role?: string;
  /** When it was said. Shown, and used for the ordering readout. */
  at?: string | number | Date;
}

export interface ChorusQuoteProps {
  entries: ChorusEntry[];
  /** ms each quote holds before the next. 0 disables auto-advance. */
  interval?: number;
  /** ms the word morph takes. */
  duration?: number;
  className?: string;
}

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Longest common subsequence over words. Quotes are short, so the plain O(n·m)
 * table is both the simplest and the fastest thing available.
 */
function pairWords(a: string[], b: string[]): Map<number, number> {
  const n = a.length;
  const m = b.length;
  const A = a.map(norm);
  const B = b.map(norm);
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        A[i] && A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = new Map<number, number>(); // old index → new index
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] && A[i] === B[j]) {
      pairs.set(i, j);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * A testimonial block that treats a set of quotes as one changing sentence.
 *
 * Rotating testimonials normally cross-fade or slide, which throws the whole
 * paragraph away and starts again — the reader loses their place, so most
 * people stop reading by the second rotation. But quotes about the same thing
 * are rarely disjoint: they share names, verbs, the product, the complaint. So
 * this diffs consecutive quotes at word level with a longest-common-subsequence
 * pass and lets the shared words *travel* to their new position, while only the
 * words that genuinely changed fade out and in. What you see is a sentence
 * rewriting itself, and the words that survive every rewrite are exactly the
 * ones every customer said — the agreement becomes visible without anyone
 * summarising it.
 *
 * The morph is a strict FLIP: two measure passes, then one WAAPI transform per
 * surviving word, so no layout happens during the animation and the cost scales
 * with the words that moved rather than the words on screen. Departing words
 * are handed to absolutely-positioned ghosts so they can leave from where they
 * were instead of vanishing. The auto-advance clock is a single timer that
 * suspends whenever the block is off-screen, hovered, or focused — it does not
 * run in a background tab, and it does not run while you are still reading.
 *
 * Type scale, measure and the attribution layout come from the component's own
 * width, so the same block works as a full-bleed pull quote and as a sidebar
 * card. Reduced motion swaps the morph for a plain swap and stops the clock,
 * leaving the manual controls.
 */
export function ChorusQuote({
  entries,
  interval = 5200,
  duration = 620,
  className = '',
}: ChorusQuoteProps) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLQuoteElement>(null);
  const ghosts = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const band = useSizeBand(root, { regular: 560, wide: 900 });
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const entry = entries[index];
  const words = useMemo(() => entry.text.split(/\s+/).filter(Boolean), [entry.text]);

  /** The previous render's words and their measured positions. */
  const prev = useRef<{ words: string[]; rects: DOMRect[] } | null>(null);
  const running = useRef<Animation[]>([]);

  // ── FLIP the words that survived the edit ──────────────────────────────────
  useLayoutEffect(() => {
    const host = stage.current;
    const layer = ghosts.current;
    if (!host) return;

    const before = prev.current;
    // Nothing was edited — do not pay for a measure pass on an unrelated render.
    if (before && before.words === words) return;

    const spans = Array.from(host.querySelectorAll<HTMLElement>('[data-w]'));
    const rects = spans.map((s) => s.getBoundingClientRect());
    prev.current = { words, rects };

    if (!before || reduced) return;

    for (const a of running.current) a.cancel();
    running.current = [];
    if (layer) layer.textContent = '';

    const pairs = pairWords(before.words, words);
    const arrivedFrom = new Set(pairs.values());
    const hostRect = host.getBoundingClientRect();
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

    // Survivors travel from where they were.
    for (const [oldIdx, newIdx] of pairs) {
      const from = before.rects[oldIdx];
      const to = rects[newIdx];
      const el = spans[newIdx];
      if (!from || !to || !el) continue;
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      running.current.push(
        el.animate(
          [
            { transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)' },
            { transform: 'translate(0,0)' },
          ],
          { duration, easing: ease, composite: 'replace' },
        ),
      );
    }

    // Newcomers arrive; they were not part of the previous sentence.
    spans.forEach((el, i) => {
      if (arrivedFrom.has(i)) return;
      running.current.push(
        el.animate(
          [
            { opacity: 0, transform: 'translateY(0.5em)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: duration * 0.8, delay: duration * 0.25, easing: ease, fill: 'backwards' },
        ),
      );
    });

    // Departures leave from where they stood, as ghosts.
    if (layer) {
      const kept = new Set(pairs.keys());
      before.words.forEach((w, i) => {
        if (kept.has(i)) return;
        const r = before.rects[i];
        if (!r) return;
        const g = document.createElement('span');
        g.textContent = w;
        g.className = 'absolute whitespace-pre pointer-events-none';
        g.style.left = r.left - hostRect.left + 'px';
        g.style.top = r.top - hostRect.top + 'px';
        g.style.font = getComputedStyle(host).font;
        layer.appendChild(g);
        const a = g.animate(
          [
            { opacity: 0.55, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-0.4em)' },
          ],
          { duration: duration * 0.65, easing: 'ease-out', fill: 'forwards' },
        );
        a.finished.then(() => g.remove()).catch(() => g.remove());
        running.current.push(a);
      });
    }
  }, [words, duration, reduced]);

  // Cached positions go stale on reflow, so refresh them when the box changes.
  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const ro = new ResizeObserver(() => {
      const p = prev.current;
      if (!p) return;
      p.rects = Array.from(host.querySelectorAll<HTMLElement>('[data-w]')).map((s) =>
        s.getBoundingClientRect(),
      );
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      for (const a of running.current) a.cancel();
      running.current = [];
    },
    [],
  );

  const advance = useCallback(
    (delta: number) => setIndex((i) => (i + delta + entries.length) % entries.length),
    [entries.length],
  );

  // ── one clock, suspended whenever nobody is reading ────────────────────────
  useEffect(() => {
    const el = root.current;
    if (!el || !interval || reduced || entries.length < 2) return;

    let timer = 0;
    let onScreen = true;
    let anim: Animation | null = null;

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
      anim?.cancel();
      anim = null;
    };
    const start = () => {
      stop();
      if (!onScreen || paused || document.hidden) return;
      timer = window.setTimeout(() => advance(1), interval);
      if (clock.current) {
        anim = clock.current.animate(
          [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
          { duration: interval, easing: 'linear', fill: 'forwards' },
        );
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        start();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [interval, paused, index, advance, reduced, entries.length]);

  const size =
    band === 'wide'
      ? 'text-[clamp(1.6rem,3.1vw,2.6rem)]'
      : band === 'regular'
        ? 'text-[clamp(1.25rem,2.6vw,1.75rem)]'
        : 'text-[1.05rem]';

  return (
    <div
      ref={root}
      className={'relative ' + className}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <blockquote
          ref={stage}
          aria-live="polite"
          className={'relative max-w-[24ch] font-serif italic leading-[1.25] sm:max-w-[32ch] ' + size}
        >
          {/* One span per word: the unit the diff and the FLIP both work in. */}
          {words.map((w, i) => (
            <span key={entry.id + '-' + i} data-w className="inline-block whitespace-pre">
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </blockquote>

        {/* Departing words live here so they can leave from where they stood. */}
        <div
          ref={ghosts}
          aria-hidden
          className="pointer-events-none absolute inset-0 font-serif italic opacity-60"
        />
      </div>

      <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-ink pt-4 font-mono text-[10px] uppercase tracking-[0.22em]">
        <span className="text-vermilion">{entry.author}</span>
        {entry.role && <span className="opacity-55">{entry.role}</span>}
        {entry.at && (
          <span className="opacity-40">
            {new Date(entry.at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        )}

        <span className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Previous quote"
            className="border border-ink px-2 py-0.5 hover:bg-ink hover:text-bone"
          >
            ←
          </button>
          <span className="tabular-nums opacity-55">
            {index + 1}/{entries.length}
          </span>
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next quote"
            className="border border-ink px-2 py-0.5 hover:bg-ink hover:text-bone"
          >
            →
          </button>
        </span>
      </figcaption>

      {/* The clock. Empty when reduced motion or auto-advance is off. */}
      <span aria-hidden className="mt-2 block h-px w-full bg-ink/15">
        {!reduced && interval > 0 && (
          <span ref={clock} className="block h-px w-full origin-left scale-x-0 bg-vermilion" />
        )}
      </span>
    </div>
  );
}
