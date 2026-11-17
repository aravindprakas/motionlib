// Modal — the overlay and the panel are one gesture on one 300ms clock
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { Modal, type ModalSize } from './Modal';

const button =
  'inline-flex h-11 items-center gap-2 rounded-[14px] border border-gray-200 bg-white px-5 text-[13.5px] font-medium text-gray-700 outline-none transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/12 dark:bg-white/[0.04] dark:text-gray-200 dark:focus-visible:ring-offset-[#0b0b0d]';

const solid =
  'inline-flex h-10 items-center rounded-[12px] bg-gray-900 px-4 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:opacity-90 active:scale-95 dark:bg-white dark:text-gray-900';

const quiet =
  'inline-flex h-10 items-center rounded-[12px] px-4 text-[13px] font-medium text-gray-500 transition-all duration-200 ease-out hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-white/10';

const danger =
  'inline-flex h-10 items-center rounded-[12px] bg-rose-600 px-4 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:bg-rose-500 active:scale-95';

type Which = 'standard' | 'confirm' | 'long' | null;

export default function ShellModalDemo() {
  const [open, setOpen] = useState<Which>(null);
  const [size, setSize] = useState<ModalSize>('md');
  const close = () => setOpen(null);

  return (
    <ShellStage hint="Open one, then press Escape or Tab around inside it. Focus is contained, and on close it returns to the exact button you pressed.">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
            Overlay
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Modal</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            The overlay's blur and the panel's zoom run off the same{' '}
            <code className="font-mono text-[13.5px]">data-state</code> on the same 300ms ease-out,
            so the ground goes soft at exactly the rate the panel arrives.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">Size</h2>
          <div className="flex flex-wrap gap-2">
            {(['sm', 'md', 'lg'] as ModalSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={
                  'h-9 rounded-[999px] px-4 text-[12px] font-medium uppercase tracking-[0.12em] transition-all duration-200 ease-out active:scale-95 ' +
                  (size === s
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'border border-gray-200 text-gray-500 hover:text-gray-900 dark:border-white/10 dark:text-gray-400')
                }
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <button type="button" className={button} onClick={() => setOpen('standard')}>
            Standard dialog
          </button>
          <button type="button" className={button} onClick={() => setOpen('confirm')}>
            Destructive confirmation
          </button>
          <button type="button" className={button} onClick={() => setOpen('long')}>
            Scrolling body
          </button>
        </section>

        <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/60 p-6 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="text-[14px] font-semibold tracking-[-0.02em]">What is actually wired up</h2>
          <ul className="space-y-1.5 text-[13px] text-gray-500 dark:text-gray-400">
            <li>
              <code className="font-mono text-[12px]">role="dialog"</code> with{' '}
              <code className="font-mono text-[12px]">aria-modal</code>, title through{' '}
              <code className="font-mono text-[12px]">aria-labelledby</code>, description through{' '}
              <code className="font-mono text-[12px]">aria-describedby</code>
            </li>
            <li>Tab and Shift+Tab wrap inside the panel; the ring is recomputed on each keypress</li>
            <li>Focus returns to the trigger on close — not to the top of the document</li>
            <li>Body scroll locked with the scrollbar gutter replaced as padding, so nothing shifts</li>
            <li>The destructive one ignores overlay clicks; Escape still works</li>
          </ul>
        </div>

        {/* Runway, so the lock has something to hold still. */}
        <div className="h-[60vh] rounded-[24px] border border-dashed border-gray-200 dark:border-white/10" />
      </div>

      <Modal
        open={open === 'standard'}
        onClose={close}
        size={size}
        title="Invite people to Aperture"
        description="They will get access to every project in this workspace until you scope them down."
        footer={
          <>
            <button type="button" className={quiet} onClick={close}>
              Cancel
            </button>
            <button type="button" className={solid} onClick={close}>
              Send invites
            </button>
          </>
        }
      >
        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-gray-400">
            Email addresses
          </span>
          <input
            type="text"
            placeholder="ana@studio.com, ravi@studio.com"
            className="mt-2 h-11 w-full rounded-[12px] border border-gray-200 bg-white px-3.5 text-[14px] outline-none transition-all duration-200 ease-out placeholder:text-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/12 dark:bg-white/[0.04] dark:placeholder:text-gray-600"
          />
        </label>
        <p className="mt-4 text-[13px]">
          Focus was moved into this panel — to its first tabbable element — on the frame after the
          entrance started. Focusing something mid-transform makes some browsers scroll the
          untransformed box into view and jump the page.
        </p>
      </Modal>

      <Modal
        open={open === 'confirm'}
        onClose={close}
        size="sm"
        dismissOnOverlay={false}
        title="Delete billing-worker?"
        description="This removes the service, its logs and its replay buffer. It cannot be undone."
        footer={
          <>
            <button type="button" className={quiet} onClick={close}>
              Keep it
            </button>
            <button type="button" className={danger} onClick={close}>
              Delete permanently
            </button>
          </>
        }
      >
        <p className="text-[13.5px]">
          Overlay clicks are ignored here. A confirmation you can dismiss by missing the panel is a
          confirmation that will eventually be dismissed by accident.
        </p>
      </Modal>

      <Modal
        open={open === 'long'}
        onClose={close}
        size={size}
        title="Changelog"
        description="The body scrolls; the header and footer do not."
        footer={
          <button type="button" className={solid} onClick={close}>
            Done
          </button>
        }
      >
        <div className="space-y-5">
          {Array.from({ length: 10 }, (_, i) => (
            <section key={i}>
              <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-white">
                2026.09.{String(10 - i).padStart(2, '0')}
              </h3>
              <p className="mt-1.5">
                Ingest gateway now steers by measured latency rather than by geography. Replay buffer
                compaction moved off the write path. Two regions added to the edge fleet.
              </p>
            </section>
          ))}
        </div>
      </Modal>
    </ShellStage>
  );
}
