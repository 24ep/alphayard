import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Mock billing information
    const billing = {
      plan: 'pro',
      status: 'active',
      currentPeriodStart: '2024-02-01T00:00:00Z',
      currentPeriodEnd: '2024-03-01T00:00:00Z',
      nextBillingDate: '2024-03-01T00:00:00Z',
      amount: 49.99,
      currency: 'usd',
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiry: '12/25'
      },
      usage: {
        users: 15,
        storage: 120, // GB
        bandwidth: 500, // GB
        apiCalls: 450000
      },
      limits: {
        users: 25,
        storage: 500, // GB
        bandwidth: 1000, // GB
        apiCalls: 1000000
      }
    }

    return NextResponse.json({ billing })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    )
  }
}
