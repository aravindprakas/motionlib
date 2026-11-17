// ui-101 — Form Fields
import { EmailField } from '../email-field/EmailField';
import { FloatingLabelField } from '../floating-label-field/FloatingLabelField';

export default function FieldsDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex w-full max-w-md flex-col gap-14">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em]">email field</p>
          <div className="flex border border-ink">
            <EmailField />
            <button className="cursor-pointer bg-ink px-4 py-[13px] font-mono text-[11px] tracking-[0.1em] text-paper">
              →
            </button>
          </div>
        </div>
        <div>
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">floating label — pure css, no js</p>
          <div className="flex flex-col gap-8">
            <FloatingLabelField label="FULL NAME" />
            <FloatingLabelField label="COMPANY" />
          </div>
        </div>
      </div>
    </section>
  );
}
