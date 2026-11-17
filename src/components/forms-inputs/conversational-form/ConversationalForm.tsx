// ui-104 — ConversationalForm
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  key: string;
  bot: string;
  hint: string;
  chips?: string[];
  placeholder: string;
  validate?: (v: string) => boolean;
  error?: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  {
    key: 'intent',
    bot: "Hi, I'm Arvi. What brings you here today?",
    hint: 'Choose one, or write your own.',
    chips: ['A new project', 'Partnership', 'Press inquiry', 'Just saying hi'],
    placeholder: 'Type a different reason…',
  },
  {
    key: 'contact',
    bot: 'Got it. Where should we reach you?',
    hint: 'Email or a phone number both work.',
    placeholder: 'you@somewhere.com',
    validate: (v) => /[@.]/.test(v) || /\d{5,}/.test(v),
    error: "Doesn't quite look like an email or phone.",
  },
  {
    key: 'note',
    bot: 'Anything we should know before we reply?',
    hint: 'Optional — send to finish.',
    placeholder: 'A sentence or two…',
    optional: true,
  },
];

interface Message {
  from: 'bot' | 'user';
  text: string;
}

/**
 * Conversational intake form: a chatbot walks the user through a short script
 * one question at a time, mixing quick-reply chips with free text and inline
 * validation. Answers accumulate as a transcript; the final step resolves to a
 * confirmation. Self-contained — no network, just local state.
 */
export function ConversationalForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: STEPS[0].bot }]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = (raw: string) => {
    const value = raw.trim();
    if (!value && !step.optional) return;
    if (value && step.validate && !step.validate(value)) {
      setError(step.error ?? 'Please check that.');
      return;
    }
    setError('');
    setInput('');

    const userMsg: Message = { from: 'user', text: value || '—' };
    const next = stepIndex + 1;

    if (next < STEPS.length) {
      setMessages((m) => [...m, userMsg, { from: 'bot', text: STEPS[next].bot }]);
      setStepIndex(next);
    } else {
      setMessages((m) => [...m, userMsg, { from: 'bot', text: "Thanks — we'll be in touch shortly." }]);
      setDone(true);
    }
  };

  const reset = () => {
    setMessages([{ from: 'bot', text: STEPS[0].bot }]);
    setStepIndex(0);
    setInput('');
    setError('');
    setDone(false);
  };

  return (
    <div className="mx-auto flex h-[520px] w-full max-w-md flex-col border border-ink bg-bone">
      <div className="flex items-center gap-2 border-b border-ink px-4 py-3">
        <span className="h-2 w-2 bg-vermilion" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Intake · Arvi</span>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className={`max-w-[80%] px-3 py-2 text-sm ${
                  m.from === 'user'
                    ? 'bg-ink font-mono text-xs uppercase tracking-wide text-bone'
                    : 'border border-ink bg-bone font-serif italic text-ink'
                }`}
              >
                {m.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input dock */}
      <div className="border-t border-ink p-4">
        {done ? (
          <button
            type="button"
            onClick={reset}
            className="w-full cursor-pointer bg-vermilion px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-vermilion-hover"
          >
            Start over
          </button>
        ) : (
          <>
            {step.chips && (
              <div className="mb-3 flex flex-wrap gap-2">
                {step.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => submit(c)}
                    className="cursor-pointer border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors hover:bg-ink hover:text-bone"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-stretch gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={step.placeholder}
                className="min-w-0 flex-1 border border-ink bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-ink/40 focus:bg-ink/5"
              />
              <button
                type="submit"
                aria-label="Send"
                className="shrink-0 cursor-pointer bg-ink px-4 font-mono text-xs font-bold uppercase text-bone transition-colors hover:bg-vermilion hover:text-ink"
              >
                →
              </button>
            </form>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink/45">{error || step.hint}</p>
          </>
        )}
      </div>
    </div>
  );
}
