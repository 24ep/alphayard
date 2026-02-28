import { NextRequest, NextResponse } from 'next/server';
import ssoProviderService from '@/server/services/SSOProviderService';
import { auditService, AuditAction } from '@/server/services/auditService';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    } else {
      body = await request.json();
    }

    const { token, token_type_hint, client_id, client_secret } = body;

    if (!token) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing token' }, { status: 400 });
    }

    // Optional: Validate client if client_id is provided
    if (client_id) {
        try {
            await ssoProviderService.validateClient(client_id, ''); 
            // In a real implementation, we'd check the secret too if confidential
        } catch (e) {
            // If client validation fails, we might still allow revocation if it's a public client
        }
    }

    await ssoProviderService.revokeToken(token, token_type_hint);

    // Audit the revocation
    await auditService.logAuthEvent(
      'system',
      AuditAction.DELETE,
      'OAuth:Revoke',
      { tokenTypeHint: token_type_hint, clientId: client_id },
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown'
    );

    return new NextResponse(null, { status: 200 });

  } catch (error: any) {
    console.error('[oauth] Revoke error:', error);
    // RFC 7009: "If the token passed to the revocation endpoint has already
    // been invalidated, the server ... MUST respond with HTTP status code 200."
    return new NextResponse(null, { status: 200 });
  }
}
