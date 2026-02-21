/**
 * Enhanced User Mapping Utilities
 * 
 * This file provides enhanced mapping functions for User entities,
 * particularly for social media features that require username, display_name,
 * followers_count, and following_count fields.
 */

import { User } from '@prisma/client';

export interface EnhancedUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUserProfile {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  bio?: string;
}

export interface MinimalUserProfile {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
}

/**
 * Maps a User entity to an enhanced profile with social media fields
 */
export function mapToEnhancedProfile(user: User): EnhancedUserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username || generateUsernameFromEmail(user.email),
    displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Maps a User entity to a public profile (excludes sensitive data)
 */
export function mapToPublicProfile(user: User): PublicUserProfile {
  return {
    id: user.id,
    username: user.username || generateUsernameFromEmail(user.email),
    displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    bio: user.bio
  };
}

/**
 * Maps a User entity to a minimal profile (for list views)
 */
export function mapToMinimalProfile(user: User): MinimalUserProfile {
  return {
    id: user.id,
    username: user.username || generateUsernameFromEmail(user.email),
    displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified
  };
}

/**
 * Maps a User entity to author profile (for posts/comments)
 */
export function mapToAuthorProfile(user: User): MinimalUserProfile {
  return {
    id: user.id,
    username: user.username || generateUsernameFromEmail(user.email),
    displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified
  };
}

/**
 * Maps a User entity to mentioner profile (for mentions)
 */
export function mapToMentionerProfile(user: User): MinimalUserProfile {
  return {
    id: user.id,
    username: user.username || generateUsernameFromEmail(user.email),
    displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified
  };
}

/**
 * Generates a username from email address if username is not set
 */
function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  // Remove special characters and convert to lowercase
  const cleanUsername = localPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return cleanUsername || 'user';
}

/**
 * Updates user social media counts
 */
export async function updateUserSocialCounts(
  userId: string,
  followersDelta: number = 0,
  followingDelta: number = 0
): Promise<void> {
  // This would be implemented with Prisma client
  // For now, this is a placeholder for the concept
  console.log(`Updating social counts for user ${userId}: followers +${followersDelta}, following +${followingDelta}`);
}

/**
 * Validates username format
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Generates a unique username from base name
 */
export function generateUniqueUsername(baseName: string, existingUsernames: string[]): string {
  let username = baseName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  
  if (!username) {
    username = 'user';
  }
  
  if (!existingUsernames.includes(username)) {
    return username;
  }
  
  // Add number suffix if username exists
  let counter = 1;
  let uniqueUsername = `${username}${counter}`;
  
  while (existingUsernames.includes(uniqueUsername)) {
    counter++;
    uniqueUsername = `${username}${counter}`;
  }
  
  return uniqueUsername;
}

/**
 * Creates user search profile for admin views
 */
export function mapToAdminProfile(user: User): EnhancedUserProfile & {
  status: string;
  emailVerified: boolean;
} {
  return {
    ...mapToEnhancedProfile(user),
    status: user.isActive ? 'active' : 'inactive',
    emailVerified: user.isVerified
  };
}

/**
 * Maps multiple users to minimal profiles
 */
export function mapToMinimalProfiles(users: User[]): MinimalUserProfile[] {
  return users.map(mapToMinimalProfile);
}

/**
 * Maps multiple users to public profiles
 */
export function mapToPublicProfiles(users: User[]): PublicUserProfile[] {
  return users.map(mapToPublicProfile);
}

/**
 * Maps multiple users to enhanced profiles
 */
export function mapToEnhancedProfiles(users: User[]): EnhancedUserProfile[] {
  return users.map(mapToEnhancedProfile);
}
