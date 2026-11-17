// CostPerWear
import { CostPerWear } from './CostPerWear';

export default function CostPerWearDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        the shopper sets the usage — so the conclusion is theirs
      </p>
      <CostPerWear
        price={18900}
        months={60}
        against={{ label: 'A ₹6,000 shell', price: 6000, months: 14 }}
      />
    </div>
  );
}
