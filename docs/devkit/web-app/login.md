# DevKit: Login Module (Web App)

The Login Module is the core of the Boundary integration. it handles the entire authentication lifecycle, from initiating the login request to receiving secure user tokens.

## Integration Strategies

### 1. Server-Side Integration (Confidential)
Best for frameworks like Next.js, Express, Nuxt, or Django where you have a secure server to store a `CLIENT_SECRET`.

### 2. Client-Side Integration (Public)
Best for Single Page Applications (React, Vue, Vite) and PWAs. Uses **PKCE** for security.

---

## Coding Implementation

### Step 1: Initialize the Auth Client
Configure the client with your application credentials obtained from the Boundary Admin Dashboard.

```typescript
const authClient = new BoundaryAuthClient({
  issuer: 'https://auth.boundary.com',
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'https://your-app.com/callback',
  // Only for Server-Side
  clientSecret: process.env.BOUNDARY_CLIENT_SECRET 
});
```

### Step 2: Trigger Login
Invoke the login method to redirect the user to the Boundary Gateway.

```typescript
// For SPA (uses PKCE automatically)
await authClient.login();

// For Server-Side (manual redirect)
const loginUrl = authClient.getAuthorizationUrl();
res.redirect(loginUrl);
```

### Step 3: Handle the Callback
On your `/callback` route, process the incoming code to exchange it for tokens.

```typescript
// Backend (Express example)
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const tokens = await authClient.handleCallback(code);
  
  // Store tokens in secure session
  req.session.tokens = tokens;
  res.redirect('/dashboard');
});
```

### Step 4: Access User Session
Retrieve the authenticated user's information from the ID Token or UserInfo endpoint.

```typescript
const user = await authClient.getUserProfile(tokens.accessToken);
console.log(`Welcome, ${user.displayName}!`);
```

---

## Technical Details

### Supported Scopes
- `openid`: Required for OIDC.
- `profile`: Access to name, picture, and basic info.
- `email`: Access to the user's verified email address.
- `offline_access`: Required to receive a Refresh Token.

### Security Features
- **State Verification**: Prevents CSRF attacks.
- **Nonce Checking**: Prevents replay attacks.
- **PKCE Support**: Standard for all frontend integrations.

[Back to DevKit Overview](./README.md)
