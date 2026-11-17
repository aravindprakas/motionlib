// PriceHistorySpark
import { PriceHistorySpark } from './PriceHistorySpark';

// 90 days of a plausible, slightly noisy price with two real markdowns.
const history = Array.from({ length: 90 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (89 - i));
  let price = 21400;
  if (i > 34) price = 19900;
  if (i > 68) price = 18900;
  price += Math.round(Math.sin(i * 0.7) * 120);
  return { date: day.toISOString().slice(0, 10), price };
});

export default function PriceHistorySparkDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        scrub the line — the discount is checkable, not asserted
      </p>
      <PriceHistorySpark history={history} />
    </div>
  );
}
