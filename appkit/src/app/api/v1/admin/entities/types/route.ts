import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import entityService from '@/server/services/EntityService';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'collections:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');
    const types = await entityService.listEntityTypes(applicationId || undefined);
    return NextResponse.json({ success: true, types });
  } catch (error: any) {
    console.error('List entity types error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // Note: createEntityType route in Express didn't explicitly check a permission in the middleware call, 
  // but it's good practice. Based on entityRoutes.ts, it was just authenticated.
  
  try {
    const { name, displayName, description, applicationId, schema, icon } = await req.json();

    if (!name || !displayName) {
      return NextResponse.json({ error: 'Name and displayName are required' }, { status: 400 });
    }

    const entityType = await entityService.createEntityType({
      name,
      displayName,
      description,
      applicationId,
      schema,
      icon
    });

    return NextResponse.json({ entityType }, { status: 201 });
  } catch (error: any) {
    console.error('Create entity type error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
