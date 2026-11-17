// Footer — scroll to it and the mark draws itself, once
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { Footer, type FooterColumn } from './Footer';

const COLUMNS: FooterColumn[] = [
  {
    id: 'product',
    heading: 'Product',
    links: [
      { label: 'Overview', href: '#overview' },
      { label: 'Analytics', href: '#analytics' },
      { label: 'Pipelines', href: '#pipelines' },
      { label: 'Edge network', href: '#edge' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    id: 'developers',
    heading: 'Developers',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API reference', href: '#api' },
      { label: 'Changelog', href: '#changelog' },
      { label: 'Status', href: '#status' },
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Security', href: '#security' },
      { label: 'Contact', href: '#contact' },
    ],
  },
];

export default function ShellFooterDemo() {
  const [run, setRun] = useState(0);

  return (
    <ShellStage
      bleed
      hint="Scroll down. The mark draws on intersection and latches — coming back to it does not replay it, because a page that re-animates every time you pass is a page that will not settle."
    >
      <div className="px-6 pt-10 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">Close</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Footer</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
          The one place in the set that animates a paint property. Six short paths in a 110×52 box,
          running once, at the bottom of the page, where nothing else is moving — the same terms on
          which the library's other exceptions are documented.
        </p>

        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="mt-6 inline-flex h-9 items-center rounded-[999px] border border-gray-200 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:text-gray-900 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
        >
          Reset the observer
        </button>

        <div className="mt-10 grid h-[85vh] place-items-center rounded-[24px] border border-dashed border-gray-200 text-[12px] text-gray-400 dark:border-white/10 dark:text-gray-500">
          Scroll past this
        </div>
      </div>

      <Footer
        key={run}
        brand={
          <>
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[12px] font-bold text-white">
              A
            </span>
            Aperture
          </>
        }
        blurb="Event infrastructure for teams who would rather not run event infrastructure. Fourteen regions, one API, no cluster to babysit."
        columns={COLUMNS}
        meta={
          <>
            <span>© 2026 Aperture Systems</span>
            <span className="flex items-center gap-5">
              <a
                href="#privacy"
                className="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Privacy
              </a>
              <a
                href="#terms"
                className="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Terms
              </a>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-[999px] bg-emerald-500" />
                All systems normal
              </span>
            </span>
          </>
        }
      />
    </ShellStage>
  );
}
