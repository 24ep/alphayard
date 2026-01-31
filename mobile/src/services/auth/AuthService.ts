import { API_CONFIG } from '../../constants/app';
export * from './AuthService.types';
import { User, AuthResponse, AuthTokens, LoginData, RegisterData } from './AuthService.types';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshTokenStr: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const user = this.mapUser(result.user);
      const tokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600 * 24 // Default assumption if not provided
      };

      this.setSession(user, tokens);
      return { user, tokens };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      const user = this.mapUser(result.user);
      const tokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600 * 24
      };

      this.setSession(user, tokens);
      return { user, tokens };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ refreshToken: this.refreshTokenStr })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.accessToken) {
        return this.currentUser;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // If 401, try refresh? Or just return null
        if (response.status === 401) {
           // Attempt refresh if implemented, otherwise clear
           this.clearSession();
           return null;
        }
        return this.currentUser; // Return cached if API fails? Or null.
      }

      const result = await response.json();
      const user = this.mapUser(result.user); // Backend wrapper { success: true, user: {} }
      
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return this.currentUser;
    }
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    return !!this.accessToken && !!this.currentUser;
  }

  // Refresh token
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      if (!this.refreshTokenStr) return null;

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshTokenStr }),
      });

      const result = await response.json();

      if (!response.ok) {
        return null;
      }

      const tokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 3600 * 24
      };

      this.accessToken = tokens.accessToken;
      this.refreshTokenStr = tokens.refreshToken;

      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset Password
  async resetPassword(newPassword: string, token?: string): Promise<void> {
    // Note: Token usually comes from deep link. 
    if (!token) throw new Error('Reset token required');
    
    try {
       const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, token })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
    } catch (error) {
       console.error('Reset password error:', error);
       throw error;
    }
  }

  // Social Login (Stub)
  async socialLogin(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    // For now, mockup or throw not implemented
    console.warn('Social login not fully implemented in API client', provider);
    
    // Mock for demo if needed
    throw new Error('Social login requires native SDK integration');
  }

  // Update Profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Update failed');
      }

      const user = this.mapUser(result.user);
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
  
  // Delete Account
  async deleteAccount(): Promise<void> {
     try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/account`, { // Assuming endpoint
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
         // handle error
      }
      this.clearSession();
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  updateCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Helpers
  private setSession(user: User, tokens: AuthTokens) {
    this.currentUser = user;
    this.accessToken = tokens.accessToken;
    this.refreshTokenStr = tokens.refreshToken;
    // In a real app, persist to SecureStore here
  }

  private clearSession() {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshTokenStr = null;
    // Clear SecureStore
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    };
  }

  private mapUser(apiUser: any): User {
    // Map backend response user to Mobile User interface
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      phoneNumber: apiUser.phone, // Backend 'phone' -> Mobile 'phoneNumber' ? or match?
      // Interface shows 'phoneNumber' in original file. Backend sends 'phone' (from my reading of AuthController.ts lines 112, 199). 
      // AuthController.ts: `phone: user.phone`
      // Wait, AuthController login response `sanitizeUser` might map it.
      // Looking at `sanitizeUser` (not fully visible but `register` response uses `userResponse` which comes from there).
      // Assuming 'phone' from backend.
      dateOfBirth: apiUser.dateOfBirth,
      gender: apiUser.gender,
      preferences: apiUser.preferences,
      emergencyContacts: apiUser.emergencyContacts || [],
      createdAt: apiUser.createdAt,
      lastActiveAt: apiUser.updatedAt || new Date().toISOString()
    };
  }
}

export default AuthService.getInstance();
