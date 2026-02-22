import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { appConfigController } from '@/server/controllers/admin/AppConfigController';

export async function PUT(req: NextRequest, { params }: { params: { screenKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  let responseData: any = null;
  const res: any = {
    json: (data: any) => { responseData = data; return res; },
    status: (code: number) => { return res; }
  };

  const body = await req.json();
  const { screenKey } = params;

  await appConfigController.updateScreenConfig({ body, params: { screenKey } } as any, res as any);
  
  return NextResponse.json(responseData);
}
