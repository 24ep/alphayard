import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { config } from '@/server/config/env'
import jwt from 'jsonwebtoken'

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const host = req.headers.get('host') || 'localhost:3001'
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

function errorRedirect(base: string, code: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${code}`, base))
}

/** Returns an HTML page that navigates after SSO — relies on httpOnly cookie set above. */
function bridgePage(token: string, _user: object, redirectTo: string): NextResponse {
  const safeRedirect = JSON.stringify(redirectTo)

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body>
<p style="font-family:sans-serif;text-align:center;margin-top:20vh">Signing in…</p>
<script>
window.location.replace(${safeRedirect});
</script>
</body>
</html>`

  const res = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
  // Also set the httpOnly cookie so OIDC / API routes can read it
  res.cookies.set('appkit_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  res.cookies.set('sso_state', '', { maxAge: 0, path: '/' })
  return res
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const stateFromQuery = searchParams.get('state')
  const oauthError = searchParams.get('error')
  const base = getBaseUrl(request)

  if (oauthError) {
    console.error(`[SSO Callback] Provider returned error for "${provider}": ${oauthError}`)
    return errorRedirect(base, 'sso_denied')
  }

  if (!code || !stateFromQuery) {
    return errorRedirect(base, 'sso_invalid')
  }

  // Verify state cookie to prevent CSRF
  const stateCookie = request.cookies.get('sso_state')?.value
  if (!stateCookie || stateCookie !== stateFromQuery) {
    console.error('[SSO Callback] State mismatch — possible CSRF')
    return errorRedirect(base, 'sso_state_mismatch')
  }

  let redirectAfter = '/dashboard'
  try {
    const decoded = JSON.parse(Buffer.from(stateFromQuery, 'base64url').toString())
    if (decoded.redirect) redirectAfter = decoded.redirect
  } catch {
    // malformed state — use default
  }

  try {
    const oauthProvider = await prisma.oAuthProvider.findFirst({
      where: {
        isEnabled: true,
        OR: [
          { providerName: provider },
          { providerName: provider.replace('-oauth', '') },
        ],
      },
    })

    if (!oauthProvider || !oauthProvider.tokenUrl || !oauthProvider.userinfoUrl) {
      return errorRedirect(base, 'sso_not_configured')
    }

    const callbackUrl = `${base}/api/v1/admin/auth/sso/${provider}/callback`

    // Exchange authorization code for tokens
    const tokenRes = await fetch(oauthProvider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: oauthProvider.clientId,
        client_secret: oauthProvider.clientSecret,
      }).toString(),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error(`[SSO Callback] Token exchange failed (${tokenRes.status}):`, body)
      return errorRedirect(base, 'sso_token_failed')
    }

    const tokens = await tokenRes.json()
    const accessToken: string = tokens.access_token
    if (!accessToken) return errorRedirect(base, 'sso_no_token')

    // Fetch user info from provider
    const userinfoRes = await fetch(oauthProvider.userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userinfoRes.ok) {
      console.error(`[SSO Callback] Userinfo failed (${userinfoRes.status})`)
      return errorRedirect(base, 'sso_userinfo_failed')
    }
    const userinfo = await userinfoRes.json()

    // Apply optional claims mapping — supports standard OIDC and provider-specific fields
    const claimsMap: Record<string, string> =
      (oauthProvider.claimsMapping as Record<string, string>) || {}

    const get = (key: string, ...fallbacks: string[]): string =>
      [key, ...fallbacks].map(k => claimsMap[k] || k).reduce<string>(
        (val, k) => val || (typeof userinfo[k] === 'string' ? userinfo[k] : ''),
        ''
      )

    const email: string = get('email')
    const firstName: string = get('given_name', 'first_name') || get('name', 'login').split(' ')[0] || ''
    const lastName: string = get('family_name', 'last_name') || (get('name').includes(' ') ? get('name').split(' ').slice(1).join(' ') : '')
    // picture (OIDC) or avatar_url (GitHub)
    const avatarUrl: string | undefined = get('picture', 'avatar_url', 'photo') || undefined
    const locale: string | undefined = get('locale', 'language') || undefined
    const timezone: string | undefined = get('zoneinfo', 'timezone') || undefined
    const phoneNumber: string | undefined = get('phone_number', 'phone') || undefined
    const website: string | undefined = get('website', 'blog', 'html_url') || undefined
    const bio: string | undefined = get('bio', 'description') || undefined
    const location: string | undefined = get('location') || undefined
    const username: string | undefined = get('preferred_username', 'login', 'username') || undefined

    if (!email) {
      console.error('[SSO Callback] No email in userinfo:', userinfo)
      return errorRedirect(base, 'sso_no_email')
    }

    // Enforce allowed domains if configured
    if (oauthProvider.allowedDomains?.length) {
      const domain = email.split('@')[1]
      if (!oauthProvider.allowedDomains.includes(domain)) {
        return errorRedirect(base, 'sso_domain_not_allowed')
      }
    }

    // Resolve admin user — prefer admin_users, fall back to users
    let userId: string
    let userName: string
    let roleName = 'admin'
    let isSuperAdmin = false
    let permissions: string[] = ['*']

    const adminUser = await prisma.adminUser.findFirst({
      where: { email: email.toLowerCase() },
      include: { role: true },
    })

    if (adminUser) {
      if (!adminUser.isActive) return errorRedirect(base, 'account_disabled')
      userId = adminUser.id
      roleName = adminUser.role?.name || 'admin'
      isSuperAdmin = adminUser.isSuperAdmin
      if (!isSuperAdmin && adminUser.roleId) {
        const rolePerms = await prisma.adminRolePermission.findMany({
          where: { roleId: adminUser.roleId },
          include: { permission: true },
        })
        permissions = rolePerms.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`)
      }
      // Sync profile from SSO on every login
      const syncedName = [firstName, lastName].filter(Boolean).join(' ') || adminUser.name || email
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: {
          lastLoginAt: new Date(),
          name: syncedName,
          ...(avatarUrl && { avatarUrl }),
        },
      })
      userName = syncedName
    } else {
      let user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } })
      if (!user) {
        if (!oauthProvider.allowSignup) return errorRedirect(base, 'sso_signup_disabled')
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            firstName: firstName || email.split('@')[0],
            lastName: lastName || '',
            avatarUrl,
            phoneNumber,
            bio,
            ...(locale && { preferences: { locale, timezone, website, location, username } }),
            userType: 'admin',
            isActive: true,
            isVerified: true,
            verifiedAt: new Date(),
          },
        })
      } else if (!user.isActive) {
        return errorRedirect(base, 'account_disabled')
      } else {
        // Sync profile from SSO on every login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(avatarUrl && { avatarUrl }),
            ...(phoneNumber && { phoneNumber }),
            ...(bio && { bio }),
          },
        })
      }
      userId = user.id
      userName = `${firstName || user.firstName} ${lastName || user.lastName}`.trim() || email
      isSuperAdmin = user.userType === 'admin'
      if (!user.createdAt) {
        // newly created, lastLoginAt already set
      } else {
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      }
    }

    const resolvedAvatar = avatarUrl || undefined

    const userPayload = {
      id: userId,
      adminId: userId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      name: userName,
      avatarUrl: resolvedAvatar,
      role: roleName,
      permissions,
      type: 'admin' as const,
      isSuperAdmin,
    }

    const appkitToken = jwt.sign(userPayload, config.JWT_SECRET, { expiresIn: '7d' })

    const userObj = {
      id: userId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      name: userName,
      avatarUrl: resolvedAvatar,
      role: roleName,
      permissions,
      isSuperAdmin,
    }

    console.log(`[SSO Callback] ✓ ${email} authenticated via ${provider}`)
    return bridgePage(appkitToken, userObj, redirectAfter)
  } catch (error: any) {
    console.error(`[SSO Callback] Unhandled error for "${provider}":`, error)
    return errorRedirect(base, 'sso_failed')
  }
}
