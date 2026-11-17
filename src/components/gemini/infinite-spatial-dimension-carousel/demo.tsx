import { useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { InfiniteSpatialDimensionCarousel, DEFAULT_SPATIAL_ITEMS } from './InfiniteSpatialDimensionCarousel';
export default function Demo() {
  const [items, setItems] = useState(DEFAULT_SPATIAL_ITEMS);
  return <AuraDemo number="06" title="Infinite spatial dimension carousel" description="A perspective rail with depth-of-field falloff, inertia and wraparound navigation. Stable item identities preserve the active dimension when the collection changes."><div className="aura-stack"><InfiniteSpatialDimensionCarousel items={items} /><div className="aura-actions"><button className="aura-button" onClick={() => setItems(previous => [...previous, { id: `dimension-${previous.length}`, title: `Dimension ${previous.length + 1}`, subtitle: 'Inserted into the living rail', hue: (previous.length * 45) % 360 }])}>Insert dimension</button><button className="aura-button" onClick={() => setItems(DEFAULT_SPATIAL_ITEMS)}>Reset collection</button></div></div></AuraDemo>;
}
