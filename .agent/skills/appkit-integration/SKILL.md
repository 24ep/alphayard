---
name: appkit-integration
description: Instructions and patterns for integrating AppKit (Identity, Auth, CMS) into applications.
---

# AppKit Integration Skill

This skill provides comprehensive instructions for integrating AppKit into web and mobile applications. AppKit is an identity gateway and application toolkit that abstracts OIDC complexities.

## Overview

AppKit (formerly AlphaYard) provides:
- **Identity Gateway:** OAuth 2.0 / OIDC authentication.
- **CMS:** Dynamic content delivery and management.
- **Communication:** Unified API for Email, SMS, and Push.
- **Circles:** Organizational grouping and data isolation.

## Core Patterns

### 1. Installation & Initialization

Install the official SDK:
```bash
npm install appkit-sdk
```

Initialize the client with credentials from environment variables:
```typescript
import { AppKit } from 'appkit-sdk';

const client = new AppKit({
  clientId: process.env.NEXT_PUBLIC_APPKIT_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_APPKIT_DOMAIN
});
```

### 2. Authentication Flow

Trigger the standard login flow (Authorization Code with PKCE):
```typescript
// Triggers redirect to AppKit login page
await client.login({
  redirect_uri: 'https://your-app.com/callback',
  scope: 'openid profile email'
});
```

Retrieve user information after authentication:
```typescript
const user = await client.getUser();
console.log(user.name, user.email);
```

### 3. CMS & Content Delivery

Fetch and render dynamic content from the Content Studio:
```typescript
const content = await client.cms.getContent('target-slug');
// 'content' contains title, description, and structured data
```

### 4. Communication API

Send transactional messages across multiple channels:
```typescript
await client.communication.sendEmail({
  to: 'user@example.com',
  template: 'welcome',
  data: { firstName: 'John' }
});
```

## Implementation Guidelines

- **Security:** Never expose `ALPHAYARD_CLIENT_SECRET` (or `APPKIT_CLIENT_SECRET`) in the browser. Use public client configurations for SPAs and mobile.
- **Redirects:** Ensure `redirect_uri` is white-listed in the AppKit Admin Console.
- **Token Management:** The SDK handles token rotation and persistence automatically. Use `client.getToken()` if access tokens are needed for direct API calls.
- **Branding:** Use the standardized AppKit UI components for a consistent experience.

## Reference Files
- Data Source: [docs.tsx](file:///e:/GitCloneProject/boundary/appkit/src/app/dev-hub/data/docs.tsx)
- Search UI: [DevHubSearch.tsx](file:///e:/GitCloneProject/boundary/appkit/src/app/dev-hub/components/DevHubSearch.tsx)
