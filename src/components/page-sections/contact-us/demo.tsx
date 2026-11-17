import { useState } from 'react';
import { ContactUs, type ContactFormValues } from './ContactUs';

export default function ContactUsDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(values: ContactFormValues) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSubmitted(`${values.name} <${values.email}>`);
        resolve();
      }, 900);
    });
  }

  return (
    <div>
      {submitted && (
        <div className="border-b border-ink/15 bg-accent/10 px-4 py-2 text-center font-mono text-xs">
          Submitted: {submitted}
        </div>
      )}
      <ContactUs onSubmit={handleSubmit} />
    </div>
  );
}
