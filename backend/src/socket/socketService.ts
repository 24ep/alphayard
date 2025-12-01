import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../services/supabaseService';
import { setupChatHandlers } from './chat';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  familyId?: string;
}

// In-memory store for online users (in production, use Redis)
const onlineUsers = new Set<string>();

export const initializeSocket = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'bondarys-dev-secret-key'
      ) as any;

      // Verify user exists and get hourse info
      const supabase = getSupabaseClient();
      const { data: user } = await supabase
        .from('users')
        .select('id, email, is_active')
        .eq('id', decoded.id)
        .single();

      if (!user || !user.is_active) {
        return next(new Error('Invalid token or inactive user'));
      }

      // Get user's hourse
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      socket.userId = user.id;
      socket.familyId = familyMember?.family_id;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected to socket`);

    // Track user as online
    if (socket.userId) {
      onlineUsers.add(socket.userId);
    }

    // Join hourse room if user has a hourse
    if (socket.familyId) {
      socket.join(`hourse:${socket.familyId}`);
      console.log(`User ${socket.userId} joined hourse room: ${socket.familyId}`);

      // Notify hourse members that user is online
      socket.to(`hourse:${socket.familyId}`).emit('user:online', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }

    // Setup chat handlers
    setupChatHandlers(io, socket as Socket & { userId?: string });

    // Handle location updates
    socket.on('location:update', async (data) => {
      try {
        if (!socket.familyId || !socket.userId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { latitude, longitude, accuracy, address } = data;

        // Save location to database
        const supabase = getSupabaseClient();
        const timestamp = new Date().toISOString();
        
        const { error: dbError } = await supabase
          .from('location_history')
          .insert({
            user_id: socket.userId,
            family_id: socket.familyId,
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy || null,
            address: address || null,
            created_at: timestamp
          });

        if (dbError) {
          console.error('Error saving location to database:', dbError);
          // Continue to broadcast even if DB save fails
        }

        const locationUpdate = {
          userId: socket.userId,
          latitude,
          longitude,
          accuracy,
          address,
          timestamp
        };

        // Broadcast to hourse members
        socket.to(`hourse:${socket.familyId}`).emit('location:update', locationUpdate);

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle safety alerts
    socket.on('safety:alert', async (data) => {
      try {
        if (!socket.familyId || !socket.userId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { type, message, location, severity } = data;

        // Save alert to database
        const supabase = getSupabaseClient();
        const timestamp = new Date().toISOString();
        
        const { data: alertData, error: dbError } = await supabase
          .from('safety_alerts')
          .insert({
            user_id: socket.userId,
            family_id: socket.familyId,
            type: type || 'custom',
            severity: severity || 'urgent',
            message: message || '',
            location: location || null,
            is_resolved: false,
            created_at: timestamp,
            updated_at: timestamp
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving safety alert to database:', dbError);
          // Continue to broadcast even if DB save fails
        }

        const alert = {
          id: alertData?.id || Date.now().toString(),
          type: type || 'custom',
          message: message || '',
          location: location || null,
          severity: severity || 'urgent',
          userId: socket.userId,
          familyId: socket.familyId,
          timestamp,
          status: 'active'
        };

        // Broadcast urgent alert to all hourse members
        io.to(`hourse:${socket.familyId}`).emit('safety:alert', alert);

      } catch (error) {
        console.error('Safety alert error:', error);
        socket.emit('error', { message: 'Failed to send alert' });
      }
    });

    // Handle location requests
    socket.on('location:request', async (data) => {
      try {
        if (!socket.familyId || !socket.userId) {
          socket.emit('error', { message: 'Not a member of any hourse' });
          return;
        }

        const { targetUserId } = data;

        if (!targetUserId) {
          socket.emit('error', { message: 'Target user ID is required' });
          return;
        }

        // Verify both users are in the same hourse
        const supabase = getSupabaseClient();
        const { data: requesterMember } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', socket.userId)
          .eq('family_id', socket.familyId)
          .single();

        const { data: targetMember } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', targetUserId)
          .eq('family_id', socket.familyId)
          .single();

        if (!requesterMember || !targetMember) {
          socket.emit('error', { message: 'Not authorized to request location' });
          return;
        }

        // Get requester's name
        const { data: requesterUser } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', socket.userId)
          .single();

        const requesterName = requesterUser 
          ? `${requesterUser.first_name} ${requesterUser.last_name}`.trim()
          : 'Someone';

        // Emit location request to target user
        io.to(`user:${targetUserId}`).emit('location_request', {
          fromUserId: socket.userId,
          fromUserName: requesterName,
          timestamp: new Date().toISOString()
        });

        console.log(`Location request sent from ${socket.userId} to ${targetUserId}`);
      } catch (error) {
        console.error('Error requesting location:', error);
        socket.emit('error', { message: 'Failed to request location' });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      if (socket.familyId) {
        socket.to(`hourse:${socket.familyId}`).emit('chat:typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from socket`);

      // Notify hourse members that user is offline
      if (socket.familyId) {
        socket.to(`hourse:${socket.familyId}`).emit('user:offline', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.IO server initialized');
};
