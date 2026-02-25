import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Mock user details response
    const user = {
      id: userId,
      email: 'alex@example.com',
      name: 'Alex Developer',
      status: 'active',
      plan: 'pro',
      joinedAt: '2023-11-15T10:00:00Z',
      lastActive: new Date().toISOString(),
      avatar: '',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Lane, Innovation City, CA 94000',
      company: 'Acme Corp',
      role: 'Admin'
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}
