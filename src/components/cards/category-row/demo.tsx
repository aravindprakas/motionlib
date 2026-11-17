// ui-80 — CategoryRow
import { CategoryRow } from './CategoryRow';
import { sampleCategories } from '@/lib/sample-data';

export default function CategoryRowDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-10">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">index rows — hover to slide (transform, not padding)</p>
      <div>
        {sampleCategories.map((c) => (
          <CategoryRow key={c.no} no={c.no} label={c.label} countText={c.countText} />
        ))}
        <div className="border-t border-ink/15" />
      </div>
    </section>
  );
}
