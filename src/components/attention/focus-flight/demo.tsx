// FocusFlight — press Tab and watch the ring travel
import { useState } from 'react';
import { FocusFlight } from './FocusFlight';

export default function FocusFlightDemo() {
  const [arrived, setArrived] = useState('—');
  const [keyboardOnly, setKeyboardOnly] = useState(false);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          press tab — the ring flies, and takes its time by distance
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">landed on: {arrived}</span>
      </div>

      <FocusFlight
        keyboardOnly={keyboardOnly}
        onArrive={(el) => setArrived(el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 24) || 'field')}
        className="border border-ink p-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <label className="col-span-2 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">full name</span>
            <input
              aria-label="full name"
              className="mt-2 w-full border border-ink bg-transparent px-4 py-3 font-mono text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">postcode</span>
            <input
              aria-label="postcode"
              className="mt-2 w-full border border-ink bg-transparent px-4 py-3 font-mono text-sm outline-none"
            />
          </label>

          {['standard · 5 days', 'express · 2 days', 'same day'].map((o) => (
            <button
              key={o}
              type="button"
              className="border border-ink px-4 py-6 text-left font-mono text-[11px] uppercase tracking-[0.18em] outline-none"
            >
              {o}
            </button>
          ))}

          <label className="col-span-3 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">delivery note</span>
            <textarea
              aria-label="delivery note"
              rows={3}
              className="mt-2 w-full border border-ink bg-transparent px-4 py-3 font-mono text-sm outline-none"
            />
          </label>

          <div className="col-span-3 flex items-center justify-between gap-4">
            <button
              type="button"
              className="border border-ink px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] outline-none"
            >
              back
            </button>
            <button
              type="button"
              className="border border-vermilion bg-vermilion px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bone outline-none"
            >
              place order
            </button>
          </div>
        </div>
      </FocusFlight>

      <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-8">
        <button
          type="button"
          onClick={() => setKeyboardOnly((k) => !k)}
          className="cursor-pointer border border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
        >
          {keyboardOnly ? 'keyboard only: on' : 'keyboard only: off'}
        </button>
        <p className="max-w-lg font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
          with it off, clicking a field flies the ring too — useful for seeing the mechanism; ship it on, so pointer
          users are not chased around the page
        </p>
      </div>
    </section>
  );
}
