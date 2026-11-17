import { useRef, useState } from 'react';
import { Toast } from './Toast';
import { PrimaryButton } from '@/components/buttons/buttons/PrimaryButton';

export default function ToastDemo() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function trigger() {
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">status toast</p>
        <PrimaryButton onClick={trigger}>TRIGGER TOAST</PrimaryButton>
        <div className="flex h-12 items-center justify-center">
          {visible && <Toast message="Item added to cart" />}
        </div>
      </div>
    </section>
  );
}
