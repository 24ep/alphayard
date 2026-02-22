import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { action, userIds, data } = await req.json();

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Action and userIds array are required' }, { status: 400 });
    }

    let affected = 0;

    switch (action) {
      case 'delete':
        const deleteResult = await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        });
        affected = deleteResult.count;
        break;

      case 'suspend':
        const suspendResult = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false, updatedAt: new Date() }
        });
        affected = suspendResult.count;
        break;

      case 'activate':
        const activateResult = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true, updatedAt: new Date() }
        });
        affected = activateResult.count;
        break;

      case 'verify_email':
        const verifyResult = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: true, updatedAt: new Date() }
        });
        affected = verifyResult.count;
        break;

      case 'assign_role':
        if (!data?.role) {
          return NextResponse.json({ error: 'Role is required for assign_role action' }, { status: 400 });
        }
        // Using batch update for preferences JSON is slightly tricky with pure prisma updateMany
        // For now, doing it via a loop or raw if mandatory. Mirroring original's $executeRawUnsafe.
        affected = await prisma.$executeRawUnsafe(
          `UPDATE public.users SET preferences = preferences || jsonb_build_object('role', $2::text), updated_at = NOW() WHERE id = ANY($1)`,
          userIds, data.role
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, affected });
  } catch (error: any) {
    console.error('Bulk user operation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
