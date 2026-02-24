# SSO Provider Environment Variables

This document outlines the environment variables required for configuring SSO providers in production.

## Google OAuth 2.0

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (development) or your production URL

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Microsoft Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory
3. App registrations → New registration
4. Set redirect URI: `http://localhost:3000/api/auth/callback/microsoft` (development)

```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github` (development)

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Facebook Login

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app → Add Facebook Login
3. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook` (development)

```bash
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

## X (Twitter) OAuth 2.0

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create new project and app
3. Set callback URL: `http://localhost:3000/api/auth/callback/twitter` (development)
4. Request OAuth 2.0 access

```bash
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

## WhatsApp Business API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create WhatsApp Business app
3. Configure webhook and OAuth settings

```bash
WHATSAPP_CLIENT_ID=your_whatsapp_client_id
WHATSAPP_CLIENT_SECRET=your_whatsapp_client_secret
```

## Database Setup

After configuring environment variables, run the seed script to populate SSO providers:

```bash
npm run db:seed:sso
```

This will create default SSO provider configurations in the database, which can then be enabled and configured through the admin interface.

## Security Notes

- Never commit client secrets to version control
- Use different secrets for development and production
- Regularly rotate your client secrets
- Configure proper redirect URIs for each environment
- Enable HTTPS in production for all OAuth callbacks

## Testing Configuration

After setting up environment variables and running the seed script:

1. Navigate to Admin → Identity → Authentication Methods
2. Enable desired SSO providers
3. Configure client IDs and additional settings
4. Test authentication flow with each provider

## Troubleshooting

### Common Issues

1. **Invalid redirect URI**: Ensure the callback URL matches exactly what's configured in the provider's dashboard
2. **Client not authorized**: Check that the OAuth app is properly configured and active
3. **Scope issues**: Verify that the requested scopes are supported by the provider
4. **Environment variables not loading**: Restart your application after adding new environment variables

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=oauth:*
```

This will provide detailed information about the OAuth flow for troubleshooting.
