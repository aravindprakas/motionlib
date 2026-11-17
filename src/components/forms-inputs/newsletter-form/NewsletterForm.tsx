import { useState, type FormEvent } from 'react'
import { EmailField } from '@/components/forms-inputs/email-field/EmailField'

interface NewsletterFormProps {
  onSubmit?: (email: string) => void
  className?: string
}

export function NewsletterForm({ onSubmit, className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit?.(email)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex border border-ink ${className}`}>
      <EmailField value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="cursor-pointer bg-ink px-4 py-[13px] font-mono text-[11px] tracking-[0.1em] text-paper">
        →
      </button>
    </form>
  )
}
