// ExpeditionMap
import { useState } from 'react';
import { ExpeditionMap } from './ExpeditionMap';
import type { ResolvedArtifact } from '@/lib/expedition';

export default function ExpeditionMapDemo() {
  const [picked, setPicked] = useState<ResolvedArtifact | null>(null);

  return (
    <div className="exp min-h-[calc(100vh-3.5rem)]">
      <ExpeditionMap onSelectArtifact={setPicked} />
      <p className="exp-section exp-meta pb-16">
        {picked
          ? `Opened from the survey: ${picked.record.accession} — ${picked.record.name}`
          : 'Enter a territory, then pick a point on the ground.'}
      </p>
    </div>
  );
}
