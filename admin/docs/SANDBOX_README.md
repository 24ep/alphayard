# Boundary Login Sandbox

## Overview

The Boundary Login Sandbox provides a comprehensive testing environment for login module integration and configuration. This sandbox allows developers to test authentication flows, configure login settings, and generate integration code before deploying to production.

## Features

### 🎯 **Main Sandbox** (`/sandbox`)
- **Live Preview**: Real-time login/signup form testing
- **Platform Modes**: Web desktop, web mobile, mobile app
- **Device Modes**: Desktop, tablet, mobile layouts
- **Configuration Panel**: Branding, layout, form settings
- **Test Credentials**: Pre-configured user data
- **Redirect URL Testing**: Configure and test callbacks
- **Import/Export Config**: Save and load settings

### 🎉 **Success Page** (`/sandbox/success`)
- **Authentication Feedback**: Clear success indicators
- **Token Display**: Generated authentication tokens
- **User Data**: Test user information
- **Debug Information**: Technical details
- **Next Steps**: Integration guidance

### 📚 **Integration Guide** (`/sandbox/integration-guide`)
- **Code Examples**: JavaScript, React, Next.js, Node.js
- **Step-by-step Instructions**: Complete walkthrough
- **Configuration Options**: Parameter explanations
- **Security Best Practices**: Authentication guidelines
- **Testing Instructions**: How to test integration

### 🔧 **API Endpoint** (`/api/sandbox/test-login`)
- **GET Request**: Simulates login with HTML response
- **POST Request**: JSON API for programmatic testing
- **Token Generation**: Creates test authentication tokens
- **Redirect Handling**: Proper callback URL processing

## Quick Start

1. **Navigate to Sandbox**: Go to `/sandbox` in your admin panel
2. **Configure Settings**: Use the control panel to customize:
   - Branding (logo, colors, fonts)
   - Layout (positioning, spacing, responsive)
   - Form fields (email, username, phone, company)
   - Social login providers
3. **Set Redirect URL**: Enter your application's callback URL
4. **Test Login**: Click "Test Login" to simulate authentication
5. **Verify Integration**: Check token handling and user data
6. **Get Code**: Use the integration guide for implementation

## Navigation Access

The sandbox is accessible through:
- **Direct URL**: `/sandbox`
- **Navigation Menu**: Identity → Login Sandbox
- **Login Emulator**: "Test in Sandbox" button
- **Signup Emulator**: "Test in Sandbox" button

## Configuration Options

### Platform Modes
- **Web Desktop**: Full browser experience
- **Web Mobile**: Mobile browser optimization
- **Mobile App**: Native app simulation

### Device Modes
- **Desktop**: Standard desktop layout
- **Tablet**: Tablet-specific design
- **Mobile**: Mobile-optimized interface

### Form Types
- **Login**: Email/password authentication
- **Signup**: User registration flow

### Customization
- **Branding**: Logo, colors, typography
- **Layout**: Positioning, spacing, responsive
- **Form Fields**: Show/hide specific fields
- **Social Login**: Configure OAuth providers
- **Security**: 2FA, rate limiting, session management

## Testing Features

### Redirect URL Testing
- Configure custom callback URLs
- Test token passing and user data
- Verify proper error handling

### Token Generation
- Generate test authentication tokens
- Display token information
- Store in localStorage for testing

### User Data Simulation
- Pre-configured test user profiles
- Customizable user attributes
- Realistic data for testing

### Debug Information
- Request/response details
- Browser information
- Timestamp and metadata

## Integration Support

### Code Examples
```javascript
// JavaScript
import { BoundaryAuth } from '@boundary/auth'
const auth = new BoundaryAuth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback'
})
const result = await auth.signIn(email, password)
```

### React Hook
```typescript
export function useBoundaryAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // ... implementation
}
```

### Next.js Integration
```typescript
// app/auth/login/page.tsx
export default function LoginPage() {
  // ... Next.js specific implementation
}
```

### Node.js Backend
```javascript
const auth = new BoundaryAuth({
  clientId: process.env.BOUNDARY_CLIENT_ID,
  clientSecret: process.env.BOUNDARY_CLIENT_SECRET
})
```

## Security Features

### Authentication
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Secure token handling
- **Password Strength**: Configurable requirements
- **Account Lockout**: Temporary lock after failures

### Privacy
- **GDPR Compliance**: Privacy protection features
- **Cookie Consent**: User consent management
- **Data Protection**: Secure data handling

### Best Practices
- **Token Storage**: HTTP-only cookies recommended
- **Environment Variables**: Secure configuration
- **Error Handling**: Don't expose sensitive information

## Troubleshooting

### Common Issues
1. **Login redirects to wrong page**
   - Check redirect URL configuration
   - Verify port numbers (admin: 3001, backend: 3000)

2. **Token not working**
   - Verify token expiration
   - Check storage method
   - Ensure proper API endpoints

3. **Social login not working**
   - Verify OAuth provider setup
   - Check redirect URIs
   - Ensure CORS configuration

### Debug Commands
```javascript
// Check authentication state
console.log('Token:', localStorage.getItem('sandbox_token'))
console.log('User:', localStorage.getItem('sandbox_user'))
console.log('URL:', window.location.href)

// Clear data
localStorage.clear()
```

## API Reference

### Test Login Endpoint
```
GET /api/sandbox/test-login?redirect=<url>
POST /api/sandbox/test-login
```

### Response Format
```json
{
  "success": true,
  "token": "sandbox_token_...",
  "user": {
    "id": "test-user-123",
    "email": "test@example.com",
    "name": "Test User"
  },
  "redirectUrl": "/sandbox/success"
}
```

## Documentation

- **Development Guide**: `/docs/DEVELOPMENT_GUIDE.md`
- **Integration Guide**: `/sandbox/integration-guide`
- **API Reference**: Available in integration guide
- **Security Guidelines**: Included in development guide

## Support

### Resources
- **Full Documentation**: `boundary.com/docs`
- **GitHub Repository**: `github.com/boundary/auth`
- **Support Center**: `boundary.com/support`
- **Community**: Discord and Stack Overflow

### Getting Help
1. Check the integration guide
2. Review the development documentation
3. Test with the sandbox environment
4. Contact support if needed

## License

This sandbox environment is part of the Boundary Login Module and is licensed under the MIT License.

---

**Ready to test?** Navigate to `/sandbox` in your admin panel to get started!
