import { NextRequest, NextResponse } from 'next/server';
import ssoProviderService from '@/server/services/SSOProviderService';
import { prisma } from '@/server/lib/prisma';
import { auditService, AuditAction } from '@/server/services/auditService';

export async function GET(request: NextRequest) {
  return handleUserInfo(request);
}

export async function POST(request: NextRequest) {
  return handleUserInfo(request);
}

async function handleUserInfo(request: NextRequest) {
  let userIdForLog = 'anonymous';
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing access token' }, { status: 401 });
    }

    // Validate access token
    const decoded = await ssoProviderService.validateAccessToken(token);
    const userId = decoded.sub;
    userIdForLog = userId;

    // Fetch user profile data
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isSuperAdmin: true }
    });

    // Audit userinfo access
    await auditService.logAuthEvent(
      userId,
      AuditAction.ACCESS,
      'OAuth:UserInfo',
      { action: 'userinfo_access_success' },
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    if (adminUser) {
      return NextResponse.json({
        sub: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        email_verified: true,
        preferred_username: adminUser.email,
        is_admin: true,
        is_super_admin: adminUser.isSuperAdmin
      });
    }

    // Fallback to general user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, isVerified: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'invalid_token', error_description: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      sub: user.id,
      name: `${user.firstName} ${user.lastName}`,
      given_name: user.firstName,
      family_name: user.lastName,
      email: user.email,
      email_verified: user.isVerified,
      preferred_username: user.email,
      is_admin: false
    });

  } catch (error: any) {
    console.error('[oauth] UserInfo error:', error);

    // Log failed userinfo access
    await auditService.logAuthEvent(
      userIdForLog,
      AuditAction.FAILED,
      'OAuth:UserInfo',
      { 
        error: error.message,
        action: 'userinfo_access_failed'
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return NextResponse.json({ 
      error: 'invalid_token', 
      error_description: error.message || 'Token validation failed' 
    }, { status: 401 });
  }
}
