# AppKit Authentication Integration Guide

This guide shows how external applications (mobile apps, web apps, third-party services) can integrate with AppKit's authentication system.

## 🚀 Quick Start

### 1. Get Your Application Credentials

1. **Create an Application** in AppKit Admin
2. **Note your Application ID** and **API endpoints**
3. **Configure login UI** (optional) for your app

### 2. Choose Your Integration Method

- **Platform-Specific Guides** (Recommended):
  - [**Web App DevKit**](./devkit/web-app/README.md) (Standardized Modules)
  - [Web Application](./integration/web-app.md) (Manual Integration)
  - [Mobile Web / PWA](./integration/mobile-web.md)
  - [Native Mobile App](./integration/mobile-app.md)
- **Direct API Integration** (For simple use cases)
- **Embedded Login Form** (For web apps)

---

## 🌐 Method 1: OAuth 2.0 Integration (Recommended)

### Overview
AppKit acts as an OAuth 2.0 provider, allowing external apps to authenticate users securely.

### Flow Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App       │───▶│   AppKit OAuth  │───▶│   User Login    │
│                 │    │   Authorization │    │                 │
│                 │    │                 │    │                 │
│                 │◀───│   Access Token   │◀───│   Authenticated  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Step 1: Register Your OAuth Client

```bash
POST /api/admin/oauth-clients
{
  "name": "My Mobile App",
  "description": "iOS and Android app",
  "redirectUris": [
    "myapp://auth/callback",
    "https://myapp.com/auth/callback"
  ],
  "grantTypes": ["authorization_code"],
  "scopes": ["openid", "email", "profile"]
}
```

### Step 2: Initiate OAuth Flow

```javascript
// Web App Example
const authUrl = `https://your-appkit-domain.com/oauth/authorize?` +
  `client_id=YOUR_CLIENT_ID&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent('openid email profile')}&` +
  `state=${generateRandomState()}`;

// Redirect user to authUrl
window.location.href = authUrl;
```

### Step 3: Handle Callback

```javascript
// Extract authorization code from callback URL
const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('code');
const state = urlParams.get('state');

// Exchange code for tokens
async function exchangeCodeForTokens(code) {
  const response = await fetch('https://your-appkit-domain.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      code: code,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const tokens = await response.json();
  return tokens;
}
```

### Step 4: Use Access Token

```javascript
// Make authenticated requests
async function getUserInfo(accessToken) {
  const response = await fetch('https://your-appkit-domain.com/oauth/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return await response.json();
}
```

---

## 📱 Method 2: Mobile App Integration

### React Native Example

```javascript
// AppAuth for React Native
import { authorize } from 'react-native-app-auth';

const config = {
  issuer: 'https://your-appkit-domain.com/oauth',
  clientId: 'YOUR_CLIENT_ID',
  redirectUrl: 'myapp://oauthredirect',
  scopes: ['openid', 'email', 'profile'],
  usePKCE: true,
};

async function loginWithAppKit() {
  try {
    const result = await authorize(config);
    
    // Store tokens securely
    await SecureStore.setItemAsync('access_token', result.accessToken);
    await SecureStore.setItemAsync('refresh_token', result.refreshToken);
    
    // Get user info
    const userInfo = await getUserInfo(result.accessToken);
    
    return { success: true, user: userInfo };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error };
  }
}
```

### iOS Native (Swift) Example

```swift
import AuthenticationServices
import AppAuth

class AppKitAuthManager {
    private let configuration: OIDServiceConfiguration
    
    init() {
        let issuer = URL(string: "https://your-appkit-domain.com/oauth")!
        configuration = OIDServiceConfiguration(
            issuer: issuer,
            authorizationEndpoint: URL(string: "https://your-appkit-domain.com/oauth/authorize")!,
            tokenEndpoint: URL(string: "https://your-appkit-domain.com/oauth/token")!,
            registrationEndpoint: nil,
            endSessionEndpoint: nil
        )
    }
    
    func authenticate() -> AnyPublisher<OIDAuthState, Error> {
        let request = OIDAuthorizationRequest(
            configuration: configuration,
            clientId: "YOUR_CLIENT_ID",
            clientSecret: nil,
            scopes: [OIDScopeOpenID, OIDScopeProfile, OIDScopeEmail],
            redirectURL: URL(string: "myapp://oauthredirect")!,
            responseType: OIDResponseTypeCode,
            additionalParameters: nil
        )
        
        return OIDAuthState.authState(
            byPresenting: request,
            presenting: self.viewController
        )
    }
}
```

### Android Native (Kotlin) Example

```kotlin
class AppKitAuthManager {
    private val authConfig = AuthorizationServiceConfiguration.Builder(
        Uri.parse("https://your-appkit-domain.com/oauth"),
        "oauth",
        "YOUR_CLIENT_ID",
        null
    )
    .setAuthorizationEndpoint(Uri.parse("https://your-appkit-domain.com/oauth/authorize"))
    .setTokenEndpoint(Uri.parse("https://your-appkit-domain.com/oauth/token"))
    .build()
    
    fun authenticate(activity: Activity) {
        val authRequest = AuthorizationRequest.Builder(
            authConfig,
            "YOUR_CLIENT_ID",
            ResponseTypeValues.CODE,
            Uri.parse("myapp://oauthredirect")
        )
        .setScopes("openid", "email", "profile")
        .build()
        
        val authIntent = AuthorizationIntent.Builder(activity)
            .setAuthRequest(authRequest)
            .build()
        
        activity.startActivityForResult(authIntent, AUTH_REQUEST_CODE)
    }
}
```

---

## 🖥️ Method 3: Direct API Integration

### For Simple Web Apps

```javascript
class AppKitAuthClient {
  constructor(apiUrl, appId) {
    this.apiUrl = apiUrl;
    this.appId = appId;
  }

  // Get login configuration for your app
  async getLoginConfig() {
    const response = await fetch(`${this.apiUrl}/api/public/login-config/${this.appId}`);
    const result = await response.json();
    return result.data;
  }

  // Login with email/password
  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, appId: this.appId })
    });
    
    const result = await response.json();
    if (result.success) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      return result;
    } else {
      throw new Error(result.message);
    }
  }

  // Login with SSO
  async ssoLogin(provider, ssoData) {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/sso/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ssoData, appId: this.appId })
    });
    
    const result = await response.json();
    if (result.success) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      return result;
    } else {
      throw new Error(result.message);
    }
  }

  // Get current user
  async getCurrentUser() {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${this.apiUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return await response.json();
  }

  // Logout
  async logout() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await fetch(`${this.apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

// Usage
const authClient = new AppKitAuthClient('https://your-appkit-domain.com', 'your-app-id');

// Get login configuration
const loginConfig = await authClient.getLoginConfig();

// Login
try {
  const result = await authClient.login('user@example.com', 'password');
  console.log('Logged in:', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

---

## 🎨 Method 4: Embedded Login Form

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { AppKitAuthClient } from './appkit-auth';

function AppKitLoginForm({ appId, onSuccess, onError }) {
  const [config, setConfig] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authClient = new AppKitAuthClient('https://your-appkit-domain.com', appId);

  useEffect(() => {
    // Load login configuration
    authClient.getLoginConfig()
      .then(setConfig)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authClient.login(email, password);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div style={{ 
      backgroundColor: config.background?.value || '#f3f4f6',
      fontFamily: config.branding?.fontFamily || 'system-ui',
      padding: config.layout?.padding || '2rem'
    }}>
      <div style={{
        maxWidth: config.layout?.maxWidth || '400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: config.layout?.borderRadius || '1rem',
        boxShadow: config.layout?.shadow || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }}>
        {/* Logo and Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {config.branding?.logoUrl && (
            <img 
              src={config.branding.logoUrl} 
              alt={config.branding.appName}
              style={{ height: '60px', marginBottom: '1rem' }}
            />
          )}
          <h1 style={{ 
            color: config.branding?.primaryColor || '#1f2937',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {config.branding?.appName || 'Welcome'}
          </h1>
          {config.branding?.tagline && (
            <p style={{ color: '#6b7280' }}>{config.branding.tagline}</p>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder={config.form?.emailPlaceholder || 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder={config.form?.passwordPlaceholder || 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: config.branding?.primaryColor || '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : (config.form?.submitButtonText || 'Sign In')}
          </button>
        </form>

        {/* SSO Options */}
        {config.form?.showSSO && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {config.form?.socialLoginText || 'Or continue with'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {/* Add SSO buttons based on your configuration */}
            </div>
          </div>
        )}

        {/* Security Badge */}
        {config.security?.showSecurityBadge && (
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            🔒 {config.security?.securityText || 'Secured with industry-standard encryption'}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage
function App() {
  const handleLoginSuccess = (result) => {
    console.log('User logged in:', result.user);
    // Redirect to dashboard or update app state
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    // Show error message
  };

  return (
    <AppKitLoginForm
      appId="your-app-id"
      onSuccess={handleLoginSuccess}
      onError={handleLoginError}
    />
  );
}
```

---

## 🔐 Security Best Practices

### 1. Token Storage
```javascript
// Web: Use httpOnly cookies or secure localStorage
// Mobile: Use Keychain/Keystore
// Never store tokens in plain text

// Secure token storage example
const secureStorage = {
  setToken: (token) => {
    // Use httpOnly cookies for web
    document.cookie = `auth_token=${token}; path=/; secure; httpOnly; samesite=strict`;
  },
  getToken: () => {
    return document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/, '$1');
  }
};
```

### 2. Token Refresh
```javascript
// Implement automatic token refresh
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const result = await response.json();
  if (result.success) {
    secureStorage.setToken(result.token);
    return result.token;
  } else {
    throw new Error('Token refresh failed');
  }
}
```

### 3. Request Interceptor
```javascript
// Axios interceptor for automatic token handling
const apiClient = axios.create({
  baseURL: 'https://your-appkit-domain.com/api/v1'
});

apiClient.interceptors.request.use((config) => {
  const token = secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📱 SDK Examples

### JavaScript/TypeScript SDK

```javascript
// appkit-auth-sdk.js
class AppKitAuth {
  constructor(options) {
    this.apiUrl = options.apiUrl;
    this.appId = options.appId;
    this.tokenStorage = options.tokenStorage;
  }

  async login(credentials) {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, appId: this.appId })
    });
    
    const result = await response.json();
    if (result.success) {
      this.tokenStorage.setToken(result.token);
      return result;
    }
    throw new Error(result.message);
  }

  async logout() {
    await fetch(`${this.apiUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.tokenStorage.getToken()}` }
    });
    this.tokenStorage.clearToken();
  }

  // Add more methods as needed...
}

// Usage
const auth = new AppKitAuth({
  apiUrl: 'https://your-appkit-domain.com',
  appId: 'your-app-id',
  tokenStorage: new CookieStorage()
});
```

---

## 🚀 Deployment Checklist

### Before Going Live:
- [ ] Register your application in AppKit Admin
- [ ] Configure OAuth client credentials
- [ ] Set up redirect URIs for your app
- [ ] Test login flows in development
- [ ] Implement proper token storage
- [ ] Add error handling
- [ ] Test token refresh mechanism
- [ ] Verify security settings

### Production Considerations:
- Use HTTPS for all API calls
- Implement proper session management
- Add rate limiting on your app
- Monitor authentication metrics
- Set up logging for security events
- Test with different user scenarios

---

## 🆘 Support & Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [OAuth 2.0 Guide](./OAUTH_GUIDE.md)
- [Security Best Practices](./SECURITY.md)

### SDK Downloads
- [JavaScript SDK](https://github.com/your-org/appkit-js-sdk)
- [React Native SDK](https://github.com/your-org/appkit-rn-sdk)
- [iOS SDK](https://github.com/your-org/appkit-ios-sdk)
- [Android SDK](https://github.com/your-org/appkit-android-sdk)

### Support
- Email: support@appkit.com
- Discord: [AppKit Community](https://discord.gg/appkit)
- Documentation: [docs.appkit.com](https://docs.appkit.com)

---

## 🎉 You're Ready!

Your application can now authenticate users using AppKit's secure authentication system. Choose the integration method that best fits your needs and follow the examples above.

For any questions or issues, don't hesitate to reach out to our support team!
