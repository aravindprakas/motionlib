import { useState } from 'react';
import { MobileBottomNav } from './MobileBottomNav';

export default function MobileBottomNavDemo() {
  const [active, setActive] = useState<'index' | 'shop' | 'search' | 'saved'>('index');

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      <p className="max-w-xs text-center font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
        the tab bar pins itself to the bottom of the viewport — tap a tab
      </p>
      <MobileBottomNav
        active={active}
        cartCount={3}
        onIndex={() => setActive('index')}
        onShop={() => setActive('shop')}
        onSearch={() => setActive('search')}
        onSaved={() => setActive('saved')}
      />
    </section>
  );
}
