import { NextResponse } from 'next/server'
import prisma from '@/server/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Fetch user's active subscription and billing details
    const activeSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: userId,
        status: 'active'
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!activeSubscription || !activeSubscription.plan) {
      // Return a default "Free" plan if no active subscription found
      return NextResponse.json({
        billing: {
          plan: 'free',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
          amount: 0,
          currency: 'usd',
          paymentMethod: { type: 'card', last4: '0000', brand: 'None' },
          usage: { users: 0, storage: 0, bandwidth: 0, apiCalls: 0 },
          limits: { users: 5, storage: 50, bandwidth: 100, apiCalls: 10000 }
        }
      })
    }

    // Safely parse metadata and limits
    const metadata = activeSubscription.metadata as any || {}
    const limits = activeSubscription.plan.limits as any || {
      users: 100, storage: 500, bandwidth: 1000, apiCalls: 1000000
    }
    const usage = metadata.usage || { users: 1, storage: 1, bandwidth: 1, apiCalls: 1000 }

    // Map Prisma Subscription data to the frontend BillingInfo
    const billing = {
      plan: activeSubscription.plan.slug || 'pro',
      status: activeSubscription.status,
      currentPeriodStart: activeSubscription.currentPeriodStart?.toISOString() || activeSubscription.createdAt.toISOString(),
      currentPeriodEnd: activeSubscription.currentPeriodEnd?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      nextBillingDate: activeSubscription.currentPeriodEnd?.toISOString() || undefined,
      amount: Number(activeSubscription.plan.priceMonthly) || 0,
      currency: activeSubscription.plan.currency || 'usd',
      paymentMethod: metadata.paymentMethod || {
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiry: '12/25'
      },
      usage: usage,
      limits: limits
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
