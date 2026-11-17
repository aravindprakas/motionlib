// ui-104 — ConversationalForm
import { ConversationalForm } from './ConversationalForm';

export default function ConversationalFormDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8 py-12">
      <div className="flex flex-col items-center gap-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">chat intake</p>
        <ConversationalForm />
        <p className="max-w-md text-center font-serif text-lg italic">
          A form disguised as a conversation — quick-reply chips, free text, and inline validation, one question at a time.
        </p>
      </div>
    </section>
  );
}
