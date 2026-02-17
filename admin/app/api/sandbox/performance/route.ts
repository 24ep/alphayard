import { NextRequest, NextResponse } from 'next/server'

// Performance metrics storage
const performanceMetrics = {
  pageLoad: [
    { timestamp: '2024-02-17T10:00:00Z', url: '/login', loadTime: 1.2, renderTime: 0.8, resources: 12 },
    { timestamp: '2024-02-17T10:05:00Z', url: '/signup', loadTime: 1.4, renderTime: 0.9, resources: 15 },
    { timestamp: '2024-02-17T10:10:00Z', url: '/dashboard', loadTime: 2.1, renderTime: 1.3, resources: 28 },
    { timestamp: '2024-02-17T10:15:00Z', url: '/profile', loadTime: 1.8, renderTime: 1.1, resources: 22 },
    { timestamp: '2024-02-17T10:20:00Z', url: '/settings', loadTime: 1.6, renderTime: 1.0, resources: 18 }
  ],
  bundleSize: {
    total: 245.6,
    chunks: [
      { name: 'main.js', size: 89.2, gzipped: 28.4 },
      { name: 'vendor.js', size: 124.8, gzipped: 41.2 },
      { name: 'styles.css', size: 18.6, gzipped: 6.8 },
      { name: 'runtime.js', size: 13.0, gzipped: 4.9 }
    ]
  },
  lighthouse: {
    performance: 92,
    accessibility: 88,
    bestPractices: 94,
    seo: 96,
    pwa: 78
  },
  vitals: {
    lcp: { value: 1.8, rating: 'good', target: 2.5 },
    fid: { value: 45, rating: 'good', target: 100 },
    cls: { value: 0.08, rating: 'good', target: 0.1 },
    ttfb: { value: 120, rating: 'good', target: 800 }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const metric = searchParams.get('metric')
  const timeRange = searchParams.get('timeRange') || '1h'

  try {
    if (metric === 'pageLoad') {
      return NextResponse.json({
        success: true,
        data: performanceMetrics.pageLoad.slice(-10),
        summary: {
          avgLoadTime: performanceMetrics.pageLoad.reduce((sum, item) => sum + item.loadTime, 0) / performanceMetrics.pageLoad.length,
          avgRenderTime: performanceMetrics.pageLoad.reduce((sum, item) => sum + item.renderTime, 0) / performanceMetrics.pageLoad.length,
          totalResources: performanceMetrics.pageLoad.reduce((sum, item) => sum + item.resources, 0)
        }
      })
    }

    if (metric === 'bundleSize') {
      return NextResponse.json({
        success: true,
        data: performanceMetrics.bundleSize
      })
    }

    if (metric === 'lighthouse') {
      return NextResponse.json({
        success: true,
        data: performanceMetrics.lighthouse,
        recommendations: generateLighthouseRecommendations(performanceMetrics.lighthouse)
      })
    }

    if (metric === 'vitals') {
      return NextResponse.json({
        success: true,
        data: performanceMetrics.vitals
      })
    }

    // Return all metrics
    return NextResponse.json({
      success: true,
      data: performanceMetrics,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, metrics, url } = body

    // Store the performance metrics
    if (type === 'pageLoad') {
      const newMetric = {
        timestamp: new Date().toISOString(),
        url: url || 'unknown',
        loadTime: metrics.loadTime,
        renderTime: metrics.renderTime,
        resources: metrics.resources || 0
      }

      performanceMetrics.pageLoad.push(newMetric)
      
      // Keep only last 100 metrics
      if (performanceMetrics.pageLoad.length > 100) {
        performanceMetrics.pageLoad = performanceMetrics.pageLoad.slice(-100)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Performance metrics recorded successfully',
      metricId: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'analyze') {
      // Simulate performance analysis
      const analysis = {
        score: calculatePerformanceScore(),
        issues: detectPerformanceIssues(),
        optimizations: generateOptimizationSuggestions(),
        estimatedImprovement: Math.floor(Math.random() * 30) + 10
      }

      return NextResponse.json({
        success: true,
        data: analysis
      })
    }

    if (action === 'optimize') {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        message: 'Performance optimization completed',
        improvements: [
          'Reduced bundle size by 15%',
          'Improved LCP by 200ms',
          'Optimized image loading',
          'Minimized CSS and JS'
        ]
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
        error: 'Failed to process performance request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateLighthouseRecommendations(scores: any) {
  const recommendations = []

  if (scores.performance < 90) {
    recommendations.push({
      category: 'Performance',
      priority: 'high',
      description: 'Optimize images and reduce bundle size',
      impact: '15-25% improvement'
    })
  }

  if (scores.accessibility < 90) {
    recommendations.push({
      category: 'Accessibility',
      priority: 'medium',
      description: 'Add alt text to images and improve color contrast',
      impact: '5-10% improvement'
    })
  }

  if (scores.bestPractices < 95) {
    recommendations.push({
      category: 'Best Practices',
      priority: 'low',
      description: 'Update dependencies and enable HTTPS',
      impact: '3-5% improvement'
    })
  }

  return recommendations
}

function calculatePerformanceScore(): number {
  const avgLoadTime = performanceMetrics.pageLoad.reduce((sum, item) => sum + item.loadTime, 0) / performanceMetrics.pageLoad.length
  const baseScore = 100
  const penalty = Math.max(0, (avgLoadTime - 1) * 10)
  return Math.max(0, Math.floor(baseScore - penalty))
}

function detectPerformanceIssues(): any[] {
  const issues = []

  const avgLoadTime = performanceMetrics.pageLoad.reduce((sum, item) => sum + item.loadTime, 0) / performanceMetrics.pageLoad.length
  if (avgLoadTime > 2) {
    issues.push({
      type: 'slow_load_time',
      severity: 'high',
      description: `Average load time is ${avgLoadTime.toFixed(2)}s (target: <2s)`,
      recommendation: 'Optimize images, reduce bundle size, enable compression'
    })
  }

  const totalBundleSize = performanceMetrics.bundleSize.total
  if (totalBundleSize > 200) {
    issues.push({
      type: 'large_bundle',
      severity: 'medium',
      description: `Bundle size is ${totalBundleSize}KB (target: <200KB)`,
      recommendation: 'Remove unused dependencies, implement code splitting'
    })
  }

  return issues
}

function generateOptimizationSuggestions(): any[] {
  return [
    {
      category: 'Images',
      suggestions: [
        'Use WebP format for better compression',
        'Implement lazy loading for below-fold images',
        'Add responsive images with srcset'
      ]
    },
    {
      category: 'JavaScript',
      suggestions: [
        'Implement code splitting for routes',
        'Remove unused dependencies',
        'Use dynamic imports for heavy components'
      ]
    },
    {
      category: 'CSS',
      suggestions: [
        'Minimize and compress CSS files',
        'Remove unused CSS rules',
        'Use CSS-in-JS for better tree shaking'
      ]
    },
    {
      category: 'Network',
      suggestions: [
        'Enable HTTP/2 or HTTP/3',
        'Implement proper caching headers',
        'Use CDN for static assets'
      ]
    }
  ]
}
