import { useEffect, useRef, useState } from 'react'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

function uid() { return Math.random().toString(36).slice(2, 9) }

function formatTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

const TYPE_ICONS: Record<NotificationType, string> = {
  success: 'M20 6L9 17l-5-5',
  warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  error: 'M18 6L6 18M6 6l12 12',
  info: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

export default function NotificationWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  function add(type: NotificationType, title: string, message: string) {
    const n: Notification = { id: uid(), type, title, message, timestamp: new Date(), read: false }
    setNotifications((prev) => [n, ...prev])
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message })
    }
  }

  function markRead(id: string) { setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)) }
  function markAllRead() { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))) }
  function dismiss(id: string) { setNotifications((prev) => prev.filter((n) => n.id !== id)) }

  function triggerDemo() {
    add('info', 'New Order Received', 'Order #1234 has been placed')
    setTimeout(() => add('success', 'Order Completed', 'Order #1234 is ready'), 500)
    setTimeout(() => add('warning', 'Low Stock Alert', 'Item running low'), 1000)
    setTimeout(() => add('error', 'Equipment Error', 'Temperature sensor malfunction'), 1500)
  }

  useEffect(() => {
    if (!isOpen) return
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    const handler = (e: MouseEvent) => {
      if (!widgetRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [isOpen])

  return (
    <div className="notif-widget" ref={widgetRef}>
      <button className="notif-bell" onClick={() => setIsOpen((o) => !o)} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <div className="notif-header-actions">
                <button className="text-btn" onClick={markAllRead}>Mark all read</button>
                <button className="text-btn" onClick={() => setNotifications([])}>Clear all</button>
              </div>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={48} height={48}>
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <p>No notifications</p>
              </div>
            ) : notifications.map((n) => (
              <div key={n.id} className={`notif-item notif-${n.type}${n.read ? '' : ' notif-unread'}`}>
                <div className={`notif-icon notif-icon-${n.type}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
                    <path d={TYPE_ICONS[n.type]} />
                  </svg>
                </div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-time">{formatTime(n.timestamp)}</div>
                </div>
                <div className="notif-actions">
                  {!n.read && (
                    <button className="notif-action-btn" onClick={() => markRead(n.id)} aria-label="Mark read">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M20 6L9 17l-5-5" /></svg>
                    </button>
                  )}
                  <button className="notif-action-btn" onClick={() => dismiss(n.id)} aria-label="Dismiss">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="notif-footer">
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.8125rem' }} onClick={triggerDemo}>
              Trigger Demo Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
