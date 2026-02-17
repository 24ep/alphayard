import { apiClient } from '../api/apiClient';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getProfile(): Promise<{ data: UserProfile }> {
    try {
        const response = await apiClient.get('/auth/me');
        // Map backend response to UserProfile if needed
        // Assuming /auth/me returns the user object structure we need or close to it
        return { data: response.data?.user || response.data };
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    await apiClient.put('/users/profile', data);
  }
}

export const userService = UserService.getInstance();
