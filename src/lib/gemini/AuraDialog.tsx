import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useFocusTrap } from '@/lib/shell/useFocusTrap';
import { useLockBodyScroll } from '@/lib/shell/useLockBodyScroll';
import { AURA_SPRING } from '@/lib/gemini/AuraSurface';

export function AuraDialog({ open, onClose, title, children, origin }: { open: boolean; onClose: () => void; title: string; children: ReactNode; origin?: DOMRect | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  const reduced = useReducedMotion();
  useLockBodyScroll(open);
  useEffect(() => {
    if (!open || !ref.current) return;
    const element = ref.current;
    const changes: (() => void)[] = [];
    for (const sibling of Array.from(document.body.children)) {
      if (!(sibling instanceof HTMLElement) || sibling.contains(element)) continue;
      const previous = sibling.inert;
      sibling.inert = true;
      changes.push(() => { sibling.inert = previous; });
    }
    const scrollers = document.querySelectorAll<HTMLElement>('[data-aura-scroller], .overflow-y-auto');
    for (const scroller of scrollers) {
      if (scroller.contains(element) || element.contains(scroller)) continue;
      const previous = scroller.style.overflowY;
      scroller.style.overflowY = 'hidden';
      changes.push(() => { scroller.style.overflowY = previous; });
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
    };
    const blockBackground = (event: Event) => { if (!element.contains(event.target as Node)) event.preventDefault(); };
    document.addEventListener('keydown', key);
    document.addEventListener('wheel', blockBackground, { passive: false });
    document.addEventListener('touchmove', blockBackground, { passive: false });
    return () => {
      changes.reverse().forEach(restore => restore());
      document.removeEventListener('keydown', key);
      document.removeEventListener('wheel', blockBackground);
      document.removeEventListener('touchmove', blockBackground);
    };
  }, [open]);
  // Restore background interactivity before the focus trap returns focus.
  useFocusTrap(ref, open);
  if (typeof document === 'undefined') return null;
  const offset = origin ? { x: origin.x + origin.width / 2 - window.innerWidth / 2, y: origin.y + origin.height / 2 - window.innerHeight / 2 } : { x: 0, y: 20 };
  return createPortal(<AnimatePresence>{open && <motion.div className="aura aura-overlay" data-lenis-prevent initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .08 : .18 }} onPointerDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div ref={ref} className="aura-dialog" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} initial={reduced ? { opacity: 0 } : { ...offset, scaleX: origin ? Math.max(.05, origin.width / Math.min(window.innerWidth * .9, 720)) : .92, scaleY: origin ? Math.max(.05, origin.height / (window.innerHeight * .75)) : .92, opacity: 0 }} animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }} exit={reduced ? { opacity: 0 } : { ...offset, scaleX: .9, scaleY: .9, opacity: 0 }} transition={reduced ? { duration: .08 } : AURA_SPRING}>
      <div className="aura-dialog-header"><h2 id={id} className="aura-label" style={{ flex: 1 }}>{title}</h2><button className="aura-icon-button" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></div>{children}
    </motion.div>
  </motion.div>}</AnimatePresence>, document.body);
}
