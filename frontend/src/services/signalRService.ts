import * as signalR from '@microsoft/signalr';
import { notificationService } from './notificationService';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: ((notification: any) => void)[] = [];
  private started = false;

  private getHubUrl(): string {
    // في Docker/nginx: نفس الـ origin على المنفذ 8080 → /notificationHub
    // في التطوير المباشر على Vite: نوجّه لـ backend
    const host = window.location.hostname;
    const port = window.location.port;

    // إذا كنا على منفذ Vite الافتراضي (5173) نتصل بالـ backend مباشرة
    if (port === '5173' || port === '3000') {
      return 'http://localhost:5000/notificationHub';
    }

    // غير ذلك: نفس الـ origin (nginx يعيد التوجيه)
    return `${window.location.origin}/notificationHub`;
  }

  async startConnection(token: string) {
    if (this.started && this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = this.getHubUrl();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on('ReceiveNotification', (notification) => {
      console.log('📩 SignalR notification received:', notification);
      notificationService.handleRealtimeNotification(notification);
      this.listeners.forEach((listener) => listener(notification));
    });

    this.connection.onreconnected(() => console.log('SignalR reconnected'));
    this.connection.onclose(() => {
      console.log('SignalR disconnected');
      this.started = false;
    });

    try {
      await this.connection.start();
      this.started = true;
      console.log('✅ SignalR connected to', hubUrl);
    } catch (err) {
      console.error('❌ SignalR connection failed:', err);
      this.started = false;
    }
  }

  onNotification(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async sendNotification(userId: string, title: string, message: string, type: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendNotification', userId, title, message, type);
    }
  }

  stopConnection() {
    this.connection?.stop();
    this.started = false;
  }

  get isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
