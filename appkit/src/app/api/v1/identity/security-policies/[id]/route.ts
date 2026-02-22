import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const policy = await prisma.securityPolicy.findUnique({
      where: { id: params.id },
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ policy });
  } catch (error: any) {
    console.error('Get security policy error:', error);
    return NextResponse.json({ error: 'Failed to get security policy' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const policy = await prisma.securityPolicy.update({
      where: { id: params.id },
      data: {
        applicationId: data.applicationId,
        policyName: data.policyName,
        policyType: data.policyType,
        isActive: data.isActive,
        priority: data.priority,
        passwordMinLength: data.passwordMinLength,
        passwordMaxLength: data.passwordMaxLength,
        passwordRequireUppercase: data.passwordRequireUppercase,
        passwordRequireLowercase: data.passwordRequireLowercase,
        passwordRequireNumber: data.passwordRequireNumber,
        passwordRequireSpecial: data.passwordRequireSpecial,
        passwordHistoryCount: data.passwordHistoryCount,
        passwordExpiryDays: data.passwordExpiryDays,
        lockoutEnabled: data.lockoutEnabled,
        lockoutThreshold: data.lockoutThreshold,
        lockoutDurationMinutes: data.lockoutDurationMinutes,
        lockoutResetAfterMinutes: data.lockoutResetAfterMinutes,
        sessionTimeoutMinutes: data.sessionTimeoutMinutes,
        sessionMaxConcurrent: data.sessionMaxConcurrent,
        mfaRequired: data.mfaRequired,
        mfaRequiredForRoles: data.mfaRequiredForRoles,
        mfaRememberDeviceDays: data.mfaRememberDeviceDays,
        mfaAllowedTypes: data.mfaAllowedTypes,
        ipWhitelist: data.ipWhitelist,
        ipBlacklist: data.ipBlacklist,
        ipGeoWhitelist: data.ipGeoWhitelist,
        ipGeoBlacklist: data.ipGeoBlacklist,
      }
    });

    return NextResponse.json({ policy });
  } catch (error: any) {
    console.error('Update security policy error:', error);
    return NextResponse.json({ error: 'Failed to update security policy' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    await prisma.securityPolicy.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete security policy error:', error);
    return NextResponse.json({ error: 'Failed to delete security policy' }, { status: 500 });
  }
}
