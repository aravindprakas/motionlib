import { motion } from 'framer-motion';
import { registry, flatRegistry } from '@/lib/registry';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Sparkles } from 'lucide-react';

export type LibraryPage = 'library' | 'gemini';

export interface SidebarProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  page: LibraryPage;
  onNavigate: (page: LibraryPage) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function Sidebar({ selectedIndex, onSelect, page, onNavigate }: SidebarProps) {
  const reduced = useReducedMotion();
  const categories = registry.filter(category => page === 'gemini' ? category.key === 'gemini' : category.key !== 'gemini');
  const entries = categories.flatMap(category => category.entries);

  return (
    <aside className="motion-library-sidebar flex shrink-0 flex-col border-r border-ink">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="motion-library-brand border-b border-ink px-6 py-6"
      >
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
          Motion Lib<span className="text-vermilion">.</span>
        </h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em]">
          {entries.length} components — {page === 'gemini' ? 'AURA-10 collection' : 'brutalist edition'}
        </p>
      </motion.div>

      <nav aria-label="Collections" className="grid grid-cols-2 border-b border-ink font-mono text-[11px] uppercase tracking-wider">
        {(['library', 'gemini'] as const).map(item => <a key={item} href={item === 'gemini' ? '/gemini' : '/'} aria-current={page === item ? 'page' : undefined} onClick={event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate(item); }} className={`flex items-center justify-center gap-2 px-3 py-4 ${page === item ? 'bg-ink text-bone' : 'hover:bg-ink/10'}`}>{item === 'gemini' && <Sparkles size={13} />}{item === 'library' ? 'Library' : 'Gemini'}</a>)}
      </nav>

      <div className="motion-library-mobile-select"><label htmlFor="mobile-component" className="font-mono text-[10px] uppercase">Preview</label><select id="mobile-component" value={selectedIndex} onChange={event => Number(event.target.value) < 0 ? onNavigate('gemini') : onSelect(Number(event.target.value))}>{page === 'gemini' && <option value={-1}>Gemini overview</option>}{categories.map(category => <optgroup key={category.key} label={category.label}>{category.entries.map(entry => <option key={entry.id} value={flatRegistry.findIndex(item => item.id === entry.id)}>{entry.name}</option>)}</optgroup>)}</select></div>

      <a href="/chatgpt" className="flex items-center justify-between border-b border-ink px-6 py-4 font-display text-sm font-semibold hover:bg-ink hover:text-bone">
        <span>ChatGPT <span className="ml-2 font-mono text-[10px] font-normal">10 studies</span></span><span aria-hidden="true">↗</span>
      </a>

      <a
        href="/claude/"
        className="flex min-h-[52px] items-center justify-between border-b border-ink bg-ink px-6 py-3 font-display text-[13px] uppercase tracking-wide text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-vermilion"
      >
        <span>Claude <span className="ml-2 font-mono text-[10px] text-vermilion">10 experiments</span></span>
        <span aria-hidden="true">↗</span>
      </a>

      <nav className="motion-library-component-nav min-h-0 flex-1 overflow-y-auto" aria-label="Components">
        {page === 'gemini' && <button className={`w-full border-b border-ink/15 px-6 py-4 text-left font-display text-sm ${selectedIndex < 0 ? 'bg-vermilion' : 'hover:bg-ink hover:text-bone'}`} onClick={() => onNavigate('gemini')} aria-current={selectedIndex < 0 ? 'page' : undefined}>AURA—10 / Overview</button>}
        {categories.map((category) => (
          <div key={category.key}>
            <div className="border-b border-ink bg-ink px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone">
              {category.label}
            </div>
            {category.entries.map((entry) => {
              const index = flatRegistry.findIndex(item => item.id === entry.id);
              const localIndex = entries.findIndex(item => item.id === entry.id);
              const active = index === selectedIndex;
              return (
                <motion.button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelect(index)}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : 0.1 + Math.min(index, 14) * 0.03, duration: 0.4, ease: EASE }}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-baseline gap-4 border-b border-ink/15 px-6 py-3 text-left transition-colors ${
                    active ? 'bg-vermilion' : 'hover:bg-ink hover:text-bone'
                  }`}
                >
                  <span className="font-mono text-[11px]">{String(localIndex + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[13px] font-medium uppercase tracking-wide">{entry.name}</span>
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="motion-library-sidebar-footer border-t border-ink px-6 py-4 font-mono text-[10px] uppercase tracking-[0.25em]">
        ↑ / ↓ to navigate
      </div>
    </aside>
  );
}
