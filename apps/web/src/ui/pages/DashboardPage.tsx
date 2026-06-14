import { useEffect, useState } from 'react'
import { auth as authClient } from '@/lib/auth'
import { getSubscription, STRIPE_PRICE_ID } from '@/lib/stripe'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isPostHogConfigured, track } from '@/lib/posthog'
import { useAuth } from '@/ui/stores/auth'
import Toast from '@/ui/components/Toast'
import type { User } from '@shared/auth'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type Subscription = {
  plan: 'free' | 'pro'
  status: string
  current_period_end: string | null
} | null

const SERVICES = [
  { name: 'Supabase', description: 'Auth + Database', ok: () => isSupabaseConfigured, hint: 'Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY' },
  { name: 'Stripe', description: 'Payments', ok: () => Boolean(STRIPE_PRICE_ID), hint: 'Set VITE_PUBLIC_STRIPE_PRICE_ID' },
  { name: 'PostHog', description: 'Analytics', ok: () => isPostHogConfigured, hint: 'Set VITE_PUBLIC_POSTHOG_KEY' },
  { name: 'Resend', description: 'Email (via edge function)', ok: () => isSupabaseConfigured, hint: 'Deploy send-email edge function with RESEND_API_KEY secret' },
]

export default function DashboardPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!authClient.isConfigured) { setLoading(false); return }
    authClient.getCurrentUser().then(async ({ user: currentUser }) => {
      setUser(currentUser)
      if (currentUser) {
        track('dashboard_viewed', { user_id: currentUser.id })
        setSubscription(await getSubscription(currentUser.id))
      }
      setLoading(false)
    })
  }, [authUser])

  async function handleSignOut() {
    track('signed_out')
    const { error } = await authClient.signOut()
    if (error) { setToast({ message: error.message, type: 'error' }); return }
    authClient.navigate(authClient.config.postLogoutPath)
  }

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null

  return (
    <organization-launchpad-auth-guard heading="Dashboard Access" message="Sign in to view your dashboard.">
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="header-right">
            <button className="btn-ghost" onClick={() => navigate('/kitchen')}>Kitchen Sink</button>
            <button className="btn-ghost" onClick={() => navigate('/pricing')}>Pricing</button>
            <button className="btn-secondary" onClick={handleSignOut}>Sign Out</button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="top-row">
            <section className="card">
              <h2 className="section-label">Account</h2>
              {loading ? <p className="muted">Loading…</p> : user ? (
                <dl className="info-list">
                  <dt>Email</dt><dd>{user.email}</dd>
                  <dt>User ID</dt><dd className="mono">{user.id}</dd>
                </dl>
              ) : <p className="muted">Not signed in</p>}
            </section>

            <section className="card">
              <h2 className="section-label">Subscription</h2>
              {loading ? <p className="muted">Loading…</p> : (
                subscription?.plan === 'pro' && subscription.status === 'active' ? (
                  <>
                    <div className="plan-badge plan-pro">Pro</div>
                    {periodEnd && <p className="muted" style={{ fontSize: '0.8rem' }}>Renews {periodEnd}</p>}
                  </>
                ) : (
                  <>
                    <div className="plan-badge plan-free">Free</div>
                    <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', marginTop: '0.5rem' }} onClick={() => navigate('/pricing')}>
                      Upgrade to Pro
                    </button>
                  </>
                )
              )}
            </section>
          </div>

          <section className="card">
            <h2 className="section-label">Integrations</h2>
            <div className="integration-list">
              {SERVICES.map((s) => (
                <div key={s.name} className="integration">
                  <div className="integration-row">
                    <span className={`status-dot ${s.ok() ? 'dot-ok' : 'dot-err'}`} />
                    <strong>{s.name}</strong>
                    <span className="integration-desc">{s.description}</span>
                  </div>
                  {!s.ok() && <p className="integration-hint">{s.hint}</p>}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </organization-launchpad-auth-guard>
  )
}
