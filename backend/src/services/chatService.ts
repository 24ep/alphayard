// Lightweight wrapper around Supabase client for chat-related operations.
// Uses the shared Supabase client from supabaseService.
import supabaseService from './supabaseService';

export class ChatService {
  /**
   * Upload file attachment for chat
   */
  static async uploadAttachment(file: any, messageId: string, userId: string) {
    try {
      const { originalname, buffer, mimetype, size } = file;
      
      // Generate unique filename
      const timestamp = Date.now();
      // const fileExtension = originalname.split('.').pop(); // Not used
      const fileName = `${timestamp}_${originalname}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseService.getSupabaseClient()
        .storage
        .from('chat-attachments')
        .upload(fileName, buffer, {
          contentType: mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabaseService.getSupabaseClient()
        .storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      // Save attachment record to database
      const { data, error } = await supabaseService.getSupabaseClient()
          .from('message_attachments')
          .insert({
            message_id: messageId,
            file_name: originalname,
            file_url: urlData.publicUrl,
            file_type: this.getFileType(mimetype),
            file_size: size,
            mime_type: mimetype,
            metadata: {
              uploaded_by: userId,
              uploaded_at: new Date().toISOString()
            }
          })
          .select()
          .single();

      if (error) {
        throw new Error(`Failed to save attachment record: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get file type from MIME type
   */
  private static getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    return 'file';
  }

  /**
   * Delete attachment
   */
  static async deleteAttachment(attachmentId: string, userId: string) {
    try {
      // Get attachment details
      const { data: attachment, error: fetchError } = await supabaseService.getSupabaseClient()
          .from('message_attachments')
          .select('*')
          .eq('id', attachmentId)
          .single();

      if (fetchError || !attachment) {
        throw new Error('Attachment not found');
      }

      // Delete from storage
      const fileName = attachment.file_url.split('/').pop();
      if (fileName) {
      const { error: deleteError } = await supabaseService.getSupabaseClient()
          .storage
          .from('chat-attachments')
          .remove([fileName]);

        if (deleteError) {
          console.error('Failed to delete file from storage:', deleteError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabaseService.getSupabaseClient()
          .from('message_attachments')
          .delete()
          .eq('id', attachmentId);

      if (dbError) {
        throw new Error(`Failed to delete attachment record: ${dbError.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attachment by ID
   */
  static async getAttachment(attachmentId: string) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient()
          .from('message_attachments')
          .select('*')
          .eq('id', attachmentId)
          .single();

      if (error) {
        throw new Error(`Failed to get attachment: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create default hourse chat room
   */
  static async createDefaultFamilyChat(familyId: string, createdBy: string) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient()
          .from('chat_rooms')
          .insert({
            family_id: familyId,
            name: 'hourse Chat',
            type: 'hourse',
            description: 'Default hourse chat room',
            created_by: createdBy,
            settings: {
              allowFileSharing: true,
              allowLocationSharing: true,
              allowVoiceMessages: true,
              allowEmojis: true,
              allowStickers: true,
              allowGifs: true
            },
            is_active: true
          })
          .select()
          .single();

      if (error) {
        throw new Error(`Failed to create hourse chat: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStats(familyId: string) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient()
        .from('chat_rooms')
        .select(`
          id,
          name,
          type,
          created_at,
          messages (
            id,
            created_at,
            type
          )
        `)
        .eq('family_id', familyId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to get chat stats: ${error.message}`);
      }

      const stats = data.map(chat => ({
        id: chat.id,
        name: chat.name,
        type: chat.type,
        createdAt: chat.created_at,
        messageCount: chat.messages?.length || 0,
        lastMessageAt: chat.messages?.length > 0 
          ? chat.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
      }));

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search messages in chat
   */
  static async searchMessages(chatId: string, query: string, userId: string) {
    try {
      // First check if user is participant
      const { data: participant, error: participantError } = await supabaseService.getSupabaseClient()
        .from('chat_participants')
        .select('id')
        .eq('chat_room_id', chatId)
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        throw new Error('Access denied: Not a participant in this chat');
      }

      // Search messages
      const { data, error } = await supabaseService.getSupabaseClient()
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('chat_room_id', chatId)
        .ilike('content', `%${query}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Failed to search messages: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(chatId: string, userId: string, lastReadMessageId?: string) {
    try {
      const { error } = await supabaseService.getSupabaseClient()
        .from('chat_participants')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('chat_room_id', chatId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to mark messages as read: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread message count for user
   */
  static async getUnreadCount(userId: string) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient()
        .from('chat_participants')
        .select(`
          chat_room_id,
          last_read_at,
          chat_rooms!inner (
            id,
            name,
            messages (
              id,
              created_at,
              sender_id
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_archived', false);

      if (error) {
        throw new Error(`Failed to get unread count: ${error.message}`);
      }

      let totalUnread = 0;
      const chatUnreadCounts: any = {};

      data.forEach((participant: any) => {
        const chatRoom = participant.chat_rooms;
        const lastReadAt = participant.last_read_at;
        
        if (chatRoom.messages) {
          const unreadMessages = chatRoom.messages.filter((message: any) => {
            return message.sender_id !== userId && 
                   (!lastReadAt || new Date(message.created_at) > new Date(lastReadAt));
          });
          
          const unreadCount = unreadMessages.length;
          totalUnread += unreadCount;
          chatUnreadCounts[chatRoom.id] = unreadCount;
        }
      });

      return {
        totalUnread,
        chatUnreadCounts
      };
    } catch (error) {
      throw error;
    }
  }
}
