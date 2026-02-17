import { NextRequest, NextResponse } from 'next/server'

// Mock A/B testing database
const abTests = [
  {
    id: 'login-button-color',
    name: 'Login Button Color',
    description: 'Test different button colors for login',
    status: 'active',
    variants: [
      {
        id: 'control-blue',
        name: 'Control - Blue',
        description: 'Current blue button',
        weight: 34,
        conversions: 142,
        visitors: 3333,
        conversionRate: 4.26
      },
      {
        id: 'test-green',
        name: 'Test - Green',
        description: 'Green primary button',
        weight: 33,
        conversions: 158,
        visitors: 3242,
        conversionRate: 4.87
      },
      {
        id: 'test-purple',
        name: 'Test - Purple',
        description: 'Purple gradient button',
        weight: 33,
        conversions: 171,
        visitors: 3225,
        conversionRate: 5.31
      }
    ],
    startDate: '2024-02-10',
    endDate: '2024-02-24',
    totalVisitors: 9800,
    totalConversions: 471,
    confidence: 92.3,
    winner: 'test-purple'
  },
  {
    id: 'social-login-layout',
    name: 'Social Login Layout',
    description: 'Test different social login button arrangements',
    status: 'completed',
    variants: [
      {
        id: 'icons-only',
        name: 'Icons Only',
        description: 'Icon-only social buttons',
        weight: 50,
        conversions: 198,
        visitors: 5234,
        conversionRate: 3.78
      },
      {
        id: 'text-icons',
        name: 'Text + Icons',
        description: 'Text with icon buttons',
        weight: 50,
        conversions: 234,
        visitors: 5178,
        conversionRate: 4.52
      }
    ],
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    totalVisitors: 10412,
    totalConversions: 432,
    confidence: 87.6,
    winner: 'text-icons'
  }
]

// Store test events
const testEvents = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const testId = searchParams.get('testId')
  const action = searchParams.get('action')

  try {
    if (action === 'list') {
      return NextResponse.json({
        success: true,
        data: abTests.map(test => ({
          id: test.id,
          name: test.name,
          description: test.description,
          status: test.status,
          totalVisitors: test.totalVisitors,
          totalConversions: test.totalConversions,
          confidence: test.confidence,
          winner: test.winner
        }))
      })
    }

    if (testId) {
      const test = abTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      if (action === 'assign') {
        // Assign user to a variant based on weights
        const random = Math.random() * 100
        let cumulative = 0
        let selectedVariant = test.variants[0]

        for (const variant of test.variants) {
          cumulative += variant.weight
          if (random <= cumulative) {
            selectedVariant = variant
            break
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            testId: test.id,
            variant: selectedVariant,
            assignmentId: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: test
      })
    }

    return NextResponse.json({
      success: true,
      data: abTests
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch A/B test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, variantId, event, data, assignmentId } = body

    // Validate required fields
    if (!testId || !variantId || !event) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: testId, variantId, event' },
        { status: 400 }
      )
    }

    // Find the test
    const test = abTests.find(t => t.id === testId)
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      )
    }

    // Find the variant
    const variant = test.variants.find(v => v.id === variantId)
    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      )
    }

    // Store the event
    if (!testEvents.has(testId)) {
      testEvents.set(testId, [])
    }
    
    const eventData = {
      variantId,
      event,
      data,
      assignmentId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }

    testEvents.get(testId)!.push(eventData)

    // Update variant statistics for conversion events
    if (event === 'conversion') {
      variant.conversions += 1
      variant.conversionRate = (variant.conversions / variant.visitors) * 100
      
      // Update test totals
      test.totalConversions += 1
      
      // Recalculate confidence and winner
      updateTestStatistics(test)
    }

    return NextResponse.json({
      success: true,
      message: 'Event recorded successfully',
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record A/B test event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, action, data } = body

    if (action === 'create') {
      // Create new A/B test
      const newTest = {
        id: data.id || `test_${Date.now()}`,
        name: data.name,
        description: data.description,
        status: 'draft',
        variants: data.variants.map((v: any) => ({
          ...v,
          conversions: 0,
          visitors: 0,
          conversionRate: 0
        })),
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate,
        totalVisitors: 0,
        totalConversions: 0,
        confidence: 0,
        winner: ''
      }

      abTests.push(newTest)

      return NextResponse.json({
        success: true,
        data: newTest
      })
    }

    if (action === 'start' && testId) {
      const test = abTests.find(t => t.id === testId)
      if (test) {
        test.status = 'active'
        test.startDate = new Date().toISOString().split('T')[0]
      }
    }

    if (action === 'stop' && testId) {
      const test = abTests.find(t => t.id === testId)
      if (test) {
        test.status = 'completed'
        test.endDate = new Date().toISOString().split('T')[0]
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test updated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update A/B test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function updateTestStatistics(test: any) {
  // Calculate confidence using simple statistical test
  const totalConversions = test.variants.reduce((sum: number, v: any) => sum + v.conversions, 0)
  const totalVisitors = test.variants.reduce((sum: number, v: any) => sum + v.visitors, 0)
  
  if (totalConversions < 10) {
    test.confidence = 0
    test.winner = null
    return
  }

  // Find best performing variant
  const bestVariant = test.variants.reduce((best: any, current: any) => 
    current.conversionRate > best.conversionRate ? current : best
  )

  // Simple confidence calculation (in production, use proper statistical tests)
  test.confidence = Math.min(95, (totalConversions / totalVisitors) * 100 * 10)
  test.winner = test.confidence > 80 ? bestVariant.id : null
}
