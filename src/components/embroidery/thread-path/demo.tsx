// ThreadPath
import { useState } from 'react';
import { ThreadPath } from './ThreadPath';

const STEPS = [
  { id: 'brief', label: 'Brief', note: '12 Feb' },
  { id: 'digitise', label: 'Digitising', note: '14 Feb' },
  { id: 'sample', label: 'Sew-out', note: '17 Feb' },
  { id: 'approve', label: 'Approval', note: 'Pending' },
  { id: 'run', label: 'Production', note: '—' },
];

export default function ThreadPathDemo() {
  const [active, setActive] = useState('sample');
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col justify-center gap-12 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        thread ahead of the needle hangs slack — behind it, it is pulled tight
      </p>
      <ThreadPath steps={STEPS} activeId={active} onChange={setActive} />
    </div>
  );
}
