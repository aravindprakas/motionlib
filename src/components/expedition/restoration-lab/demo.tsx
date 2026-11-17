// RestorationLab
import { useState } from 'react';
import { RestorationLab, type RestorationState } from './RestorationLab';
import { RESOLVED } from '@/lib/expedition';

export default function RestorationLabDemo() {
  const [committed, setCommitted] = useState<RestorationState | null>(null);

  return (
    <div className="exp min-h-[calc(100vh-3.5rem)]">
      <RestorationLab artifact={RESOLVED[0]} onCommit={setCommitted} />
      {committed && (
        <p className="exp-section exp-meta pb-16">
          Committed — ground {committed.fabricId}, carrier {committed.garmentId}, zone{' '}
          {committed.zoneId}, {Math.round(committed.widthMm)}mm,{' '}
          {Object.keys(committed.threads).length} block(s) re-threaded.
        </p>
      )}
    </div>
  );
}
