import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import entityService from '@/server/services/EntityService';

export async function GET(req: NextRequest, { params }: { params: { typeName: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { typeName } = params;
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get('applicationId');
  const ownerId = searchParams.get('ownerId');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const orderBy = searchParams.get('orderBy');
  const orderDir = searchParams.get('orderDir') as 'asc' | 'desc';
  const search = searchParams.get('search');

  try {
    // If search term provided, use search
    if (search) {
      const entities = await entityService.searchEntities(typeName, search, {
        applicationId: applicationId || undefined,
        limit
      });
      
      const entityType = await entityService.getEntityType(typeName);
      const responseKey = entityType?.responseKey || 'entities';
      
      return NextResponse.json({ 
        [responseKey]: entities, 
        total: entities.length 
      });
    }

    // Otherwise, use standard query
    const result = await entityService.queryEntities(typeName, {
      applicationId: applicationId || undefined,
      ownerId: ownerId || undefined,
      status: status || undefined,
      page,
      limit,
      orderBy: orderBy || undefined,
      orderDir
    });

    const entityType = await entityService.getEntityType(typeName);
    const responseKey = entityType?.responseKey || 'entities';
    
    return NextResponse.json({
      [responseKey]: result.entities,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error: any) {
    console.error('Query entities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { typeName: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { typeName } = params;
    const body = await req.json();
    const { applicationId, ownerId, attributes, metadata, ...other } = body;

    const effectiveAttributes = attributes || other;

    const entity = await entityService.createEntity({
      typeName,
      applicationId,
      ownerId,
      attributes: effectiveAttributes || {},
      metadata
    });

    return NextResponse.json({ entity }, { status: 201 });
  } catch (error: any) {
    console.error('Create entity error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
