import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import { getSubscription, redirectToCheckout, STRIPE_PRICE_ID } from '@/lib/stripe'
import { isSupabaseConfigured } from '@/lib/supabase'
import { track } from '@/lib/posthog'

type Subscription = { plan: 'free' | 'pro'; status: string; current_period_end: string | null } | null

export default function StripeWidget() {
  const [subscription, setSubscription] = useState<Subscription>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isConfigured = isSupabaseConfigured && Boolean(STRIPE_PRICE_ID)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    auth.getCurrentUser().then(async ({ user }) => {
      if (user) setSubscription(await getSubscription(user.id))
      setLoading(false)
    })
  }, [])

  async function handleUpgrade() {
    const { user } = await auth.getCurrentUser()
    if (!user) return
    setUpgradeStatus('loading')
    track('upgrade_clicked', { source: 'stripe_widget' })
    const { error } = await redirectToCheckout(user.id, user.email ?? '')
    if (error) { setUpgradeStatus('error'); setErrorMessage(error) }
  }

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null

  return (
    <div className="service-widget">
      <div className="widget-header">
        <h3>Payments</h3>
        <span className={`widget-badge${isConfigured ? ' badge-ok' : ''}`}>
          {isConfigured ? 'Stripe configured' : 'Not configured'}
        </span>
      </div>

      {!isConfigured ? (
        <p className="muted">Set <code>VITE_PUBLIC_STRIPE_PRICE_ID</code> and configure Supabase to enable payments.</p>
      ) : loading ? (
        <p className="muted">Loading…</p>
      ) : subscription?.plan === 'pro' && subscription.status === 'active' ? (
        <>
          <div className="service-status service-status-active">
            <span className="status-dot dot-ok" />
            <div>
              <strong>Pro — Active</strong>
              {periodEnd && <p className="muted" style={{ margin: '0.125rem 0 0', fontSize: '0.8rem' }}>Renews {periodEnd}</p>}
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem' }}>Managed via Stripe dashboard.</p>
        </>
      ) : (
        <>
          <div className="service-status">
            <span className="status-dot" style={{ background: 'var(--muted)' }} />
            <strong>Free plan</strong>
          </div>
          <button className="btn-primary" onClick={handleUpgrade} disabled={upgradeStatus === 'loading'}>
            {upgradeStatus === 'loading' ? 'Redirecting…' : 'Upgrade to Pro — $9/mo'}
          </button>
          {upgradeStatus === 'error' && <p className="error">{errorMessage}</p>}
        </>
      )}
    </div>
  )
}
