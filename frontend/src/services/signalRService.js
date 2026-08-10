import * as signalR from '@microsoft/signalr';
class SignalRService {
    connection = null;
    listeners = [];
    async startConnection(token) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:5001/notificationHub', {
            accessTokenFactory: () => token
        })
            .withAutomaticReconnect()
            .build();
        this.connection.on('ReceiveNotification', (notification) => {
            this.listeners.forEach(listener => listener(notification));
        });
        await this.connection.start();
        console.log('SignalR connected');
    }
    onNotification(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    async sendNotification(userId, title, message, type) {
        await this.connection?.invoke('SendNotification', userId, title, message, type);
    }
    stopConnection() {
        this.connection?.stop();
    }
}
export const signalRService = new SignalRService();
