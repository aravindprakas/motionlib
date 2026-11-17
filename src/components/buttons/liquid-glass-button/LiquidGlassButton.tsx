// ui-100 — LiquidGlassButton
import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface LiquidGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Refraction strength (feDisplacementMap scale). Default 60. */
  strength?: number;
  /** Backdrop blur in px behind the glass. Default 2. */
  blur?: number;
  className?: string;
}

/**
 * Glassmorphism button: an SVG turbulence + displacement filter refracts
 * whatever sits behind it (progressive enhancement — degrades to a translucent
 * blur where `backdrop-filter: url()` is unsupported), over a frosted surface
 * with an inset highlight. Lifts slightly on hover. Best placed over imagery.
 */
export function LiquidGlassButton({
  children,
  strength = 60,
  blur = 2,
  className = '',
  style,
  ...rest
}: LiquidGlassButtonProps) {
  const rawId = useId();
  const filterId = `lg-${rawId.replace(/:/g, '')}`;

  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={strength} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <button
        type="button"
        className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 border border-bone/40 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out hover:scale-105 active:scale-95 ${className}`}
        style={{
          backdropFilter: `url(#${filterId}) blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          backgroundColor: 'rgba(255,255,255,0.10)',
          ...style,
        }}
        {...rest}
      >
        <span className="relative z-10">{children}</span>
        {/* Soft top sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      </button>
    </>
  );
}
