// Sidebar — hover it, pin it, collapse it; three widths that compose
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { Sidebar, type SidebarGroup } from './Sidebar';

const icon = (d: string) => (
  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GROUPS: SidebarGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: icon('M3 10.5 10 4l7 6.5M5.5 9v7h9V9') },
      { id: 'analytics', label: 'Analytics', icon: icon('M4 16V9M10 16V4M16 16v-5'), badge: 3 },
      { id: 'pipelines', label: 'Pipelines', icon: icon('M4 6h5l2 4h5M4 14h5l2-4') },
      { id: 'storage', label: 'Storage', icon: icon('M3 6c0-1.1 3.1-2 7-2s7 .9 7 2v8c0 1.1-3.1 2-7 2s-7-.9-7-2V6ZM3 10c0 1.1 3.1 2 7 2s7-.9 7-2') },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    items: [
      { id: 'members', label: 'Members', icon: icon('M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 16c0-2.2 1.8-4 4-4s4 1.8 4 4M13 5.5a2.5 2.5 0 0 1 0 5M17 16c0-2-1.2-3.4-3-3.9'), badge: 12 },
      { id: 'audit', label: 'Audit log', icon: icon('M6 3h6l4 4v10H6V3ZM12 3v4h4M8.5 11h5M8.5 14h3') },
      { id: 'billing', label: 'Billing', icon: icon('M3 7h14v8H3V7ZM3 10h14M6 13h2') },
    ],
  },
  {
    id: 'system',
    items: [
      { id: 'settings', label: 'Settings', icon: icon('M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM10 2.5v2M10 15.5v2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M2.5 10h2M15.5 10h2M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4') },
      { id: 'help', label: 'Help & docs', icon: icon('M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM8.2 8a1.8 1.8 0 1 1 2.3 1.7c-.4.2-.5.5-.5.9M10 13.5h.01') },
    ],
  },
];

export default function ShellSidebarDemo() {
  const [active, setActive] = useState('analytics');

  return (
    <ShellStage
      bleed
      hint="Hover the rail: 280 to 320. Collapse it: 76, and hovering brings it back to 280 without un-collapsing. Tab into it and it peeks open on its own."
    >
      <div className="flex h-[calc(100vh-3.5rem)] min-h-[560px]">
        <Sidebar
          groups={GROUPS}
          activeId={active}
          onSelect={setActive}
          footer={
            <div className="flex items-center gap-3 rounded-[14px] px-[13px] py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[999px] bg-gradient-to-br from-emerald-400 to-teal-500 text-[11px] font-semibold text-white">
                AR
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-gray-600 dark:text-gray-300">
                Aravind
              </span>
            </div>
          }
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
            {active}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
            The main column does not move on its own
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            The rail animates <code className="font-mono text-[13px]">width</code>, which is a layout
            property — deliberately, because a sidebar that widened by transform would slide over
            this column instead of moving it, and the whole point of the gesture is that the page
            makes room. <code className="font-mono text-[13px]">contain: layout paint</code> bounds
            the reflow to the rail's own box so it never reaches this text.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              ['Labels lead the width', 'They fade out before the rail is narrow enough to clip them, and fade in a beat after it starts widening. Without the offset the collapse looks like text being cut off.'],
              ['One indicator, not two', 'The active pill is a single layoutId element that travels between items, so switching sections is a continuous move rather than two cross-fades.'],
              ['Badges survive the collapse', 'A count becomes a dot at 76px. Losing the signal entirely is worse than losing the number.'],
              ['Hover is off on touch', 'A coarse pointer has no hover to speak of, so peek is disabled and the toggle is the whole interaction.'],
            ].map(([title, body]) => (
              <section
                key={title}
                className="rounded-[24px] border border-gray-100 bg-white p-6 transition-all duration-400 ease-out hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              >
                <h2 className="text-[14px] font-semibold tracking-[-0.02em]">{title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {body}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </ShellStage>
  );
}
