/**
 * API Monitoring Middleware
 * Tracks API response times and success rates
 */

import { NextRequest, NextResponse } from 'next/server'

interface APIMetrics {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
}

class APIMonitor {
  private metrics: APIMetrics[] = []
  private maxMetrics = 1000

  /**
   * Track API call
   */
  track(endpoint: string, method: string, duration: number, status: number) {
    this.metrics.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
    })

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`⚠️ Slow API: ${method} ${endpoint} took ${duration.toFixed(0)}ms`)
    }

    // Log errors
    if (status >= 400) {
      console.error(`❌ API Error: ${method} ${endpoint} returned ${status}`)
    }
  }

  /**
   * Get metrics for specific endpoint
   */
  getMetrics(endpoint?: string) {
    if (endpoint) {
      return this.metrics.filter((m) => m.endpoint === endpoint)
    }
    return this.metrics
  }

  /**
   * Get statistics
   */
  getStats(endpoint?: string) {
    const metrics = this.getMetrics(endpoint)

    if (metrics.length === 0) {
      return null
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b)
    const sum = durations.reduce((a, b) => a + b, 0)
    const successCount = metrics.filter((m) => m.status >= 200 && m.status < 300).length

    return {
      count: metrics.length,
      avgDuration: sum / metrics.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      successRate: (successCount / metrics.length) * 100,
      errorRate: ((metrics.length - successCount) / metrics.length) * 100,
    }
  }

  /**
   * Get all endpoint statistics
   */
  getAllStats() {
    const endpointGroups = this.metrics.reduce((acc: Record<string, APIMetrics[]>, metric) => {
      if (!acc[metric.endpoint]) {
        acc[metric.endpoint] = []
      }
      acc[metric.endpoint].push(metric)
      return acc
    }, {})

    const stats: Record<string, any> = {}
    Object.keys(endpointGroups).forEach((endpoint) => {
      stats[endpoint] = this.getStats(endpoint)
    })

    return stats
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = []
  }
}

// Export singleton instance
export const apiMonitor = new APIMonitor()

/**
 * Middleware wrapper for Next.js API routes
 */
export function withAPIMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = performance.now()
    const endpoint = req.nextUrl.pathname
    const method = req.method

    try {
      const response = await handler(req)
      const duration = performance.now() - startTime

      // Track the call
      apiMonitor.track(endpoint, method, duration, response.status)

      // Add performance headers
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
      response.headers.set('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

      return response
    } catch (error) {
      const duration = performance.now() - startTime
      apiMonitor.track(endpoint, method, duration, 500)

      throw error
    }
  }
}

/**
 * Log performance summary
 */
export function logPerformanceSummary() {
  const stats = apiMonitor.getAllStats()

  console.log('\n📊 API Performance Summary:')
  console.log('=' .repeat(60))

  Object.entries(stats).forEach(([endpoint, stat]) => {
    if (!stat) return

    const avgTime = stat.avgDuration.toFixed(0)
    const p95Time = stat.p95.toFixed(0)
    const successRate = stat.successRate.toFixed(1)

    console.log(`\n${endpoint}`)
    console.log(`  Calls: ${stat.count}`)
    console.log(`  Avg: ${avgTime}ms | P95: ${p95Time}ms | Success: ${successRate}%`)

    if (stat.errorRate > 5) {
      console.log(`  ⚠️ High error rate: ${stat.errorRate.toFixed(1)}%`)
    }
    if (stat.p95 > 1000) {
      console.log(`  ⚠️ Slow endpoint: P95 > 1s`)
    }
  })

  console.log('\n' + '='.repeat(60) + '\n')
}

// Log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(logPerformanceSummary, 5 * 60 * 1000)
}
