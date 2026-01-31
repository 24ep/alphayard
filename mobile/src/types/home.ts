export interface SocialPost {
  id: string;
  circleId: string;
  authorId: string;
  content: string;
  type: 'text' | 'image' | 'video';
  media_urls?: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface CreateSocialPostRequest {
  content: string;
  circleId: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  tags?: string[];
}

export interface UpdateSocialPostRequest extends Partial<CreateSocialPostRequest> {}

export interface SocialPostInteraction {
  postId: string;
  type: 'like' | 'comment' | 'share';
  content?: string;
}

export interface ShoppingItem {
  id: string;
  circleId: string;
  item: string;
  category: string;
  quantity: string;
  assignedTo?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  estimatedCost?: number;
  created_at?: string;
}
