// ui-121 — Footer
import type { ReactNode } from 'react'
import { Marquee } from '@/components/marquee-ticker/marquee/Marquee'
import { NewsletterForm } from '@/components/forms-inputs/newsletter-form/NewsletterForm'

interface FooterLink {
  label: string
  onClick?: () => void
}

interface FooterProps {
  tickerText?: ReactNode
  brandName?: string
  metaLine?: ReactNode
  newsletterHeading?: ReactNode
  newsletterBlurb?: ReactNode
  indexHeading?: ReactNode
  indexLinks: FooterLink[]
  accountHeading?: ReactNode
  accountLinks: FooterLink[]
  supportHeading?: ReactNode
  supportItems: string[]
  copyrightLine?: ReactNode
  creditLine?: ReactNode
  onSubscribe?: (email: string) => void
}

export function Footer({
  tickerText = 'FREE SHIPPING OVER $75 ✳ 30-DAY RETURNS ✳ MEMBERS GET EARLY ACCESS ✳ ',
  brandName = 'Brand',
  metaLine = (
    <>
      EST. 2026
      <br />
      YOUR CITY
    </>
  ),
  newsletterHeading = 'NEWSLETTER',
  newsletterBlurb = 'One email per month. New drops, restocks, nothing else.',
  indexHeading = 'INDEX',
  indexLinks,
  accountHeading = 'ACCOUNT',
  accountLinks,
  supportHeading = 'SUPPORT',
  supportItems,
  copyrightLine = '© 2026 Brand — ALL RIGHTS RESERVED',
  creditLine = 'MADE WITH CARE',
  onSubscribe,
}: FooterProps) {
  return (
    <footer className="border-t border-ink">
      <Marquee speed={28} className="border-b border-ink bg-accent py-2.5 font-mono text-xs font-bold tracking-[0.16em]">
        <span className="px-[22px]">{tickerText}</span>
      </Marquee>

      <div className="mx-auto grid max-w-[1480px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[clamp(28px,4vw,56px)] px-[clamp(16px,4vw,64px)] py-[clamp(40px,6vw,80px)] pb-[clamp(24px,3vw,40px)]">
        <div className="col-span-full mb-2 flex flex-wrap items-end justify-between gap-5 border-b border-ink/15 pb-[clamp(28px,4vw,48px)]">
          <div className="font-serif text-[clamp(60px,13vw,200px)] leading-[0.8] tracking-[-0.02em]">{brandName}</div>
          <div className="text-right font-mono text-[11px] tracking-[0.12em] text-ink/55">{metaLine}</div>
        </div>

        <div>
          <div className="mb-[18px] font-mono text-[11px] tracking-[0.14em] text-ink/50">{newsletterHeading}</div>
          <p className="mb-4 max-w-[30ch] font-sans text-sm leading-[1.5] text-ink/70">{newsletterBlurb}</p>
          <NewsletterForm onSubmit={onSubscribe} />
        </div>

        <div>
          <div className="mb-[18px] font-mono text-[11px] tracking-[0.14em] text-ink/50">{indexHeading}</div>
          <div className="flex flex-col gap-2.5 font-mono text-xs tracking-[0.04em]">
            {indexLinks.map((l) => (
              <button key={l.label} onClick={l.onClick} className="cursor-pointer text-left hover:text-accent">
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-mono text-[11px] tracking-[0.14em] text-ink/50">{accountHeading}</div>
          <div className="flex flex-col gap-2.5 font-mono text-xs tracking-[0.04em]">
            {accountLinks.map((l) => (
              <button key={l.label} onClick={l.onClick} className="cursor-pointer text-left hover:text-accent">
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-mono text-[11px] tracking-[0.14em] text-ink/50">{supportHeading}</div>
          <div className="flex flex-col gap-2.5 font-mono text-xs tracking-[0.04em] text-ink/70">
            {supportItems.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1480px] flex-wrap justify-between gap-3 px-[clamp(16px,4vw,64px)] pb-[clamp(24px,3vw,40px)] font-mono text-[10.5px] tracking-[0.1em] text-ink/50">
        <span>{copyrightLine}</span>
        <span>{creditLine}</span>
      </div>
    </footer>
  )
}
