# Getting Started with Boundary Web App DevKit

This guide will walk you through the initial setup required to integrate your web application with the Boundary Identity Gateway.

## Prerequisites

1.  **Boundary Account**: You need access to a Boundary instance.
2.  **Admin Access**: Ability to register new OIDC clients in the Admin Dashboard.
3.  **App Framework**: A web application (React, Next.js, Vue, Express, etc.).

## 1. Register Your Application

Before coding, you must register your application in the Boundary Admin Dashboard under **Identity > OAuth Clients**.

1.  Click **Create Client**.
2.  Set **Client Type**:
    *   `Confidential`: For Server-side apps (Next.js SSR, Express).
    *   `Public`: For Client-side apps (SPA, Mobile).
3.  Add your **Redirect URIs** (e.g., `http://localhost:3000/callback`).
4.  Note your **Client ID** (and **Client Secret** if confidential).

## 2. Environment Configuration

Standardize your configuration by adding these keys to your `.env` or system environment:

```bash
# Boundary Gateway URL
BOUNDARY_ISSUER=https://auth.boundary.com

# Client Credentials
BOUNDARY_CLIENT_ID=your_client_id_here
BOUNDARY_CLIENT_SECRET=your_client_secret_here # (Confidential only)

# Application URL
BOUNDARY_REDIRECT_URI=http://localhost:3000/callback
```

## 3. Installation (Conceptual)

While a physical npm package is forthcoming, the DevKit provides the architectural blueprints for your integration. We recommend using industry-standard libraries:

- **For Node.js**: `openid-client`
- **For React**: `react-oidc-context`
- **For Next.js**: `next-auth` (with custom Boundary provider)

## Next Steps

Now that your environment is ready, proceed to implement the **[Login Module](./login.md)**.
