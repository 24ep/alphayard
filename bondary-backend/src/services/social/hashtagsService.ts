// Mock HashtagsService - TODO: Implement when database schema is ready

export class HashtagsService {
  // Mock methods to prevent import errors
  static async getTrendingHashtags() { return []; }
  static async searchHashtags() { return []; }
  static async createHashtag() { return null; }
  static async getUnreadMentions() { return []; }
  static async getAllMentions() { return []; }
  static async markMentionAsRead() { return false; }
  static async markAllMentionsAsRead() { return 0; }
  static async getUnreadMentionsCount() { return 0; }
  static async updateTrendingStatus() { return null; }
  static async blockHashtag() { return false; }
  static async unblockHashtag() { return false; }
}

// Mock interfaces
export interface Hashtag {
  id: string;
  tag: string;
  count: number;
  isTrending: boolean;
}

export interface Mention {
  id: string;
  mentionerId: string;
  mentionedUserId: string;
  postId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
