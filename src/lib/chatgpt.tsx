import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useReducedMotion } from './useReducedMotion';

export type DataState = 'ready' | 'loading' | 'empty' | 'error' | 'partial';
export interface AsyncSurfaceProps { state?: DataState; onRetry?: () => void }
export const instrumentSpring = { type: 'spring' as const, stiffness: 280, damping: 32 };
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function SurfaceState({ state = 'ready', onRetry, children }: AsyncSurfaceProps & { children: ReactNode }) {
  if (state === 'ready' || state === 'partial') return <>{state === 'partial' && <p className="cg-notice" role="status">Some content is unavailable. You can still work with what is here.</p>}{children}</>;
  return <div className="cg-state" role={state === 'error' ? 'alert' : 'status'} aria-busy={state === 'loading'}>
    {state === 'loading' ? <Loader2 className="cg-spin" size={28} /> : <AlertCircle size={28} />}
    <h3>{state === 'loading' ? 'Bringing things into focus' : state === 'empty' ? 'A little space for something new' : 'This could not be loaded'}</h3>
    <p>{state === 'loading' ? 'Your workspace will appear here.' : state === 'empty' ? 'Add your first item to get started.' : 'Your work is safe. Try loading this view again.'}</p>
    {onRetry && state !== 'loading' && <button className="cg-button" onClick={onRetry}><RefreshCw size={14} />{state === 'empty' ? 'Load sample content' : 'Try again'}</button>}
  </div>;
}

/** Native modal semantics, focus containment, Escape and focus restoration. */
export function InstrumentDialog({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); if (open && previous?.isConnected) previous.focus(); };
  }, [open]);
  return <dialog ref={ref} aria-labelledby={titleId} className={`cg-dialog ${className}`} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}>
    <div className="cg-dialog-heading"><h3 id={titleId}>{title}</h3><button className="cg-icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}
  </dialog>;
}

/** URL updates preserve other components' deep links and the page selection. */
export function useLinkedState(key: string, fallback: string, allowed?: readonly string[]) {
  const read = () => {
    if (typeof window === 'undefined') return fallback;
    const value = new URLSearchParams(window.location.search).get(key);
    return value && (!allowed || allowed.includes(value)) ? value : fallback;
  };
  const [value, setValue] = useState(read);
  useEffect(() => {
    const sync = () => setValue(read());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [key, fallback, allowed]);
  const update = (next: string) => {
    setValue(next);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set(key, next);
      window.history.replaceState(null, '', url);
    }
  };
  return [value, update] as const;
}

export function useInstrumentMotion() {
  const reduced = useReducedMotion();
  return { reduced, transition: reduced ? { duration: 0 } : instrumentSpring };
}

/** Decorative, code-native art: no network, stable aspect ratio and no missing assets. */
export function FrameArt({ seed = 0, className = '' }: { seed?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const palettes = [['#dcd6c8', '#b4bead', '#31483d'], ['#cdd7d8', '#718a9a', '#263b4b'], ['#eadacb', '#c48768', '#583b32'], ['#ddd8e7', '#9e91b3', '#433654']];
  const [ground, mid, ink] = palettes[Math.abs(seed) % palettes.length];
  return <svg viewBox="0 0 560 360" className={`cg-art ${className}`} aria-hidden="true" focusable="false">
    <defs><pattern id={`lines-${id}`} width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 14L14 0" stroke={ink} strokeOpacity=".08" /></pattern></defs>
    <rect width="560" height="360" fill={ground}/><circle cx={390 - seed % 3 * 45} cy="130" r="102" fill={mid}/><path d="M-40 330L185 76L410 330Z" fill={ink}/><path d="M150 360L355 178L570 360Z" fill={mid}/><rect width="560" height="360" fill={`url(#lines-${id})`}/><path d="M35 35H70M35 35V70M525 325H490M525 325V290" fill="none" stroke={ink} strokeWidth="1"/><circle cx="185" cy="76" r="5" fill={ground}/>
  </svg>;
}

export function formatNumber(value: number) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, notation: Math.abs(value) >= 10000 ? 'compact' : 'standard' }).format(value); }
