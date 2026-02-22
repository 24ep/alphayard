import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'localization:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  const timezones = [
    { id: 'America/New_York', name: 'Eastern Time', offset: 'UTC-05:00', region: 'North America' },
    { id: 'America/Los_Angeles', name: 'Pacific Time', offset: 'UTC-08:00', region: 'North America' },
    { id: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+00:00', region: 'Europe' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+09:00', region: 'Asia' },
    { id: 'Asia/Bangkok', name: 'Thailand Time', offset: 'UTC+07:00', region: 'Asia' },
  ];
  return NextResponse.json({ timezones });
}
