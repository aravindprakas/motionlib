// TideAccordion — open every panel in turn; the ruler on the right never moves
import { useState } from 'react';
import { TideAccordion, type TideItem } from './TideAccordion';

const body = (paras: string[]) => (
  <div className="space-y-3 pt-1">
    {paras.map((p, i) => (
      <p key={i} className="font-serif text-[15px] italic leading-relaxed opacity-85">
        {p}
      </p>
    ))}
  </div>
);

const ITEMS: TideItem[] = [
  {
    id: 'shipping',
    label: 'Shipping & lead times',
    meta: '4 regions',
    content: body([
      'Everything is cut to order in Chennai and leaves within six working days. Nothing is warehoused, which is why nothing is ever quite in stock.',
      'Domestic orders travel on a two-day service. International moves through Singapore and clears in four to nine days depending on where it lands.',
      'A tracking number is issued at dispatch, not at order — we would rather send one late number that works than three early ones that do not.',
    ]),
  },
  {
    id: 'returns',
    label: 'Returns, exchanges & repairs',
    meta: 'lifetime',
    content: body([
      'Thirty days, unworn, in the bag it arrived in. We pay the return leg once per order.',
      'Repairs are free for the life of the garment: seams, buttons, zips, cuffs. Send it back with a note about what happened and we will do what the workshop would do.',
      'Exchanges are processed as a return and a fresh order so the second piece is never held hostage by the first one arriving.',
    ]),
  },
  {
    id: 'sizing',
    label: 'Sizing & fit',
    meta: '6 blocks',
    content: body([
      'The house block runs one size large through the chest and true at the shoulder. If you are between sizes, the smaller one is almost always right.',
      'Every product page lists flat measurements taken from the actual sample, not from the pattern. Patterns lie by about a centimetre.',
      'Sleeve and hem shortening is free within two weeks of delivery. Lengthening is not possible; there is no seam allowance left.',
    ]),
  },
  {
    id: 'materials',
    label: 'Materials & care',
    meta: '11 mills',
    content: body([
      'Cotton comes from two mills in Coimbatore, wool from Biella, linen from Kortrijk. Every mill is named on the label because a supply chain you cannot name is not one you control.',
      'Wash cold, hang dry, iron on the reverse. Dry cleaning is a solvent bath; use it twice a year, not twice a month.',
      'Fading is expected and is not a defect. The dyes are reactive, not pigment, and they will move.',
    ]),
  },
  {
    id: 'workshop',
    label: 'The workshop',
    meta: 'est. 2016',
    content: body([
      'Nineteen people, one floor, four machines older than the company. Output is roughly two hundred pieces a month and has not grown in three years, on purpose.',
      'Visits are welcome on Thursdays. There is no showroom, so you will be handed a coffee and shown a cutting table.',
    ]),
  },
];

export default function TideAccordionDemo() {
  const [open, setOpen] = useState<string[]>(['returns']);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-6 md:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em]">
          open anything — the rule under this block never moves
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
          holding space: {open.join(', ') || 'none'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_10rem]">
        <TideAccordion items={ITEMS} defaultOpen={['returns']} maxOpen={2} onOpenChange={setOpen} />

        {/* A ruler pinned beside it: proof that nothing below ever shifts. */}
        <aside className="relative hidden border border-ink lg:block" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span
              key={i}
              className="absolute left-0 h-px bg-ink/20"
              style={{ top: (i + 1) * 6.6 + '%', width: i % 5 === 0 ? '100%' : '38%' }}
            />
          ))}
          <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
            no shift
          </span>
        </aside>
      </div>

      <p className="max-w-2xl border-t border-ink pt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        maxOpen is 2 here — open a third and the panel you opened *earliest* gives its space back.
        the vermilion rule under each header is how long you have actually spent reading it. shorten
        the window and the budget stops buying anything, so it flows instead.
      </p>
    </section>
  );
}
