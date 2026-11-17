// ui-92 — PinCodeInput
import { useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const LEN = 4;
const CODE = '2049';

type Status = 'idle' | 'error' | 'ok';

/**
 * OTP-style pin input: digits pop in as you type, a wrong code shakes the row
 * and clears itself, the right one lifts each box on a green stagger.
 */
export function PinCodeInput() {
  const [val, setVal] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const row = useAnimationControls();

  const handle = (raw: string) => {
    if (status === 'ok') return;
    const digits = raw.replace(/\D/g, '').slice(0, LEN);
    setVal(digits);
    setStatus('idle');
    if (digits.length === LEN) {
      if (digits === CODE) {
        setStatus('ok');
        setTimeout(() => { setVal(''); setStatus('idle'); }, 1800);
      } else {
        setStatus('error');
        row.start({ x: [0, -8, 8, -6, 6, -3, 0], transition: { duration: 0.45 } });
        setTimeout(() => { setVal(''); setStatus('idle'); inputRef.current?.focus(); }, 550);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-5" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => handle(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Pin code"
        className="absolute h-px w-px opacity-0"
      />

      <motion.div animate={row} className="flex cursor-text gap-3">
        {Array.from({ length: LEN }, (_, k) => {
          const ch = val[k];
          const active = k === val.length && status === 'idle';
          return (
            <motion.div
              key={k}
              animate={status === 'ok' ? { y: -8 } : { y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: status === 'ok' ? k * 0.07 : 0 }}
              className={`grid h-16 w-[52px] place-items-center border-2 font-mono text-2xl tnum transition-colors duration-200 ${
                status === 'ok' ? 'border-[#2f9e7f] text-[#2f9e7f]'
                : status === 'error' ? 'border-vermilion text-vermilion'
                : active ? 'border-vermilion'
                : 'border-ink'
              }`}
            >
              {ch ? (
                <motion.span
                  key={`${k}-${ch}`}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 700, damping: 20 }}
                >
                  {ch}
                </motion.span>
              ) : active ? (
                <span className="h-6 w-0.5 animate-pulse bg-vermilion" />
              ) : null}
            </motion.div>
          );
        })}
      </motion.div>

      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/50">
        {status === 'ok' ? 'Unlocked' : status === 'error' ? 'Wrong code — try 2049' : 'Hint: the code is 2049'}
      </p>
    </div>
  );
}
