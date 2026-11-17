// ArtifactCatalog
import { useState } from 'react';
import { ArtifactCatalog } from './ArtifactCatalog';
import { RESOLVED, TERRITORIES } from '@/lib/expedition';

export default function ArtifactCatalogDemo() {
  const [territory, setTerritory] = useState<string>('all');
  const artifacts =
    territory === 'all'
      ? RESOLVED
      : RESOLVED.filter((a) => a.record.territoryId === territory);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="exp exp-section pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="exp-label">Territory filter</span>
          {[{ id: 'all', name: 'All records' }, ...TERRITORIES].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTerritory(t.id)}
              aria-pressed={territory === t.id}
              className="exp-action exp-action--quiet"
              style={
                territory === t.id
                  ? { color: 'var(--exp-accent)', borderColor: 'var(--exp-accent)' }
                  : undefined
              }
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <ArtifactCatalog artifacts={artifacts} onAcquire={() => undefined} />
    </div>
  );
}
