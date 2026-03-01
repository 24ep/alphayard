import { NextRequest, NextResponse } from 'next/server'
import ssoProviderService from '@/server/services/SSOProviderService'

const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set('appkit_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const clientId = searchParams.get('client_id')?.trim()
  const postLogoutRedirectUri = searchParams.get('post_logout_redirect_uri')?.trim()
  const state = searchParams.get('state')?.trim()

  // Validate redirect URI against registered client redirect URIs.
  // This prevents open redirects while supporting OIDC logout callbacks.
  if (postLogoutRedirectUri) {
    if (!clientId) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'client_id is required when post_logout_redirect_uri is provided' },
        { status: 400 }
      )
    }

    try {
      await ssoProviderService.validateClient(clientId, postLogoutRedirectUri)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: error?.message || 'Invalid post_logout_redirect_uri' },
        { status: 400 }
      )
    }
  }

  const redirectTarget = postLogoutRedirectUri || `${origin}/login`
  const response = NextResponse.redirect(redirectTarget)
  clearSessionCookie(response)

  if (state) {
    const url = new URL(redirectTarget)
    url.searchParams.set('state', state)
    const stateResponse = NextResponse.redirect(url)
    clearSessionCookie(stateResponse)
    return stateResponse
  }

  return response
}

