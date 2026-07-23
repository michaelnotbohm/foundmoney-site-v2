'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface LeadCaptureFormProps {
  heading?: string
  subheading?: string
  source: string
  showLoanType?: boolean
  showMessage?: boolean
  className?: string
}

const loanTypes = [
  'Buy a Home',
  'Refinance',
  'HELOC',
  'Other',
]

export function LeadCaptureForm({
  heading = "Let's Get Started",
  subheading = "Fill out the form below and a loan officer will reach out within 24 hours.",
  source,
  showLoanType = true,
  showMessage = true,
  className,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    loan_type: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .insert({
          ...formData,
          source,
        })

      if (error) throw error

      setStatus('success')
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        loan_type: '',
        message: '',
      })
    } catch (err) {
      console.error('Form submission error:', err)
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again or call us directly.')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (status === 'success') {
    return (
      <div className={cn('rounded-2xl border border-border bg-card p-8 text-center', className)}>
        <CheckCircle className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-xl font-semibold text-foreground">
          Thank You!
        </h3>
        <p className="mt-2 text-muted-foreground">
          We&apos;ve received your information and will be in touch within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setStatus('idle')}
        >
          Submit Another Inquiry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-8', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {heading}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {subheading}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="full_name" className="sr-only">
            Full Name
          </label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Full Name"
            required
            value={formData.full_name}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone" className="sr-only">
              Phone
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {showLoanType && (
          <div>
            <label htmlFor="loan_type" className="sr-only">
              Loan Type
            </label>
            <select
              id="loan_type"
              name="loan_type"
              value={formData.loan_type}
              onChange={handleChange}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                !formData.loan_type && 'text-muted-foreground'
              )}
            >
              <option value="" disabled>
                What are you looking to do?
              </option>
              {loanTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {showMessage && (
          <div>
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Tell us about your situation (optional)"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={cn(
                'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'placeholder:text-muted-foreground resize-none'
              )}
            />
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Get Started'
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          . We&apos;ll never spam you.
        </p>
      </form>
    </div>
  )
}
