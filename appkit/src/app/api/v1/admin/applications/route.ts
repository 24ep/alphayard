import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import ApplicationService from '@/server/services/ApplicationService';
import ApplicationModel from '@/server/models/ApplicationModel';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const myAppsOnly = searchParams.get('scope') === 'my-apps';

    if (myAppsOnly || !auth.admin.isSuperAdmin) {
      const adminId = auth.admin.adminId || auth.admin.id;
      const applications = await ApplicationService.getAdminApplications(adminId);
      return NextResponse.json({ applications });
    }

    // Super admins see all applications
    const applications = await ApplicationService.getAllApplications(true);
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('List applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const application = await ApplicationService.createApplication(body);
    
    // Auto-assign the creating admin to the new application
    if (application && auth.admin.adminId) {
      await ApplicationService.assignAdminToApplication({
        adminUserId: auth.admin.adminId,
        applicationId: application.id,
        role: 'super_admin',
        isPrimary: false,
        grantedBy: auth.admin.adminId
      });
    }
    
    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error('Create application error:', error);
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
