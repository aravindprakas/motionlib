// ui-121 — Footer
import { useState } from 'react';
import { Footer } from './Footer';
import { sampleFooterIndexLinks, sampleFooterAccountLinks, sampleSupportItems } from '@/lib/sample-data';

export default function FooterDemo() {
  const [subscribed, setSubscribed] = useState<string | null>(null);

  return (
    <div>
      <section className="grid min-h-[30vh] place-items-center">
        {subscribed ? (
          <p className="border border-ink/15 bg-accent/10 px-4 py-2 font-mono text-xs">Subscribed: {subscribed}</p>
        ) : (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/40">page content above the footer</p>
        )}
      </section>
      <Footer
        brandName="ACME"
        indexLinks={sampleFooterIndexLinks.map((label) => ({ label }))}
        accountLinks={sampleFooterAccountLinks.map((label) => ({ label }))}
        supportItems={sampleSupportItems}
        onSubscribe={setSubscribed}
      />
    </div>
  );
}
