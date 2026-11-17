import { ScrollTextReveal, type ScrollTextPart } from '@/components/text-effects/scroll-text-reveal/ScrollTextReveal'

interface AboutProps {
  parts?: ScrollTextPart[]
}

const DEFAULT_PARTS: ScrollTextPart[] = [
  { text: 'I am ' },
  { text: 'Your Name', accent: true },
  { text: ', a developer building app + ' },
  { text: 'web', accent: true },
  { text: ' experiences that move, respond, and' },
  { text: ' connect.', accent: true },
]

/** Full-bleed dark statement section: a bio-style headline that reveals word-by-word as it scrolls through view. */
export function About({ parts = DEFAULT_PARTS }: AboutProps) {
  return (
    <div className="border-t border-ink bg-ink text-paper">
      <div className="mx-auto max-w-[1480px] px-[clamp(16px,4vw,64px)] py-[clamp(64px,12vw,180px)]">
        <h2 className="text-center text-4xl leading-tight md:text-5xl lg:text-left lg:text-7xl">
          <ScrollTextReveal parts={parts} />
        </h2>
      </div>
    </div>
  )
}
