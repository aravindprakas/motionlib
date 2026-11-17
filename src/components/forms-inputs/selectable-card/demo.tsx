// ui-102 — SelectableCardGroup
import { SelectableCardGroup } from './SelectableCard';

const OPTIONS = [
  { value: 'a', label: 'Option A', note: 'card reacts via :has()' },
  { value: 'b', label: 'Option B', note: 'parent styled by child' },
  { value: 'c', label: 'Option C', note: 'no JS involved' },
];

export default function SelectableCardDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">css :has() selection</p>
      <SelectableCardGroup options={OPTIONS} />
      <p className="max-w-lg font-serif text-lg italic">
        The border and fill react to the checked radio purely via CSS — two groups on one page stay independent
        thanks to auto-scoped names.
      </p>
      <SelectableCardGroup
        options={[
          { value: 'x', label: 'Second group', note: 'independent selection' },
          { value: 'y', label: 'Same page', note: 'useId-scoped name' },
        ]}
      />
    </section>
  );
}
