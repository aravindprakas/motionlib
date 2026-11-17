// ReceiptUnroll
import { ReceiptUnroll } from './ReceiptUnroll';

const lines = [
  { label: 'Foundry Shell Parka · M', value: '₹18,900' },
  { label: 'Margin Wool Scarf', value: '₹4,100' },
  { label: 'Subtotal', value: '₹23,000', rule: true },
  { label: 'Bundle −10%', value: '−₹2,300' },
  { label: 'Shipping', value: 'Free' },
  { label: 'GST (12%)', value: '₹2,484' },
];

export default function ReceiptUnrollDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-start justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        confirmation that prints — the total lands last, on purpose
      </p>
      <ReceiptUnroll orderId="AR-26-081402" lines={lines} total="₹23,184" />
    </div>
  );
}
