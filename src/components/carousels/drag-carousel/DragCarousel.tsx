// ui-17 — DragCarousel
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

export interface DragCarouselProps {
  slides: ReactNode[];
  className?: string;
}

/**
 * Pointer/touch drag carousel with momentum + snap (embla-carousel-react,
 * headless) and accessible dot buttons.
 *
 * Fixes vs. the Store original: slides are a prop, the `select`/`reInit`
 * listeners are removed on cleanup (they leaked before), and the v4-only
 * container query breakpoint is replaced with a viewport breakpoint.
 */
export function DragCarousel({ slides, className = '' }: DragCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={className}>
      <div className="overflow-hidden border border-ink/15" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 flex-[0_0_72%] border-r border-ink/15 sm:flex-[0_0_42%]">
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-[3px] w-6 cursor-pointer border-0 p-0 ${selected === i ? 'bg-accent' : 'bg-ink/15'}`}
          />
        ))}
      </div>
    </div>
  );
}
