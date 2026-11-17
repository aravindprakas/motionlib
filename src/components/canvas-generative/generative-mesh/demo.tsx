// ui-75 — GenerativeMesh
import { GenerativeMesh } from './GenerativeMesh';

export default function GenerativeMeshDemo() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] px-8 py-16">
      <div className="mx-auto mb-10 max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">[ lab_unit: 004 ]</p>
        <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight">Simulation parameters</h2>
      </div>
      <GenerativeMesh />
    </section>
  );
}
