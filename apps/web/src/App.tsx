import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './ui/stores/auth'
import { identify, track } from './lib/posthog'
import { isSupabaseConfigured } from './lib/supabase'
import { fetchHealth } from './lib/api'
import DashboardPage from './ui/pages/DashboardPage'
import LoginPage from './ui/pages/LoginPage'
import SignUpPage from './ui/pages/SignUpPage'
import CallbackPage from './ui/pages/CallbackPage'
import PricingPage from './ui/pages/PricingPage'
import SuccessPage from './ui/pages/SuccessPage'
import KitchenPage from './ui/pages/KitchenPage'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Router() {
  const [route, setRoute] = useState(window.location.pathname)
  const { user } = useAuth()

  useEffect(() => {
    const handleRoute = () => {
      setRoute(window.location.pathname)
      track('$pageview', { path: window.location.pathname })
    }
    window.addEventListener('popstate', handleRoute)
    return () => window.removeEventListener('popstate', handleRoute)
  }, [])

  useEffect(() => {
    if (user) identify(user.id, { email: user.email })
  }, [user])

  if (route === '/login') return <LoginPage />
  if (route === '/signup') return <SignUpPage />
  if (route === '/auth/callback') return <CallbackPage />
  if (route === '/dashboard') return <DashboardPage />
  if (route === '/pricing') return <PricingPage />
  if (route === '/success') return <SuccessPage />
  if (route === '/kitchen') return <KitchenPage />
  return <LandingPage />
}

function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const [health, setHealth] = useState<unknown>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err: unknown) => setHealthError(err instanceof Error ? err.message : String(err)))
  }, [])

  return (
    <main className="wrap">
      <header className="hero">
        <p className="eyebrow">OrganizationLaunchpad</p>
        <h1>Ship your app with a full business stack</h1>
        <p className="lede">Auth, payments, email, and analytics — all wired together and ready to deploy.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/pricing')}>View Pricing</button>
          <button className="btn-secondary" onClick={() => navigate('/kitchen')}>Kitchen Sink Demo</button>
        </div>
      </header>

      <section className="card">
        <h2>Services</h2>
        <div className="service-grid">
          {[
            { icon: '🔐', name: 'Auth', desc: isSupabaseConfigured ? 'Supabase configured' : 'Configure VITE_PUBLIC_SUPABASE_URL' },
            { icon: '💳', name: 'Payments', desc: 'Stripe checkout + webhooks' },
            { icon: '✉️', name: 'Email', desc: 'Resend via Supabase edge functions' },
            { icon: '📊', name: 'Analytics', desc: 'PostHog event tracking' },
          ].map(({ icon, name, desc }) => (
            <div key={name} className="service">
              <span className="service-icon">{icon}</span>
              <div>
                <strong>{name}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Auth</h2>
        {isSupabaseConfigured ? (
          isAuthenticated ? (
            <>
              <p>Signed in as {user?.email}</p>
              <div className="actions">
                <button className="link-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="link-button" onClick={() => navigate('/pricing')}>Pricing</button>
              </div>
            </>
          ) : (
            <div className="actions">
              <button className="link-button" onClick={() => navigate('/login')}>Sign In</button>
              <button className="link-button secondary" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
          )
        ) : (
          <p className="muted">
            Set <code>VITE_PUBLIC_SUPABASE_URL</code> and <code>VITE_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Edge Function Health</h2>
        <p className="muted">Run <code>npm run dev:worker</code> or deploy edge functions to test.</p>
        {healthError ? (
          <p className="error">{healthError}</p>
        ) : health ? (
          <pre className="code">{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p className="muted">Contacting <code>/health</code>…</p>
        )}
      </section>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
