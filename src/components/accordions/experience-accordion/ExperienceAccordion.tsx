import { Reveal } from '@/components/reveal-entrance/reveal/Reveal'
import type { ExperienceEntry } from '@/lib/types'

interface ExperienceAccordionProps {
  experience: ExperienceEntry[]
}

function ProjectRow({ project }: { project: ExperienceEntry }) {
  const words = project.name.split(' ')

  return (
    <Reveal className="border-t border-b border-paper/15 py-4">
      <div className="flex flex-col items-center gap-2 p-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-1 flex-col items-center gap-2 text-center md:flex-row md:items-center md:gap-6 md:text-left">
          <span className="text-sm md:text-base">{`0${project.id}`}</span>
          <span className="text-[clamp(28px,6vw,72px)] font-extrabold">
            {words.map((word, i) => (
              <span key={i} className={word === project.accentWord ? 'font-normal text-accent italic' : undefined}>
                {word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
          <span className="text-base text-paper/55 md:text-lg">{project.designation}</span>
        </div>
        <span className="text-xs md:text-sm">{project.time}</span>
      </div>
    </Reveal>
  )
}

/** Numbered list of experience rows, each fading up into view as it scrolls in, with one accent word per name. */
export function ExperienceAccordion({ experience }: ExperienceAccordionProps) {
  return (
    <div className="bg-ink px-[clamp(16px,4vw,64px)] py-[clamp(64px,10vw,160px)] text-paper/70">
      <h2 className="mb-[clamp(28px,4vw,48px)] text-center text-[clamp(28px,6vw,56px)] leading-tight tracking-normal text-paper">
        Experience
      </h2>
      {experience.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}
    </div>
  )
}
