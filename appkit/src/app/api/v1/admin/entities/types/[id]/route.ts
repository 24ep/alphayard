import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import entityService from '@/server/services/EntityService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'collections:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const entityType = await entityService.getEntityTypeById(params.id);
    if (!entityType) {
      return NextResponse.json({ error: 'Entity type not found' }, { status: 404 });
    }
    return NextResponse.json({ entityType });
  } catch (error: any) {
    console.error('Get entity type error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'collections:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { displayName, description, schema, icon } = await req.json();
    const entityType = await entityService.updateEntityType(params.id, {
      displayName,
      description,
      schema,
      icon
    });

    if (!entityType) {
      return NextResponse.json({ error: 'Entity type not found' }, { status: 404 });
    }

    return NextResponse.json({ entityType });
  } catch (error: any) {
    console.error('Update entity type error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'collections:delete')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const success = await entityService.deleteEntityType(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Entity type not found or cannot be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Entity type deleted successfully' });
  } catch (error: any) {
    console.error('Delete entity type error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
