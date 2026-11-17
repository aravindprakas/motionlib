// ui-107 — Header + UtilityBar
import { useState } from 'react';
import { Header } from './Header';
import { UtilityBar } from './UtilityBar';
import { sampleNavLinks } from '@/lib/sample-data';

export default function HeaderDemo() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <UtilityBar />
      <Header
        brandName="ACME"
        brandTag="V 1.0"
        links={sampleNavLinks.map((label, i) => ({ label, active: i === active, onClick: () => setActive(i) }))}
        wishCount={2}
        cartCount={3}
      />
      <div className="grid min-h-[120vh] place-items-start p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
          page content — scroll to see the header stick
        </p>
      </div>
    </div>
  );
}
