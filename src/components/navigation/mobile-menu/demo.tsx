import { useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { PrimaryButton } from '@/components/buttons/buttons/PrimaryButton';

export default function MobileMenuDemo() {
  const [open, setOpen] = useState(false);

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      <div className="flex flex-col items-center gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">fullscreen overlay nav</p>
        <PrimaryButton onClick={() => setOpen(true)}>OPEN MOBILE MENU</PrimaryButton>
      </div>
      {open && (
        <MobileMenu
          links={['Home', 'Shop', 'Search', 'Saved', 'Account'].map((label) => ({ label, onClick: () => setOpen(false) }))}
          brandName="ACME"
          cartCount={3}
          onClose={() => setOpen(false)}
          onCheckout={() => setOpen(false)}
        />
      )}
    </section>
  );
}
