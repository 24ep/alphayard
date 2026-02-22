import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const userId = params.id;

    const userQuery = `
      SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", 
             u.avatar_url as "avatarUrl", u.phone_number as "phone", u.is_active as "isActive", 
             (CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END) as "status",
             u.created_at as "createdAt", u.updated_at as "updatedAt",
             u.preferences as metadata,
             (SELECT json_agg(json_build_object(
               'id', c.id, 
               'name', c.data->>'name',
               'members', (SELECT count(*) FROM public.entity_relations WHERE target_id = c.id AND relation_type = 'member_of')
             ))
              FROM public.unified_entities c 
              JOIN public.entity_relations er ON c.id = er.target_id 
              WHERE er.source_id = u.id AND er.relation_type = 'member_of') as circles
      FROM public.users u
      WHERE u.id = $1
    `;
    const userRows = await prisma.$queryRawUnsafe<any[]>(userQuery, userId);

    if (userRows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userRows[0];
    if (!user.metadata || typeof user.metadata !== 'object') {
      user.metadata = {};
    }

    // Connected apps
    const appRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT a.id AS "appId", a.name AS "appName", MIN(ue.created_at) AS "joinedAt"
       FROM public.unified_entities ue
       JOIN public.applications a ON a.id = ue.application_id
       WHERE ue.owner_id = $1 AND ue.application_id IS NOT NULL AND a.is_active = true
       GROUP BY a.id, a.name
       ORDER BY "joinedAt" ASC`,
      userId
    );
    user.metadata.apps = (appRows || []).map((row: any) => ({
      appId: row.appId,
      appName: row.appName,
      joinedAt: row.joinedAt,
      role: 'member',
    }));

    // Subscription
    const subRows = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM public.subscriptions WHERE user_id = $1 LIMIT 1',
      userId
    );

    // Recent activity
    const recentAlerts = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM public.unified_entities WHERE owner_id = $1 AND type = 'safety_alert' AND data->>'type' = 'emergency' ORDER BY created_at DESC LIMIT 5",
      userId
    );

    const recentSafetyChecks = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM public.unified_entities WHERE owner_id = $1 AND type = 'safety_alert' AND data->>'type' = 'check_in' ORDER BY created_at DESC LIMIT 5",
      userId
    );

    return NextResponse.json({
      user,
      subscription: subRows[0] || null,
      recentActivity: {
        alerts: recentAlerts,
        safetyChecks: recentSafetyChecks,
      },
    });
  } catch (error: any) {
    console.error('Get user details error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { firstName, lastName, email, role, status, is_active, metadata, phone, notes } = await req.json();
    const userId = params.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phoneNumber = phone;

    if (is_active !== undefined) {
      updateData.isActive = is_active;
    } else if (status !== undefined) {
      updateData.isActive = (status === 'active');
    }

    if (metadata !== undefined) updateData.preferences = metadata;
    // Notes field mapping if it exists in schema
    // if (notes !== undefined) updateData.adminNotes = notes;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    const rows = await prisma.$queryRawUnsafe<any[]>(
      'SELECT *, phone_number as "phone", preferences as metadata, (CASE WHEN is_active THEN \'active\' ELSE \'inactive\' END) as status FROM public.users WHERE id = $1', 
      userId
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: rows[0]
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:delete')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const userId = params.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Protection for admin deletion (simplified check)
    if (user.email?.includes('admin') || user.id === 'admin') {
      return NextResponse.json({ message: 'Cannot delete admin user' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
