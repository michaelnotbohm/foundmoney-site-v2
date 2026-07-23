'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle } from 'lucide-react'
import type { BlockProps, LeadFormContent } from './types'

/**
 * Writes to the leads table via /api/leads.
 *
 * There is no tenant_id in the payload — this database serves one business,
 * and the insert policy allows anonymous writes so the public form works
 * without auth. Everything else on that table is admin-read only.
 */
export function LeadFormBlock({ content }: BlockProps<LeadFormContent>) {
  const {
    heading,
    subheading,
    sourceKey,
    subjectTypes = [],
    showMessage = true,
    submitLabel = 'Submit',
    successHeading = 'Thank you',
    successBody = "We've received your information and will be in touch soon.",
  } = content

  const [formState, setFormState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      source: sourceKey,
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject_type: formData.get('subject_type'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to submit form')

      setFormState('success')
    } catch {
      setFormState('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (formState === 'success') {
    return (
      <section className="bg-[var(--color-surface)] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-[var(--color-primary)]" />
            <h2 className="mb-2 font-[var(--font-heading)] text-2xl font-bold text-[var(--color-foreground)]">
              {successHeading}
            </h2>
            <p className="text-[var(--color-muted)]">{successBody}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[var(--color-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-md">
          {(heading || subheading) && (
            <div className="mb-8 text-center">
              {heading && (
                <h2 className="mb-2 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-foreground)]">
                  {heading}
                </h2>
              )}
              {subheading && (
                <p className="text-[var(--color-muted)]">{subheading}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                required
                autoComplete="name"
                className="border-[var(--color-border)] bg-[var(--color-background)]"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="border-[var(--color-border)] bg-[var(--color-background)]"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="border-[var(--color-border)] bg-[var(--color-background)]"
              />
            </div>

            {subjectTypes.length > 0 && (
              <div>
                <Label htmlFor="subject_type">I&apos;m interested in</Label>
                <select
                  id="subject_type"
                  name="subject_type"
                  className="w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
                >
                  <option value="">Select an option</option>
                  {subjectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showMessage && (
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="border-[var(--color-border)] bg-[var(--color-background)]"
                />
              </div>
            )}

            {formState === 'error' && (
              <p role="alert" className="text-sm text-[var(--color-danger,#DC2626)]">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={formState === 'loading'}
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              {formState === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
