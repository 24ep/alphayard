import { NextRequest, NextResponse } from 'next/server';
import { appConfigController } from '@/server/controllers/admin/AppConfigController';

export async function GET(req: NextRequest) {
  let responseData: any = null;
  const res: any = {
    json: (data: any) => { responseData = data; return res; },
    status: (code: number) => { return res; }
  };

  const { searchParams } = new URL(req.url);
  const query: any = {};
  searchParams.forEach((val, key) => query[key] = val);

  await appConfigController.getFeatureFlags({ query } as any, res as any);
  
  return NextResponse.json(responseData);
}
