// ExpeditionOpening
import { useState } from 'react';
import { ExpeditionOpening } from './ExpeditionOpening';
import type { ResolvedArtifact } from '@/lib/expedition';

export default function ExpeditionOpeningDemo() {
  const [opened, setOpened] = useState<ResolvedArtifact | null>(null);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <ExpeditionOpening onOpen={setOpened} />
      {opened && (
        <p className="exp exp-section pb-16 font-mono text-xs uppercase tracking-[0.2em]">
          Record opened: {opened.record.accession} — {opened.record.name}
        </p>
      )}
    </div>
  );
}
