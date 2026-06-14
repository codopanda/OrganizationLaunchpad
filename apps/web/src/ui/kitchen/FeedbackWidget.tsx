import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Props {
  onSuccess?: () => void
}

const MAX_CHARS = 500

export default function FeedbackWidget({ onSuccess }: Props) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValid = message.trim().length >= 10 && message.length <= MAX_CHARS
  const isOverLimit = message.length > MAX_CHARS

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || status === 'loading') return
    setStatus('loading'); setErrorMessage('')

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('feedback').insert([{ message: message.trim(), created_at: new Date().toISOString() }])
        if (error) throw error
        setStatus('success'); setMessage(''); onSuccess?.()
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Failed to submit feedback')
      }
    } else {
      await new Promise((r) => setTimeout(r, 800))
      setStatus('success'); setMessage(''); onSuccess?.()
    }
  }

  if (status === 'success') {
    return (
      <div className="feedback-widget">
        <h3>Feedback</h3>
        <div className="feedback-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={40} height={40}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>Thank you for your feedback!</span>
          <button className="text-btn" onClick={() => setStatus('idle')}>Send another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-widget">
      <h3>Feedback</h3>
      <form onSubmit={handleSubmit}>
        <div className="feedback-field">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts with us..."
            rows={4}
            disabled={status === 'loading'}
            aria-label="Feedback message"
          />
          <div className={`char-count${isOverLimit ? ' over-limit' : ''}`}>
            {message.length}/{MAX_CHARS}
          </div>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        {!isSupabaseConfigured && <p className="demo-notice">Demo mode — Supabase not configured</p>}
        <button type="submit" className="btn-primary" disabled={!isValid || status === 'loading' || isOverLimit}>
          {status === 'loading' ? 'Sending...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}
