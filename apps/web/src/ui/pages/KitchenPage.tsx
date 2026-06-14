import { useState } from 'react'
import AlarmWidget from '@/ui/kitchen/AlarmWidget'
import CameraWidget from '@/ui/kitchen/CameraWidget'
import NotificationWidget from '@/ui/kitchen/NotificationWidget'
import FeedbackWidget from '@/ui/kitchen/FeedbackWidget'
import StripeWidget from '@/ui/kitchen/StripeWidget'
import PostHogWidget from '@/ui/kitchen/PostHogWidget'
import EmailWidget from '@/ui/kitchen/EmailWidget'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function KitchenPage() {
  const [alarmComplete, setAlarmComplete] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <div className="kitchen-header-left">
          <button className="btn-back" onClick={() => navigate('/')}>← Home</button>
          <div>
            <h1>Kitchen Sink</h1>
            <p className="kitchen-subtitle">Every integration, all in one place</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Dashboard →</button>
      </header>

      <main className="kitchen-grid">
        <section className="card"><StripeWidget /></section>
        <section className="card"><PostHogWidget /></section>
        <section className="card"><EmailWidget /></section>
        <section className="card">
          <FeedbackWidget onSuccess={() => setFeedbackSubmitted(true)} />
          {feedbackSubmitted && <p className="kitchen-status kitchen-status-success">Feedback saved to Supabase!</p>}
        </section>
        <section className="card">
          <h3 className="widget-title">Timer</h3>
          <AlarmWidget initialSeconds={10} onComplete={() => setAlarmComplete(true)} />
          {alarmComplete && <p className="kitchen-status kitchen-status-success">Done!</p>}
        </section>
        <section className="card">
          <h3 className="widget-title">Camera</h3>
          <CameraWidget />
        </section>
        <section className="card">
          <h3 className="widget-title">Notifications</h3>
          <NotificationWidget />
        </section>
      </main>
    </div>
  )
}
