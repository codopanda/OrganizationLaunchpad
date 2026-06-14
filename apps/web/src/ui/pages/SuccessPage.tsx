import { useEffect } from 'react'
import { track } from '@/lib/posthog'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function SuccessPage() {
  useEffect(() => {
    track('payment_success', {
      session_id: new URLSearchParams(window.location.search).get('session_id'),
    })
  }, [])

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>You're now a Pro member!</h1>
        <p className="lede">
          Your payment was successful. A receipt has been sent to your email. All Pro features are
          now unlocked.
        </p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
