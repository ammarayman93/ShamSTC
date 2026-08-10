import api from './api';

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'danger' | 'info' | 'success';
}

class NotificationServiceClass {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
    // جلب الإشعارات كل دقيقة
    setInterval(() => this.fetchNotifications(), 60000);
  }

  async fetchNotifications() {
    try {
      const response = await api.get('/dashboard/notifications');
      if (response.data && response.data.success) {
        const raw = response.data.data || [];
        const newNotifications: Notification[] = raw.map((n: any, index: number) => ({
          id: n.id ?? `notif-${Date.now()}-${index}`,
          title: n.title || this.getTitleByType(n.type),
          message: n.message || '',
          time: n.time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          read: n.read ?? false,
          type: (n.type as Notification['type']) || 'info',
        }));

        // دمج مع القديم مع تجنب التكرار حسب الرسالة
        const existingMessages = new Set(this.notifications.map((x) => x.message));
        const uniqueNew = newNotifications.filter((n) => !existingMessages.has(n.message));
        this.notifications = [...uniqueNew, ...this.notifications].slice(0, 50);
        this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // لا نضيف demo إلا إذا كانت القائمة فارغة تماماً
      if (this.notifications.length === 0) {
        this.addDemoNotifications();
      }
    }
  }

  private getTitleByType(type?: string): string {
    switch (type) {
      case 'warning':
        return 'تنبيه';
      case 'danger':
        return 'تحذير هام';
      case 'success':
        return 'نجاح';
      default:
        return 'إشعار';
    }
  }

  private addDemoNotifications() {
    this.notifications = [
      {
        id: 1,
        title: 'مرحباً بك في النظام',
        message: 'تم تسجيل دخولك بنجاح إلى نظام إدارة ISP',
        time: 'الآن',
        read: false,
        type: 'success',
      },
    ];
    this.saveNotifications();
    this.notifyListeners();
  }

  loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAsRead(id: string | number) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
    this.notifyListeners();
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifications = this.notifications.slice(0, 50);
    this.saveNotifications();
    this.notifyListeners();
  }

  /** يستقبل إشعار من SignalR */
  handleRealtimeNotification(raw: any) {
    const notification: Notification = {
      id: raw.id || `rt-${Date.now()}`,
      title: raw.title || this.getTitleByType(raw.type),
      message: raw.message || '',
      time: raw.time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: (raw.type as Notification['type']) || 'info',
    };
    this.addNotification(notification);
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    // أرسل الحالة الحالية فوراً
    listener(this.notifications);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }
}

export const notificationService = new NotificationServiceClass();
export type { Notification as NotificationType };
