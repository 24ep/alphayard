import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import ApplicationService from '@/server/services/ApplicationService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'applications:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;

    const result = await ApplicationService.getApplicationUsers(params.id, {
      limit,
      offset,
      status
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get application users error:', error);
    return NextResponse.json({ error: 'Failed to fetch application users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'applications:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { user_id, role = 'member' } = await req.json();
    if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

    const success = await ApplicationService.assignUserToApplication({
      userId: user_id,
      applicationId: params.id,
      role,
      status: 'active'
    });
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to assign user' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'User assigned to application' });
  } catch (error) {
    console.error('Assign user to application error:', error);
    return NextResponse.json({ error: 'Failed to assign user' }, { status: 500 });
  }
}
