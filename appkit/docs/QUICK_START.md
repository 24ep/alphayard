# 🚀 Quick Start Guide

## ⚡ Get Started in 5 Minutes

### **1. Register Your Application**

```bash
curl -X POST https://your-identity-gateway.com/api/admin/identity/applications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "slug": "my-app",
    "type": "web",
    "url": "https://myapp.com",
    "callbackUrls": ["https://myapp.com/auth/callback"],
    "allowedOrigins": ["https://myapp.com"]
  }'
```

### **2. Save Your Credentials**

```json
{
  "clientId": "my-app-client-id",
  "clientSecret": "my-app-client-secret"
}
```

### **3. Implement Login**

```javascript
// Frontend login
const login = async (email, password) => {
  const response = await fetch('https://your-identity-gateway.com/api/admin/identity/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      clientId: 'my-app-client-id',
      email,
      password,
      deviceInfo: { device: 'Desktop', browser: 'Chrome' }
    })
  })
  
  const { user, tokens } = await response.json()
  localStorage.setItem('token', tokens.accessToken)
  return user
}
```

### **4. Protect Your API**

```javascript
// Middleware to verify tokens
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  fetch('https://your-identity-gateway.com/api/admin/identity/auth', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Client-ID': 'my-app-client-id'
    },
    body: JSON.stringify({ action: 'verify', clientId: 'my-app-client-id', accessToken: token })
  }).then(response => response.json())
    .then(({ valid, user }) => {
      if (valid) {
        req.user = user
        next()
      } else {
        res.status(401).json({ error: 'Unauthorized' })
      }
    })
    .catch(() => {
      res.status(401).json({ error: 'Unauthorized' })
    })
}
```

### **5. Test It!**

```javascript
// Test login
const user = await login('admin@appkit.com', 'admin123')
console.log('Logged in as:', user.firstName)

// Test protected route
fetch('/api/protected-data', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
```

## 🔧 Integration Examples

### **React Hook**

```jsx
import { useState, useEffect } from 'react'

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/admin/identity/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          clientId: 'my-app-client-id',
          accessToken: token
        })
      })
      .then(res => res.json())
      .then(({ valid, user }) => {
        if (valid) setUser(user)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])
  
  const login = async (email, password) => {
    const response = await fetch('/api/admin/identity/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        clientId: 'my-app-client-id',
        email,
        password
      })
    })
    
    const { user, tokens } = await response.json()
    localStorage.setItem('token', tokens.accessToken)
    setUser(user)
    return user
  }
  
  const logout = async () => {
    await fetch('/api/admin/identity/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logout',
        clientId: 'my-app-client-id',
        accessToken: localStorage.getItem('token')
      })
    })
    
    localStorage.removeItem('token')
    setUser(null)
  }
  
  return { user, loading, login, logout }
}
```

### **Node.js Express Middleware**

```javascript
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    // Verify with identity gateway
    const response = await fetch('https://your-identity-gateway.com/api/admin/identity/auth', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': 'my-app-client-id'
      },
      body: JSON.stringify({ action: 'verify', clientId: 'my-app-client-id', accessToken: token })
    })
    
    const { valid, user } = await response.json()
    
    if (!valid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

// Use in routes
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected data', user: req.user })
})
```

### **Python Flask Decorator**

```python
import functools
import requests

def require_auth(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Verify with identity gateway
        response = requests.post('https://your-identity-gateway.com/api/admin/identity/auth', 
            json={
                'action': 'verify',
                'clientId': 'my-app-client-id',
                'accessToken': token
            },
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}',
                'X-Client-ID': 'my-app-client-id'
            }
        )
        
        if response.status_code != 200 or not response.json().get('valid'):
            return jsonify({'error': 'Unauthorized'}), 401
        
        user = response.json().get('user')
        return f(user, *args, **kwargs)
    return decorated_function

@app.route('/api/protected')
@require_auth
def protected_route(user):
    return jsonify({'message': 'Protected data', 'user': user})
```

## 🌐 SSO Integration

### **Google SSO**

```javascript
// Initiate Google SSO
const googleLogin = () => {
  window.location.href = 'https://your-identity-gateway.com/api/admin/identity/sso?provider=google&clientId=my-app-client-id'
}

// Handle callback
const handleCallback = async (code, state) => {
  const response = await fetch('https://your-identity-gateway.com/api/admin/identity/sso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      code,
      state,
      clientId: 'my-app-client-id'
    })
  })
  
  const { user, tokens } = await response.json()
  localStorage.setItem('token', tokens.accessToken)
  return user
}
```

### **GitHub SSO**

```javascript
// GitHub SSO button
<button onClick={() => window.location.href = 'https://your-identity-gateway.com/api/admin/identity/sso?provider=github&clientId=my-app-client-id'}>
  Continue with GitHub
</button>
```

## 📱 Mobile App Integration

### **React Native**

```javascript
import { Linking } from 'expo-linking'

const handleLogin = async (email, password) => {
  try {
    const response = await fetch('https://your-identity-gateway.com/api/admin/identity/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        clientId: 'my-app-client-id',
        email,
        password,
        deviceInfo: {
          device: 'Mobile',
          platform: Platform.OS
        }
      })
    })
    
    const { user, tokens } = await response.json()
    
    // Store tokens securely
    await SecureStore.setItemAsync('token', tokens.accessToken)
    return user
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// SSO with deep linking
const handleSSO = async (provider) => {
  const redirectUrl = await Linking.createOpenURL(`myapp://auth?provider=${provider}`)
  
  const authUrl = `https://your-identity-gateway.com/api/admin/identity/sso?provider=${provider}&clientId=my-app-client-id&redirectUri=${redirectUrl}`
  
  Linking.openURL(authUrl)
}
```

### **iOS (Swift)**

```swift
import Foundation

class IdentityGateway {
    private let baseURL = "https://your-identity-gateway.com"
    private let clientId = "my-app-client-id"
    
    func login(email: String, password: String) async throws -> User {
        let url = URL(string: "\(baseURL)/api/admin/identity/auth")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "action": "login",
            "clientId": clientId,
            "email": email,
            "password": password,
            "deviceInfo": [
                "device": "Mobile",
                "platform": "iOS"
            ]
        ] as [String : Any]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(LoginResponse.self, from: data)
        
        // Store token
        UserDefaults.standard.set(response.tokens.accessToken, forKey: "authToken")
        
        return response.user
    }
}
```

## 🛡️ Security Best Practices

### **Token Storage**

```javascript
// Use httpOnly cookies in production
const tokenStorage = {
  set: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },
  get: () => {
    return localStorage.getItem('token')
  },
  clear: () => {
    localStorage.removeItem('token')
  }
}
```

### **Auto-Refresh**

```javascript
const setupTokenRefresh = (expiresIn) => {
  const refreshTime = (expiresIn - 300) * 1000 // 5 minutes before expiry
  
  setTimeout(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const response = await fetch('/api/admin/identity/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh',
          clientId: 'my-app-client-id',
          refreshToken
        })
      })
      
      const { tokens } = await response.json()
      localStorage.setItem('token', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      
      // Schedule next refresh
      setupTokenRefresh(tokens.expiresIn)
    } catch (error) {
      tokenStorage.clear()
      window.location.href = '/login'
    }
  }, refreshTime)
}
```

### **Error Handling**

```javascript
const handleAuthError = (error) => {
  if (error.code === 'TOKEN_EXPIRED') {
    // Try to refresh token
    refreshToken()
  } else if (error.code === 'INVALID_CREDENTIALS') {
    // Show login form
    showMessage('Invalid email or password')
  } else {
    // Generic error
    showMessage('Authentication failed')
  }
}
```

## 🧪 Testing

### **Unit Tests**

```javascript
// Test login
test('should login with valid credentials', async () => {
  const response = await fetch('/api/admin/identity/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      clientId: 'test-client-id',
      email: 'test@example.com',
      password: 'password123'
    })
  })
  
  const data = await response.json()
  expect(response.status).toBe(200)
  expect(data.success).toBe(true)
  expect(data.user.email).toBe('test@example.com')
  expect(data.tokens.accessToken).toBeDefined()
})
```

### **Integration Tests**

```javascript
// Test full login flow
test('should complete full login flow', async () => {
  // 1. Login
  const loginResponse = await login('test@example.com', 'password123')
  expect(loginResponse.user.email).toBe('test@example.com')
  
  // 2. Verify token
  const user = await verifyToken(loginResponse.tokens.accessToken)
  expect(user.email).toBe('test@example.com')
  
  // 3. Logout
  await logout(loginResponse.tokens.accessToken)
  
  // 4. Verify token is invalid
  await expect(verifyToken(loginResponse.tokens.accessToken)).rejects.toThrow()
})
```

## 📞 Support

Need help? Check out:

- 📖 [Full Developer Guide](./IDENTITY_GATEWAY_GUIDE.md)
- 🔧 [API Reference](./API_REFERENCE.md)
- 💬 [GitHub Discussions](https://github.com/your-org/identity-gateway/discussions)
- 📧 [Support Email](mailto:support@yourorg.com)

---

**Happy coding! 🚀**
