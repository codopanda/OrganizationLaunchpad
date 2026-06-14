import { useState } from 'react'
import { track, isPostHogConfigured } from '@/lib/posthog'

interface EventEntry { name: string; time: string }

const PRESETS = ['button_clicked', 'feature_used', 'page_viewed', 'error_occurred']

export default function PostHogWidget() {
  const [firedEvents, setFiredEvents] = useState<EventEntry[]>([])
  const [customEvent, setCustomEvent] = useState('')

  function fireEvent(name: string) {
    track(name, { source: 'kitchen_widget', timestamp: Date.now() })
    setFiredEvents((prev) => [{ name, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)])
  }

  function handleCustom() {
    const name = customEvent.trim()
    if (!name) return
    fireEvent(name)
    setCustomEvent('')
  }

  return (
    <div className="service-widget">
      <div className="widget-header">
        <h3>Analytics</h3>
        <span className={`widget-badge${isPostHogConfigured ? ' badge-ok' : ''}`}>
          {isPostHogConfigured ? 'PostHog configured' : 'Not configured'}
        </span>
      </div>

      {!isPostHogConfigured ? (
        <p className="muted">Set <code>VITE_PUBLIC_POSTHOG_KEY</code> to start capturing events.</p>
      ) : (
        <>
          <p className="muted">Fire events and see them appear live in your PostHog dashboard.</p>
          <div className="posthog-presets">
            {PRESETS.map((p) => (
              <button key={p} className="preset-btn" onClick={() => fireEvent(p)}>{p}</button>
            ))}
          </div>
          <div className="posthog-custom">
            <input
              type="text"
              placeholder="custom_event_name"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
            />
            <button className="btn-primary" onClick={handleCustom} disabled={!customEvent.trim()}>Fire</button>
          </div>
          {firedEvents.length > 0 && (
            <div className="posthog-log">
              <p className="log-label">Fired this session</p>
              {firedEvents.map((e, i) => (
                <div key={i} className="log-entry">
                  <code>{e.name}</code>
                  <span className="log-time">{e.time}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
