// ui-40 — ParallaxHeader
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface ParallaxHeaderProps {
  wordOne?: string;
  wordTwo?: string;
  videoSrc?: string;
}

/**
 * Full-viewport sticky header: a giant two-word wordmark parallaxes upward
 * while an optional background video fades out over the first viewport of
 * scroll. Transform/opacity only.
 *
 * Fixes vs. the Store original: progress is read from the ambient Lenis
 * scroller (window.scrollY is always 0 inside a scroll container), and
 * reduced motion skips the scroll handler entirely.
 */
export function ParallaxHeader({ wordOne = 'Your', wordTwo = 'Name', videoSrc }: ParallaxHeaderProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const scroller = scrollerRef?.current ?? null;
    const listenTarget: EventTarget = scroller ?? window;

    const handleScroll = () => {
      const top = scroller ? scroller.scrollTop : window.scrollY;
      const vh = scroller ? scroller.clientHeight : window.innerHeight;
      const progress = Math.min(Math.max(top / vh, 0), 1);

      if (textRef.current) {
        // Wordmark drifts up half a viewport over the first viewport of scroll.
        textRef.current.style.transform = `translateY(-${progress * vh * 0.5}px)`;
      }
      if (videoRef.current) {
        // Video is gone by 25% scroll — the wordmark carries the rest.
        videoRef.current.style.opacity = String(Math.max(1 - progress * 4, 0));
      }
    };

    handleScroll();
    listenTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => listenTarget.removeEventListener('scroll', handleScroll);
  }, [reduced, scrollerRef]);

  return (
    <div className="relative h-screen w-full">
      <header className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-ink pb-0 md:items-end md:pb-24 lg:pb-32">
        <div className="absolute inset-0 z-0">
          {videoSrc && (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          )}
          <div className="absolute inset-0 bg-ink/30" />
        </div>

        <h1
          ref={textRef}
          className="relative z-10 mix-blend-difference px-4 text-center text-[22vw] leading-[0.85] tracking-tight text-paper/90 will-change-transform sm:text-[16vw] md:text-[13vw]"
        >
          <span>{wordOne}</span> <span className="italic text-accent">{wordTwo}</span>
        </h1>
      </header>
    </div>
  );
}
