/**
 * API Configuration for Bondarys Web Application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DELETE_ACCOUNT: '/user/delete',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Family Management
  FAMILY: {
    LIST: '/hourse',
    CREATE: '/hourse',
    GET: (id: string) => `/hourse/${id}`,
    UPDATE: (id: string) => `/hourse/${id}`,
    DELETE: (id: string) => `/hourse/${id}`,
    MEMBERS: (id: string) => `/hourse/${id}/members`,
    INVITE: (id: string) => `/hourse/${id}/invite`,
    REMOVE_MEMBER: (id: string, memberId: string) => `/hourse/${id}/members/${memberId}`,
  },

  // Social
  SOCIAL: {
    POSTS: '/social/posts',
    CREATE_POST: '/social/posts',
    POST: (id: string) => `/social/posts/${id}`,
    COMMENTS: (postId: string) => `/social/posts/${postId}/comments`,
    LIKE: (postId: string) => `/social/posts/${postId}/like`,
    FAMILIES: '/social/families',
  },

  // Calendar
  CALENDAR: {
    EVENTS: '/calendar/events',
    CREATE_EVENT: '/calendar/events',
    EVENT: (id: string) => `/calendar/events/${id}`,
    UPDATE_EVENT: (id: string) => `/calendar/events/${id}`,
    DELETE_EVENT: (id: string) => `/calendar/events/${id}`,
  },

  // Tasks
  TASKS: {
    LIST: '/todos',
    CREATE: '/todos',
    TASK: (id: string) => `/todos/${id}`,
    UPDATE: (id: string) => `/todos/${id}`,
    DELETE: (id: string) => `/todos/${id}`,
  },

  // Gallery
  GALLERY: {
    PHOTOS: '/gallery/photos',
    UPLOAD: '/gallery/upload',
    PHOTO: (id: string) => `/gallery/photos/${id}`,
    DELETE: (id: string) => `/gallery/photos/${id}`,
  },

  // Notes
  NOTES: {
    LIST: '/notes',
    CREATE: '/notes',
    NOTE: (id: string) => `/notes/${id}`,
    UPDATE: (id: string) => `/notes/${id}`,
    DELETE: (id: string) => `/notes/${id}`,
  },

  // Chat
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
  },

  // Safety
  SAFETY: {
    LOCATIONS: '/location',
    UPDATE_LOCATION: '/location/update',
    EMERGENCY_CONTACTS: '/safety/contacts',
    GEOFENCES: '/safety/geofences',
  },

  // Storage
  STORAGE: {
    FILES: '/storage/files',
    UPLOAD: '/storage/upload',
    FILE: (id: string) => `/storage/files/${id}`,
    DELETE: (id: string) => `/storage/files/${id}`,
  },
}

export default API_CONFIG

