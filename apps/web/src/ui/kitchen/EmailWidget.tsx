import { useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { track } from '@/lib/posthog'

export default function EmailWidget() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('Test email from OrganizationLaunchpad')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!to.trim() || status === 'loading') return
    setStatus('loading'); setErrorMessage('')
    track('email_test_sent')

    try {
      const supabase = getSupabase()
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to: to.trim(), subject, html: `<h2>Hello from OrganizationLaunchpad</h2><p>This is a test email sent via the Resend integration. It works!</p>` },
      })
      if (error) throw new Error(error.message)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="service-widget">
      <div className="widget-header">
        <h3>Email</h3>
        <span className={`widget-badge${isSupabaseConfigured ? ' badge-ok' : ''}`}>
          {isSupabaseConfigured ? 'Resend via Supabase' : 'Not configured'}
        </span>
      </div>

      {!isSupabaseConfigured ? (
        <p className="muted">Configure Supabase and deploy the <code>send-email</code> edge function to test email.</p>
      ) : status === 'success' ? (
        <div className="email-success">
          <span className="email-check">✓</span>
          <p>Email sent! Check your inbox.</p>
          <button className="text-btn" onClick={() => { setStatus('idle'); setTo('') }}>Send another</button>
        </div>
      ) : (
        <form onSubmit={handleSend}>
          <div className="email-field">
            <label htmlFor="email-to">To</label>
            <input id="email-to" type="email" placeholder="you@example.com" value={to} onChange={(e) => setTo(e.target.value)} disabled={status === 'loading'} required />
          </div>
          <div className="email-field">
            <label htmlFor="email-subject">Subject</label>
            <input id="email-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={status === 'loading'} />
          </div>
          {status === 'error' && <p className="error">{errorMessage}</p>}
          <button type="submit" className="btn-primary" disabled={!to.trim() || status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send test email'}
          </button>
        </form>
      )}
    </div>
  )
}
