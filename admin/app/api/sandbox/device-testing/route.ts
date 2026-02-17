import { NextRequest, NextResponse } from 'next/server'

// Device testing engine
interface DeviceProfile {
  id: string
  name: string
  type: 'mobile' | 'tablet' | 'desktop'
  userAgent: string
  viewport: { width: number; height: number }
  pixelRatio: number
  capabilities: {
    touch: boolean
    geolocation: boolean
    camera: boolean
    bluetooth: boolean
    webgl: boolean
    webrtc: boolean
  }
  browser: string
  os: string
  screen: {
    resolution: string
    colorDepth: number
    orientation: 'portrait' | 'landscape'
  }
}

interface DeviceTest {
  id: string
  deviceId: string
  url: string
  timestamp: string
  results: {
    layout: {
      viewportFit: boolean
      overflow: boolean
      responsiveBreakpoints: boolean
      touchTargets: boolean
    }
    performance: {
      loadTime: number
      renderTime: number
      memoryUsage: number
      cpuUsage: number
    }
    compatibility: {
      cssSupport: string[]
      jsSupport: string[]
      apiSupport: string[]
    }
    usability: {
      touchOptimized: boolean
      readableText: boolean
      accessible: boolean
      errorFree: boolean
    }
  }
  score: number
  issues: string[]
}

// Device profiles database
const deviceProfiles: DeviceProfile[] = [
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    pixelRatio: 3,
    capabilities: {
      touch: true,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Safari',
    os: 'iOS 16.0',
    screen: {
      resolution: '1179x2556',
      colorDepth: 24,
      orientation: 'portrait'
    }
  },
  {
    id: 'samsung-s23',
    name: 'Samsung Galaxy S23',
    type: 'mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    viewport: { width: 360, height: 780 },
    pixelRatio: 3,
    capabilities: {
      touch: true,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Chrome',
    os: 'Android 13',
    screen: {
      resolution: '1080x2400',
      colorDepth: 24,
      orientation: 'portrait'
    }
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro 12.9"',
    type: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 1024, height: 1366 },
    pixelRatio: 2,
    capabilities: {
      touch: true,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Safari',
    os: 'iPadOS 16.0',
    screen: {
      resolution: '2048x2732',
      colorDepth: 24,
      orientation: 'portrait'
    }
  },
  {
    id: 'surface-pro',
    name: 'Microsoft Surface Pro',
    type: 'tablet',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:112.0) Gecko/20100101 Firefox/112.0',
    viewport: { width: 768, height: 1024 },
    pixelRatio: 2,
    capabilities: {
      touch: true,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Firefox',
    os: 'Windows 11',
    screen: {
      resolution: '2736x1824',
      colorDepth: 24,
      orientation: 'portrait'
    }
  },
  {
    id: 'macbook-pro',
    name: 'MacBook Pro 16"',
    type: 'desktop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    viewport: { width: 1512, height: 982 },
    pixelRatio: 2,
    capabilities: {
      touch: false,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Chrome',
    os: 'macOS Monterey',
    screen: {
      resolution: '3024x1964',
      colorDepth: 24,
      orientation: 'landscape'
    }
  },
  {
    id: 'windows-desktop',
    name: 'Windows Desktop',
    type: 'desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    pixelRatio: 1,
    capabilities: {
      touch: false,
      geolocation: true,
      camera: true,
      bluetooth: true,
      webgl: true,
      webrtc: true
    },
    browser: 'Chrome',
    os: 'Windows 11',
    screen: {
      resolution: '1920x1080',
      colorDepth: 24,
      orientation: 'landscape'
    }
  }
]

// Device test results storage
const deviceTests: DeviceTest[] = []

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const deviceId = searchParams.get('deviceId')
  const testId = searchParams.get('testId')
  const action = searchParams.get('action')

  try {
    if (action === 'devices') {
      return NextResponse.json({
        success: true,
        data: deviceProfiles
      })
    }

    if (deviceId) {
      const device = deviceProfiles.find(d => d.id === deviceId)
      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: device
      })
    }

    if (testId) {
      const test = deviceTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: test
      })
    }

    if (action === 'recent') {
      return NextResponse.json({
        success: true,
        data: deviceTests.slice(-20).reverse()
      })
    }

    return NextResponse.json({
      success: true,
      data: deviceTests
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch device testing data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, url, tests } = body

    if (!deviceId || !url) {
      return NextResponse.json(
        { success: false, error: 'Device ID and URL are required' },
        { status: 400 }
      )
    }

    const device = deviceProfiles.find(d => d.id === deviceId)
    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      )
    }

    // Create new device test
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate device testing
    await new Promise(resolve => setTimeout(resolve, 2500))

    const results = simulateDeviceTest(device, url, tests)
    const score = calculateDeviceScore(results)
    const issues = extractDeviceIssues(results)

    const test: DeviceTest = {
      id: testId,
      deviceId,
      url,
      timestamp: new Date().toISOString(),
      results,
      score,
      issues
    }

    deviceTests.push(test)

    return NextResponse.json({
      success: true,
      data: test,
      message: 'Device test completed successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform device test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, testId, data } = body

    if (action === 'compare' && testId) {
      const test = deviceTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      // Compare with other devices
      const device = deviceProfiles.find(d => d.id === test.deviceId)
      const otherDeviceTests = deviceTests.filter(t => 
        t.url === test.url && t.deviceId !== test.deviceId
      )

      const comparison = {
        currentTest: test,
        device: device,
        comparisons: otherDeviceTests.map(otherTest => {
          const otherDevice = deviceProfiles.find(d => d.id === otherTest.deviceId)!
          return {
            device: otherDevice,
            test: otherTest,
            scoreDifference: test.score - otherTest.score,
            betterIn: getBetterCategories(test.results, otherTest.results),
            worseIn: getWorseCategories(test.results, otherTest.results)
          }
        }),
        summary: {
          averageScore: otherDeviceTests.length > 0 
            ? otherDeviceTests.reduce((sum, t) => sum + t.score, 0) / otherDeviceTests.length 
            : 0,
          ranking: otherDeviceTests.filter(t => t.score > test.score).length + 1,
          totalCompared: otherDeviceTests.length
        }
      }

      return NextResponse.json({
        success: true,
        data: comparison
      })
    }

    if (action === 'generate_report' && testId) {
      const test = deviceTests.find(t => t.id === testId)
      if (!test) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        )
      }

      const device = deviceProfiles.find(d => d.id === test.deviceId)!

      const report = {
        testId: test.id,
        timestamp: test.timestamp,
        url: test.url,
        device: device,
        overallScore: test.score,
        summary: {
          layoutScore: calculateCategoryScore(test.results.layout),
          performanceScore: calculateCategoryScore(test.results.performance),
          compatibilityScore: calculateCategoryScore(test.results.compatibility),
          usabilityScore: calculateCategoryScore(test.results.usability)
        },
        detailedResults: test.results,
        issues: test.issues,
        recommendations: generateDeviceRecommendations(test, device),
        optimizationSuggestions: generateOptimizationSuggestions(test, device)
      }

      return NextResponse.json({
        success: true,
        data: report
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process device testing request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function simulateDeviceTest(device: DeviceProfile, url: string, testTypes?: string[]) {
  const random = Math.random()
  
  return {
    layout: {
      viewportFit: random > 0.2,
      overflow: random > 0.7,
      responsiveBreakpoints: random > 0.3,
      touchTargets: device.capabilities.touch ? random > 0.4 : true
    },
    performance: {
      loadTime: device.type === 'mobile' ? 2.5 + random * 2 : device.type === 'tablet' ? 2.0 + random * 1.5 : 1.5 + random,
      renderTime: device.type === 'mobile' ? 1.2 + random : 0.8 + random * 0.5,
      memoryUsage: device.type === 'mobile' ? 45 + random * 30 : device.type === 'tablet' ? 35 + random * 25 : 25 + random * 20,
      cpuUsage: 15 + random * 25
    },
    compatibility: {
      cssSupport: device.browser === 'Chrome' ? ['grid', 'flexbox', 'variables'] : ['flexbox', 'variables'],
      jsSupport: device.browser === 'Chrome' ? ['es2020', 'modules', 'async'] : ['es2018', 'async'],
      apiSupport: device.capabilities.touch ? ['touch', 'geolocation'] : ['geolocation']
    },
    usability: {
      touchOptimized: device.capabilities.touch ? random > 0.3 : true,
      readableText: random > 0.2,
      accessible: random > 0.4,
      errorFree: random > 0.3
    }
  }
}

function calculateDeviceScore(results: any): number {
  const layoutScore = calculateCategoryScore(results.layout)
  const performanceScore = calculateCategoryScore(results.performance)
  const compatibilityScore = calculateCategoryScore(results.compatibility)
  const usabilityScore = calculateCategoryScore(results.usability)
  
  return Math.round((layoutScore + performanceScore + compatibilityScore + usabilityScore) / 4)
}

function calculateCategoryScore(category: any): number {
  const values = Object.values(category)
  const booleanValues = values.map(v => typeof v === 'boolean' ? (v ? 100 : 0) : (v as number))
  return Math.round(booleanValues.reduce((sum: number, val: number) => sum + val, 0) / booleanValues.length)
}

function extractDeviceIssues(results: any): string[] {
  const issues: string[] = []
  
  if (!results.layout.viewportFit) issues.push('Content does not fit viewport properly')
  if (results.layout.overflow) issues.push('Horizontal overflow detected')
  if (!results.layout.responsiveBreakpoints) issues.push('Responsive breakpoints not working')
  if (!results.layout.touchTargets) issues.push('Touch targets too small for mobile')
  if (results.performance.loadTime > 3) issues.push('Slow load time detected')
  if (results.performance.memoryUsage > 80) issues.push('High memory usage')
  if (!results.usability.touchOptimized) issues.push('Interface not touch-optimized')
  if (!results.usability.readableText) issues.push('Text readability issues')
  if (!results.usability.accessible) issues.push('Accessibility issues detected')
  if (!results.usability.errorFree) issues.push('JavaScript errors detected')
  
  return issues
}

function getBetterCategories(results1: any, results2: any): string[] {
  const categories = []
  if (calculateCategoryScore(results1.layout) > calculateCategoryScore(results2.layout)) categories.push('Layout')
  if (calculateCategoryScore(results1.performance) > calculateCategoryScore(results2.performance)) categories.push('Performance')
  if (calculateCategoryScore(results1.compatibility) > calculateCategoryScore(results2.compatibility)) categories.push('Compatibility')
  if (calculateCategoryScore(results1.usability) > calculateCategoryScore(results2.usability)) categories.push('Usability')
  return categories
}

function getWorseCategories(results1: any, results2: any): string[] {
  return getBetterCategories(results2, results1)
}

function generateDeviceRecommendations(test: DeviceTest, device: DeviceProfile): any[] {
  const recommendations = []

  if (!test.results.layout.viewportFit) {
    recommendations.push({
      priority: 'high',
      category: 'Layout',
      action: 'Optimize layout for device viewport',
      details: `Content does not fit properly on ${device.name} (${device.viewport.width}x${device.viewport.height})`
    })
  }

  if (test.results.performance.loadTime > 3) {
    recommendations.push({
      priority: 'high',
      category: 'Performance',
      action: 'Optimize loading performance',
      details: `Load time is ${test.results.performance.loadTime.toFixed(2)}s (target: <3s)`
    })
  }

  if (!test.results.usability.touchOptimized && device.capabilities.touch) {
    recommendations.push({
      priority: 'medium',
      category: 'Usability',
      action: 'Optimize touch interactions',
      details: 'Increase touch target sizes and improve touch responsiveness'
    })
  }

  return recommendations
}

function generateOptimizationSuggestions(test: DeviceTest, device: DeviceProfile): any[] {
  return [
    {
      category: 'Images',
      suggestions: device.type === 'mobile' 
        ? ['Use responsive images with srcset', 'Implement lazy loading', 'Optimize image formats for mobile']
        : ['Use WebP format for better compression', 'Implement progressive loading']
    },
    {
      category: 'CSS',
      suggestions: device.type === 'mobile'
        ? ['Use mobile-first CSS approach', 'Optimize critical CSS', 'Reduce CSS file size']
        : ['Use CSS Grid for complex layouts', 'Implement CSS custom properties']
    },
    {
      category: 'JavaScript',
      suggestions: device.type === 'mobile'
        ? ['Reduce JavaScript bundle size', 'Implement code splitting', 'Use tree shaking']
        : ['Optimize JavaScript execution', 'Implement service workers']
    },
    {
      category: 'Network',
      suggestions: device.type === 'mobile'
        ? ['Implement HTTP/2 or HTTP/3', 'Use CDN for static assets', 'Enable compression']
        : ['Optimize caching strategies', 'Implement resource hints']
    }
  ]
}
