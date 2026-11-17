// Highlighter
import { Highlighter, type HighlighterAction } from './Highlighter';

const actions: HighlighterAction[] = [
  'highlight',
  'underline',
  'box',
  'circle',
  'strike-through',
  'crossed-off',
  'bracket',
];

export default function HighlighterDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-16 px-10">
      <div>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">in prose — draws on view</p>
        <p className="max-w-2xl font-display text-3xl leading-[1.7]">
          We make{' '}
          <Highlighter action="underline" color="#ff4d23">
            interfaces that move
          </Highlighter>{' '}
          — and we make sure the{' '}
          <Highlighter action="highlight" color="#e8a23d">
            motion carries meaning
          </Highlighter>
          , not just polish.
        </p>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">every action</p>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-10">
          {actions.map((a, i) => (
            <Highlighter
              key={a}
              action={a}
              color={i % 2 ? '#0c394a' : '#ff4d23'}
              delay={i * 120}
              className="font-mono text-lg"
            >
              {a}
            </Highlighter>
          ))}
        </div>
      </div>

      <div className="border-t border-ink pt-12">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">
          hover trigger · wraps across lines cleanly
        </p>
        <p className="max-w-md text-xl leading-[1.8]">
          <Highlighter action="highlight" color="#7b6cf6" trigger="hover" roughness={3}>
            Hover this sentence and the marker sweeps line by line, one stroke per line box, in reading order.
          </Highlighter>
        </p>
      </div>
    </div>
  );
}
