import { useState } from 'react'
import { auth } from '@/lib/auth'
import { redirectToCheckout, STRIPE_PRICE_ID } from '@/lib/stripe'
import { track } from '@/lib/posthog'
import { isSupabaseConfigured } from '@/lib/supabase'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const isStripeConfigured = Boolean(STRIPE_PRICE_ID)

export default function PricingPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleUpgrade() {
    if (!auth.isConfigured) {
      navigate('/signup')
      return
    }
    const { user } = await auth.getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }
    setStatus('loading')
    track('upgrade_clicked', { plan: 'pro' })
    const { error } = await redirectToCheckout(user.id, user.email ?? '')
    if (error) {
      setStatus('error')
      setErrorMessage(error)
    }
  }

  const disabled = status === 'loading' || !isSupabaseConfigured || !isStripeConfigured

  return (
    <div className="pricing-page">
      <header className="pricing-hero">
        <p className="eyebrow">Pricing</p>
        <h1>Simple, honest pricing</h1>
        <p className="lede">Start free. Upgrade when you're ready.</p>
      </header>

      <main className="pricing-cards">
        <div className="plan">
          <div className="plan-header">
            <h2>Free</h2>
            <div className="plan-price"><span className="amount">$0</span><span className="period">/month</span></div>
          </div>
          <ul className="plan-features">
            <li>User authentication</li>
            <li>Supabase database</li>
            <li>Community support</li>
          </ul>
          <button className="btn-secondary" disabled>Current plan</button>
        </div>

        <div className="plan plan-featured">
          <div className="plan-badge">Most popular</div>
          <div className="plan-header">
            <h2>Pro</h2>
            <div className="plan-price"><span className="amount">$9</span><span className="period">/month</span></div>
          </div>
          <ul className="plan-features">
            <li>Everything in Free</li>
            <li>Priority email support</li>
            <li>Advanced analytics</li>
            <li>Remove branding</li>
          </ul>
          {(!isSupabaseConfigured || !isStripeConfigured) && (
            <p className="config-notice">
              {!isSupabaseConfigured ? 'Configure Supabase' : 'Set VITE_PUBLIC_STRIPE_PRICE_ID'} to enable checkout
            </p>
          )}
          <button className="btn-primary" onClick={handleUpgrade} disabled={disabled}>
            {status === 'loading' ? 'Redirecting to checkout…' : 'Upgrade to Pro'}
          </button>
          {status === 'error' && <p className="error">{errorMessage}</p>}
        </div>
      </main>
    </div>
  )
}
