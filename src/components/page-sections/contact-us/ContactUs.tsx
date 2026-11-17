import { useState, useEffect, useMemo, useRef, type FormEvent } from 'react'
import { EmailField } from '@/components/forms-inputs/email-field/EmailField'

export interface ContactFormValues {
  name: string
  email: string
  phone: string
  message: string
}

interface ContactTagline {
  pre: string
  hl: string
}

interface ContactUsProps {
  title?: string
  taglines?: ContactTagline[]
  onSubmit?: (values: ContactFormValues) => Promise<void> | void
}

const DEFAULT_TAGLINES: ContactTagline[] = [
  { pre: 'Building scalable web apps\nwith modern tech. ', hl: 'Let us build.' },
  { pre: 'From concept to ', hl: 'Production.' },
  { pre: 'React, TypeScript, modern tooling—\na stack built to scale. ', hl: 'Ready?' },
  { pre: "Your idea. Our expertise.\nLet's ", hl: 'Execute.' },
  { pre: 'Startups, enterprises, side projects.\nAll welcome. ', hl: 'Drop a line.' },
  { pre: 'Clean code. Fast delivery.\nSerious about ', hl: 'Results?' },
]

const WORD_STAGGER = 120
const WORD_DURATION = 600
const TYPE_SPEED = 48
const TAGLINE_CYCLE = 3800

const EMPTY_FORM: ContactFormValues = { name: '', email: '', phone: '', message: '' }

type WordState = 'hidden' | 'visible'

function splitIntoTokens(text: string) {
  return text.split(/(\s+)/)
}

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setDisplayed('')
    if (!active) return
    let i = 0
    const tick = () => {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) timerRef.current = setTimeout(tick, TYPE_SPEED)
    }
    timerRef.current = setTimeout(tick, TYPE_SPEED)
    return () => clearTimeout(timerRef.current)
  }, [text, active])

  return displayed
}

/** Dark contact section: word-stagger title reveal into a typewriter-cycling tagline, opening a centered form modal. */
export function ContactUs({ title = 'Contact now', taglines = DEFAULT_TAGLINES, onSubmit }: ContactUsProps) {
  const titleWords = useMemo(() => title.split(' '), [title])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<ContactFormValues>(EMPTY_FORM)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [wordStates, setWordStates] = useState<WordState[]>(() => titleWords.map(() => 'hidden'))
  const [titleDone, setTitleDone] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const [tagIdx, setTagIdx] = useState(0)
  const [tagPhase, setTagPhase] = useState<'typing' | 'fading'>('typing')
  const [typeActive, setTypeActive] = useState(false)
  const currentTag = taglines[tagIdx]
  const typedHl = useTypewriter(currentTag.hl, typeActive)

  const preTokens = splitIntoTokens(currentTag.pre)
  const preWordCount = preTokens.filter((t) => !/^\s+$/.test(t)).length
  const [preStates, setPreStates] = useState<WordState[]>(() => Array(preWordCount).fill('hidden'))

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitStatus('loading')

    try {
      await onSubmit?.(formData)
      setSubmitStatus('success')
      setTimeout(() => {
        setIsFormOpen(false)
        setFormData(EMPTY_FORM)
        setSubmitStatus('idle')
      }, 2000)
    } catch (err) {
      console.error(err)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }
  }

  useEffect(() => {
    document.body.style.overflow = isFormOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFormOpen])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        titleWords.forEach((_, i) => {
          setTimeout(() => {
            setWordStates((prev) => {
              const next = [...prev]
              next[i] = 'visible'
              return next
            })
            if (i === titleWords.length - 1) {
              setTimeout(() => setTitleDone(true), WORD_DURATION)
            }
          }, i * WORD_STAGGER)
        })
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [titleWords])

  useEffect(() => {
    if (!titleDone) return
    const tokens = splitIntoTokens(taglines[tagIdx].pre)
    const count = tokens.filter((t) => !/^\s+$/.test(t)).length
    setPreStates(Array(count).fill('hidden'))
    let wordI = 0
    tokens.forEach((token) => {
      if (/^\s+$/.test(token)) return
      const wi = wordI++
      setTimeout(() => {
        setPreStates((prev) => {
          const next = [...prev]
          next[wi] = 'visible'
          return next
        })
      }, wi * 80 + 60)
    })
  }, [tagIdx, titleDone, taglines])

  useEffect(() => {
    if (titleDone) {
      setTimeout(() => setTypeActive(true), 60)
    }
  }, [titleDone])

  useEffect(() => {
    if (!titleDone) return
    const id = setInterval(() => {
      setTypeActive(false)
      setTagPhase('fading')
      setTimeout(() => {
        setTagIdx((i) => (i + 1) % taglines.length)
        setTagPhase('typing')
        setTimeout(() => setTypeActive(true), preWordCount * 80 + 120)
      }, 380)
    }, TAGLINE_CYCLE)
    return () => clearInterval(id)
  }, [titleDone, preWordCount, taglines.length])

  function renderPreTokens() {
    let wordI = 0
    return preTokens.map((token, ti) => {
      if (/^\n/.test(token)) return <br key={ti} />
      if (/^\s+$/.test(token)) return <span key={ti}> </span>
      const wi = wordI++
      const vis = preStates[wi] === 'visible'
      return (
        <span
          key={ti}
          className="mr-[0.2em] inline-block"
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0px)' : 'translateY(14px)',
            filter: vis ? 'blur(0px)' : 'blur(5px)',
            transition: `opacity ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1), transform ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1), filter ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
            willChange: 'opacity, transform, filter',
          }}
        >
          {token.trim()}
        </span>
      )
    })
  }

  return (
    <section ref={sectionRef} className="overflow-hidden bg-ink pt-16 select-none lg:pt-24">
      <div className="overflow-hidden px-5 pb-4 sm:px-8 md:px-10">
        <button
          onClick={() => setIsFormOpen(true)}
          className="group w-full text-left leading-[0.88] tracking-[-0.03em] text-paper transition-opacity duration-500 ease-out hover:opacity-80"
          style={{ fontSize: 'clamp(1.8rem, 12.5vw, 180px)' }}
          aria-label={`${title} - Open Form`}
        >
          {titleWords.map((word, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: wordStates[i] === 'visible' ? 1 : 0,
                transform: wordStates[i] === 'visible' ? 'translateY(0px)' : 'translateY(18px)',
                filter: wordStates[i] === 'visible' ? 'blur(0px)' : 'blur(6px)',
                transition: `opacity ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1), transform ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1), filter ${WORD_DURATION}ms cubic-bezier(0.22,1,0.36,1)`,
                willChange: 'opacity, transform, filter',
                marginRight: i < titleWords.length - 1 ? '0.22em' : 0,
              }}
            >
              {word}
            </span>
          ))}
          <span
            className="ml-2 inline-block align-middle group-hover:-translate-y-2 group-hover:translate-x-2 md:ml-6"
            style={{
              opacity: titleDone ? 1 : 0,
              transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            ↗
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-8 px-5 pt-8 pb-16 sm:px-8 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:pb-10">
        <div
          className="min-h-[160px] md:min-h-[120px] lg:min-h-[140px] lg:min-w-0 lg:flex-1"
          style={{
            opacity: tagPhase === 'fading' ? 0 : 1,
            transform: tagPhase === 'fading' ? 'translateY(-10px)' : 'translateY(0px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <p className="leading-[1.4] text-paper" style={{ fontSize: 'clamp(1.15rem, 2.5vw, 2.1rem)' }}>
            <span className="font-normal">{renderPreTokens()}</span>
            <span className="italic text-accent">
              {typedHl}
              {typeActive && typedHl.length < currentTag.hl.length && (
                <span className="animate-cursor-blink ml-[2px] inline-block h-[0.85em] w-[2px] bg-accent align-text-bottom" />
              )}
            </span>
          </p>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md">
          <div className="animate-modal-fade-in relative w-full max-w-lg border border-paper/10 bg-ink p-8 md:p-10">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 cursor-pointer text-paper/40 transition-colors hover:text-paper"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="mb-2 text-3xl font-extrabold text-paper">Let's Talk</h2>
            <p className="mb-8 text-sm text-paper/50">Fill out the form below and we'll get back to you.</p>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <input
                type="text"
                placeholder="Name"
                required
                className="w-full border border-paper/10 bg-paper/5 px-5 py-4 text-paper placeholder:text-paper/30 focus:border-paper/30 focus:bg-paper/10 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <EmailField
                placeholder="Email"
                required
                className="w-full border border-paper/10 bg-paper/5 px-5 text-paper placeholder:text-paper/30 focus:border-paper/30 focus:bg-paper/10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                className="w-full border border-paper/10 bg-paper/5 px-5 py-4 text-paper placeholder:text-paper/30 focus:border-paper/30 focus:bg-paper/10 focus:outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <textarea
                placeholder="Message"
                required
                rows={4}
                className="w-full resize-none border border-paper/10 bg-paper/5 px-5 py-4 text-paper placeholder:text-paper/30 focus:border-paper/30 focus:bg-paper/10 focus:outline-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <button
                type="submit"
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                className={`mt-4 w-full cursor-pointer py-4 text-center font-mono text-xs font-bold tracking-[0.14em] uppercase transition-opacity disabled:opacity-50 ${
                  submitStatus === 'success'
                    ? 'bg-ink text-paper'
                    : submitStatus === 'error'
                      ? 'bg-vermilion text-ink'
                      : 'bg-accent text-ink hover:opacity-90'
                }`}
              >
                {submitStatus === 'loading' && 'Sending...'}
                {submitStatus === 'success' && 'Sent Successfully!'}
                {submitStatus === 'error' && 'Error Sending'}
                {submitStatus === 'idle' && 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
