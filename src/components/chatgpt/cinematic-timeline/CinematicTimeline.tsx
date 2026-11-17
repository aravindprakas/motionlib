import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FrameArt, SurfaceState, clamp, useInstrumentMotion, useLinkedState, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface TimelineFrame { id: string; title: string; chapter: string; date: string; description: string; seed?: number }
export interface CinematicTimelineProps extends AsyncSurfaceProps { items: TimelineFrame[]; initialId?: string; onSelect?: (item: TimelineFrame) => void; linkKey?: string }

export function CinematicTimeline({ items, initialId, onSelect, linkKey = 'frame', state, onRetry }: CinematicTimelineProps) {
  const ids = useMemo(() => items.map(item => item.id), [items]);
  const [selected, setSelected] = useLinkedState(linkKey, initialId ?? items[0]?.id ?? '', ids);
  const index = Math.max(0, items.findIndex(item => item.id === selected));
  const frame = items[index];
  const rail = useRef<HTMLDivElement>(null);
  const { reduced, transition } = useInstrumentMotion();
  const start = Math.max(0, index - 3);
  const end = Math.min(items.length, index + 4);
  const select = (next: number) => { const item = items[clamp(next, 0, items.length - 1)]; if (item) { setSelected(item.id); onSelect?.(item); } };
  useEffect(() => { rail.current?.querySelector<HTMLElement>('[aria-current="step"]')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest', inline: 'center' }); }, [selected, reduced]);
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : items.length ? state : 'empty'} onRetry={onRetry}>
    {frame && <section className="cg-timeline" aria-label="Cinematic timeline" onKeyDown={e => { if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) { e.preventDefault(); select(e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : index + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)); } }}>
      <div className="cg-between"><span className="cg-eyebrow">A STORY IN {items.length} FRAMES</span><span className="cg-mono">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></div>
      <div className="cg-film-focus"><motion.div className="cg-film-image" key={frame.id} initial={reduced ? false : { clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={reduced ? { duration: 0 } : { duration: .45, ease: [.22, 1, .36, 1] }}><FrameArt seed={frame.seed}/><span className="cg-film-caption">{frame.date} / {frame.chapter}</span></motion.div><div className="cg-film-story" aria-live="polite" aria-atomic="true"><span className="cg-eyebrow">{frame.chapter}</span><h3>{frame.title}</h3><p>{frame.description}</p><div className="cg-inline"><button className="cg-icon-button" aria-label="Previous frame" disabled={index === 0} onClick={() => select(index - 1)}><ArrowLeft size={18}/></button><button className="cg-icon-button" aria-label="Next frame" disabled={index === items.length - 1} onClick={() => select(index + 1)}><ArrowRight size={18}/></button></div></div></div>
      <div ref={rail} className="cg-film-rail" tabIndex={0} aria-label="Scroll or use arrow keys to explore frames" onScroll={() => {
        const node = rail.current; if (!node) return;
        const rect = node.getBoundingClientRect();
        const vertical = window.matchMedia('(max-width: 600px)').matches;
        const center = vertical ? rect.top + node.clientHeight / 2 : rect.left + node.clientWidth / 2;
        let nearest = index, distance = Infinity;
        node.querySelectorAll<HTMLElement>('[data-frame]').forEach(el => { const box = el.getBoundingClientRect(); const d = Math.abs((vertical ? box.top + box.height / 2 : box.left + box.width / 2) - center); if (d < distance) { distance = d; nearest = Number(el.dataset.frame); } });
        if (distance < 30 && nearest !== index) select(nearest);
      }}>
        {start > 0 && <button className="cg-film-more" onClick={() => select(start - 1)}>← {start} earlier frames</button>}
        {items.slice(start, end).map((item, offset) => <motion.button layout={!reduced} transition={transition} key={item.id} data-frame={start + offset} aria-current={item.id === frame.id ? 'step' : undefined} className="cg-film-frame" onClick={() => select(start + offset)}><FrameArt seed={item.seed}/><span><small>{item.date}</small>{item.title}</span><i/></motion.button>)}
        {end < items.length && <button className="cg-film-more" onClick={() => select(end)}>{items.length - end} later frames →</button>}
      </div><p className="cg-footnote">Scroll to explore · Arrow keys to move · Every frame has its own link</p>
    </section>}
  </SurfaceState>;
}
