# Mobile Web / PWA Integration Guide

For Single Page Applications (SPAs) and Progressive Web Apps (PWAs), Boundary supports the OIDC Authorization Code flow with **PKCE** (Proof Key for Code Exchange).

## Configuration

Register your application as a **Public Client** in the Boundary Admin dashboard.

- **Client ID**: `YOUR_CLIENT_ID`
- **Redirect URI**: `https://your-pwa.com/callback`

## Authentication with PKCE

### 1. Generate PKCE Verifier and Challenge

You must generate a cryptographically strong random string (verifier) and its SHA256 hash (challenge).

```javascript
const verifier = generateRandomString();
const challenge = await generateCodeChallenge(verifier);
localStorage.setItem('pkce_verifier', verifier);
```

### 2. Redirect to Authorization Endpoint

```javascript
const authUrl = `https://auth.boundary.com/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `code_challenge=${challenge}&` +
  `code_challenge_method=S256&` +
  `scope=openid profile email`;

window.location.href = authUrl;
```

### 3. Exchange Code for Tokens

```javascript
const verifier = localStorage.getItem('pkce_verifier');

const response = await fetch('https://auth.boundary.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: CLIENT_ID,
    code_verifier: verifier,
    redirect_uri: REDIRECT_URI
  })
});
```

## Security Considerations

- **Never** store the client secret in your frontend code.
- Use `S256` as the challenge method.
- Store tokens securely in memory or using secure cookies if possible.
