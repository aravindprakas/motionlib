// ShapeShiftTabs — pull the width slider and watch the same nav change species
import { useState } from 'react';
import { ShapeShiftTabs, type ShapeShiftTab } from './ShapeShiftTabs';

const para = (text: string) => (
  <p className="max-w-prose font-serif text-[15px] italic leading-relaxed opacity-85">{text}</p>
);

const TABS: ShapeShiftTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    content: para(
      'One tab bar, three shapes. Nothing here knows about a viewport — the only input is the width of the box it was given.',
    ),
  },
  {
    id: 'construction',
    label: 'Construction',
    updatedAt: new Date(Date.now() - 3 * 864e5),
    content: para(
      'Felled seams throughout, a two-piece sleeve, and a collar stand cut on the bias so it holds its roll after washing.',
    ),
  },
  {
    id: 'materials',
    label: 'Materials',
    updatedAt: new Date(Date.now() - 11 * 864e5),
    content: para(
      'Eleven-ounce cotton from Coimbatore, corozo buttons, and a lining that was chosen because it can be replaced.',
    ),
  },
  {
    id: 'sizing',
    label: 'Sizing & fit',
    content: para(
      'Flat measurements are taken from the sample, not the pattern. Between sizes, take the smaller one.',
    ),
  },
  {
    id: 'care',
    label: 'Care',
    content: para('Cold, hung, ironed on the reverse. Fading is expected and is not a defect.'),
  },
  {
    id: 'shipping',
    label: 'Shipping',
    updatedAt: new Date(Date.now() - 1 * 864e5),
    content: para('Six working days to dispatch. Tracking is issued when it actually leaves.'),
  },
  {
    id: 'provenance',
    label: 'Provenance',
    content: para('Nineteen people, one floor, four machines older than the company.'),
  },
];

export default function ShapeShiftTabsDemo() {
  const [width, setWidth] = useState(100);
  const [active, setActive] = useState('construction');

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-6 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
          drag the width down — full row, then priority-plus with a menu, then a listbox
        </p>
        <label className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="opacity-60">width</span>
          <input
            type="range"
            min={22}
            max={100}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="h-1 w-44 cursor-pointer appearance-none bg-ink accent-vermilion md:w-64"
            aria-label="Container width"
          />
          <span className="w-10 tabular-nums opacity-60">{width}%</span>
        </label>
      </div>

      <div className="border border-ink p-5">
        <div style={{ width: width + '%' }} className="transition-[width] duration-150">
          <ShapeShiftTabs tabs={TABS} activeId={active} onChange={setActive} />
        </div>
      </div>

      <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        keep “provenance” selected while you shrink it: when the active tab is pushed into the menu,
        the vermilion indicator moves onto the menu button rather than vanishing. the small
        vermilion squares are real timestamps — construction changed 3 days ago, materials 11.
      </p>
    </section>
  );
}
