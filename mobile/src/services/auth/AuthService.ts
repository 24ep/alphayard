import { supabase } from '../../config/supabase';
import { User, AuthResponse, AuthTokens } from './AuthService.types';
import { Tables } from '../../config/supabase';

import { LoginData, RegisterData } from './AuthService.types';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if Supabase is available
  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return !error;
    } catch (error) {
      console.warn('Supabase connection not available:', error);
      return false;
    }
  }

  // Login with Supabase
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockUser: User = {
          id: 'mock-user-id',
          email: data.email,
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+1234567890',
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              push: true,
              email: true,
              sms: true,
            },
            privacy: {
              locationSharing: true,
              profileVisibility: 'hourse',
              dataSharing: true,
            },
          },
          emergencyContacts: [],
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };

        const mockTokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        };

        this.currentUser = mockUser;
        return { user: mockUser, tokens: mockTokens };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      const user: User = {
        id: authData.user.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        phoneNumber: profileData.phone_number,
        dateOfBirth: profileData.date_of_birth,
        gender: profileData.gender,
        preferences: profileData.preferences,
        emergencyContacts: profileData.emergency_contacts || [],
        createdAt: authData.user.created_at,
        lastActiveAt: profileData.last_active_at,
      };

      this.currentUser = user;

      const tokens: AuthTokens = {
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
        expiresIn: authData.session?.expires_in || 3600,
      };

      return { user, tokens };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user with Supabase
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockUser: User = {
          id: 'mock-user-id',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              push: true,
              email: true,
              sms: true,
            },
            privacy: {
              locationSharing: true,
              profileVisibility: 'hourse',
              dataSharing: true,
            },
          },
          emergencyContacts: [],
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };

        const mockTokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        };

        this.currentUser = mockUser;
        return { user: mockUser, tokens: mockTokens };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Create user profile in database
      const userProfile = {
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        preferences: {
          language: 'en',
          theme: 'light' as const,
          notifications: {
            push: true,
            email: true,
            sms: true,
          },
          privacy: {
            location_sharing: true,
            profile_visibility: 'hourse' as const,
            data_sharing: true,
          },
        },
        emergency_contacts: [],
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('users')
        .insert(userProfile);

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(profileError.message);
      }

      const user: User = {
        id: authData.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        preferences: userProfile.preferences,
        emergencyContacts: [],
        createdAt: authData.user.created_at,
        lastActiveAt: authData.user.created_at,
      };

      this.currentUser = user;

      const tokens: AuthTokens = {
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
        expiresIn: authData.session?.expires_in || 3600,
      };

      return { user, tokens };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (isConnected) {
        await supabase.auth.signOut();
      }
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
      this.currentUser = null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        return this.currentUser;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return null;
      }

      const currentUser: User = {
        id: user.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        phoneNumber: profileData.phone_number,
        dateOfBirth: profileData.date_of_birth,
        gender: profileData.gender,
        preferences: profileData.preferences,
        emergencyContacts: profileData.emergency_contacts || [],
        createdAt: user.created_at,
        lastActiveAt: profileData.last_active_at,
      };

      this.currentUser = currentUser;
      return currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return this.currentUser;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        return this.currentUser !== null;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && session !== null;
    } catch (error) {
      console.error('Authentication check error:', error);
      return this.currentUser !== null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        return null;
      }

      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        return null;
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock password reset email sent to:', email);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(newPassword: string): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        console.log('Mock password reset completed');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Social login
  async socialLogin(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        // Return mock data for development
        const mockUser: User = {
          id: 'mock-social-user-id',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+1234567890',
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              push: true,
              email: true,
              sms: true,
            },
            privacy: {
              locationSharing: true,
              profileVisibility: 'hourse',
              dataSharing: true,
            },
          },
          emergencyContacts: [],
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        };

        const mockTokens: AuthTokens = {
          accessToken: 'mock-social-access-token',
          refreshToken: 'mock-social-refresh-token',
          expiresIn: 3600,
        };

        this.currentUser = mockUser;
        return { user: mockUser, tokens: mockTokens };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'bondarys://auth/callback',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // This will redirect to OAuth provider, so we return a placeholder
      return {
        user: {} as User,
        tokens: {} as AuthTokens,
      };
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        if (this.currentUser) {
          this.currentUser = { ...this.currentUser, ...updates };
        }
        return this.currentUser!;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {};
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.preferences) updateData.preferences = updates.preferences;
      if (updates.emergencyContacts) updateData.emergency_contacts = updates.emergencyContacts;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const updatedUser: User = {
        id: user.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        preferences: data.preferences,
        emergencyContacts: data.emergency_contacts || [],
        createdAt: user.created_at,
        lastActiveAt: data.last_active_at,
      };

      this.currentUser = updatedUser;
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Update current user in memory
  updateCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      const isConnected = await this.checkSupabaseConnection();
      if (!isConnected) {
        this.currentUser = null;
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Delete auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (authDeleteError) {
        throw new Error(authDeleteError.message);
      }

      this.currentUser = null;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

export default AuthService.getInstance(); 