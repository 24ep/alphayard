-- Migration: 016_social_media_tables.sql
-- Description: Add social media tables for posts, comments, reports, and activities
-- Created: 2024-01-15
-- Author: Bondarys Team

-- =============================================
-- SOCIAL MEDIA TABLES
-- =============================================

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'event')),
  media_urls JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  visibility VARCHAR(20) DEFAULT 'family' CHECK (visibility IN ('public', 'family', 'friends')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted', 'under_review')),
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0,
  last_reported_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social post comments table
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social post reports table
CREATE TABLE IF NOT EXISTS social_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(20) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'violence', 'other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social post activities table (likes, shares, views)
CREATE TABLE IF NOT EXISTS social_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'share', 'comment', 'view')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social post likes table (for tracking individual likes)
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Social comment likes table
CREATE TABLE IF NOT EXISTS social_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Social posts indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_circle_id ON social_posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_author_id ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(type);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_reported ON social_posts(is_reported);

-- Social comments indexes
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_author_id ON social_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_created_at ON social_comments(created_at DESC);

-- Social reports indexes
CREATE INDEX IF NOT EXISTS idx_social_reports_post_id ON social_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_reporter_id ON social_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_status ON social_reports(status);
CREATE INDEX IF NOT EXISTS idx_social_reports_created_at ON social_reports(created_at DESC);

-- Social activities indexes
CREATE INDEX IF NOT EXISTS idx_social_activities_post_id ON social_activities(post_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_action ON social_activities(action);
CREATE INDEX IF NOT EXISTS idx_social_activities_created_at ON social_activities(created_at DESC);

-- Social likes indexes
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comment_likes_comment_id ON social_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_social_comment_likes_user_id ON social_comment_likes(user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC COUNTER UPDATES
-- =============================================

-- Function to update post counters
CREATE OR REPLACE FUNCTION update_social_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update likes count
    IF NEW.action = 'like' THEN
      UPDATE social_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    
    -- Update views count
    IF NEW.action = 'view' THEN
      UPDATE social_posts 
      SET views_count = views_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update likes count
    IF OLD.action = 'like' THEN
      UPDATE social_posts 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for social activities
CREATE TRIGGER trigger_update_social_post_counters
  AFTER INSERT OR DELETE ON social_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_social_post_counters();

-- Function to update comment counters
CREATE OR REPLACE FUNCTION update_social_comment_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update comments count on post
    UPDATE social_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    
    -- Update likes count on comment
    IF NEW.action = 'like' THEN
      UPDATE social_comments 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.comment_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update comments count on post
    UPDATE social_posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.post_id;
    
    -- Update likes count on comment
    IF OLD.action = 'like' THEN
      UPDATE social_comments 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.comment_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for social comments
CREATE TRIGGER trigger_update_social_comment_counters
  AFTER INSERT OR DELETE ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_social_comment_counters();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;

-- Social posts policies
CREATE POLICY "Users can view posts from their family" ON social_posts
  FOR SELECT USING (
    circle_id IN (
      SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts in their family" ON social_posts
  FOR INSERT WITH CHECK (
    circle_id IN (
      SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own posts" ON social_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON social_posts
  FOR DELETE USING (author_id = auth.uid());

-- Social comments policies
CREATE POLICY "Users can view comments on posts they can see" ON social_comments
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments on posts they can see" ON social_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON social_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON social_comments
  FOR DELETE USING (author_id = auth.uid());

-- Social reports policies
CREATE POLICY "Users can view reports on posts they can see" ON social_reports
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create reports on posts they can see" ON social_reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid() AND
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

-- Social activities policies
CREATE POLICY "Users can view activities on posts they can see" ON social_activities
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create activities on posts they can see" ON social_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

-- Social likes policies
CREATE POLICY "Users can view likes on posts they can see" ON social_post_likes
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create likes on posts they can see" ON social_post_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    post_id IN (
      SELECT id FROM social_posts WHERE circle_id IN (
        SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own likes" ON social_post_likes
  FOR DELETE USING (user_id = auth.uid());

-- Social comment likes policies
CREATE POLICY "Users can view comment likes on posts they can see" ON social_comment_likes
  FOR SELECT USING (
    comment_id IN (
      SELECT id FROM social_comments WHERE post_id IN (
        SELECT id FROM social_posts WHERE circle_id IN (
          SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comment likes on posts they can see" ON social_comment_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    comment_id IN (
      SELECT id FROM social_comments WHERE post_id IN (
        SELECT id FROM social_posts WHERE circle_id IN (
          SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete their own comment likes" ON social_comment_likes
  FOR DELETE USING (user_id = auth.uid());
