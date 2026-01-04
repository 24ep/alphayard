import { api } from './index';

export interface Chat {
  id: string;
  type: 'hourse' | 'direct' | 'group';
  name: string;
  description?: string;
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  lastMessage?: Message;
}

export interface ChatParticipant {
  id: string;
  chatRoomId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'file';
  replyTo?: string;
  metadata?: any;
  reactions?: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface CreateChatRequest {
  type: 'hourse' | 'direct' | 'group';
  name?: string;
  description?: string;
  participants?: string[];
}

export interface SendMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'location' | 'file';
  replyTo?: string;
  metadata?: any;
}

export const chatApi = {
  // Create chat room
  createChat: async (data: CreateChatRequest): Promise<{ success: boolean; chat: Chat }> => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  // Get user's chats
  getChats: async (): Promise<{ success: boolean; chats: Chat[] }> => {
    const response = await api.get('/chat');
    return response.data;
  },

  // Get chat by ID
  getChat: async (chatId: string): Promise<{ success: boolean; chat: Chat }> => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  // Send message
  sendMessage: async (chatId: string, data: SendMessageRequest): Promise<{ success: boolean; data: Message }> => {
    const response = await api.post(`/chat/${chatId}/messages`, data);
    return response.data;
  },

  // Get chat messages
  getMessages: async (chatId: string, params?: { limit?: number; offset?: number; before?: string; after?: string }): Promise<{ success: boolean; messages: Message[]; pagination: any }> => {
    const response = await api.get(`/chat/${chatId}/messages`, { params });
    return response.data;
  },

  // Update message
  updateMessage: async (chatId: string, messageId: string, content: string): Promise<{ success: boolean; data: Message }> => {
    const response = await api.put(`/chat/${chatId}/messages/${messageId}`, { content });
    return response.data;
  },

  // Delete message
  deleteMessage: async (chatId: string, messageId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/chat/${chatId}/messages/${messageId}`);
    return response.data;
  },

  // Add reaction to message
  addReaction: async (chatId: string, messageId: string, emoji: string): Promise<{ success: boolean; data: Message }> => {
    const response = await api.post(`/chat/${chatId}/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  // Remove reaction from message
  removeReaction: async (chatId: string, messageId: string, emoji: string): Promise<{ success: boolean; data: Message }> => {
    const response = await api.delete(`/chat/${chatId}/messages/${messageId}/reactions`, { data: { emoji } });
    return response.data;
  },

  // Add participant to chat
  addParticipant: async (chatId: string, participantId: string, role: 'admin' | 'member' = 'member'): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/chat/${chatId}/participants`, { participantId, role });
    return response.data;
  },

  // Remove participant from chat
  removeParticipant: async (chatId: string, participantId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/chat/${chatId}/participants/${participantId}`);
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (messageId: string, file: { uri: string; name?: string; type?: string }): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'file',
      type: file.type || 'application/octet-stream',
    } as any);

    const response = await api.post(`/messages/${messageId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
