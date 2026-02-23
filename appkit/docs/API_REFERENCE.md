# 📚 Identity Gateway API Reference

## 📋 Overview

Complete API reference for the Centralized Identity Gateway. All endpoints use RESTful principles and return JSON responses.

## 🔐 Authentication

All API requests (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
X-Client-ID: <your-client-id>
```

---

## 🚀 Authentication Gateway

### **POST `/api/admin/identity/auth`**

Main authentication endpoint supporting multiple actions.

#### **Login Action**

**Request**
```json
{
  "action": "login",
  "clientId": "your-client-id",
  "email": "user@example.com",
  "password": "password123",
  "deviceInfo": {
    "device": "Desktop",
    "browser": "Chrome",
    "os": "Windows",
    "userAgent": "Mozilla/5.0..."
  },
  "rememberMe": false
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "isVerified": true,
    "permissions": ["content:read", "profile:write"],
    "lastLogin": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "tokenType": "Bearer"
  },
  "session": {
    "id": "sess_550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2024-01-22T10:30:00Z",
    "deviceInfo": {
      "device": "Desktop",
      "browser": "Chrome",
      "os": "Windows"
    }
  },
  "message": "Login successful"
}
```

**Error Responses**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account disabled
- `500 Internal Server Error`: Server error

#### **Register Action**

**Request**
```json
{
  "action": "register",
  "clientId": "your-client-id",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "deviceInfo": {
    "device": "Mobile",
    "browser": "Safari",
    "os": "iOS"
  },
  "acceptTerms": true
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user",
    "isActive": true,
    "isVerified": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "tokenType": "Bearer"
  },
  "message": "Registration successful"
}
```

#### **Token Refresh Action**

**Request**
```json
{
  "action": "refresh",
  "clientId": "your-client-id",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "tokenType": "Bearer"
  },
  "message": "Token refreshed successfully"
}
```

#### **Logout Action**

**Request**
```json
{
  "action": "logout",
  "clientId": "your-client-id",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "allSessions": false
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### **Verify Token Action**

**Request**
```json
{
  "action": "verify",
  "clientId": "your-client-id",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "isVerified": true,
    "permissions": ["content:read", "profile:write"]
  },
  "session": {
    "id": "sess_550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2024-01-22T10:30:00Z"
  },
  "message": "Token is valid"
}
```

---

## 🌐 SSO (Single Sign-On)

### **GET `/api/admin/identity/sso`**

Initiate SSO login with external provider.

**Query Parameters**
- `provider` (required): `google`, `github`, `microsoft`
- `clientId` (required): Your application client ID
- `redirectUri` (optional): Callback URL
- `state` (optional): CSRF protection token

**Example Request**
```
GET /api/admin/identity/sso?provider=google&clientId=your-client-id&redirectUri=https://yourapp.com/auth/callback
```

**Response (200 OK)**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/oauth/authorize?client_id=your-client-id&redirect_uri=https://yourapp.com/auth/callback&response_type=code&scope=openid%20email%20profile&state=random-state-string",
  "state": "random-state-string",
  "message": "Redirect to Google for authentication"
}
```

### **POST `/api/admin/identity/sso`**

Complete SSO authentication with authorization code.

**Request**
```json
{
  "provider": "google",
  "code": "4/0AX4XfWg-8hJg-8hJg-8hJg-8hJg",
  "state": "random-state-string",
  "clientId": "your-client-id"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/a-/AOh14siYmN9pQk8TQY4W8hJg",
    "verified": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "tokenType": "Bearer"
  },
  "provider": "google",
  "message": "Google authentication successful"
}
```

---

## 👥 User Management

### **GET `/api/admin/users`**

Get users with pagination and filtering.

**Query Parameters**
- `page` (optional): Page number, default `1`
- `limit` (optional): Items per page, default `20`
- `search` (optional): Search by email, first name, or last name
- `role` (optional): Filter by role
- `isActive` (optional): Filter by active status (`true`/`false`)

**Example Request**
```
GET /api/admin/users?page=1&limit=10&search=john&role=user&isActive=true
```

**Response (200 OK)**
```json
{
  "success": true,
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  },
  "message": "Users retrieved successfully"
}
```

### **POST `/api/admin/users`**

Create a new user.

**Request**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "password123",
  "role": "user",
  "isActive": true,
  "sendWelcomeEmail": true
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User created successfully"
}
```

### **PUT `/api/admin/users/[userId]`**

Update an existing user.

**Request**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "isActive": true
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "admin",
    "isActive": true,
    "isVerified": false,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "User updated successfully"
}
```

### **DELETE `/api/admin/users/[userId]`**

Delete a user.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🎭 Roles & Permissions

### **GET `/api/admin/identity/roles`**

Get all available roles.

**Query Parameters**
- `includeSystem` (optional): Include system roles, default `true`

**Response (200 OK)**
```json
{
  "success": true,
  "roles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Super Admin",
      "slug": "super-admin",
      "description": "Full system access with all permissions",
      "isSystem": true,
      "isDefault": false,
      "permissions": ["*"],
      "userCount": 1,
      "color": "#dc2626",
      "icon": "crown",
      "level": 100,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "Admin",
      "slug": "admin",
      "description": "Administrative access for application management",
      "isSystem": true,
      "isDefault": false,
      "permissions": [
        "users:read",
        "users:write",
        "users:delete",
        "roles:read",
        "roles:write"
      ],
      "userCount": 3,
      "color": "#3b82f6",
      "icon": "shield",
      "level": 80,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Roles retrieved successfully"
}
```

### **POST `/api/admin/identity/roles`**

Create a new role.

**Request**
```json
{
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Users who can manage content",
  "permissions": [
    "content:read",
    "content:write",
    "media:read",
    "media:write"
  ],
  "color": "#10b981",
  "icon": "edit"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "role": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Content Manager",
    "slug": "content-manager",
    "description": "Users who can manage content",
    "isSystem": false,
    "isDefault": false,
    "permissions": [
      "content:read",
      "content:write",
      "media:read",
      "media:write"
    ],
    "userCount": 0,
    "color": "#10b981",
    "icon": "edit",
    "level": 60,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Role created successfully"
}
```

### **GET `/api/admin/identity/permissions`**

Get all available permissions.

**Query Parameters**
- `module` (optional): Filter by module (`users`, `content`, `settings`, etc.)

**Response (200 OK)**
```json
{
  "success": true,
  "permissions": [
    {
      "id": "users:read",
      "module": "users",
      "action": "read",
      "description": "View users"
    },
    {
      "id": "users:write",
      "module": "users",
      "action": "write",
      "description": "Create and edit users"
    },
    {
      "id": "content:read",
      "module": "content",
      "action": "read",
      "description": "View content"
    }
  ],
  "modules": ["users", "content", "settings", "analytics"],
  "message": "All permissions retrieved successfully"
}
```

---

## 🏢 Application Registry

### **GET `/api/admin/identity/applications`**

Get registered applications.

**Query Parameters**
- `status` (optional): Filter by status (`active`, `inactive`, `pending`)
- `type` (optional): Filter by type (`web`, `mobile`, `desktop`)

**Response (200 OK)**
```json
{
  "success": true,
  "applications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "name": "My Application",
      "slug": "my-app",
      "description": "Main application for user management",
      "type": "web",
      "status": "active",
      "url": "https://myapp.com",
      "clientId": "my-app-client-id",
      "callbackUrls": [
        "https://myapp.com/auth/callback"
      ],
      "allowedOrigins": [
        "https://myapp.com"
      ],
      "settings": {
        "allowRegistration": true,
        "requireEmailVerification": true,
        "defaultRole": "user",
        "sessionTimeout": 7200,
        "maxSessions": 3
      },
      "branding": {
        "primaryColor": "#3b82f6",
        "secondaryColor": "#64748b",
        "logoUrl": null
      },
      "statistics": {
        "totalUsers": 100,
        "activeUsers": 75,
        "totalLogins": 1250,
        "lastLogin": "2024-01-15T09:45:00Z"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "message": "Applications retrieved successfully"
}
```

### **POST `/api/admin/identity/applications`**

Register a new application.

**Request**
```json
{
  "name": "New Application",
  "slug": "new-app",
  "description": "A new application for testing",
  "type": "web",
  "url": "https://newapp.com",
  "callbackUrls": [
    "https://newapp.com/auth/callback"
  ],
  "allowedOrigins": [
    "https://newapp.com"
  ],
  "settings": {
    "allowRegistration": false,
    "requireEmailVerification": true,
    "defaultRole": "user",
    "sessionTimeout": 3600,
    "maxSessions": 2
  },
  "branding": {
    "primaryColor": "#f59e0b",
    "secondaryColor": "#64748b"
  }
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "application": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "name": "New Application",
    "slug": "new-app",
    "description": "A new application for testing",
    "type": "web",
    "status": "pending",
    "url": "https://newapp.com",
    "clientId": "new-app-client-id",
    "clientSecret": "new-app-client-secret",
    "callbackUrls": [
      "https://newapp.com/auth/callback"
    ],
    "allowedOrigins": [
      "https://newapp.com"
    ],
    "settings": {
      "allowRegistration": false,
      "requireEmailVerification": true,
      "defaultRole": "user",
      "sessionTimeout": 3600,
      "maxSessions": 2
    },
    "branding": {
      "primaryColor": "#f59e0b",
      "secondaryColor": "#64748b"
    },
    "statistics": {
      "totalUsers": 0,
      "activeUsers": 0,
      "totalLogins": 0,
      "lastLogin": null
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Application registered successfully"
}
```

---

## 🔐 SSO Providers Management

### **GET `/api/admin/identity/sso-providers`**

Get configured SSO providers.

**Query Parameters**
- `enabled` (optional): Filter by enabled status (`true`/`false`)

**Response (200 OK)**
```json
{
  "success": true,
  "providers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "name": "Google",
      "displayName": "Continue with Google",
      "type": "oauth2",
      "enabled": true,
      "config": {
        "clientId": "your-google-client-id",
        "scope": ["openid", "email", "profile"],
        "authUrl": "https://accounts.google.com/oauth/authorize",
        "tokenUrl": "https://oauth2.googleapis.com/token",
        "userInfoUrl": "https://www.googleapis.com/oauth2/v2/userinfo"
      },
      "icon": "https://developers.google.com/identity/images/g-logo.png",
      "color": "#4285f4",
      "metadata": {
        "allowSignup": true,
        "requireEmailVerified": true,
        "autoLinkByEmail": false
      },
      "statistics": {
        "totalLogins": 150,
        "lastLogin": "2024-01-15T09:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "total": 1,
  "message": "SSO providers retrieved successfully"
}
```

### **PUT `/api/admin/identity/sso-providers`**

Create a new SSO provider.

**Request**
```json
{
  "name": "GitHub",
  "type": "oauth2",
  "displayName": "Continue with GitHub",
  "config": {
    "clientId": "your-github-client-id",
    "clientSecret": "your-github-client-secret",
    "scope": "user:email",
    "authUrl": "https://github.com/login/oauth/authorize",
    "tokenUrl": "https://github.com/login/oauth/access_token",
    "userInfoUrl": "https://api.github.com/user"
  },
  "icon": "github",
  "color": "#333333",
  "enabled": true
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "provider": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "GitHub",
    "displayName": "Continue with GitHub",
    "type": "oauth2",
    "enabled": true,
    "config": {
      "clientId": "your-github-client-id",
      "scope": ["user:email"],
      "authUrl": "https://github.com/login/oauth/authorize",
      "tokenUrl": "https://github.com/login/oauth/access_token",
      "userInfoUrl": "https://api.github.com/user"
    },
    "icon": "github",
    "color": "#333333",
    "metadata": {
      "allowSignup": true,
      "requireEmailVerified": false,
      "autoLinkByEmail": false
    }
  },
  "message": "SSO provider created successfully"
}
```

---

## 📊 Session Management

### **GET `/api/admin/identity/sessions`**

Get active sessions.

**Query Parameters**
- `userId` (optional): Filter by user ID
- `applicationId` (optional): Filter by application ID
- `active` (optional): Filter by active status (`true`/`false`)

**Response (200 OK)**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "userEmail": "user@example.com",
      "applicationId": "550e8400-e29b-41d4-a716-446655440007",
      "applicationName": "My Application",
      "token": "sess_token_hash",
      "isActive": true,
      "deviceInfo": {
        "deviceType": "Desktop",
        "deviceName": "Chrome on Windows",
        "browser": "Chrome",
        "os": "Windows"
      },
      "location": {
        "ipAddress": "192.168.1.100",
        "country": "United States",
        "city": "New York"
      },
      "createdAt": "2024-01-15T09:30:00Z",
      "lastActivityAt": "2024-01-15T10:25:00Z",
      "expiresAt": "2024-01-22T09:30:00Z"
    }
  ],
  "total": 1,
  "activeCount": 1,
  "message": "Sessions retrieved successfully"
}
```

### **DELETE `/api/admin/identity/sessions`**

Revoke sessions.

**Query Parameters**
- `sessionId` (optional): Revoke specific session
- `userId` (optional): Revoke all sessions for user
- `revokeAll` (optional): Revoke all sessions for user (requires `userId`)

**Example Request**
```
DELETE /api/admin/identity/sessions?sessionId=550e8400-e29b-41d4-a716-446655440011
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

## 📋 Groups Management

### **GET `/api/admin/identity/groups`**

Get user groups.

**Response (200 OK)**
```json
{
  "success": true,
  "groups": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "name": "Administrators",
      "slug": "administrators",
      "description": "System administrators with full access",
      "isSystem": true,
      "isDefault": false,
      "permissions": ["*"],
      "userCount": 1,
      "color": "#ef4444",
      "icon": "shield",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "User groups retrieved successfully"
}
```

### **POST `/api/admin/identity/groups`**

Create a new user group.

**Request**
```json
{
  "name": "Content Editors",
  "slug": "content-editors",
  "description": "Users who can edit content",
  "permissions": [
    "content:read",
    "content:write"
  ],
  "color": "#3b82f6",
  "icon": "edit"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "group": {
    "id": "550e8400-e29b-41d4-a716-446655440013",
    "name": "Content Editors",
    "slug": "content-editors",
    "description": "Users who can edit content",
    "isSystem": false,
    "isDefault": false,
    "permissions": [
      "content:read",
      "content:write"
    ],
    "userCount": 0,
    "color": "#3b82f6",
    "icon": "edit",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User group created successfully"
}
```

---

## ⚠️ Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_550e8400-e29b-41d4-a716-446655440014"
}
```

### **Common Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 401 | Invalid JWT token |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permission |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## 🔍 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute per IP
- **User management**: 100 requests per minute per user
- **General endpoints**: 1000 requests per minute per application

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

---

## 🏥 Health Check

### **GET `/api/health`**

Check system health status.

**Response (200 OK)**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "jwt": "operational"
  },
  "uptime": 86400
}
```

---

## 📝 SDK Examples

### **JavaScript/TypeScript**

```typescript
import { IdentityGateway } from '@your-org/identity-sdk'

const identity = new IdentityGateway({
  clientId: 'your-client-id',
  baseUrl: 'https://identity.yourorg.com'
})

// Login
const user = await identity.login({
  email: 'user@example.com',
  password: 'password123'
})

// Check permissions
const canReadUsers = await identity.hasPermission('users:read')

// Get current user
const currentUser = await identity.getCurrentUser()
```

### **Python**

```python
from identity_sdk import IdentityGateway

identity = IdentityGateway(
    client_id='your-client-id',
    base_url='https://identity.yourorg.com'
)

# Verify token
user = identity.verify_token('Bearer token')

# Create user
new_user = identity.create_user({
    email: 'newuser@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'password123'
})
```

### **cURL Examples**

```bash
# Login
curl -X POST https://identity.yourorg.com/api/admin/identity/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "clientId": "your-client-id",
    "email": "user@example.com",
    "password": "password123"
  }'

# Get users (with authentication)
curl -X GET https://identity.yourorg.com/api/admin/users \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Client-ID: your-client-id"
```

---

## 📞 Support

For API support and questions:

- **Documentation**: https://docs.yourorg.com/identity
- **GitHub**: https://github.com/your-org/identity-gateway
- **Email**: api-support@yourorg.com
- **Status**: https://status.yourorg.com

---

**Last updated: January 15, 2024**
