import { NextRequest, NextResponse } from 'next/server';
import ssoProviderService from '@/server/services/SSOProviderService';

export async function GET(request: NextRequest) {
  try {
    const jwks = await ssoProviderService.getJwks();
    return NextResponse.json(jwks, {
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error: any) {
    console.error('[jwks] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
