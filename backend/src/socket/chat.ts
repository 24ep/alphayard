/**
 * Chat Socket Handlers
 * 
 * TypeScript implementation of chat socket event handlers.
 * Replaces Mongoose models with Supabase queries.
 * Includes rate limiting and retry logic.
 */

import { Server, Socket } from 'socket.io';
import { ChatDatabaseService } from '../services/chatDatabaseService';
import { messageRateLimiter, reactionRateLimiter, typingRateLimiter } from '../middleware/chatRateLimiter';

// interface SocketData { // Not used
//   userId: string;
// }

export const setupChatHandlers = (io: Server, socket: Socket & { userId?: string }) => {
  // Join chat room
  socket.on('join-chat', async (chatId: string) => {
    try {
      if (!socket.userId) {
        socket.emit('chat-join-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(chatId);
      if (chat) {
        const isParticipant = await ChatDatabaseService.isParticipant(chatId, socket.userId);
        if (isParticipant) {
          socket.join(`chat:${chatId}`);
          socket.emit('chat-joined', { chatId });

          // Notify other participants that user joined
          socket.to(`chat:${chatId}`).emit('user-joined', {
            chatId,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit('chat-join-error', {
            error: 'Access denied',
            message: 'You are not a participant in this chat room',
          });
        }
      } else {
        socket.emit('chat-join-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist',
        });
      }
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('chat-join-error', {
        error: 'Internal server error',
        message: 'Failed to join chat room',
      });
    }
  });

  // Leave chat room
  socket.on('leave-chat', async (chatId: string) => {
    try {
      socket.leave(`chat:${chatId}`);
      socket.emit('chat-left', { chatId });

      // Notify other participants that user left
      socket.to(`chat:${chatId}`).emit('user-left', {
        chatId,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Leave chat error:', error);
    }
  });

  // Send message
  socket.on('send-message', async (data: {
    chatId: string;
    content: string;
    type?: string;
    metadata?: Record<string, any>;
    replyTo?: string;
    messageId?: string; // For retry logic
  }) => {
    try {
      // Rate limiting
      const rateLimitResult = messageRateLimiter.check(socket.id, 'send-message');
      if (!rateLimitResult.allowed) {
        socket.emit('message-error', {
          error: 'Rate limit exceeded',
          message: 'Too many messages. Please slow down.',
          resetTime: rateLimitResult.resetTime,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        });
        return;
      }

      if (!socket.userId) {
        socket.emit('message-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { chatId, content, type = 'text', metadata = {}, replyTo } = data;

      if (!chatId || (!content && type === 'text')) {
        socket.emit('message-error', {
          error: 'Invalid message data',
          message: 'Chat ID and content are required',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(chatId);
      if (!chat) {
        socket.emit('message-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist',
        });
        return;
      }

      const isParticipant = await ChatDatabaseService.isParticipant(chatId, socket.userId);
      if (!isParticipant) {
        socket.emit('message-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room',
        });
        return;
      }

      // Create the message with retry logic
      let message = null;
      let retries = 0;
      const maxRetries = 3;

      while (!message && retries < maxRetries) {
        try {
          message = await ChatDatabaseService.createMessage({
            room_id: chatId,
            sender_id: socket.userId,
            content,
            type,
            metadata: {
              ...metadata,
              retryAttempt: retries,
              originalMessageId: data.messageId,
            },
            reply_to_id: replyTo,
          });

          if (message) {
            break;
          }
        } catch (error) {
          retries += 1;
          if (retries >= maxRetries) {
            console.error('Failed to create message after retries:', error);
            socket.emit('message-error', {
              error: 'Internal server error',
              message: 'Failed to create message after multiple attempts',
              retryable: true,
              messageId: data.messageId,
            });
            return;
          }
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }

      if (!message) {
        socket.emit('message-error', {
          error: 'Internal server error',
          message: 'Failed to create message',
          retryable: true,
          messageId: data.messageId,
        });
        return;
      }

      // Get reactions for the message
      const reactions = await ChatDatabaseService.getMessageReactions(message.id);

      // Emit to all users in the chat
      io.to(`chat:${chatId}`).emit('new-message', {
        message: {
          id: message.id,
          chatRoomId: message.room_id,
          senderId: message.sender_id,
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          replyTo: message.reply_to_id,
          editedAt: message.edited_at,
          deletedAt: message.deleted_at,
          isPinned: message.is_pinned,
          reactions,
          createdAt: message.created_at,
          updatedAt: message.updated_at,
        },
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', {
        error: 'Internal server error',
        message: 'Failed to send message',
      });
    }
  });

  // Update message
  socket.on('update-message', async (data: {
    messageId: string;
    content: string;
  }) => {
    try {
      if (!socket.userId) {
        socket.emit('message-update-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { messageId, content } = data;

      if (!messageId || !content) {
        socket.emit('message-update-error', {
          error: 'Invalid update data',
          message: 'Message ID and content are required',
        });
        return;
      }

      const message = await ChatDatabaseService.findMessageById(messageId);
      if (!message) {
        socket.emit('message-update-error', {
          error: 'Message not found',
          message: 'The requested message does not exist',
        });
        return;
      }

      if (message.sender_id !== socket.userId) {
        socket.emit('message-update-error', {
          error: 'Access denied',
          message: 'You can only edit your own messages',
        });
        return;
      }

      const updatedMessage = await ChatDatabaseService.updateMessage(messageId, {
        content,
        edited_at: new Date().toISOString(),
      });

      if (!updatedMessage) {
        socket.emit('message-update-error', {
          error: 'Internal server error',
          message: 'Failed to update message',
        });
        return;
      }

      // Get reactions
      const reactions = await ChatDatabaseService.getMessageReactions(updatedMessage.id);

      // Emit to all users in the chat
      io.to(`chat:${updatedMessage.room_id}`).emit('message-updated', {
        message: {
          id: updatedMessage.id,
          chatRoomId: updatedMessage.room_id,
          senderId: updatedMessage.sender_id,
          content: updatedMessage.content,
          type: updatedMessage.type,
          metadata: updatedMessage.metadata,
          replyTo: updatedMessage.reply_to_id,
          editedAt: updatedMessage.edited_at,
          deletedAt: updatedMessage.deleted_at,
          isPinned: updatedMessage.is_pinned,
          reactions,
          createdAt: updatedMessage.created_at,
          updatedAt: updatedMessage.updated_at,
        },
      });
    } catch (error) {
      console.error('Update message error:', error);
      socket.emit('message-update-error', {
        error: 'Internal server error',
        message: 'Failed to update message',
      });
    }
  });

  // Delete message
  socket.on('delete-message', async (data: { messageId: string }) => {
    try {
      if (!socket.userId) {
        socket.emit('message-delete-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { messageId } = data;

      if (!messageId) {
        socket.emit('message-delete-error', {
          error: 'Invalid delete data',
          message: 'Message ID is required',
        });
        return;
      }

      const message = await ChatDatabaseService.findMessageById(messageId);
      if (!message) {
        socket.emit('message-delete-error', {
          error: 'Message not found',
          message: 'The requested message does not exist',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(message.room_id);
      const isSender = message.sender_id === socket.userId;
      const isAdmin = chat
        ? await ChatDatabaseService.isAdmin(message.room_id, socket.userId)
        : false;

      if (!isSender && !isAdmin) {
        socket.emit('message-delete-error', {
          error: 'Access denied',
          message: 'You can only delete your own messages or be an admin',
        });
        return;
      }

      const deleted = await ChatDatabaseService.deleteMessage(messageId);
      if (!deleted) {
        socket.emit('message-delete-error', {
          error: 'Internal server error',
          message: 'Failed to delete message',
        });
        return;
      }

      // Emit to all users in the chat
      io.to(`chat:${message.room_id}`).emit('message-deleted', {
        messageId: message.id,
        chatRoomId: message.room_id,
        deletedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('message-delete-error', {
        error: 'Internal server error',
        message: 'Failed to delete message',
      });
    }
  });

  // Add reaction
  socket.on('add-reaction', async (data: {
    messageId: string;
    emoji: string;
  }) => {
    try {
      // Rate limiting
      const rateLimitResult = reactionRateLimiter.check(socket.id, 'add-reaction');
      if (!rateLimitResult.allowed) {
        socket.emit('reaction-error', {
          error: 'Rate limit exceeded',
          message: 'Too many reactions. Please slow down.',
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }

      if (!socket.userId) {
        socket.emit('reaction-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { messageId, emoji } = data;

      if (!messageId || !emoji) {
        socket.emit('reaction-error', {
          error: 'Invalid reaction data',
          message: 'Message ID and emoji are required',
        });
        return;
      }

      const message = await ChatDatabaseService.findMessageById(messageId);
      if (!message) {
        socket.emit('reaction-error', {
          error: 'Message not found',
          message: 'The requested message does not exist',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(message.room_id);
      if (!chat) {
        socket.emit('reaction-error', {
          error: 'Chat room not found',
          message: 'The chat room for this message does not exist',
        });
        return;
      }

      const isParticipant = await ChatDatabaseService.isParticipant(
        message.room_id,
        socket.userId
      );
      if (!isParticipant) {
        socket.emit('reaction-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room',
        });
        return;
      }

      const success = await ChatDatabaseService.addReaction(messageId, socket.userId, emoji);
      if (!success) {
        socket.emit('reaction-error', {
          error: 'Internal server error',
          message: 'Failed to add reaction',
        });
        return;
      }

      // Get updated reactions
      const reactions = await ChatDatabaseService.getMessageReactions(messageId);

      // Emit to all users in the chat
      io.to(`chat:${message.room_id}`).emit('reaction-added', {
        messageId: message.id,
        chatRoomId: message.room_id,
        userId: socket.userId,
        emoji,
        reactions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('reaction-error', {
        error: 'Internal server error',
        message: 'Failed to add reaction',
      });
    }
  });

  // Remove reaction
  socket.on('remove-reaction', async (data: {
    messageId: string;
    emoji: string;
  }) => {
    try {
      if (!socket.userId) {
        socket.emit('reaction-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { messageId, emoji } = data;

      if (!messageId || !emoji) {
        socket.emit('reaction-error', {
          error: 'Invalid reaction data',
          message: 'Message ID and emoji are required',
        });
        return;
      }

      const message = await ChatDatabaseService.findMessageById(messageId);
      if (!message) {
        socket.emit('reaction-error', {
          error: 'Message not found',
          message: 'The requested message does not exist',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(message.room_id);
      if (!chat) {
        socket.emit('reaction-error', {
          error: 'Chat room not found',
          message: 'The chat room for this message does not exist',
        });
        return;
      }

      const isParticipant = await ChatDatabaseService.isParticipant(
        message.room_id,
        socket.userId
      );
      if (!isParticipant) {
        socket.emit('reaction-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room',
        });
        return;
      }

      const success = await ChatDatabaseService.removeReaction(messageId, socket.userId, emoji);
      if (!success) {
        socket.emit('reaction-error', {
          error: 'Internal server error',
          message: 'Failed to remove reaction',
        });
        return;
      }

      // Get updated reactions
      const reactions = await ChatDatabaseService.getMessageReactions(messageId);

      // Emit to all users in the chat
      io.to(`chat:${message.room_id}`).emit('reaction-removed', {
        messageId: message.id,
        chatRoomId: message.room_id,
        userId: socket.userId,
        emoji,
        reactions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Remove reaction error:', error);
      socket.emit('reaction-error', {
        error: 'Internal server error',
        message: 'Failed to remove reaction',
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
    // Rate limiting for typing events
    const rateLimitResult = typingRateLimiter.check(socket.id, 'typing');
    if (!rateLimitResult.allowed) {
      // Silently ignore excessive typing events
      return;
    }

    const { chatId } = data;
    if (chatId && socket.userId) {
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId: socket.userId,
        chatId,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Stop typing indicator
  socket.on('stop-typing', (data: { chatId: string }) => {
    const { chatId } = data;
    if (chatId && socket.userId) {
      socket.to(`chat:${chatId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        chatId,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Mark messages as read
  socket.on('mark-messages-read', async (data: {
    chatId: string;
    lastReadMessageId?: string;
  }) => {
    try {
      if (!socket.userId) {
        socket.emit('mark-read-error', {
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { chatId, lastReadMessageId } = data;

      if (!chatId) {
        socket.emit('mark-read-error', {
          error: 'Invalid data',
          message: 'Chat ID is required',
        });
        return;
      }

      const chat = await ChatDatabaseService.findChatRoomById(chatId);
      if (!chat) {
        socket.emit('mark-read-error', {
          error: 'Chat room not found',
          message: 'The requested chat room does not exist',
        });
        return;
      }

      const isParticipant = await ChatDatabaseService.isParticipant(chatId, socket.userId);
      if (!isParticipant) {
        socket.emit('mark-read-error', {
          error: 'Access denied',
          message: 'You are not a participant in this chat room',
        });
        return;
      }

      // Mark messages as read
      await ChatDatabaseService.markMessagesRead(chatId, socket.userId);

      socket.emit('messages-marked-read', {
        chatId,
        userId: socket.userId,
        lastReadMessageId,
        timestamp: new Date().toISOString(),
      });

      // Notify other participants that messages were read
      socket.to(`chat:${chatId}`).emit('user-read-messages', {
        chatId,
        userId: socket.userId,
        lastReadMessageId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Mark messages read error:', error);
      socket.emit('mark-read-error', {
        error: 'Internal server error',
        message: 'Failed to mark messages as read',
      });
    }
  });

  // Chat room events
  socket.on('chat-room-updated', (data: { chatId: string }) => {
    const { chatId } = data;
    if (chatId && socket.userId) {
      socket.to(`chat:${chatId}`).emit('chat-room-changed', {
        chatId,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Participant events
  socket.on('participant-added', (data: { chatId: string; addedUserId: string }) => {
    const { chatId, addedUserId } = data;
    if (chatId && addedUserId && socket.userId) {
      io.to(`chat:${chatId}`).emit('participant-joined', {
        chatId,
        addedUserId,
        addedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('participant-removed', (data: { chatId: string; removedUserId: string }) => {
    const { chatId, removedUserId } = data;
    if (chatId && removedUserId && socket.userId) {
      io.to(`chat:${chatId}`).emit('participant-left', {
        chatId,
        removedUserId,
        removedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    }
  });
};

