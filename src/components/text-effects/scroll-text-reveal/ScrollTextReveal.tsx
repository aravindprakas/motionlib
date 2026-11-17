import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface ScrollTextPart {
  text: string;
  accent?: boolean;
}

export interface ScrollTextRevealProps {
  parts: ScrollTextPart[];
  /** Viewport fraction where the reveal starts (element top). Default 0.8. */
  startVh?: number;
  /** Viewport fraction where the reveal completes. Default 0.35. */
  endVh?: number;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const TRANSLATE_Y = 12;
const BLUR_PX = 3;
const STAGGER_AMOUNT = 0.6;

/**
 * Splits text into words and reveals them with a staggered opacity +
 * translateY + blur wipe driven continuously by scroll progress (works under
 * Lenis since it measures getBoundingClientRect every frame).
 *
 * Progress is measured against the ambient Lenis scroller's own viewport
 * (not the window), and if the block is ever scrolled past before reaching
 * full progress, the text snaps to fully visible — words can never end up
 * stuck half-hidden. Reduced motion renders plain text.
 */
export function ScrollTextReveal({
  parts,
  startVh = 0.8,
  endVh = 0.35,
  className = '',
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  const words = useMemo(
    () =>
      parts.flatMap((part, partIndex) =>
        part.text.split(/(\s+)/).map((chunk, index) => {
          if (/^\s+$/.test(chunk)) return chunk;
          return (
            <span
              key={`${partIndex}-${index}`}
              data-reveal-word
              className={`inline-block ${part.accent ? 'text-accent italic' : ''}`}
            >
              {chunk}
            </span>
          );
        }),
      ),
    [parts],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced || typeof window === 'undefined') return;

    const wordEls = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-word]'));
    if (wordEls.length === 0) return;

    // Each word's window within 0..1 progress: staggered starts, all windows
    // (1 − STAGGER_AMOUNT) long, so the last word resolves exactly at 1.
    const perWordOffset = STAGGER_AMOUNT / wordEls.length;

    let startLine = 0;
    let range = 1;
    let vpTop = 0;
    let frameId = 0;
    let running = false;
    let done = false;
    let cachedProgress = -1;

    const measure = () => {
      // Measure against the Lenis scroller's box, not the window — the stage
      // viewport is shorter than the window and offset by the header.
      const scroller = scrollerRef?.current ?? null;
      const vpH = scroller ? scroller.clientHeight : window.innerHeight;
      vpTop = scroller ? scroller.getBoundingClientRect().top : 0;
      startLine = vpTop + vpH * startVh;
      range = Math.max(1, vpH * (startVh - endVh));
    };

    wordEls.forEach((w) => {
      w.style.opacity = '0';
      w.style.transform = `translateY(${TRANSLATE_Y}px)`;
      w.style.filter = `blur(${BLUR_PX}px)`;
      w.style.willChange = 'opacity, transform, filter';
    });

    const finish = () => {
      if (done) return;
      done = true;
      running = false;
      cancelAnimationFrame(frameId);
      wordEls.forEach((w) => {
        w.style.opacity = '1';
        w.style.transform = 'none';
        w.style.filter = 'none';
        w.style.willChange = 'auto';
      });
      io.disconnect();
      window.removeEventListener('resize', measure);
    };

    const update = () => {
      const rect = el.getBoundingClientRect();
      const progress = clamp((startLine - rect.top) / range, 0, 1);
      if (progress >= 1) {
        finish();
        return;
      }
      if (Math.abs(progress - cachedProgress) < 0.001) return;
      cachedProgress = progress;

      for (let index = 0; index < wordEls.length; index++) {
        const wordStart = index * perWordOffset;
        const wp = clamp((progress - wordStart) / (1 - STAGGER_AMOUNT), 0, 1);
        const blur = BLUR_PX * Math.max(0, 1 - wp * 2);
        const w = wordEls[index];
        w.style.opacity = String(wp);
        w.style.transform = wp >= 1 ? 'none' : `translateY(${(1 - wp) * TRANSLATE_Y}px)`;
        w.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      }
    };

    const loop = () => {
      if (!running || done) return;
      update();
      frameId = requestAnimationFrame(loop);
    };

    // Only burn rAF frames while on screen; if the block exits above the
    // viewport (scrolled past), resolve everything immediately.
    const io = new IntersectionObserver(([entry]) => {
      if (done) return;
      if (entry.isIntersecting) {
        if (!running) {
          running = true;
          frameId = requestAnimationFrame(loop);
        }
      } else {
        running = false;
        cancelAnimationFrame(frameId);
        if (entry.boundingClientRect.top < vpTop) finish();
      }
    });
    io.observe(el);

    measure();
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(frameId);
      io.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [startVh, endVh, reduced, parts, scrollerRef]);

  return (
    <span ref={containerRef} className={className}>
      {words}
    </span>
  );
}
