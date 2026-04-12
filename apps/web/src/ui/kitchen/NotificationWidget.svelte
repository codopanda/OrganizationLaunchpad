<script lang="ts">
  type NotificationType = 'info' | 'success' | 'warning' | 'error';

  interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }

  let notifications = $state<Notification[]>([]);
  let isOpen = $state(false);

  const unreadCount = $derived(notifications.filter((n) => !n.read).length);

  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  function addNotification(type: NotificationType, title: string, message: string): void {
    const notification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };
    notifications = [notification, ...notifications];
    requestDesktopNotification(notification);
  }

  function requestDesktopNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
      });
    }
  }

  function requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function markAsRead(id: string): void {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  function markAllAsRead(): void {
    notifications = notifications.map((n) => ({ ...n, read: true }));
  }

  function dismiss(id: string): void {
    notifications = notifications.filter((n) => n.id !== id);
  }

  function clearAll(): void {
    notifications = [];
  }

  function toggleDropdown(): void {
    isOpen = !isOpen;
    if (isOpen) {
      requestNotificationPermission();
    }
  }

  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-widget')) {
      isOpen = false;
    }
  }

  function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  function getTypeIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'M20 6L9 17l-5-5';
      case 'warning':
        return 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z';
      case 'error':
        return 'M18 6L6 18M6 6l12 12';
      default:
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  function triggerDemoNotifications(): void {
    addNotification('info', 'New Order Received', 'Order #1234 has been placed');
    setTimeout(() => addNotification('success', 'Order Completed', 'Order #1234 is ready for pickup'), 500);
    setTimeout(() => addNotification('warning', 'Low Stock Alert', 'Item "Grill Station 1" running low'), 1000);
    setTimeout(() => addNotification('error', 'Equipment Error', 'Temperature sensor malfunction on Unit 3'), 1500);
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  });
</script>

<div class="notification-widget">
  <button class="bell-button" onclick={toggleDropdown} aria-label="Notifications">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
    {#if unreadCount > 0}
      <span class="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
    {/if}
  </button>

  {#if isOpen}
    <div class="dropdown" role="menu">
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          {#if notifications.length > 0}
            <button class="text-button" onclick={markAllAsRead}>Mark all read</button>
            <button class="text-button" onclick={clearAll}>Clear all</button>
          {/if}
        </div>
      </div>

      <div class="notification-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p>No notifications</p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            <div
              class="notification-item {notification.type}"
              class:unread={!notification.read}
              role="menuitem"
            >
              <div class="notification-icon {notification.type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d={getTypeIcon(notification.type)} />
                </svg>
              </div>
              <div class="notification-content">
                <div class="notification-title">{notification.title}</div>
                <div class="notification-message">{notification.message}</div>
                <div class="notification-time">{formatTime(notification.timestamp)}</div>
              </div>
              <div class="notification-actions">
                {#if !notification.read}
                  <button
                    class="action-button"
                    onclick={() => markAsRead(notification.id)}
                    aria-label="Mark as read"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                {/if}
                <button
                  class="action-button"
                  onclick={() => dismiss(notification.id)}
                  aria-label="Dismiss"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div class="dropdown-footer">
        <button class="demo-button" onclick={triggerDemoNotifications}>
          Trigger Demo Notifications
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-widget {
    position: relative;
    display: inline-block;
  }

  .bell-button {
    position: relative;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .bell-button:hover {
    background: var(--surface-hover);
  }

  .bell-button svg {
    width: 24px;
    height: 24px;
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: var(--error);
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 380px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
    overflow: hidden;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .dropdown-header h3 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .text-button {
    background: none;
    border: none;
    color: var(--primary);
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .text-button:hover {
    background: var(--surface-hover);
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: var(--muted);
  }

  .empty-state svg {
    width: 48px;
    height: 48px;
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border);
    transition: background-color 0.15s;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-item:hover {
    background: var(--surface-hover);
  }

  .notification-item.unread {
    background: var(--surface-raised);
  }

  .notification-item.unread:hover {
    background: var(--surface-hover);
  }

  .notification-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-icon svg {
    width: 18px;
    height: 18px;
  }

  .notification-icon.info {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .notification-icon.success {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .notification-icon.warning {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }

  .notification-icon.error {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 0.125rem;
  }

  .notification-message {
    font-size: 0.8125rem;
    color: var(--muted);
    line-height: 1.4;
  }

  .notification-time {
    font-size: 0.6875rem;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  .notification-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .notification-item:hover .notification-actions {
    opacity: 1;
  }

  .action-button {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: var(--muted);
    border-radius: 4px;
    transition: color 0.15s, background-color 0.15s;
  }

  .action-button:hover {
    color: var(--text);
    background: var(--border);
  }

  .action-button svg {
    width: 14px;
    height: 14px;
  }

  .dropdown-footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border);
    background: var(--surface-raised);
  }

  .demo-button {
    width: 100%;
    padding: 0.625rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .demo-button:hover {
    opacity: 0.9;
  }
</style>
