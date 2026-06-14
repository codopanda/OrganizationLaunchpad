import { useEffect, useRef, useState } from 'react'

interface Props {
  initialSeconds?: number
  onComplete?: () => void
}

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

async function sendNotification() {
  if (!('Notification' in window)) return
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    new Notification('Timer Complete!', { body: 'Your timer has finished.' })
  }
}

export default function AlarmWidget({ initialSeconds = 60, onComplete }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  function start() {
    if (running && !paused) return
    setRunning(true); setPaused(false)
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearTimer()
          setRunning(false)
          sendNotification()
          onComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function pause() {
    setPaused(true); clearTimer()
  }

  function reset() {
    clearTimer(); setRunning(false); setPaused(false); setSeconds(initialSeconds)
  }

  useEffect(() => () => clearTimer(), [])

  return (
    <div className="alarm-widget">
      <div className={`alarm-display${seconds === 0 ? ' alarm-alert' : ''}`}>
        {formatTime(seconds)}
      </div>
      <div className="alarm-controls">
        {!running || paused ? (
          <button className="alarm-btn alarm-btn-start" onClick={start} aria-label="Start">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          </button>
        ) : (
          <button className="alarm-btn alarm-btn-pause" onClick={pause} aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x={6} y={4} width={4} height={16} /><rect x={14} y={4} width={4} height={16} />
            </svg>
          </button>
        )}
        <button className="alarm-btn" onClick={reset} disabled={seconds === initialSeconds && !running} aria-label="Reset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
