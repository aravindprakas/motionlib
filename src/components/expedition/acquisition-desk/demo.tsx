// AcquisitionDesk
import { useEffect, useRef, useState } from 'react';
import { AcquisitionDesk, type AcquisitionStatus } from './AcquisitionDesk';
import { RESOLVED } from '@/lib/expedition';

export default function AcquisitionDeskDemo() {
  const [status, setStatus] = useState<AcquisitionStatus>('idle');
  const timer = useRef<number>();

  // The demo fakes the register round-trip so the busy and acquired states are
  // actually reachable. Cleared on unmount like every timer in the library.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="exp min-h-[calc(100vh-3.5rem)]">
      <AcquisitionDesk
        artifact={RESOLVED[0]}
        interventions={[{ key: 'Ground', from: 'Washed Linen', to: 'Cotton Oxford' }]}
        status={status}
        onAcquire={() => {
          setStatus('submitting');
          timer.current = window.setTimeout(() => setStatus('acquired'), 1100);
        }}
      />
    </div>
  );
}
