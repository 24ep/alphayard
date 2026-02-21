/**
 * Enhanced Follow Service
 * 
 * This service provides enhanced follow/friend functionality using Prisma client
 * and proper user mappings for social media features.
 */

import { prisma } from '../database';
import { mapToMinimalProfile, mapToPublicProfile } from '../../utils/userMappings';

export interface UserProfile {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  isCloseFriend: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  message?: string;
  createdAt: Date;
  expiresAt?: Date;
  sender: UserProfile;
  receiver?: UserProfile;
}

/**
 * Get close friends with enhanced profiles
 */
export async function getCloseFriends(userId: string): Promise<UserProfile[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
      u.followers_count, u.following_count,
      true as is_close_friend
    FROM bondarys.user_follows uf
    JOIN public.users u ON uf.following_id = u.id
    WHERE uf.follower_id = ${userId}::uuid AND uf.is_close_friend = true AND uf.status = 'active'
    ORDER BY u.display_name
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isVerified: row.is_verified,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    isCloseFriend: row.is_close_friend
  }));
}

/**
 * Get mutual friends between two users
 */
export async function getMutualFriends(userId: string, targetId: string): Promise<UserProfile[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
      u.followers_count, u.following_count
    FROM bondarys.user_follows uf1
    JOIN bondarys.user_follows uf2 ON uf1.follower_id = uf2.follower_id
    JOIN public.users u ON uf1.follower_id = u.id
    WHERE uf1.following_id = ${userId}::uuid AND uf2.following_id = ${targetId}::uuid
      AND uf1.status = 'active' AND uf2.status = 'active'
      AND uf1.follower_id != ${userId}::uuid AND uf1.follower_id != ${targetId}::uuid
    ORDER BY u.display_name
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isVerified: row.is_verified,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    isCloseFriend: false
  }));
}

/**
 * Get friend requests sent to user
 */
export async function getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.message, 
      fr.created_at as "createdAt", fr.expires_at as "expiresAt",
      u.id as senderId, u.username, u.display_name, u.avatar_url as avatar,
      u.is_verified as senderIsVerified, u.followers_count as senderFollowersCount,
      u.following_count as senderFollowingCount
    FROM bondarys.friend_requests fr
    JOIN public.users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = ${userId}::uuid AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    status: row.status,
    message: row.message,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    sender: {
      id: row.senderId,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar,
      isVerified: row.senderIsVerified,
      followersCount: row.senderFollowersCount,
      followingCount: row.senderFollowingCount
    }
  }));
}

/**
 * Get friend requests sent by user
 */
export async function getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.message,
      fr.created_at as "createdAt", fr.expires_at as "expiresAt",
      u.id as receiverId, u.username, u.display_name, u.avatar_url as avatar,
      u.is_verified as receiverIsVerified, u.followers_count as receiverFollowersCount,
      u.following_count as receiverFollowingCount
    FROM bondarys.friend_requests fr
    JOIN public.users u ON fr.receiver_id = u.id
    WHERE fr.sender_id = ${userId}::uuid AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    status: row.status,
    message: row.message,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    receiver: {
      id: row.receiverId,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar,
      isVerified: row.receiverIsVerified,
      followersCount: row.receiverFollowersCount,
      followingCount: row.receiverFollowingCount
    }
  }));
}

/**
 * Get user suggestions for following
 */
export async function getUserSuggestions(userId: string, limit: number = 10): Promise<UserProfile[]> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
      u.followers_count, u.following_count,
      COUNT(DISTINCT mutual.follower_id) as mutual_friends_count
    FROM public.users u
    LEFT JOIN bondarys.user_follows mutual ON mutual.following_id = u.id
      AND mutual.follower_id IN (
        SELECT following_id FROM bondarys.user_follows WHERE follower_id = ${userId}::uuid AND status = 'active'
      )
    WHERE u.id != ${userId}::uuid
      AND u.id NOT IN (
        SELECT following_id FROM bondarys.user_follows 
        WHERE follower_id = ${userId}::uuid AND status = 'active'
      )
      AND u.is_active = true
    GROUP BY u.id, u.username, u.display_name, u.avatar_url, u.is_verified, u.followers_count, u.following_count
    ORDER BY mutual_friends_count DESC, u.followers_count DESC
    LIMIT ${limit}
  `;
  
  return result.map((row: any) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isVerified: row.is_verified,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    isCloseFriend: false
  }));
}

/**
 * Send friend request
 */
export async function sendFriendRequest(senderId: string, receiverId: string, message?: string): Promise<FriendRequest> {
  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO bondarys.friend_requests (sender_id, receiver_id, status, message, created_at, expires_at)
    VALUES (${senderId}::uuid, ${receiverId}::uuid, 'pending', ${message || null}, NOW(), NOW() + INTERVAL '7 days')
    RETURNING *
  `;
  
  return result[0];
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  await prisma.$executeRaw`
    BEGIN;
    
    -- Update friend request status
    UPDATE bondarys.friend_requests 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = ${requestId}::uuid;
    
    -- Create follow relationships (both ways)
    INSERT INTO bondarys.user_follows (follower_id, following_id, status, created_at)
    SELECT receiver_id, sender_id, 'active', NOW() 
    FROM bondarys.friend_requests 
    WHERE id = ${requestId}::uuid;
    
    INSERT INTO bondarys.user_follows (follower_id, following_id, status, created_at)
    SELECT sender_id, receiver_id, 'active', NOW() 
    FROM bondarys.friend_requests 
    WHERE id = ${requestId}::uuid;
    
    COMMIT;
  `;
}

/**
 * Decline friend request
 */
export async function declineFriendRequest(requestId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE bondarys.friend_requests 
    SET status = 'declined', updated_at = NOW()
    WHERE id = ${requestId}::uuid
  `;
}

/**
 * Cancel friend request
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM bondarys.friend_requests 
    WHERE id = ${requestId}::uuid AND status = 'pending'
  `;
}

/**
 * Follow user
 */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO bondarys.user_follows (follower_id, following_id, status, created_at)
    VALUES (${followerId}::uuid, ${followingId}::uuid, 'active', NOW())
    ON CONFLICT (follower_id, following_id) DO UPDATE SET
      status = 'active', updated_at = NOW()
  `;
}

/**
 * Unfollow user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM bondarys.user_follows 
    WHERE follower_id = ${followerId}::uuid AND following_id = ${followingId}::uuid
  `;
}

/**
 * Mark user as close friend
 */
export async function markAsCloseFriend(followerId: string, followingId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE bondarys.user_follows 
    SET is_close_friend = true, updated_at = NOW()
    WHERE follower_id = ${followerId}::uuid AND following_id = ${followingId}::uuid
  `;
}

/**
 * Unmark user as close friend
 */
export async function unmarkAsCloseFriend(followerId: string, followingId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE bondarys.user_follows 
    SET is_close_friend = false, updated_at = NOW()
    WHERE follower_id = ${followerId}::uuid AND following_id = ${followingId}::uuid
  `;
}

/**
 * Get follow statistics
 */
export async function getFollowStats(userId: string): Promise<any> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      (SELECT COUNT(*) FROM bondarys.user_follows WHERE follower_id = ${userId}::uuid AND status = 'active') as following_count,
      (SELECT COUNT(*) FROM bondarys.user_follows WHERE following_id = ${userId}::uuid AND status = 'active') as followers_count,
      (SELECT COUNT(*) FROM bondarys.user_follows WHERE follower_id = ${userId}::uuid AND following_id = ${userId}::uuid AND status = 'active') as self_following,
      (SELECT COUNT(*) FROM bondarys.user_follows WHERE follower_id = ${userId}::uuid AND is_close_friend = true AND status = 'active') as close_friends_count
  `;
  
  return result[0];
}

/**
 * Check if user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 1 FROM bondarys.user_follows 
    WHERE follower_id = ${followerId}::uuid AND following_id = ${followingId}::uuid AND status = 'active'
    LIMIT 1
  `;
  
  return result.length > 0;
}

/**
 * Check if users are close friends
 */
export async function areCloseFriends(userId1: string, userId2: string): Promise<boolean> {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 1 FROM bondarys.user_follows 
    WHERE follower_id = ${userId1}::uuid AND following_id = ${userId2}::uuid 
      AND is_close_friend = true AND status = 'active'
    LIMIT 1
  `;
  
  return result.length > 0;
}
