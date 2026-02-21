/**
 * Enhanced Hashtags Service
 * 
 * This service provides enhanced hashtag functionality using Prisma client
 * and proper user mappings for social media features.
 */

import { prisma } from '../database';
import { mapToAuthorProfile, mapToMentionerProfile } from '../../utils/userMappings';

export interface PostWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

export interface UserMention {
  id: string;
  mentionerId: string;
  mentionerUsername?: string;
  mentionerDisplayName?: string;
  mentionerAvatarUrl?: string;
  createdAt: Date;
}

/**
 * Get posts by hashtag with enhanced user profiles
 */
export async function getPostsByHashtag(
  tag: string,
  limit: number = 50,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  // For now, we'll use raw SQL but with proper user mapping
  // In a full implementation, this would use Prisma with proper relationships
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      e.id, e.data as content, e.created_at as "createdAt",
      u.id as "authorId", u.username as "authorUsername",
      u.display_name as "authorDisplayName", u.avatar_url as "authorAvatarUrl",
      u.is_verified as "authorIsVerified"
    FROM bondarys.social_post_hashtags ph
    JOIN bondarys.social_hashtags h ON ph.hashtag_id = h.id
    JOIN bondarys.entities e ON ph.post_id = e.id
    LEFT JOIN public.users u ON e.owner_id = u.id
    WHERE LOWER(h.tag) = ${tag.toLowerCase()} AND h.is_blocked = false
    ORDER BY e.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      username: row.authorUsername,
      displayName: row.authorDisplayName,
      avatarUrl: row.authorAvatarUrl,
      isVerified: row.authorIsVerified
    }
  }));
}

/**
 * Get user mentions with enhanced profiles
 */
export async function getUserMentions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserMention[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      m.id, m.mentioner_id as "mentionerId", m.created_at as "createdAt",
      u.id, u.username as "mentionerUsername",
      u.display_name as "mentionerDisplayName", u.avatar_url as "mentionerAvatarUrl"
    FROM bondarys.social_mentions m
    JOIN public.users u ON m.mentioner_id = u.id
    WHERE m.mentioned_user_id = ${userId}::uuid
    ORDER BY m.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    mentionerId: row.mentionerId,
    mentionerUsername: row.mentionerUsername,
    mentionerDisplayName: row.mentionerDisplayName,
    mentionerAvatarUrl: row.mentionerAvatarUrl,
    createdAt: row.createdAt
  }));
}

/**
 * Get trending hashtags
 */
export async function getTrendingHashtags(limit: number = 10): Promise<any[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      h.tag,
      COUNT(*) as post_count,
      COUNT(DISTINCT ph.post_id) as unique_posts
    FROM bondarys.social_hashtags h
    JOIN bondarys.social_post_hashtags ph ON h.id = ph.hashtag_id
    JOIN bondarys.entities e ON ph.post_id = e.id
    WHERE h.is_blocked = false AND e.status != 'deleted'
      AND e.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY h.tag
    HAVING COUNT(*) >= 3
    ORDER BY unique_posts DESC, post_count DESC
    LIMIT ${limit}
  `;
  
  return result;
}

/**
 * Search hashtags
 */
export async function searchHashtags(
  query: string,
  limit: number = 20
): Promise<any[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      h.tag,
      COUNT(*) as post_count
    FROM bondarys.social_hashtags h
    JOIN bondarys.social_post_hashtags ph ON h.id = ph.hashtag_id
    JOIN bondarys.entities e ON ph.post_id = e.id
    WHERE LOWER(h.tag) LIKE LOWER(${`%${query}%`}) 
      AND h.is_blocked = false 
      AND e.status != 'deleted'
    GROUP BY h.tag
    ORDER BY post_count DESC
    LIMIT ${limit}
  `;
  
  return result;
}

/**
 * Create or update hashtag
 */
export async function upsertHashtag(tag: string): Promise<any> {
  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO bondarys.social_hashtags (tag, is_blocked, created_at, updated_at)
    VALUES (${tag}, false, NOW(), NOW())
    ON CONFLICT (tag) DO UPDATE SET
      updated_at = NOW()
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Block hashtag
 */
export async function blockHashtag(tag: string): Promise<void> {
  await prisma.$queryRaw<any[]>`
    UPDATE bondarys.social_hashtags 
    SET is_blocked = true, updated_at = NOW()
    WHERE tag = ${tag}
  `;
}

/**
 * Unblock hashtag
 */
export async function unblockHashtag(tag: string): Promise<void> {
  await prisma.$queryRaw<any[]>`
    UPDATE bondarys.social_hashtags 
    SET is_blocked = false, updated_at = NOW()
    WHERE tag = ${tag}
  `;
}

/**
 * Get hashtag analytics
 */
export async function getHashtagAnalytics(tag: string): Promise<any> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      h.tag,
      COUNT(*) as total_posts,
      COUNT(DISTINCT ph.post_id) as unique_posts,
      COUNT(DISTINCT e.owner_id) as unique_authors,
      MIN(e.created_at) as first_used,
      MAX(e.created_at) as last_used
    FROM bondarys.social_hashtags h
    JOIN bondarys.social_post_hashtags ph ON h.id = ph.hashtag_id
    JOIN bondarys.entities e ON ph.post_id = e.id
    WHERE h.tag = ${tag} AND h.is_blocked = false
    GROUP BY h.tag
  `;
  
  return result[0] || null;
}

/**
 * Get user's hashtag usage
 */
export async function getUserHashtagUsage(userId: string): Promise<any[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      h.tag,
      COUNT(*) as usage_count,
      MAX(e.created_at) as last_used
    FROM bondarys.social_post_hashtags ph
    JOIN bondarys.social_hashtags h ON ph.hashtag_id = h.id
    JOIN bondarys.entities e ON ph.post_id = e.id
    WHERE e.owner_id = ${userId}::uuid AND h.is_blocked = false
    GROUP BY h.tag
    ORDER BY usage_count DESC
    LIMIT 20
  `;
  
  return result;
}

/**
 * Get related hashtags
 */
export async function getRelatedHashtags(tag: string, limit: number = 10): Promise<any[]> {
  const result = await prisma.$queryRaw<any[]>`
    WITH post_hashtags AS (
      SELECT DISTINCT ph.hashtag_id
      FROM bondarys.social_post_hashtags ph
      JOIN bondarys.entities e ON ph.post_id = e.id
      WHERE ph.post_id IN (
        SELECT ph2.post_id
        FROM bondarys.social_post_hashtags ph2
        JOIN bondarys.social_hashtags h2 ON ph2.hashtag_id = h2.id
        WHERE h2.tag = ${tag}
      )
      AND ph.hashtag_id != (SELECT id FROM bondarys.social_hashtags WHERE tag = ${tag})
    )
    SELECT 
      h.tag,
      COUNT(*) as co_occurrence_count
    FROM bondarys.social_hashtags h
    WHERE h.id IN (SELECT hashtag_id FROM post_hashtags)
      AND h.is_blocked = false
    GROUP BY h.tag
    ORDER BY co_occurrence_count DESC
    LIMIT ${limit}
  `;
  
  return result;
}
