import { NextRequest, NextResponse } from 'next/server';
import { appConfigController } from '@/server/controllers/admin/AppConfigController';

export async function GET(req: NextRequest) {
  // Public route, no authentication
  // Note: Express controller expects req.query and res.json
  // We'll simulate the Express-like call or call the controller method directly.
  // The controller is a class, so we use the instance exported.
  
  // Create a mock response object
  let responseData: any = null;
  const res: any = {
    json: (data: any) => { responseData = data; return res; },
    status: (code: number) => { return res; }
  };

  // Extract query params
  const { searchParams } = new URL(req.url);
  const query: any = {};
  searchParams.forEach((val, key) => query[key] = val);

  await appConfigController.getAppConfig({ query } as any, res as any);
  
  return NextResponse.json(responseData);
}
