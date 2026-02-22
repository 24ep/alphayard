import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;

    const policies = await prisma.securityPolicy.findMany({
      where,
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({ policies });
  } catch (error: any) {
    console.error('Get security policies error:', error);
    return NextResponse.json({ error: 'Failed to get security policies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const policy = await prisma.securityPolicy.create({
      data: {
        applicationId: data.applicationId,
        policyName: data.policyName,
        policyType: data.policyType || 'default',
        isActive: data.isActive !== undefined ? data.isActive : true,
        priority: data.priority || 0,
        passwordMinLength: data.passwordMinLength || 8,
        passwordMaxLength: data.passwordMaxLength || 128,
        passwordRequireUppercase: data.passwordRequireUppercase !== undefined ? data.passwordRequireUppercase : true,
        passwordRequireLowercase: data.passwordRequireLowercase !== undefined ? data.passwordRequireLowercase : true,
        passwordRequireNumber: data.passwordRequireNumber !== undefined ? data.passwordRequireNumber : true,
        passwordRequireSpecial: data.passwordRequireSpecial !== undefined ? data.passwordRequireSpecial : true,
        passwordHistoryCount: data.passwordHistoryCount || 5,
        passwordExpiryDays: data.passwordExpiryDays || 90,
        lockoutEnabled: data.lockoutEnabled !== undefined ? data.lockoutEnabled : true,
        lockoutThreshold: data.lockoutThreshold || 5,
        lockoutDurationMinutes: data.lockoutDurationMinutes || 30,
        lockoutResetAfterMinutes: data.lockoutResetAfterMinutes || 30,
        sessionTimeoutMinutes: data.sessionTimeoutMinutes || 1440,
        sessionMaxConcurrent: data.sessionMaxConcurrent || 5,
        mfaRequired: data.mfaRequired || false,
        mfaRequiredForRoles: data.mfaRequiredForRoles || [],
        mfaRememberDeviceDays: data.mfaRememberDeviceDays || 30,
        mfaAllowedTypes: data.mfaAllowedTypes || ['totp'],
        ipWhitelist: data.ipWhitelist || [],
        ipBlacklist: data.ipBlacklist || [],
        ipGeoWhitelist: data.ipGeoWhitelist || [],
        ipGeoBlacklist: data.ipGeoBlacklist || [],
      }
    });

    return NextResponse.json({ policy }, { status: 201 });
  } catch (error: any) {
    console.error('Create security policy error:', error);
    return NextResponse.json({ error: 'Failed to create security policy' }, { status: 500 });
  }
}
