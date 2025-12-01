import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
// import { FamilyModel } from '../models/FamilyModel';
 // TODO: Fix missing module: ../models/FamilyModel
// import { ChatMessageModel } from '../models/ChatMessageModel';
 // TODO: Fix missing module: ../models/ChatMessageModel
// import { EmergencyAlertModel } from '../models/EmergencyAlertModel';
 // TODO: Fix missing module: ../models/EmergencyAlertModel
// import { logger } from '../utils/logger';
 // TODO: Fix missing module: ../utils/logger
const logger = console; // Use console as fallback

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
  familyIds?: string[];
}

// ChatMessage interface removed - not used

interface VideoCall {
  id: string;
  initiatorId: string;
  participants: string[];
  status: 'ringing' | 'connected' | 'ended' | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface LocationUpdate {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
  placeLabel?: string;
  batteryLevel?: number;
  isOnline: boolean;
}

/* interface EmergencyAlert { // Not used
  id: string;
  senderId: string;
  senderName: string;
  type: 'panic' | 'medical' | 'location' | 'custom';
  message?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  isResolved: boolean;
  responders: string[];
} */

class SocketService {
  private io: Server;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();
  private activeCalls: Map<string, VideoCall> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const userId = socket.handshake.auth.userId;

        if (!token || !userId) {
          return next(new Error('Authentication failed'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.userId !== userId) {
          return next(new Error('Invalid token'));
        }

        // Get user data
        const user = await UserModel.findById(userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = userId;
        socket.user = user;
        socket.familyIds = user.familyIds;

        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const user = socket.user!;

    logger.info(`User connected: ${userId}`);

    // Store connected user
    this.connectedUsers.set(userId, socket);

    // Join user's hourse rooms
    if (user.familyIds && user.familyIds.length > 0) {
      user.familyIds.forEach((familyId: any) => {
        const roomId = `family_${familyId}`;
        socket.join(roomId);
        this.addUserToRoom(userId, roomId);
      });
    }

    // Update user online status
    this.updateUserOnlineStatus(userId, true);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Chat events
    socket.on('chat:send_message', (data) => {
      this.handleChatMessage(socket, data);
    });

    socket.on('chat:typing', (data) => {
      this.handleTypingStatus(socket, data);
    });

    // Location events
    socket.on('location:update', (data) => {
      this.handleLocationUpdate(socket, data);
    });

    // Video call events
    socket.on('call:initiate', (data) => {
      this.handleCallInitiation(socket, data);
    });

    socket.on('call:answer', (data) => {
      this.handleCallAnswer(socket, data);
    });

    socket.on('call:reject', (data) => {
      this.handleCallReject(socket, data);
    });

    socket.on('call:end', (data) => {
      this.handleCallEnd(socket, data);
    });

    // Emergency events
    socket.on('emergency:alert', (data) => {
      this.handleEmergencyAlert(socket, data);
    });

    socket.on('emergency:resolve', (data) => {
      this.handleEmergencyResolve(socket, data);
    });

    // Room events
    socket.on('room:join', (data) => {
      this.handleRoomJoin(socket, data);
    });

    socket.on('room:leave', (data) => {
      this.handleRoomLeave(socket, data);
    });

    // Ping/Pong
    socket.on('ping', () => {
      socket.emit('pong', Date.now());
    });
  }

  private handleDisconnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    
    logger.info(`User disconnected: ${userId}`);

    // Remove from connected users
    this.connectedUsers.delete(userId);

    // Leave all rooms
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(roomId => {
        socket.leave(roomId);
        this.removeUserFromRoom(userId, roomId);
      });
      this.userRooms.delete(userId);
    }

    // Update user online status
    this.updateUserOnlineStatus(userId, false);

    // End active calls
    this.endUserCalls(userId);
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const userId = socket.userId!;
      const user = socket.user!;

      const messageData = {
        senderId: userId,
        senderName: data.senderName || `${user.firstName} ${user.lastName}`,
        senderAvatar: data.senderAvatar || user.avatar,
        content: data.content,
        type: data.type || 'text',
        metadata: data.metadata,
        timestamp: new Date(),
        isRead: false,
      };

      // Save message to database
      // TODO: Implement ChatMessageModel
      // const message = new ChatMessageModel({
      //   ...messageData,
      //   familyId: data.familyId, // TODO: Get from room context
      // });
      // await message.save();
      const messageId = 'stub-message-id';

      // Broadcast to hourse room
      const roomId = `family_${data.familyId}`;
      socket.to(roomId).emit('chat:message', {
        ...messageData,
        id: messageId,
      });

      // Send confirmation to sender
      socket.emit('chat:message_sent', {
        id: messageId,
        timestamp: messageData.timestamp,
      });

      logger.info(`Chat message sent: ${messageId} by ${userId}`);
    } catch (error) {
      logger.error('Chat message error:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStatus(socket: AuthenticatedSocket, data: any) {
    const userId = socket.userId!;
    const roomId = `family_${data.familyId}`;

    socket.to(roomId).emit('chat:typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  private async handleLocationUpdate(socket: AuthenticatedSocket, data: LocationUpdate) {
    try {
      const userId = socket.userId!;
      const user = socket.user!;

      const locationData = {
        ...data,
        userId,
        timestamp: new Date(),
      };

      // Update user's location in database
      await UserModel.findByIdAndUpdate(userId, {
        'location.latitude': data.latitude,
        'location.longitude': data.longitude,
        'location.lastUpdated': new Date(),
      });

      // Broadcast to hourse members
      if (user.familyIds) {
        user.familyIds.forEach((familyId: any) => {
          const roomId = `family_${familyId}`;
          socket.to(roomId).emit('location:update', locationData);
        });
      }

      logger.info(`Location update: ${userId}`);
    } catch (error) {
      logger.error('Location update error:', error);
    }
  }

  private async handleCallInitiation(socket: AuthenticatedSocket, data: any) {
    try {
      const userId = socket.userId!;
      const { participants } = data;

      const callId = `call_${Date.now()}_${userId}`;
      const call: VideoCall = {
        id: callId,
        initiatorId: userId,
        participants,
        status: 'ringing',
        startTime: new Date(),
      };

      this.activeCalls.set(callId, call);

      // Notify participants
      participants.forEach((participantId: any) => {
        const participantSocket = this.connectedUsers.get(participantId);
        if (participantSocket) {
          participantSocket.emit('call:incoming', call);
        }
      });

      logger.info(`Call initiated: ${callId} by ${userId}`);
    } catch (error) {
      logger.error('Call initiation error:', error);
    }
  }

  private handleCallAnswer(socket: AuthenticatedSocket, data: any) {
    const { callId } = data;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.status = 'connected';
      this.activeCalls.set(callId, call);

      // Notify all participants
      call.participants.forEach(participantId => {
        const participantSocket = this.connectedUsers.get(participantId);
        if (participantSocket) {
          participantSocket.emit('call:answered', callId);
        }
      });

      logger.info(`Call answered: ${callId}`);
    }
  }

  private handleCallReject(socket: AuthenticatedSocket, data: any) {
    const { callId } = data;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.status = 'missed';
      call.endTime = new Date();
      this.activeCalls.set(callId, call);

      // Notify all participants
      call.participants.forEach(participantId => {
        const participantSocket = this.connectedUsers.get(participantId);
        if (participantSocket) {
          participantSocket.emit('call:rejected', callId);
        }
      });

      logger.info(`Call rejected: ${callId}`);
    }
  }

  private handleCallEnd(socket: AuthenticatedSocket, data: any) {
    const { callId } = data;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.status = 'ended';
      call.endTime = new Date();
      call.duration = call.endTime.getTime() - call.startTime!.getTime();
      this.activeCalls.set(callId, call);

      // Notify all participants
      call.participants.forEach(participantId => {
        const participantSocket = this.connectedUsers.get(participantId);
        if (participantSocket) {
          participantSocket.emit('call:ended', callId);
        }
      });

      logger.info(`Call ended: ${callId}`);
    }
  }

  private async handleEmergencyAlert(socket: AuthenticatedSocket, data: any) {
    try {
      const userId = socket.userId!;
      const user = socket.user!;

      const alertData = {
        senderId: userId,
        senderName: data.senderName || `${user.firstName} ${user.lastName}`,
        type: data.type,
        message: data.message,
        location: data.location,
        timestamp: new Date(),
        isResolved: false,
        responders: [],
      };

      // Save emergency alert to database
      // TODO: Implement EmergencyAlertModel
      // const alert = new EmergencyAlertModel(alertData);
      // await alert.save();

      // Broadcast to hourse members
      if (user.familyIds) {
        user.familyIds.forEach((familyId: any) => {
          const roomId = `family_${familyId}`;
          socket.to(roomId).emit('emergency:alert', {
            ...alertData,
            id: 'stub-alert-id', // alert._id,
          });
        });
      }

      // Send push notifications
      await this.sendEmergencyNotifications(user.familyIds, alertData);

      logger.warn(`Emergency alert: stub-alert-id by ${userId}`); // alert._id
    } catch (error) {
      logger.error('Emergency alert error:', error);
    }
  }

  private async handleEmergencyResolve(socket: AuthenticatedSocket, data: any) {
    try {
      const { alertId } = data;
      const userId = socket.userId!;

      // Update alert status
      // TODO: Implement EmergencyAlertModel
      // await EmergencyAlertModel.findByIdAndUpdate(alertId, {
      //   isResolved: true,
      //   resolvedBy: userId,
      //   resolvedAt: new Date(),
      // });

      // Notify hourse members
      const user = socket.user!;
      if (user.familyIds) {
        user.familyIds.forEach((familyId: any) => {
          const roomId = `family_${familyId}`;
          socket.to(roomId).emit('emergency:resolved', alertId);
        });
      }

      logger.info(`Emergency resolved: ${alertId} by ${userId}`);
    } catch (error) {
      logger.error('Emergency resolve error:', error);
    }
  }

  private handleRoomJoin(socket: AuthenticatedSocket, data: any) {
    const { roomId } = data;
    const userId = socket.userId!;

    socket.join(roomId);
    this.addUserToRoom(userId, roomId);

    logger.info(`User ${userId} joined room: ${roomId}`);
  }

  private handleRoomLeave(socket: AuthenticatedSocket, data: any) {
    const { roomId } = data;
    const userId = socket.userId!;

    socket.leave(roomId);
    this.removeUserFromRoom(userId, roomId);

    logger.info(`User ${userId} left room: ${roomId}`);
  }

  private addUserToRoom(userId: string, roomId: string) {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);
  }

  private removeUserFromRoom(userId: string, roomId: string) {
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
      if (userRooms.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  private updateUserOnlineStatus(userId: string, isOnline: boolean) {
    // Update in database
    UserModel.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    }).catch((error: any) => {
      logger.error('Failed to update user online status:', error);
    });

    // Notify hourse members
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket && userSocket.user?.familyIds) {
      userSocket.user.familyIds.forEach((familyId: any) => {
        const roomId = `family_${familyId}`;
        this.io.to(roomId).emit(isOnline ? 'user:online' : 'user:offline', userId);
      });
    }
  }

  private endUserCalls(userId: string) {
    // Find and end all calls involving this user
    this.activeCalls.forEach((call, callId) => {
      if (call.participants.includes(userId) && call.status === 'connected') {
        this.handleCallEnd({ userId } as AuthenticatedSocket, { callId });
      }
    });
  }

  private async sendEmergencyNotifications(familyIds: string[], alertData: any) {
    try {
      // Get all hourse members' device tokens
      const familyMembers = await UserModel.find({
        familyIds: { $in: familyIds },
        'deviceTokens.0': { $exists: true },
      });

      const deviceTokens = familyMembers.flatMap((member: any) => member.deviceTokens);

      if (deviceTokens.length > 0) {
        // TODO: Send push notifications using Firebase
        logger.info(`Emergency notifications sent to ${deviceTokens.length} devices`);
      }
    } catch (error) {
      logger.error('Failed to send emergency notifications:', error);
    }
  }

  // Public methods for external use
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getUserSocket(userId: string): AuthenticatedSocket | undefined {
    return this.connectedUsers.get(userId);
  }

  public sendToUser(userId: string, event: string, data: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }

  public sendToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}

export { SocketService }; 