// ui-97 — Glimpse
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ease } from '@/lib/motion';

/**
 * Glimpse — a link that unfurls a live preview card on hover/focus.
 *
 * Adapted from the Kibo UI "Glimpse" (a Next.js Server Component that scrapes
 * OpenGraph tags on the server) to run entirely client-side in this Vite SPA:
 *  - the hover-card is hand-rolled on framer-motion instead of Radix HoverCard;
 *  - OpenGraph data is fetched live at runtime through Microlink's CORS-enabled
 *    metadata API, since browsers can't scrape cross-origin HTML directly.
 *  Results are cached per URL at module scope so repeat hovers never refetch.
 *  Pass `title`/`description`/`image` to skip the network entirely.
 */

export interface GlimpseData {
  title?: string;
  description?: string;
  image?: string;
}

const cache = new Map<string, GlimpseData>();

async function fetchGlimpse(url: string, signal: AbortSignal): Promise<GlimpseData> {
  const hit = cache.get(url);
  if (hit) return hit;

  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`preview unavailable (${res.status})`);

  const json = await res.json();
  if (json.status !== 'success') throw new Error('no preview for this link');

  const d = json.data ?? {};
  const data: GlimpseData = {
    title: d.title ?? undefined,
    description: d.description ?? undefined,
    image: d.image?.url ?? d.logo?.url ?? undefined,
  };
  cache.set(url, data);
  return data;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export interface GlimpseProps {
  href: string;
  children: ReactNode;
  /** Provide any of these to skip the live fetch and render static content. */
  title?: string;
  description?: string;
  image?: string;
  openDelay?: number;
  closeDelay?: number;
}

type Status = 'idle' | 'loading' | 'error';

export function Glimpse({
  href,
  children,
  title,
  description,
  image,
  openDelay = 140,
  closeDelay = 120,
}: GlimpseProps) {
  const manual = Boolean(title || description || image);

  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GlimpseData | null>(
    manual ? { title, description, image } : null,
  );
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const abortRef = useRef<AbortController>();
  const fetched = useRef(false);

  const load = useCallback(() => {
    if (manual || fetched.current) return;
    fetched.current = true;
    setStatus('loading');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    fetchGlimpse(href, ctrl.signal)
      .then((d) => {
        setData(d);
        setStatus('idle');
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'preview failed');
        setStatus('error');
        fetched.current = false; // allow a retry on the next hover
      });
  }, [href, manual]);

  const show = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      load();
    }, openDelay);
  }, [load, openDelay]);

  const hide = useCallback(() => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
      abortRef.current?.abort();
    },
    [],
  );

  return (
    <span
      className="relative inline-block"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-accent underline decoration-from-font underline-offset-2 transition-colors hover:text-accent-hover"
      >
        {children}
      </a>

      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: ease.out }}
            className="absolute left-0 top-full z-50 mt-2 block w-80 border-2 border-ink bg-bone text-ink shadow-[6px_6px_0_0_#0c0b0e]"
            role="dialog"
            aria-label="Link preview"
          >
            {/* image / skeleton */}
            <span className="block aspect-[1.9/1] overflow-hidden border-b-2 border-ink bg-ink/5">
              {status === 'loading' && (
                <motion.span
                  className="block h-full w-full bg-ink/10"
                  animate={{ opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {status !== 'loading' && data?.image && (
                <img
                  src={data.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
              {status === 'error' && (
                <span className="flex h-full w-full items-center justify-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                  {error}
                </span>
              )}
            </span>

            <span className="block p-4">
              {status === 'loading' ? (
                <span className="block space-y-2">
                  <span className="block h-3 w-2/3 bg-ink/15" />
                  <span className="block h-2.5 w-full bg-ink/10" />
                  <span className="block h-2.5 w-4/5 bg-ink/10" />
                </span>
              ) : (
                <>
                  {data?.title && (
                    <span className="block font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                      {data.title}
                    </span>
                  )}
                  {data?.description && (
                    <span className="mt-1.5 block font-serif text-sm italic leading-snug text-ink/70">
                      {data.description}
                    </span>
                  )}
                </>
              )}

              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                {hostOf(href)}
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
