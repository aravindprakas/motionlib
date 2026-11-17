import { SpecimenCard } from './SpecimenCard';
import { sampleSpecimens } from '@/lib/sample-data';

export default function SpecimenCardDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-10 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">hover the plate — background swap reveals the invert layer</p>
      <div className="grid max-w-3xl grid-cols-1 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2">
        {sampleSpecimens.slice(0, 2).map((item) => (
          <SpecimenCard key={item.sku} item={item} />
        ))}
      </div>
    </section>
  );
}
