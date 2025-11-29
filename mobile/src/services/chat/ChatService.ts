import { supabase } from '../../config/supabase';
import { ChatMessage, ChatRoom, MessageType } from './ChatService.types';

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Check if Supabase is available
  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return !error;
    } catch (error) {
      console.warn('Supabase connection not available:', error);
      return false;
    }
  }

  // Create a new chat room
  async createChatRoom(familyId: string, name: string, type: 'hourse' | 'private' = 'hourse'): Promise<ChatRoom> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Creating chat room');
        const mockRoom: ChatRoom = {
          id: `mock-room-${Date.now()}`,
          familyId,
          name,
          type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return mockRoom;
      }

      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({
          family_id: familyId,
          name,
          type,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: room.id,
        familyId: room.family_id,
        name: room.name,
        type: room.type,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      };
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('Failed to create chat room');
    }
  }

  // Get chat rooms for a hourse
  async getChatRooms(familyId: string): Promise<ChatRoom[]> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        return [
          {
            id: 'mock-room-1',
            familyId,
            name: 'hourse Chat',
            type: 'hourse',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }

      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('family_id', familyId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return rooms.map((room: any) => ({
        id: room.id,
        familyId: room.family_id,
        name: room.name,
        type: room.type,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      }));
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      return [];
    }
  }

  // Send a message
  async sendMessage(roomId: string, senderId: string, content: string, type: MessageType = 'text', metadata?: any): Promise<ChatMessage> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Sending message');
        const mockMessage: ChatMessage = {
          id: `mock-message-${Date.now()}`,
          roomId,
          senderId,
          content,
          type,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: {
            id: senderId,
            firstName: 'Demo',
            lastName: 'User',
            avatar: 'https://via.placeholder.com/150',
          },
        };
        return mockMessage;
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: senderId,
          content,
          type,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Update room's updated_at timestamp
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      return {
        id: message.id,
        roomId: message.room_id,
        senderId: message.sender_id,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Get messages for a chat room
  async getMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        return [
          {
            id: 'mock-message-1',
            roomId,
            senderId: 'user-1',
            content: 'Hello hourse! 👋',
            type: 'text',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: {
              id: 'user-1',
              firstName: 'Demo',
              lastName: 'User',
              avatar: 'https://via.placeholder.com/150',
            },
          },
          {
            id: 'mock-message-2',
            roomId,
            senderId: 'user-2',
            content: 'Hi everyone! 😊',
            type: 'text',
            metadata: {},
            createdAt: new Date(Date.now() - 60000).toISOString(),
            updatedAt: new Date(Date.now() - 60000).toISOString(),
            sender: {
              id: 'user-2',
              firstName: 'Sarah',
              lastName: 'Johnson',
              avatar: 'https://via.placeholder.com/150',
            },
          },
        ];
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return messages.map((message: any) => ({
        id: message.id,
        roomId: message.room_id,
        senderId: message.sender_id,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
        sender: message.sender ? {
          id: message.sender.id,
          firstName: message.sender.first_name,
          lastName: message.sender.last_name,
          avatar: message.sender.avatar_url,
        } : null,
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Mark messages as read
  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Marking messages as read');
        return;
      }

      const { error } = await supabase
        .from('chat_message_reads')
        .upsert({
          room_id: roomId,
          user_id: userId,
          read_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  // Get unread message count for a user
  async getUnreadCount(userId: string, familyId: string): Promise<number> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        return 2;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('room_id', familyId)
        .not('sender_id', 'eq', userId);

      if (error) throw error;

      return data.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Delete a message
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Deleting message');
        return;
      }

      // Check if user is the sender
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      if (message.sender_id !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  // Edit a message
  async editMessage(messageId: string, userId: string, newContent: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Editing message');
        return;
      }

      // Check if user is the sender
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      if (message.sender_id !== userId) {
        throw new Error('Unauthorized to edit this message');
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  // Send location message
  async sendLocationMessage(roomId: string, senderId: string, latitude: number, longitude: number, address?: string): Promise<ChatMessage> {
    return this.sendMessage(roomId, senderId, '', 'location', {
      latitude,
      longitude,
      address,
    });
  }

  // Send image message
  async sendImageMessage(roomId: string, senderId: string, imageUrl: string, caption?: string): Promise<ChatMessage> {
    return this.sendMessage(roomId, senderId, caption || '', 'image', {
      imageUrl,
    });
  }

  // Send file message
  async sendFileMessage(roomId: string, senderId: string, fileUrl: string, fileName: string, fileSize: number): Promise<ChatMessage> {
    return this.sendMessage(roomId, senderId, fileName, 'file', {
      fileUrl,
      fileSize,
    });
  }

  // Send emergency alert message
  async sendEmergencyAlert(roomId: string, senderId: string, alertType: string, location?: any): Promise<ChatMessage> {
    return this.sendMessage(roomId, senderId, `Emergency Alert: ${alertType}`, 'emergency', {
      alertType,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  // Get message reactions
  async getMessageReactions(messageId: string): Promise<any[]> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        return [];
      }

      const { data: reactions, error } = await supabase
        .from('chat_message_reactions')
        .select(`
          *,
          user:users(
            id,
            first_name,
            last_name
          )
        `)
        .eq('message_id', messageId);

      if (error) throw error;

      return reactions.map((reaction: any) => ({
        id: reaction.id,
        messageId: reaction.message_id,
        userId: reaction.user_id,
        emoji: reaction.emoji,
        createdAt: reaction.created_at,
        user: reaction.user ? {
          id: reaction.user.id,
          firstName: reaction.user.first_name,
          lastName: reaction.user.last_name,
        } : null,
      }));
    } catch (error) {
      console.error('Error getting message reactions:', error);
      return [];
    }
  }

  // Add reaction to message
  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Adding reaction');
        return;
      }

      const { error } = await supabase
        .from('chat_message_reactions')
        .upsert({
          message_id: messageId,
          user_id: userId,
          emoji,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock: Removing reaction');
        return;
      }

      const { error } = await supabase
        .from('chat_message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('Failed to remove reaction');
    }
  }
}

export const chatService = ChatService.getInstance(); 