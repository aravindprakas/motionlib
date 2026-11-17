// ui-110 — FAQ
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqGroup {
  eyebrow: string;
  title: string;
  items: FaqItem[];
}

const DEFAULT_GROUPS: FaqGroup[] = [
  {
    eyebrow: '01',
    title: 'Pricing & Engagement',
    items: [
      { q: 'How do you structure pricing?', a: 'Transparent fixed-fee pricing — no hourly surprises. Projects are scoped up front, with monthly retainers available for teams that need ongoing design and build.' },
      { q: "What's the smallest project you'll take on?", a: 'A focused three-week sprint around one critical surface — a landing page, a checkout flow, or an onboarding experience.' },
      { q: 'How do payments work?', a: '50% at kickoff, 50% on delivery. Larger engagements split across three milestones: discovery, design, and launch.' },
    ],
  },
  {
    eyebrow: '02',
    title: 'Process & Timeline',
    items: [
      { q: 'What is your typical timeline?', a: 'A full build takes four to ten weeks. Strategy is front-loaded so design and development execute without false starts.' },
      { q: 'How much time do you need from our team?', a: 'Roughly two to four hours per week from a product owner — a kickoff workshop, a weekly review, and async questions.' },
    ],
  },
];

export interface FaqProps {
  groups?: FaqGroup[];
  className?: string;
}

/**
 * Grouped FAQ accordion. Questions are organised under labelled sections; a
 * single answer is open at a time and expands with a height/opacity transition.
 */
export function Faq({ groups = DEFAULT_GROUPS, className = '' }: FaqProps) {
  const [open, setOpen] = useState<string | null>('0-0');

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`}>
      {groups.map((group, gi) => (
        <div key={group.title} className="mb-16 last:mb-0">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-vermilion">{group.eyebrow}</span>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{group.title}</h3>
          </div>

          <div className="border-t border-ink">
            {group.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = open === key;
              return (
                <div key={key} className="border-b border-ink">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-display text-lg tracking-tight">{item.q}</span>
                    <span className={`shrink-0 font-mono text-xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 font-serif text-lg italic leading-relaxed text-ink/75">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
