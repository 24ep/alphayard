import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // In a real application, you would query the database for activity logs related to this app ID.
    // For now, we return an empty array or mock data to prevent 404s in the dashboard UI.
    const mockActivity = [
      { id: '1', action: 'Application viewed', user: 'admin', timestamp: new Date().toISOString(), type: 'config' }
    ];

    return NextResponse.json({ entries: mockActivity });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
