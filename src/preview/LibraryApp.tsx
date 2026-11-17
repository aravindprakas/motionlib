import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { flatRegistry, registry } from '@/lib/registry';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Sidebar, type LibraryPage } from './Sidebar';
import { PreviewStage } from './PreviewStage';
import { GeminiPage } from './GeminiPage';

interface LocationState { page: LibraryPage; selectedId: string | null }
const geminiIds = new Set(registry.find(category => category.key === 'gemini')!.entries.map(entry => entry.id));
function readLocation(): LocationState {
  const requested = new URLSearchParams(window.location.search).get('component');
  const page = window.location.pathname.replace(/\/$/, '') === '/gemini' || !!requested && geminiIds.has(requested) ? 'gemini' : 'library';
  const matching = flatRegistry.find(entry => entry.id === requested && (page === 'gemini') === geminiIds.has(entry.id));
  return { page, selectedId: matching?.id ?? (page === 'library' ? flatRegistry.find(entry => !geminiIds.has(entry.id))!.id : null) };
}
export default function LibraryApp() {
  const [location, setLocation] = useState(readLocation);
  const reduced = useReducedMotion();
  const selectedIndex = flatRegistry.findIndex(entry => entry.id === location.selectedId);
  const entry = flatRegistry[selectedIndex];
  const navigate = (page: LibraryPage, id: string | null = null) => {
    const selectedId = id ?? (page === 'library' ? flatRegistry.find(item => !geminiIds.has(item.id))!.id : null);
    const path = page === 'gemini' ? '/gemini' : '/';
    window.history.pushState(null, '', `${path}${selectedId ? `?component=${encodeURIComponent(selectedId)}` : ''}`);
    setLocation({ page, selectedId });
  };
  useEffect(() => {
    const popstate = () => setLocation(readLocation());
    window.addEventListener('popstate', popstate);
    return () => window.removeEventListener('popstate', popstate);
  }, []);
  useEffect(() => {
    document.title = location.page === 'gemini' ? `${entry ? `${entry.name} — ` : ''}Gemini / AURA-10 — Motion Lib` : 'MOTION LIB — brutalist motion components';
  }, [location.page, entry]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || document.querySelector('[aria-modal="true"]')) return;
      if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"],[role="tree"],[role="tablist"],main button,main a')) return;
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const entries = flatRegistry.filter(item => geminiIds.has(item.id) === (location.page === 'gemini'));
      const current = entries.findIndex(item => item.id === location.selectedId);
      const next = current < 0 ? 0 : (current + (event.key === 'ArrowDown' ? 1 : -1) + entries.length) % entries.length;
      navigate(location.page, entries[next].id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [location]);
  return <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }} className="motion-library-app flex h-dvh overflow-hidden bg-bone text-ink">
    <Sidebar page={location.page} selectedIndex={selectedIndex} onSelect={index => navigate(geminiIds.has(flatRegistry[index].id) ? 'gemini' : 'library', flatRegistry[index].id)} onNavigate={page => navigate(page)} />
    {location.page === 'gemini' && !entry ? <main className="min-h-0 min-w-0 flex-1 overflow-y-auto" data-aura-scroller><GeminiPage onSelect={id => navigate('gemini', id)} /></main> : entry && <PreviewStage entry={entry} onBack={location.page === 'gemini' ? () => navigate('gemini') : undefined} />}
  </motion.div>;
}
