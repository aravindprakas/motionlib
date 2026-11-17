// DataCard — sweep the pointer across all twelve and watch the frame budget hold
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { DataCard, type CardTone, type DataCardProps } from './DataCard';

const Bolt = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
    <path d="M9 1 3 9h4l-1 6 6-8H8l1-6Z" />
  </svg>
);

const Clock = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Shield = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M8 1.8 13 4v4c0 3-2.2 5.4-5 6.2C5.2 13.4 3 11 3 8V4l5-2.2Z" strokeLinejoin="round" />
  </svg>
);

const Alert = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M8 2.5 14.5 13.5h-13L8 2.5Z" strokeLinejoin="round" />
    <path d="M8 6.8v3M8 12h.01" strokeLinecap="round" />
  </svg>
);

type Card = Omit<DataCardProps, 'onActivate'> & { id: string; tone: CardTone };

const CARDS: Card[] = [
  {
    id: 'ingest',
    tone: 'accent',
    eyebrow: 'Live',
    title: 'Events ingested',
    value: '4.28B',
    icon: <Bolt />,
    trend: { direction: 'up', label: '+12.4%', series: [22, 28, 25, 34, 31, 42, 39, 48, 52, 61] },
    footer: 'Rolling 24 hours',
  },
  {
    id: 'latency',
    tone: 'neutral',
    eyebrow: 'p99',
    title: 'Write latency',
    value: '38ms',
    icon: <Clock />,
    trend: { direction: 'down', label: '-6ms', series: [58, 54, 55, 48, 46, 44, 41, 40, 39, 38] },
    footer: 'Target 50ms',
  },
  {
    id: 'uptime',
    tone: 'positive',
    eyebrow: '90 days',
    title: 'Availability',
    value: '99.99%',
    icon: <Shield />,
    trend: { direction: 'flat', label: 'no change' },
    footer: 'Four minutes of budget left',
  },
  {
    id: 'errors',
    tone: 'critical',
    eyebrow: 'Last hour',
    title: 'Failed writes',
    value: '1,204',
    icon: <Alert />,
    trend: { direction: 'up', label: '+318', series: [4, 6, 5, 9, 14, 12, 22, 31, 44, 62] },
    footer: 'Two incidents open',
  },
];

export default function ShellDataCardDemo() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <ShellStage hint="Four pixels of lift, a 40px shadow at 8%, 400ms. Small on purpose — a bento wall is a dozen of these under one pointer sweep.">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">Unit</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">DataCard</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            One card, four tones, one hover gesture. The lift is a transform and the shadow is a
            shadow — nothing here animates a box-model property.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
            Activatable — real button semantics, in the tab ring
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card) => (
              <DataCard
                key={card.id}
                {...card}
                spotlight
                onActivate={() => setPicked(card.id === picked ? null : card.id)}
                className={
                  card.id === picked
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0b0b0d]'
                    : ''
                }
              />
            ))}
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Selected: <span className="font-medium">{picked ?? 'none'}</span> — tab into the row and
            press Enter. Without <code className="font-mono text-[12px]">onActivate</code> the same
            card renders as a plain div and stays out of the tab ring.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
            Static — a lift is not a reason to be focusable
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DataCard
              eyebrow="Region"
              title="ap-south-1"
              value="1.12B"
              description="Chennai and Mumbai, steered by measured latency rather than by geography."
              trend={{ direction: 'up', label: '+4.1%' }}
              footer="Added Q1"
            />
            <DataCard
              eyebrow="Region"
              title="eu-west-2"
              value="884M"
              description="London. Two availability zones, one of them added after the March incident."
              trend={{ direction: 'down', label: '-1.8%' }}
              footer="Stable"
            />
            <DataCard eyebrow="Composition" title="Anything in the body">
              <div className="flex h-full items-end gap-1.5">
                {[34, 52, 41, 68, 57, 76, 64, 88].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: h + '%' }}
                    className="flex-1 rounded-[3px] bg-gradient-to-t from-indigo-500/20 to-indigo-500/60 transition-all duration-400 ease-out group-hover:to-fuchsia-500"
                  />
                ))}
              </div>
            </DataCard>
          </div>
        </section>
      </div>
    </ShellStage>
  );
}
