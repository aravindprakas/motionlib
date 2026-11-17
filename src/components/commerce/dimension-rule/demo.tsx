// DimensionRule
import { DimensionRule } from './DimensionRule';

export default function DimensionRuleDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        manifest tote 24L — measured against a credit card, at true scale
      </p>
      <DimensionRule dimensions={{ width: 340, height: 420 }} />
    </div>
  );
}
