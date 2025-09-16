import { io, Socket } from 'socket.io-client';

export interface SocketEventHandlers {
  onNewAlert?: (alert: any) => void;
  onCategoryAlert?: (alert: any) => void;
  onHighSeverityAlert?: (alert: any) => void;
  onThreatPatterns?: (patterns: any[]) => void;
  onAlertUpdated?: (alert: any) => void;
  onStats?: (stats: any) => void;
  onAlerts?: (alerts: any[]) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: SocketEventHandlers = {};

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to threat monitoring server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join default rooms
      this.joinRoom('dashboard');
      this.joinRoom('high-severity');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from threat monitoring server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnection();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to threat monitoring server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      this.handleReconnection();
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to threat monitoring server');
      this.isConnected = false;
    });

    // Threat monitoring events
    this.socket.on('new-alert', (alert) => {
      console.log('New threat alert received:', alert);
      this.eventHandlers.onNewAlert?.(alert);
    });

    this.socket.on('category-alert', (alert) => {
      console.log('Category alert received:', alert);
      this.eventHandlers.onCategoryAlert?.(alert);
    });

    this.socket.on('high-severity-alert', (alert) => {
      console.log('High severity alert received:', alert);
      this.eventHandlers.onHighSeverityAlert?.(alert);
    });

    this.socket.on('threat-patterns', (patterns) => {
      console.log('Threat patterns received:', patterns);
      this.eventHandlers.onThreatPatterns?.(patterns);
    });

    this.socket.on('alert-updated', (alert) => {
      console.log('Alert updated:', alert);
      this.eventHandlers.onAlertUpdated?.(alert);
    });

    this.socket.on('stats', (stats) => {
      console.log('Stats received:', stats);
      this.eventHandlers.onStats?.(stats);
    });

    this.socket.on('alerts', (alerts) => {
      console.log('Alerts received:', alerts);
      this.eventHandlers.onAlerts?.(alerts);
    });
  }

  private handleReconnection(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          this.socket.connect();
        }
      }, delay);
    }
  }

  // Public methods
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', room);
      console.log(`Joined room: ${room}`);
    }
  }

  public leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
      console.log(`Left room: ${room}`);
    }
  }

  public joinCategory(category: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-category', category);
      console.log(`Joined category: ${category}`);
    }
  }

  public acknowledgeAlert(alertId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('acknowledge-alert', alertId);
      console.log(`Acknowledged alert: ${alertId}`);
    }
  }

  public updateAlertStatus(alertId: string, status: string, notes?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-alert-status', { alertId, status, notes });
      console.log(`Updated alert ${alertId} status to: ${status}`);
    }
  }

  public setEventHandlers(handlers: SocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public removeEventHandlers(): void {
    this.eventHandlers = {};
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('Disconnected from threat monitoring server');
    }
  }

  public reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Utility methods
  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}

// Create singleton instance
export const socketService = new SocketService();
export default socketService;
