# Web Application Integration Guide

This guide describes how to integrate the Boundary Authentication Gateway into a standard server-side web application using OpenID Connect (OIDC).

## Configuration

Registry your application as a **Confidential Client** in the Boundary Admin dashboard.

- **Client ID**: `YOUR_CLIENT_ID`
- **Client Secret**: `YOUR_CLIENT_SECRET`
- **Redirect URI**: `https://your-app.com/callback`

## Authentication Flow

### 1. Redirect to Authorization Endpoint

Redirect the user to the Boundary authorization endpoint to initiate the login process.

```javascript
const authUrl = `https://auth.boundary.com/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=openid profile email&` +
  `state=${generateRandomState()}`;

window.location.href = authUrl;
```

### 2. Handle the Callback

After the user authenticates, Boundary will redirect back to your `redirect_uri` with a `code` parameter.

```javascript
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
```

### 3. Exchange Code for Tokens

Exchange the authorization code for an ID token and an access token using your client secret.

```javascript
const response = await fetch('https://auth.boundary.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  })
});

const tokens = await response.json();
```

## Accessing User Information

Use the access token to fetch user profile details.

```javascript
const userResponse = await fetch('https://auth.boundary.com/oauth/userinfo', {
  headers: {
    'Authorization': `Bearer ${tokens.access_token}`
  }
});

const user = await userResponse.json();
```
