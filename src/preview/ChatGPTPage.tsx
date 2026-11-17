import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, Copy, Layers3, Moon, RotateCcw, Sun } from 'lucide-react';
import { chatgptStudies } from '@/lib/chatgpt-catalog';
import { useLinkedState, type DataState } from '@/lib/chatgpt';

const studyIds = chatgptStudies.map(study => study.id);
type Tab = 'experience' | 'design' | 'api' | 'source';

export default function ChatGPTPage() {
  const [selected, setSelected] = useLinkedState('study', studyIds[0], studyIds);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('cg-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [tab, setTab] = useState<Tab>('experience');
  const [state, setState] = useState<DataState>('ready');
  const [reset, setReset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState('');
  const [sourceError, setSourceError] = useState(false);
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const index = Math.max(0, chatgptStudies.findIndex(study => study.id === selected));
  const study = chatgptStudies[index];
  useEffect(() => { const previous = document.title; document.title = 'ChatGPT — Interaction Studies · Motion Lib'; return () => { document.title = previous; }; }, []);
  useEffect(() => { try { localStorage.setItem('cg-theme', theme); } catch { /* Theme remains usable for this visit. */ } }, [theme]);
  useEffect(() => { setTab('experience'); setState('ready'); setCopied(false); }, [selected]);
  useEffect(() => { if (tab !== 'source') return; let live = true; setSource(''); setSourceError(false); study.source().then(result => { if (live) setSource(result.default); }).catch(() => { if (live) setSourceError(true); }); return () => { live = false; }; }, [study, tab]);
  const choose = (id: string, focus = false) => { setSelected(id); if (focus) requestAnimationFrame(() => stageHeading.current?.focus()); };
  const copy = async () => { try { await navigator.clipboard.writeText(`import { ${study.name.replace(/[^a-zA-Z]/g, '')} } from '@/components/chatgpt/${study.id}/${study.name.replace(/[^a-zA-Z]/g, '')}';\n\n${study.usage}`); setCopied(true); } catch { setCopied(false); } };
  return <div className="cg-theme cg-page" data-theme={theme} onKeyDown={e => { if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); choose(studyIds[(index + (e.key === 'ArrowDown' ? 1 : -1) + studyIds.length) % studyIds.length], true); } }}>
    <a className="cg-skip" href="#cg-stage-heading">Skip to the active study</a>
    <aside className="cg-rail"><a href="/" className="cg-library-link"><ArrowLeft size={14}/>Motion Lib</a><div className="cg-brand"><span className="cg-brand-mark" aria-hidden="true"><Layers3 size={22}/></span><div>ChatGPT<small>INTERACTION STUDIES</small></div></div><div className="cg-rail-intro"><span className="cg-eyebrow">COLLECTION / 01</span><p>Ten ways to make<br/>the interface feel alive.</p></div>
      <nav className="cg-study-nav" aria-label="ChatGPT component studies">{chatgptStudies.map((item, i) => <button key={item.id} aria-current={selected === item.id ? 'page' : undefined} onClick={() => choose(item.id)}><span>{String(i + 1).padStart(2, '0')}</span><span>{item.shortName}<small>{item.family}</small></span><ArrowUpRight size={14}/></button>)}</nav>
      <div className="cg-rail-bottom"><span className="cg-live"><i/>Made to be used.</span><small>React · TypeScript · Motion</small><span className="cg-mono">ALT + ↑ / ↓ TO EXPLORE</span></div>
    </aside>
    <main className="cg-page-main"><header className="cg-page-header"><div className="cg-breadcrumb">Motion Lib<span>/</span>ChatGPT<span>/</span><strong>Studies</strong></div><div className="cg-inline"><a href="#cg-stage" className="cg-header-link">Explore the collection<ArrowDown size={13}/></a><button className="cg-icon-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button></div></header>
      <div className="cg-main-content"><div className="cg-page-hero"><div><div className="cg-eyebrow"><span className="cg-dot"/> DESIGN ENGINEERING / TEN EXPERIMENTS</div><h1>A little more<br/><em>than an interface.</em></h1></div><div className="cg-hero-note"><span className="cg-mono">01 — 10</span><p>Not just things to look at.<br/>Things to think with.</p><span>Purposeful motion. Useful surprises.<br/>A way forward, and a way back.</span></div></div>
        <section id="cg-stage" className="cg-study-stage" aria-labelledby="cg-stage-heading"><div className="cg-stage-heading"><div className="cg-study-number">{String(index + 1).padStart(2, '0')}<small>/ 10</small></div><div><span className="cg-eyebrow">{study.family}</span><h2 id="cg-stage-heading" ref={stageHeading} tabIndex={-1}>{study.name}</h2></div><button className="cg-icon-button" aria-label="Reset this study" onClick={() => { setReset(reset + 1); setState('ready'); }}><RotateCcw size={15}/></button></div>
          <div className="cg-stage-toolbar"><nav className="cg-stage-tabs" aria-label="Study information">{([{ id: 'experience', label: 'Experience' }, { id: 'design', label: 'Design notes' }, { id: 'api', label: 'API & usage' }, { id: 'source', label: 'Source' }] as { id: Tab; label: string }[]).map(item => <button key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{item.id === 'source' && <Code2 size={13}/>} {item.label}</button>)}</nav>{tab === 'experience' && <label className="cg-state-control"><span>Preview state</span><select value={state} onChange={e => setState(e.target.value as DataState)} aria-label="Preview component data state"><option value="ready">Live</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="error">Error</option><option value="partial">Partial</option></select></label>}</div>
          <div className="cg-demo-stage" data-tab={tab}>{tab === 'experience' ? <study.Demo key={`${study.id}-${reset}`} state={state} onRetry={() => setState('ready')}/> : tab === 'design' ? <article className="cg-design-notes"><span className="cg-eyebrow">THE RELATIONSHIP WE’RE EXPLORING</span><h3>{study.concept}</h3><p className="cg-design-lead">{study.novelty}</p><dl>{[['Interaction', study.interaction], ['Responsive behavior', study.responsive], ['Accessibility', study.accessibility], ['Motion & performance', study.performance]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article> : tab === 'api' ? <article className="cg-api"><div className="cg-between"><h3>A small, purposeful API.</h3><button className="cg-button cg-small" onClick={() => void copy()}>{copied ? <Check size={14}/> : <Copy size={14}/>}{copied ? 'Copied' : 'Copy usage'}</button></div><p>Content belongs to your data. Behavior belongs to the component.</p><pre><code>{study.api}</code></pre><span className="cg-eyebrow">EXAMPLE USAGE</span><pre><code>{study.usage}</code></pre><p className="cg-footnote">Import the shared chatgpt.css stylesheet and wrap your component with the cg-theme class. Full types are in Source.</p><span role="status" className="cg-sr-only">{copied ? 'Example usage copied.' : ''}</span></article> : <article className="cg-source"><div className="cg-between"><span className="cg-eyebrow">COMPLETE COMPONENT / TYPESCRIPT</span><span className="cg-tag">{study.name}</span></div>{sourceError ? <p role="alert">The source could not load. Reopen this tab to try again.</p> : source ? <pre tabIndex={0} aria-label={`${study.name} source code`}><code>{source}</code></pre> : <p role="status">Loading source…</p>}</article>}</div>
          <div className="cg-stage-caption"><span className="cg-dot"/><p>{study.concept}</p><span className="cg-mono">BUILT FOR EXPLORATION</span></div>
        </section>
        <div className="cg-below-stage"><div><span className="cg-eyebrow">THE IDEA</span><p>{study.novelty}</p></div><div><span className="cg-eyebrow">TRY THIS</span><p>{study.interaction}</p></div><div className="cg-next-study"><span className="cg-eyebrow">UP NEXT / {String(index === 9 ? 1 : index + 2).padStart(2, '0')}</span><button onClick={() => choose(studyIds[(index + 1) % studyIds.length], true)}>{chatgptStudies[(index + 1) % 10].shortName}<ArrowRight size={19}/></button></div></div>
        <footer className="cg-page-footer"><span>Ten interactions. One coherent language.</span><a href="/">Back to Motion Lib<ArrowUpRight size={13}/></a></footer>
      </div>
    </main>
  </div>;
}
