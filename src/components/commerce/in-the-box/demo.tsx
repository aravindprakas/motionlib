// InTheBox
import { InTheBox } from './InTheBox';

const contents = [
  { name: 'Foundry Shell Parka' },
  { name: 'Spare storm-flap studs', qty: '×4' },
  { name: 'Repair swatch, shell fabric' },
  { name: 'Garment bag, cotton' },
  { name: 'Care & re-proofing card' },
  { name: 'Re-proofing wax tin', excluded: true },
  { name: 'Hanger', excluded: true },
];

export default function InTheBoxDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        open it — including what isn't in there
      </p>
      <InTheBox contents={contents} />
    </div>
  );
}
