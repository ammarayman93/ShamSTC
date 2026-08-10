import api from './api';
class NotificationServiceClass {
    notifications = [];
    listeners = [];
    constructor() {
        this.loadNotifications();
        // جلب الإشعارات كل دقيقة
        setInterval(() => this.fetchNotifications(), 60000);
    }
    async fetchNotifications() {
        try {
            const response = await api.get('/dashboard/notifications');
            if (response.data && response.data.success) {
                const newNotifications = (response.data.data || []).map((n) => ({
                    id: n.id || Date.now(),
                    title: n.title || 'إشعار جديد',
                    message: n.message || '',
                    time: n.time || 'الآن',
                    read: false,
                    type: n.type || 'info'
                }));
                this.notifications = [...newNotifications, ...this.notifications].slice(0, 50);
                this.saveNotifications();
                this.notifyListeners();
            }
            else {
                // بيانات تجريبية إذا لم يكن هناك API
                this.addDemoNotifications();
            }
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            this.addDemoNotifications();
        }
    }
    addDemoNotifications() {
        if (this.notifications.length === 0) {
            this.notifications = [
                { id: 1, title: 'مرحباً بك في النظام', message: 'تم تسجيل دخولك بنجاح إلى نظام إدارة ISP', time: 'الآن', read: false, type: 'success' },
                { id: 2, title: 'اشتراكات ستنتهي قريباً', message: 'يوجد 5 عملاء سينتهي اشتراكهم خلال 3 أيام', time: 'منذ ساعة', read: false, type: 'warning' },
            ];
            this.saveNotifications();
            this.notifyListeners();
        }
    }
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                this.notifications = JSON.parse(saved);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
    getNotifications() {
        return this.notifications;
    }
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.notifyListeners();
        }
    }
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.notifyListeners();
    }
    addNotification(notification) {
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.notifyListeners();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.notifications));
    }
}
export const notificationService = new NotificationServiceClass();
