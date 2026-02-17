# API Reference

While the SDK is the recommended way to integrate, you can also interact with Boundary directly via our RESTful API.

## Base URL

All API requests should be made to:
`https://api.your-boundary-domain.com/v1`

## Authentication

Most endpoints require a Bearer token in the `Authorization` header.

```bash
Authorization: Bearer <ACCESS_TOKEN>
```

## Endpoints

### 1. Identity Endpoints

#### GET `/me`
Returns the profile of the authenticated user.

**Response:**
```json
{
  "id": "usr_123",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

#### PATCH `/me`
Updates user metadata or profile fields.

### 2. Session Endpoints

#### POST `/oauth/token`
Exchange an authorization code for tokens, or refresh an existing token.

#### POST `/oauth/revoke`
Invalidate an access or refresh token.

### 3. Application Endpoints

#### GET `/config`
Retrieves public configuration for your application (logos, colors, provider list).

## Error Handling

Standard HTTP status codes are used:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
