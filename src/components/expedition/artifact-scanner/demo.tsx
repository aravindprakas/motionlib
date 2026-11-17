// ArtifactScanner
import { useState } from 'react';
import { ArtifactScanner } from './ArtifactScanner';
import { RESOLVED } from '@/lib/expedition';

export default function ArtifactScannerDemo() {
  const [id, setId] = useState(RESOLVED[0].record.id);
  const artifact = RESOLVED.find((a) => a.record.id === id) ?? RESOLVED[0];

  return (
    <div className="exp min-h-[calc(100vh-3.5rem)]">
      <div className="exp-section flex flex-wrap items-center gap-2 pt-8">
        <span className="exp-label">Plate</span>
        {RESOLVED.slice(0, 3).map((a) => (
          <button
            key={a.record.id}
            type="button"
            className="exp-action exp-action--quiet"
            aria-pressed={a.record.id === id}
            onClick={() => setId(a.record.id)}
            style={
              a.record.id === id
                ? { color: 'var(--exp-accent)', borderColor: 'var(--exp-accent)' }
                : undefined
            }
          >
            {a.record.name}
          </button>
        ))}
      </div>
      <ArtifactScanner key={artifact.record.id} artifact={artifact} />
    </div>
  );
}
