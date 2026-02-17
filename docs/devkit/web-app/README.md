# Boundary Web App DevKit

Welcome to the Boundary Web App DevKit. This suite provides a set of tools, libraries, and architectural patterns to help you integrate Boundary's identity services seamlessly into your web applications.

## Overview

The DevKit is designed to abstract the complexities of OAuth 2.0 and OpenID Connect, allowing you to focus on your application's core logic while Boundary handles security, identity, and user management.

## Available Modules

| Module | Description | Status |
| :--- | :--- | :--- |
| **[Login](./login.md)** | Authentication, Auth Code flow, and PKCE. | **Complete** |
| Identity | User profiles, metadata, and custom claims. | *Planned* |
| Sessions | Secure session handling and token rotation. | *Planned* |
| Security (MFA) | Multi-factor authentication integration. | *Planned* |
| Branding | Dynamic UI syncing with Boundary configuration. | *Planned* |

## Core Concepts

1.  **Standard-Compliant**: Built on top of industry-standard protocols.
2.  **Platform Agnostic**: Guides for Node.js, Next.js, and Single Page Apps (SPA).
3.  **Modern Security**: Native support for PKCE and secure storage patterns.

---

[Getting Started Guide](./getting-started.md) | [Login Module](./login.md)
