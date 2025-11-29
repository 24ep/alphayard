import { io, Socket } from 'socket.io-client';
import { config } from '../../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SocketEvents {
  // Connection events
  connected: (data: { message: string; userId: string; timestamp: string }) => void;
  error: (data: { message: string }) => void;
  
  // Chat events
  joined_chat: (data: { chatId: string; message: string }) => void;
  left_chat: (data: { chatId: string; message: string }) => void;
  user_joined_chat: (data: { chatId: string; userId: string; userName: string }) => void;
  user_left_chat: (data: { chatId: string; userId: string; userName: string }) => void;
  new_message: (data: { message: any }) => void;
  user_typing: (data: { chatId: string; userId: string; userName: string; isTyping: boolean }) => void;
  
  // Location events
  location_updated: (data: { userId: string; userName: string; location: any }) => void;
  location_request: (data: { fromUserId: string; fromUserName: string; timestamp: string }) => void;
  
  // Safety events
  emergency_alert: (data: { alert: any }) => void;
  alert_acknowledged: (data: { alertId: string; acknowledgedBy: string; acknowledgedByName: string; timestamp: string }) => void;
  
  // hourse events
  member_status_updated: (data: { userId: string; userName: string; status: string; message: string; timestamp: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('No authentication token found, skipping socket connection');
        return;
      }

      this.socket = io(config.apiUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket initialization failed'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
          this.handleReconnection();
        });
      });
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connected', (data) => {
      console.log('Socket server connected:', data);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // =============================================
  // CHAT METHODS
  // =============================================

  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  sendMessage(chatId: string, content: string, messageType: string = 'text', attachments: any[] = []): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        chatId,
        content,
        messageType,
        attachments
      });
    }
  }

  startTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // =============================================
  // LOCATION METHODS
  // =============================================

  updateLocation(latitude: number, longitude: number, address?: string, accuracy?: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_location', {
        latitude,
        longitude,
        address,
        accuracy
      });
    }
  }

  requestLocation(targetUserId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_location', { targetUserId });
    }
  }

  // =============================================
  // SAFETY METHODS
  // =============================================

  sendEmergencyAlert(message: string, location?: string, type: string = 'panic'): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('emergency_alert', {
        message,
        location,
        type
      });
    }
  }

  acknowledgeAlert(alertId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('acknowledge_alert', { alertId });
    }
  }

  // =============================================
  // hourse METHODS
  // =============================================

  updateStatus(status: string, message?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_status', { status, message });
    }
  }

  // =============================================
  // EVENT LISTENERS
  // =============================================

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Reconnect with new token
  async reconnectWithNewToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
    this.disconnect();
    await this.connect();
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;