/**
 * Chat Database Service
 * 
 * Provides database operations for chat functionality using Supabase.
 * Replaces Mongoose model references with Supabase queries.
 */

import { getSupabaseClient } from './supabaseService';

export interface ChatRoom {
  id: string;
  family_id: string;
  name: string;
  type: string;
  description?: string;
  avatar_url?: string;
  settings?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  deleted_at?: string;
  is_pinned?: boolean;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at?: string;
  is_muted?: boolean;
  is_archived?: boolean;
}

export class ChatDatabaseService {
  /**
   * Find chat room by ID
   */
  static async findChatRoomById(chatId: string): Promise<ChatRoom | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as ChatRoom;
    } catch (error) {
      console.error('Error finding chat room:', error);
      return null;
    }
  }

  /**
   * Check if user is participant in chat room
   */
  static async isParticipant(chatId: string, userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      
      // First check if chat room exists and get family_id
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('family_id')
        .eq('id', chatId)
        .single();

      if (!chatRoom) {
        return false;
      }

      // Check if user is a family member (for hourse chats)
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', chatRoom.family_id)
        .eq('user_id', userId)
        .single();

      return !!familyMember;
    } catch (error) {
      console.error('Error checking participant:', error);
      return false;
    }
  }

  /**
   * Check if user is admin of chat room
   */
  static async isAdmin(chatId: string, userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      
      // Check if user created the chat room
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('created_by')
        .eq('id', chatId)
        .single();

      if (!chatRoom) {
        return false;
      }

      return chatRoom.created_by === userId;
    } catch (error) {
      console.error('Error checking admin:', error);
      return false;
    }
  }

  /**
   * Create a new message
   */
  static async createMessage(data: {
    room_id: string;
    sender_id: string;
    content: string;
    type?: string;
    metadata?: Record<string, any>;
    reply_to_id?: string;
  }): Promise<ChatMessage | null> {
    try {
      const supabase = getSupabaseClient();
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: data.room_id,
          sender_id: data.sender_id,
          content: data.content,
          type: data.type || 'text',
          metadata: data.metadata || {},
          reply_to_id: data.reply_to_id,
        })
        .select()
        .single();

      if (error || !message) {
        console.error('Error creating message:', error);
        return null;
      }

      return message as ChatMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  }

  /**
   * Find message by ID
   */
  static async findMessageById(messageId: string): Promise<ChatMessage | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as ChatMessage;
    } catch (error) {
      console.error('Error finding message:', error);
      return null;
    }
  }

  /**
   * Update message
   */
  static async updateMessage(
    messageId: string,
    updates: {
      content?: string;
      metadata?: Record<string, any>;
      edited_at?: string;
    }
  ): Promise<ChatMessage | null> {
    try {
      const supabase = getSupabaseClient();
      const updateData: any = { ...updates };
      
      if (updates.content) {
        updateData.edited_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .update(updateData)
        .eq('id', messageId)
        .select()
        .single();

      if (error || !data) {
        console.error('Error updating message:', error);
        return null;
      }

      return data as ChatMessage;
    } catch (error) {
      console.error('Error updating message:', error);
      return null;
    }
  }

  /**
   * Delete message (soft delete)
   */
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Add reaction to message
   */
  static async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji,
        })
        .select()
        .single();

      if (error) {
        // If unique constraint violation, reaction already exists
        if (error.code === '23505') {
          return true;
        }
        console.error('Error adding reaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }

  /**
   * Remove reaction from message
   */
  static async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }

  /**
   * Get message reactions
   */
  static async getMessageReactions(messageId: string): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('chat_message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error getting reactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting reactions:', error);
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesRead(roomId: string, userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_message_reads')
        .upsert(
          {
            room_id: roomId,
            user_id: userId,
            read_at: new Date().toISOString(),
          },
          {
            onConflict: 'room_id,user_id',
          }
        );

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  /**
   * Get chat room participants
   */
  static async getChatRoomParticipants(chatId: string): Promise<ChatParticipant[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Get chat room family_id
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('family_id')
        .eq('id', chatId)
        .single();

      if (!chatRoom) {
        return [];
      }

      // Get family members as participants
      const { data: familyMembers, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', chatRoom.family_id);

      if (error || !familyMembers) {
        return [];
      }

      // Transform to participant format
      return familyMembers.map((fm: any) => ({
        id: fm.id,
        room_id: chatId,
        user_id: fm.user_id,
        role: fm.role || 'member',
        joined_at: fm.joined_at || new Date().toISOString(),
        last_read_at: undefined,
        is_muted: false,
        is_archived: false,
      }));
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }

  /**
   * Get messages with pagination
   */
  static async getMessages(
    roomId: string,
    options: {
      limit?: number;
      offset?: number;
      before?: string; // Message ID to fetch messages before
      after?: string; // Message ID to fetch messages after
    } = {}
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean; total?: number }> {
    try {
      const supabase = getSupabaseClient();
      const { limit = 50, before, after } = options;

      let query = supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply cursor-based pagination
      if (before) {
        // Get timestamp of the before message
        const { data: beforeMessage } = await supabase
          .from('chat_messages')
          .select('created_at')
          .eq('id', before)
          .single();

        if (beforeMessage) {
          query = query.lt('created_at', beforeMessage.created_at);
        }
      } else if (after) {
        // Get timestamp of the after message
        const { data: afterMessage } = await supabase
          .from('chat_messages')
          .select('created_at')
          .eq('id', after)
          .single();

        if (afterMessage) {
          query = query.gt('created_at', afterMessage.created_at);
        }
      }

      // Apply limit and offset
      query = query.limit(limit + 1); // Fetch one extra to check if there are more

      const { data, error, count } = await query;

      if (error) {
        console.error('Error getting messages:', error);
        return { messages: [], hasMore: false };
      }

      const messages = (data || []) as ChatMessage[];
      const hasMore = messages.length > limit;
      const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;

      return {
        messages: paginatedMessages.reverse(), // Reverse to show oldest first
        hasMore,
        total: count || undefined,
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Search messages with full-text search
   */
  static async searchMessages(
    roomId: string,
    searchQuery: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ChatMessage[]> {
    try {
      const supabase = getSupabaseClient();
      const { limit = 50, offset = 0 } = options;

      // Use PostgreSQL full-text search
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

      if (error) {
        console.error('Error searching messages:', error);
        return [];
      }

      return (data || []) as ChatMessage[];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }
}

