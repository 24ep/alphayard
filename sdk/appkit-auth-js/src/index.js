/**
 * AppKit Authentication JavaScript SDK
 * 
 * A simple JavaScript library for integrating with AppKit authentication system
 * 
 * @version 1.0.0
 * @author AppKit Team
 */

class AppKitAuth {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://your-appkit-domain.com';
    this.appId = options.appId;
    this.tokenStorage = options.tokenStorage || new LocalStorageTokenStorage();
    this.onAuthStateChanged = options.onAuthStateChanged || (() => {});
    this.autoRefresh = options.autoRefresh !== false;
    this.refreshTimer = null;
    
    // Initialize auth state
    this.user = null;
    this.isAuthenticated = false;
    
    // Check for existing token on initialization
    this.checkExistingAuth();
  }

  /**
   * Get login configuration for the application
   */
  async getLoginConfig() {
    try {
      const response = await fetch(`${this.apiUrl}/api/public/login-config/${this.appId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get login configuration');
      }
    } catch (error) {
      console.error('Failed to get login config:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          appId: this.appId 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await this.handleAuthSuccess(result);
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Login with SSO provider
   */
  async ssoLogin(provider, ssoData) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/sso/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...ssoData, 
          appId: this.appId 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await this.handleAuthSuccess(result);
        return result;
      } else {
        throw new Error(result.message || 'SSO login failed');
      }
    } catch (error) {
      console.error('SSO login error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        this.user = result.user;
        return result.user;
      } else {
        throw new Error(result.message || 'Failed to get user info');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, clear it
      this.logout();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const result = await response.json();
      
      if (result.success) {
        this.tokenStorage.setToken(result.token);
        this.tokenStorage.setRefreshToken(result.refreshToken);
        return result.token;
      } else {
        throw new Error(result.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      this.logout();
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const token = this.tokenStorage.getToken();
    
    try {
      if (token) {
        await fetch(`${this.apiUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create API client with automatic token handling
   */
  createApiClient(baseURL = `${this.apiUrl}/api/v1`) {
    const client = {
      get: async (endpoint, options = {}) => {
        return this.makeRequest('GET', endpoint, null, options);
      },
      post: async (endpoint, data, options = {}) => {
        return this.makeRequest('POST', endpoint, data, options);
      },
      put: async (endpoint, data, options = {}) => {
        return this.makeRequest('PUT', endpoint, data, options);
      },
      delete: async (endpoint, options = {}) => {
        return this.makeRequest('DELETE', endpoint, null, options);
      }
    };

    return client;
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(method, endpoint, data, options = {}) {
    const token = this.tokenStorage.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${baseURL}${endpoint}`, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        try {
          await this.refreshToken();
          // Retry request with new token
          config.headers.Authorization = `Bearer ${this.tokenStorage.getToken()}`;
          return fetch(`${baseURL}${endpoint}`, config);
        } catch (refreshError) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Handle successful authentication
   */
  async handleAuthSuccess(result) {
    this.tokenStorage.setToken(result.token);
    if (result.refreshToken) {
      this.tokenStorage.setRefreshToken(result.refreshToken);
    }
    
    this.user = result.user;
    this.isAuthenticated = true;
    
    // Start auto refresh timer
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
    
    // Notify state change
    this.onAuthStateChanged({
      isAuthenticated: true,
      user: result.user
    });
  }

  /**
   * Clear authentication state
   */
  clearAuth() {
    this.tokenStorage.clearToken();
    this.tokenStorage.clearRefreshToken();
    this.user = null;
    this.isAuthenticated = false;
    
    // Clear auto refresh timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Notify state change
    this.onAuthStateChanged({
      isAuthenticated: false,
      user: null
    });
  }

  /**
   * Check for existing authentication on initialization
   */
  async checkExistingAuth() {
    const token = this.tokenStorage.getToken();
    if (!token) {
      return;
    }

    try {
      await this.getCurrentUser();
      this.isAuthenticated = true;
      
      // Start auto refresh timer
      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
      
      this.onAuthStateChanged({
        isAuthenticated: true,
        user: this.user
      });
    } catch (error) {
      // Token is invalid, clear it
      this.clearAuth();
    }
  }

  /**
   * Start automatic token refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Refresh token every 50 minutes (3000 seconds)
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
        this.clearAuth();
      }
    }, 3000000);
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

/**
 * Local Storage Token Storage Implementation
 */
class LocalStorageTokenStorage {
  getToken() {
    return localStorage.getItem('appkit_auth_token');
  }

  setToken(token) {
    localStorage.setItem('appkit_auth_token', token);
  }

  getRefreshToken() {
    return localStorage.getItem('appkit_refresh_token');
  }

  setRefreshToken(token) {
    localStorage.setItem('appkit_refresh_token', token);
  }

  clearToken() {
    localStorage.removeItem('appkit_auth_token');
  }

  clearRefreshToken() {
    localStorage.removeItem('appkit_refresh_token');
  }
}

/**
 * Cookie Token Storage Implementation (for web apps)
 */
class CookieTokenStorage {
  getToken() {
    const match = document.cookie.match(/(^|; )appkit_auth_token=([^;]*)/);
    return match ? match[2] : null;
  }

  setToken(token) {
    document.cookie = `appkit_auth_token=${token}; path=/; secure; samesite=strict; max-age=86400`;
  }

  getRefreshToken() {
    const match = document.cookie.match(/(^|; )appkit_refresh_token=([^;]*)/);
    return match ? match[2] : null;
  }

  setRefreshToken(token) {
    document.cookie = `appkit_refresh_token=${token}; path=/; secure; samesite=strict; max-age=604800`;
  }

  clearToken() {
    document.cookie = 'appkit_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  clearRefreshToken() {
    document.cookie = 'appkit_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/ES modules export
  module.exports = { AppKitAuth, LocalStorageTokenStorage, CookieTokenStorage };
}

// Browser
if (typeof window !== 'undefined') {
  window.AppKitAuth = AppKitAuth;
  window.LocalStorageTokenStorage = LocalStorageTokenStorage;
  window.CookieTokenStorage = CookieTokenStorage;
}
