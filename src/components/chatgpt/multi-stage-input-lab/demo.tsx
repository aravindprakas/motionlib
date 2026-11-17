import { useState } from 'react';
import { MultiStageInputLab, type ProjectDraft } from './MultiStageInputLab';
import { SurfaceState, type AsyncSurfaceProps } from '@/lib/chatgpt';
export default function Demo(props: AsyncSurfaceProps) {
  const [created, setCreated] = useState<ProjectDraft | null>(null);
  return <SurfaceState {...props}><MultiStageInputLab validateName={async (name, signal) => { await Promise.resolve(); return signal.aborted ? null : name.toLowerCase() === 'admin' ? '“Admin” is reserved. Try a more personal name.' : null; }} onSubmit={async (draft, signal) => { if (signal.aborted) return; try { localStorage.setItem('cg-created-project', JSON.stringify(draft)); } catch { throw new Error('This browser could not save the project. Check storage access and try again.'); } setCreated(draft); }}/>{created && <p className="cg-footnote">Saved “{created.name}” on this device. This demo creates a local project.</p>}</SurfaceState>;
}
