import { Manifesto } from './Manifesto';
import { sampleManifestoPoints } from '@/lib/sample-data';

export default function ManifestoDemo() {
  return (
    <div>
      <section className="grid min-h-[40vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓</p>
      </section>
      <Manifesto points={sampleManifestoPoints} />
    </div>
  );
}
