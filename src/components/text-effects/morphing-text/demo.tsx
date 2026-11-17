// MorphingText
import { MorphingText } from './MorphingText';

const words = ['Design', 'Motion', 'Systems', 'Interfaces', 'Craft'];
const stack = ['GSAP', 'FRAMER', 'CANVAS', 'WEBGL'];

export default function MorphingTextDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-20 px-10">
      <div>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">default — hold 1.2s / morph 1s</p>
        <MorphingText
          texts={words}
          className="font-display text-7xl font-bold tracking-tight text-ink"
        />
      </div>

      <div className="border-t border-ink pt-14">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">fast + heavy goo — blur 12, threshold 180</p>
        <MorphingText
          texts={stack}
          holdDuration={0.5}
          morphDuration={0.7}
          blur={12}
          threshold={180}
          className="font-mono text-5xl uppercase tracking-[0.15em] text-accent"
        />
      </div>

      <div className="border-t border-ink pt-14">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">inline, once — settles on the last word</p>
        <p className="font-display text-3xl">
          We build{' '}
          <MorphingText
            texts={['websites', 'web apps', 'brands', 'products']}
            once
            holdDuration={0.6}
            morphDuration={0.6}
            className="align-baseline text-accent"
          />{' '}
          that move.
        </p>
      </div>
    </div>
  );
}
