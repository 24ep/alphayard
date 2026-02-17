import { api } from './index';

export interface Chat {
  id: string;
  type: 'Circle' | 'direct' | 'group';
  name: string;
  description?: string;
  circleId: string;
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
  type: 'Circle' | 'direct' | 'group';
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
  getChats: async (circleId: string): Promise<{ success: boolean; data: Chat[] }> => {
    const response = await api.get(`/chat/families/${circleId}/rooms`);
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
  getMessages: async (chatId: string, params?: { limit?: number; offset?: number; before?: string; after?: string }): Promise<{ success: boolean; data: Message[]; pagination: any }> => {
    const response = await api.get(`/chat/rooms/${chatId}/messages`, { params });
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

  // =====================================================
  // MESSAGE PINNING
  // =====================================================
  
  pinMessage: async (chatRoomId: string, messageId: string, expiresAt?: Date): Promise<{ success: boolean; pinned: any }> => {
    const response = await api.post(`/chat/rooms/${chatRoomId}/pin/${messageId}`, { expiresAt });
    return response.data;
  },

  unpinMessage: async (chatRoomId: string, messageId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chat/rooms/${chatRoomId}/pin/${messageId}`);
    return response.data;
  },

  getPinnedMessages: async (chatRoomId: string): Promise<{ success: boolean; pinnedMessages: any[] }> => {
    const response = await api.get(`/chat/rooms/${chatRoomId}/pinned`);
    return response.data;
  },

  // =====================================================
  // MESSAGE FORWARDING
  // =====================================================
  
  forwardMessage: async (messageId: string, targetChatRoomIds: string[]): Promise<{ success: boolean; newMessageIds: string[] }> => {
    const response = await api.post(`/chat/messages/${messageId}/forward`, { targetChatRoomIds });
    return response.data;
  },

  getForwardInfo: async (messageId: string): Promise<{ success: boolean; forwardInfo: any }> => {
    const response = await api.get(`/chat/messages/${messageId}/forward-info`);
    return response.data;
  },

  // =====================================================
  // MESSAGE THREADS
  // =====================================================
  
  replyToThread: async (threadId: string, chatRoomId: string, content: string, messageType?: string): Promise<{ success: boolean; reply: any }> => {
    const response = await api.post(`/chat/threads/${threadId}/reply`, { chatRoomId, content, messageType });
    return response.data;
  },

  getThreadReplies: async (threadId: string, options?: { limit?: number; offset?: number }): Promise<{ success: boolean; replies: any[] }> => {
    const response = await api.get(`/chat/threads/${threadId}/replies`, { params: options });
    return response.data;
  },

  getThreadSummary: async (threadId: string): Promise<{ success: boolean; summary: any }> => {
    const response = await api.get(`/chat/threads/${threadId}/summary`);
    return response.data;
  },

  getChatThreads: async (chatRoomId: string, limit?: number): Promise<{ success: boolean; threads: any[] }> => {
    const response = await api.get(`/chat/rooms/${chatRoomId}/threads`, { params: { limit } });
    return response.data;
  },

  // =====================================================
  // SCHEDULED MESSAGES
  // =====================================================
  
  createScheduledMessage: async (data: {
    chatRoomId: string;
    content: string;
    scheduledFor: Date;
    messageType?: string;
    timezone?: string;
  }): Promise<{ success: boolean; scheduled: any }> => {
    const response = await api.post('/chat/scheduled', data);
    return response.data;
  },

  getScheduledMessages: async (chatRoomId?: string): Promise<{ success: boolean; scheduledMessages: any[] }> => {
    const response = await api.get('/chat/scheduled', { params: { chatRoomId } });
    return response.data;
  },

  updateScheduledMessage: async (id: string, updates: any): Promise<{ success: boolean; scheduled: any }> => {
    const response = await api.put(`/chat/scheduled/${id}`, updates);
    return response.data;
  },

  cancelScheduledMessage: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chat/scheduled/${id}`);
    return response.data;
  },

  // =====================================================
  // DISAPPEARING MESSAGES
  // =====================================================
  
  setDisappearSettings: async (chatRoomId: string, enabled: boolean, durationSeconds?: number): Promise<{ success: boolean; settings: any }> => {
    const response = await api.put(`/chat/rooms/${chatRoomId}/disappear`, { enabled, durationSeconds });
    return response.data;
  },

  getDisappearSettings: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.get(`/chat/rooms/${chatRoomId}/disappear`);
    return response.data;
  },

  getDisappearPresets: async (): Promise<{ success: boolean; presets: any[] }> => {
    const response = await api.get('/chat/disappear/presets');
    return response.data;
  },

  // =====================================================
  // MESSAGE BOOKMARKS
  // =====================================================
  
  bookmarkMessage: async (messageId: string, note?: string, collectionName?: string): Promise<{ success: boolean; bookmark: any }> => {
    const response = await api.post('/chat/bookmarks', { messageId, note, collectionName });
    return response.data;
  },

  removeBookmark: async (messageId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chat/bookmarks/${messageId}`);
    return response.data;
  },

  getBookmarks: async (options?: { collectionName?: string; limit?: number }): Promise<{ success: boolean; bookmarks: any[] }> => {
    const response = await api.get('/chat/bookmarks', { params: options });
    return response.data;
  },

  getBookmarkCollections: async (): Promise<{ success: boolean; collections: any[] }> => {
    const response = await api.get('/chat/bookmarks/collections');
    return response.data;
  },

  searchBookmarks: async (q: string, limit?: number): Promise<{ success: boolean; bookmarks: any[] }> => {
    const response = await api.get('/chat/bookmarks/search', { params: { q, limit } });
    return response.data;
  },

  // =====================================================
  // CHAT MENTIONS
  // =====================================================
  
  getUnreadMentions: async (limit?: number): Promise<{ success: boolean; mentions: any[] }> => {
    const response = await api.get('/chat/mentions/unread', { params: { limit } });
    return response.data;
  },

  getAllMentions: async (options?: { limit?: number; offset?: number }): Promise<{ success: boolean; mentions: any[] }> => {
    const response = await api.get('/chat/mentions', { params: options });
    return response.data;
  },

  markMentionAsRead: async (mentionId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/mentions/${mentionId}/read`);
    return response.data;
  },

  markAllMentionsAsRead: async (chatRoomId?: string): Promise<{ success: boolean; count: number }> => {
    const response = await api.post('/chat/mentions/read-all', { chatRoomId });
    return response.data;
  },

  getMentionsCount: async (): Promise<{ success: boolean; count: number }> => {
    const response = await api.get('/chat/mentions/count');
    return response.data;
  },

  // =====================================================
  // CHAT POLLS
  // =====================================================
  
  createPoll: async (data: {
    chatRoomId: string;
    question: string;
    options: string[];
    pollType?: 'single' | 'multiple' | 'quiz';
    isAnonymous?: boolean;
    allowsAddOptions?: boolean;
    closesAt?: Date;
  }): Promise<{ success: boolean; poll: any }> => {
    const response = await api.post('/chat/polls', data);
    return response.data;
  },

  getPoll: async (pollId: string): Promise<{ success: boolean; poll: any }> => {
    const response = await api.get(`/chat/polls/${pollId}`);
    return response.data;
  },

  votePoll: async (pollId: string, optionIds: string[]): Promise<{ success: boolean; poll: any }> => {
    const response = await api.post(`/chat/polls/${pollId}/vote`, { optionIds });
    return response.data;
  },

  retractPollVote: async (pollId: string, optionId?: string): Promise<{ success: boolean; poll: any }> => {
    const response = await api.delete(`/chat/polls/${pollId}/vote`, { data: { optionId } });
    return response.data;
  },

  addPollOption: async (pollId: string, optionText: string): Promise<{ success: boolean; option: any }> => {
    const response = await api.post(`/chat/polls/${pollId}/options`, { optionText });
    return response.data;
  },

  closePoll: async (pollId: string): Promise<{ success: boolean; poll: any }> => {
    const response = await api.post(`/chat/polls/${pollId}/close`);
    return response.data;
  },

  // =====================================================
  // BROADCAST LISTS
  // =====================================================
  
  createBroadcastList: async (name: string, description?: string): Promise<{ success: boolean; list: any }> => {
    const response = await api.post('/chat/broadcasts', { name, description });
    return response.data;
  },

  getBroadcastLists: async (): Promise<{ success: boolean; lists: any[] }> => {
    const response = await api.get('/chat/broadcasts');
    return response.data;
  },

  addBroadcastRecipients: async (listId: string, userIds: string[]): Promise<{ success: boolean; addedCount: number }> => {
    const response = await api.post(`/chat/broadcasts/${listId}/recipients`, { userIds });
    return response.data;
  },

  sendBroadcast: async (listId: string, content: string, messageType?: string): Promise<{ success: boolean; message: any }> => {
    const response = await api.post(`/chat/broadcasts/${listId}/send`, { content, messageType });
    return response.data;
  },

  // =====================================================
  // CHAT SETTINGS (Mute, Archive, Pin)
  // =====================================================
  
  muteChat: async (chatRoomId: string, mutedUntil?: Date): Promise<{ success: boolean; settings: any }> => {
    const response = await api.post(`/chat/rooms/${chatRoomId}/mute`, { mutedUntil });
    return response.data;
  },

  unmuteChat: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.delete(`/chat/rooms/${chatRoomId}/mute`);
    return response.data;
  },

  archiveChat: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.post(`/chat/rooms/${chatRoomId}/archive`);
    return response.data;
  },

  unarchiveChat: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.delete(`/chat/rooms/${chatRoomId}/archive`);
    return response.data;
  },

  getArchivedChats: async (): Promise<{ success: boolean; archivedChatIds: string[] }> => {
    const response = await api.get('/chat/archived');
    return response.data;
  },

  pinChat: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.post(`/chat/rooms/${chatRoomId}/pin-chat`);
    return response.data;
  },

  unpinChat: async (chatRoomId: string): Promise<{ success: boolean; settings: any }> => {
    const response = await api.delete(`/chat/rooms/${chatRoomId}/pin-chat`);
    return response.data;
  },

  getPinnedChats: async (): Promise<{ success: boolean; pinnedChatIds: string[] }> => {
    const response = await api.get('/chat/pinned-chats');
    return response.data;
  },

  // =====================================================
  // QUICK REPLY TEMPLATES
  // =====================================================
  
  getTemplates: async (): Promise<{ success: boolean; templates: any[] }> => {
    const response = await api.get('/chat/templates');
    return response.data;
  },

  createTemplate: async (data: { shortcut: string; title: string; content: string }): Promise<{ success: boolean; template: any }> => {
    const response = await api.post('/chat/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, updates: any): Promise<{ success: boolean; template: any }> => {
    const response = await api.put(`/chat/templates/${id}`, updates);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chat/templates/${id}`);
    return response.data;
  },

  // =====================================================
  // STICKERS
  // =====================================================
  
  getUserStickerPacks: async (): Promise<{ success: boolean; packs: any[] }> => {
    const response = await api.get('/chat/stickers/packs');
    return response.data;
  },

  getStickerStore: async (): Promise<{ success: boolean; packs: any[] }> => {
    const response = await api.get('/chat/stickers/store');
    return response.data;
  },

  getStickerPack: async (packId: string): Promise<{ success: boolean; pack: any }> => {
    const response = await api.get(`/chat/stickers/packs/${packId}`);
    return response.data;
  },

  addStickerPack: async (packId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/stickers/packs/${packId}`);
    return response.data;
  },

  removeStickerPack: async (packId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/chat/stickers/packs/${packId}`);
    return response.data;
  },

  getRecentStickers: async (limit?: number): Promise<{ success: boolean; stickers: any[] }> => {
    const response = await api.get('/chat/stickers/recent', { params: { limit } });
    return response.data;
  },

  trackStickerUsage: async (stickerId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/stickers/${stickerId}/use`);
    return response.data;
  },

  // =====================================================
  // VOICE/VIDEO CALLS
  // =====================================================
  
  initiateCall: async (callType: 'voice' | 'video', chatRoomId?: string, participantIds?: string[]): Promise<{ success: boolean; call: any }> => {
    const response = await api.post('/chat/calls', { callType, chatRoomId, participantIds });
    return response.data;
  },

  getCall: async (callId: string): Promise<{ success: boolean; call: any }> => {
    const response = await api.get(`/chat/calls/${callId}`);
    return response.data;
  },

  joinCall: async (callId: string): Promise<{ success: boolean; participant: any }> => {
    const response = await api.post(`/chat/calls/${callId}/join`);
    return response.data;
  },

  leaveCall: async (callId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/calls/${callId}/leave`);
    return response.data;
  },

  declineCall: async (callId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/chat/calls/${callId}/decline`);
    return response.data;
  },

  endCall: async (callId: string, endReason?: string): Promise<{ success: boolean; call: any }> => {
    const response = await api.put(`/chat/calls/${callId}/status`, { status: 'ended', endReason });
    return response.data;
  },

  getCallHistory: async (options?: { limit?: number; callType?: string }): Promise<{ success: boolean; calls: any[] }> => {
    const response = await api.get('/chat/calls/history', { params: options });
    return response.data;
  },

  getActiveCall: async (chatRoomId: string): Promise<{ success: boolean; call: any }> => {
    const response = await api.get(`/chat/rooms/${chatRoomId}/active-call`);
    return response.data;
  },

  // =====================================================
  // LINK PREVIEWS
  // =====================================================
  
  getLinkPreviews: async (messageId: string): Promise<{ success: boolean; previews: any[] }> => {
    const response = await api.get(`/chat/messages/${messageId}/previews`);
    return response.data;
  },
};

