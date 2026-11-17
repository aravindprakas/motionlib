// ui-124 — SpotlightPodium
import { useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface Special {
  name: string;
  price: string;
  /** Description shown when this special is featured. */
  blurb: string;
  /** Optional dish image; falls back to a dashed slot. */
  image?: string;
}

export interface SpotlightPodiumProps {
  /** Exactly three specials — the piece choreographs a 3-pedestal rotation. */
  specials?: [Special, Special, Special];
  /** Eyebrow above the featured title. */
  eyebrow?: string;
  className?: string;
}

const DEFAULT_SPECIALS: [Special, Special, Special] = [
  { name: 'Charred Octopus', price: '26', blurb: "Galician octopus charred over white oak, with 'nduja butter and grilled bread. The chef's favourite thing on the menu this week." },
  { name: 'Bone Marrow Flatbread', price: '19', blurb: 'Hearth flatbread blistered to order, roasted marrow, pickled onion and parsley picked an hour before service.' },
  { name: 'Salt-Baked Celeriac', price: '22', blurb: 'A whole celeriac baked for four hours in a salt crust, carved tableside with brown butter and aged comté.' },
];

/** Position of a pedestal relative to the featured one (rel 0 = downstage). */
function slot(rel: number) {
  if (rel === 0) return { x: 0, z: 90, h: 170, dish: 150, dim: 1 };
  if (rel === 1) return { x: 235, z: -70, h: 110, dish: 112, dim: 0.5 };
  return { x: -235, z: -70, h: 110, dish: 112, dim: 0.5 };
}

/**
 * Tonight's three specials under a single spotlight. Clicking a pedestal
 * brings it downstage and raises it into the beam; the other two recede to the
 * back corners. The detail copy top-left tracks the featured dish.
 *
 * Reduced motion: pedestals reposition instantly (no glide).
 */
export function SpotlightPodium({
  specials = DEFAULT_SPECIALS,
  eyebrow = "Tonight's specials",
  className = '',
}: SpotlightPodiumProps) {
  const reduced = useReducedMotion();
  const [star, setStar] = useState(0);
  const ease = reduced ? 'none' : 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease';

  return (
    <div className={`overflow-hidden border border-ink ${className}`}>
      <div
        className="relative h-[540px] bg-ink"
        style={{
          perspective: '1400px',
          backgroundImage:
            'radial-gradient(620px 320px at 50% 26%, rgba(236,230,216,0.14), transparent 60%)',
        }}
      >
        <div className="absolute left-14 top-11 z-10 max-w-[300px]">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-vermilion">{eyebrow}</p>
          <h3 className="mb-3 font-display text-4xl font-medium leading-[1.05] text-bone">{specials[star].name}</h3>
          <p className="text-sm leading-relaxed text-bone/60">{specials[star].blurb}</p>
        </div>

        <div className="absolute inset-x-0 bottom-[110px] h-px bg-bone/15" />

        {specials.map((s, i) => {
          const p = slot((i - star + 3) % 3);
          return (
            <div
              key={s.name}
              onClick={() => setStar(i)}
              className="absolute bottom-[110px] left-1/2 cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateX(calc(-50% + ${p.x}px)) translateZ(${p.z}px)`,
                opacity: p.dim,
                zIndex: p.z > 0 ? 2 : 1,
                transition: ease,
              }}
            >
              <div
                className="relative mx-auto bg-bone/90"
                style={{ width: p.dish * 0.62, height: p.h, transition: reduced ? 'none' : 'height 0.7s cubic-bezier(0.22,1,0.36,1)' }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 bg-bone"
                  style={{ width: p.dish * 0.78, height: 26, top: -14, borderRadius: '50%' }}
                />
              </div>
              <div className="absolute left-1/2 grid -translate-x-1/2 place-items-center" style={{ bottom: p.h + 8 }}>
                <div
                  className="overflow-hidden border border-bone/20"
                  style={{ width: p.dish, height: p.dish, borderRadius: '50%', transition: reduced ? 'none' : 'width 0.7s cubic-bezier(0.22,1,0.36,1), height 0.7s cubic-bezier(0.22,1,0.36,1)' }}
                >
                  {s.image ? (
                    <img src={s.image} alt={s.name} draggable={false} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center border border-dashed border-bone/25 p-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone/45">
                      {s.name}
                    </div>
                  )}
                </div>
              </div>
              <div
                className="absolute left-1/2 w-[220px] -translate-x-1/2 text-center"
                style={{ bottom: -76, opacity: p.dim === 1 ? 1 : 0.55 }}
              >
                <div className="font-display text-xl font-medium text-bone">{s.name}</div>
                <div className="mt-0.5 font-display text-[17px] font-semibold text-vermilion">{s.price}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
