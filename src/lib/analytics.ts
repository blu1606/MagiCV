/**
 * Analytics & Performance Monitoring Service
 * Tracks user interactions, page views, and performance metrics
 */

// Analytics event types
export type AnalyticsEvent =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'cv_generated'
  | 'component_created'
  | 'component_edited'
  | 'component_deleted'
  | 'data_source_connected'
  | 'data_source_synced'
  | 'api_call'
  | 'error'
  | 'performance'

interface AnalyticsData {
  event: AnalyticsEvent
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
}

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

class AnalyticsService {
  private sessionId: string
  private userId?: string
  private events: AnalyticsData[] = []
  private performanceMetrics: PerformanceMetric[] = []
  private apiResponseTimes: Map<string, number[]> = new Map()

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeWebVitals()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId
  }

  /**
   * Track analytics event
   */
  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    const data: AnalyticsData = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.events.push(data)

    // Send to analytics service (if configured)
    this.sendToAnalytics(data)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', data)
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, properties?: Record<string, any>) {
    this.track('page_view', {
      path,
      referrer: document.referrer,
      ...properties,
    })
  }

  /**
   * Track button click
   */
  trackClick(buttonName: string, properties?: Record<string, any>) {
    this.track('button_click', {
      buttonName,
      ...properties,
    })
  }

  /**
   * Track API call with response time
   */
  trackAPICall(endpoint: string, method: string, duration: number, success: boolean) {
    // Store response time
    if (!this.apiResponseTimes.has(endpoint)) {
      this.apiResponseTimes.set(endpoint, [])
    }
    this.apiResponseTimes.get(endpoint)!.push(duration)

    this.track('api_call', {
      endpoint,
      method,
      duration,
      success,
      timestamp: Date.now(),
    })

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`)
    }
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    })

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
      console.error('Error tracked:', error)
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(name: string, value: number) {
    const rating = this.getPerformanceRating(name, value)

    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    }

    this.performanceMetrics.push(metric)

    this.track('performance', {
      metric: name,
      value,
      rating,
    })
  }

  /**
   * Get performance rating based on thresholds
   */
  private getPerformanceRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
      LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
      FID: { good: 100, poor: 300 },   // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
      TTFB: { good: 800, poor: 1800 }, // Time to First Byte
      INP: { good: 200, poor: 500 },   // Interaction to Next Paint
    }

    const threshold = thresholds[name]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals() {
    if (typeof window === 'undefined') return

    // Track page load time
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (perfData) {
        this.trackPerformance('page_load', perfData.loadEventEnd - perfData.fetchStart)
        this.trackPerformance('dom_interactive', perfData.domInteractive - perfData.fetchStart)
        this.trackPerformance('dom_complete', perfData.domComplete - perfData.fetchStart)
      }
    })

    // Track First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackPerformance('FCP', entry.startTime)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      // Not all browsers support this
    }
  }

  /**
   * Get API response time statistics
   */
  getAPIStats(endpoint?: string) {
    if (endpoint) {
      const times = this.apiResponseTimes.get(endpoint) || []
      return this.calculateStats(times)
    }

    // Return stats for all endpoints
    const allStats: Record<string, any> = {}
    this.apiResponseTimes.forEach((times, endpoint) => {
      allStats[endpoint] = this.calculateStats(times)
    })
    return allStats
  }

  /**
   * Calculate statistics from array of numbers
   */
  private calculateStats(numbers: number[]) {
    if (numbers.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 }
    }

    const sorted = [...numbers].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary: Record<string, any> = {}

    this.performanceMetrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          values: [],
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
        }
      }
      summary[metric.name].values.push(metric.value)
      summary[metric.name].ratings[metric.rating]++
    })

    // Calculate stats for each metric
    Object.keys(summary).forEach((key) => {
      summary[key].stats = this.calculateStats(summary[key].values)
    })

    return summary
  }

  /**
   * Send data to analytics service
   */
  private async sendToAnalytics(data: AnalyticsData) {
    // Skip in development
    if (process.env.NODE_ENV !== 'production') return

    try {
      // TODO: Send to your analytics service (Google Analytics, Mixpanel, etc.)
      // Example:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })
    } catch (error) {
      console.error('Failed to send analytics:', error)
    }
  }

  /**
   * Export all analytics data
   */
  exportData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      performanceMetrics: this.performanceMetrics,
      apiStats: this.getAPIStats(),
      performanceSummary: this.getPerformanceSummary(),
    }
  }

  /**
   * Clear analytics data
   */
  clear() {
    this.events = []
    this.performanceMetrics = []
    this.apiResponseTimes.clear()
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

/**
 * React hook for analytics
 */
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackClick: analytics.trackClick.bind(analytics),
    trackAPICall: analytics.trackAPICall.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    getAPIStats: analytics.getAPIStats.bind(analytics),
    getPerformanceSummary: analytics.getPerformanceSummary.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  }
}

/**
 * API call wrapper with automatic tracking
 */
export async function trackedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const startTime = performance.now()
  const method = options?.method || 'GET'

  try {
    const response = await fetch(url, options)
    const duration = performance.now() - startTime

    analytics.trackAPICall(url, method, duration, response.ok)

    return response
  } catch (error) {
    const duration = performance.now() - startTime
    analytics.trackAPICall(url, method, duration, false)
    throw error
  }
}
