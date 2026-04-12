import { describe, it, expect, beforeEach } from 'vitest';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

function createNotificationStore() {
  let notifications: Notification[] = [];

  function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  function getUnreadCount(): number {
    return notifications.filter((n) => !n.read).length;
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

  return {
    get notifications() { return notifications; },
    getUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
  };
}

type NotificationStore = ReturnType<typeof createNotificationStore>;

describe('Notification State Management', () => {
  let store: NotificationStore;

  beforeEach(() => {
    store = createNotificationStore();
  });

  describe('addNotification', () => {
    it('should add a notification to the beginning of the list', () => {
      store.addNotification('info', 'Test Title', 'Test message');

      expect(store.notifications.length).toBe(1);
      expect(store.notifications[0]!.title).toBe('Test Title');
      expect(store.notifications[0]!.message).toBe('Test message');
    });

    it('should add notification with correct defaults', () => {
      store.addNotification('success', 'Order Complete', 'Order is ready');

      const notification = store.notifications[0]!;
      expect(notification.type).toBe('success');
      expect(notification.read).toBe(false);
      expect(notification.timestamp).toBeInstanceOf(Date);
      expect(notification.id).toBeTruthy();
    });

    it('should support all notification types', () => {
      const types: NotificationType[] = ['info', 'success', 'warning', 'error'];

      types.forEach((type) => {
        store.addNotification(type, `Title ${type}`, `Message ${type}`);
      });

      expect(store.notifications.length).toBe(4);
      expect(store.notifications.map((n) => n.type)).toEqual(['error', 'warning', 'success', 'info']);
    });

    it('should add multiple notifications in correct order', () => {
      store.addNotification('info', 'First', 'First message');
      store.addNotification('info', 'Second', 'Second message');
      store.addNotification('info', 'Third', 'Third message');

      expect(store.notifications.length).toBe(3);
      expect(store.notifications[0]!.title).toBe('Third');
      expect(store.notifications[2]!.title).toBe('First');
    });
  });

  describe('unreadCount', () => {
    it('should return 0 when no notifications exist', () => {
      expect(store.getUnreadCount()).toBe(0);
    });

    it('should count only unread notifications', () => {
      store.addNotification('info', 'Unread 1', 'Message');
      store.addNotification('info', 'Unread 2', 'Message');
      store.addNotification('info', 'Unread 3', 'Message');

      expect(store.getUnreadCount()).toBe(3);

      store.markAsRead(store.notifications[0]!.id);

      expect(store.getUnreadCount()).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      store.addNotification('info', 'Test', 'Message');
      const id = store.notifications[0]!.id;

      store.markAsRead(id);

      expect(store.notifications[0]!.read).toBe(true);
    });

    it('should not affect other notifications', () => {
      store.addNotification('info', 'First', 'Message');
      store.addNotification('info', 'Second', 'Message');

      store.markAsRead(store.notifications[1]!.id);

      expect(store.notifications[0]!.read).toBe(false);
      expect(store.notifications[1]!.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      store.addNotification('info', 'First', 'Message');
      store.addNotification('success', 'Second', 'Message');
      store.addNotification('warning', 'Third', 'Message');

      store.markAllAsRead();

      expect(store.getUnreadCount()).toBe(0);
      expect(store.notifications.every((n) => n.read)).toBe(true);
    });

    it('should handle empty notification list', () => {
      store.markAllAsRead();
      expect(store.getUnreadCount()).toBe(0);
    });
  });

  describe('dismiss', () => {
    it('should remove a notification by id', () => {
      store.addNotification('info', 'Test', 'Message');
      const id = store.notifications[0]!.id;

      store.dismiss(id);

      expect(store.notifications.length).toBe(0);
    });

    it('should only remove the specified notification', () => {
      store.addNotification('info', 'First', 'Message');
      store.addNotification('info', 'Second', 'Message');
      store.addNotification('info', 'Third', 'Message');

      store.dismiss(store.notifications[1]!.id);

      expect(store.notifications.length).toBe(2);
      expect(store.notifications.map((n) => n.title)).toEqual(['Third', 'First']);
    });

    it('should update unread count when dismissing unread notification', () => {
      store.addNotification('info', 'Unread', 'Message');
      store.addNotification('info', 'Other', 'Message');

      expect(store.getUnreadCount()).toBe(2);

      store.dismiss(store.notifications[0]!.id);

      expect(store.getUnreadCount()).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should remove all notifications', () => {
      store.addNotification('info', 'First', 'Message');
      store.addNotification('success', 'Second', 'Message');
      store.addNotification('warning', 'Third', 'Message');
      store.addNotification('error', 'Fourth', 'Message');

      store.clearAll();

      expect(store.notifications.length).toBe(0);
      expect(store.getUnreadCount()).toBe(0);
    });

    it('should handle clearing empty store', () => {
      store.clearAll();
      expect(store.notifications.length).toBe(0);
    });
  });
});
