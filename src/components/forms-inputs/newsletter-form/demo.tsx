import { useState } from 'react';
import { NewsletterForm } from './NewsletterForm';

export default function NewsletterFormDemo() {
  const [subscribed, setSubscribed] = useState<string | null>(null);
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="w-full max-w-md">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em]">newsletter</p>
        <p className="mb-4 font-serif text-xl italic">One email per month. New drops, restocks, nothing else.</p>
        <NewsletterForm onSubmit={setSubscribed} />
        {subscribed && (
          <p className="mt-4 border border-ink/15 bg-accent/10 px-4 py-2 font-mono text-xs">Subscribed: {subscribed}</p>
        )}
      </div>
    </section>
  );
}
