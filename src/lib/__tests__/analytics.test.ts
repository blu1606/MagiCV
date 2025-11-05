/**
 * Unit tests for analytics service
 */

import { analytics, trackedFetch } from '../analytics'

describe('Analytics Service', () => {
  beforeEach(() => {
    analytics.clear()
  })

  describe('track', () => {
    it('should track basic event', () => {
      analytics.track('button_click', { buttonName: 'test-button' })

      const data = analytics.exportData()
      expect(data.events.length).toBe(1)
      expect(data.events[0].event).toBe('button_click')
      expect(data.events[0].properties?.buttonName).toBe('test-button')
    })

    it('should include timestamp in tracked events', () => {
      const beforeTime = Date.now()
      analytics.track('page_view')
      const afterTime = Date.now()

      const data = analytics.exportData()
      expect(data.events[0].timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(data.events[0].timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should include sessionId in tracked events', () => {
      analytics.track('page_view')

      const data = analytics.exportData()
      expect(data.events[0].sessionId).toBeTruthy()
      expect(typeof data.events[0].sessionId).toBe('string')
    })

    it('should include userId when set', () => {
      analytics.setUserId('user-123')
      analytics.track('page_view')

      const data = analytics.exportData()
      expect(data.events[0].userId).toBe('user-123')
    })
  })

  describe('trackPageView', () => {
    it('should track page view with path', () => {
      analytics.trackPageView('/dashboard')

      const data = analytics.exportData()
      expect(data.events.length).toBe(1)
      expect(data.events[0].event).toBe('page_view')
      expect(data.events[0].properties?.path).toBe('/dashboard')
    })

    it('should include additional properties', () => {
      analytics.trackPageView('/dashboard', { section: 'main' })

      const data = analytics.exportData()
      expect(data.events[0].properties?.section).toBe('main')
    })
  })

  describe('trackClick', () => {
    it('should track button click', () => {
      analytics.trackClick('generate-cv')

      const data = analytics.exportData()
      expect(data.events[0].event).toBe('button_click')
      expect(data.events[0].properties?.buttonName).toBe('generate-cv')
    })
  })

  describe('trackAPICall', () => {
    it('should track successful API call', () => {
      analytics.trackAPICall('/api/cv/generate', 'POST', 250, true)

      const data = analytics.exportData()
      expect(data.events[0].event).toBe('api_call')
      expect(data.events[0].properties?.endpoint).toBe('/api/cv/generate')
      expect(data.events[0].properties?.method).toBe('POST')
      expect(data.events[0].properties?.duration).toBe(250)
      expect(data.events[0].properties?.success).toBe(true)
    })

    it('should track failed API call', () => {
      analytics.trackAPICall('/api/cv/generate', 'POST', 150, false)

      const data = analytics.exportData()
      expect(data.events[0].properties?.success).toBe(false)
    })

    it('should store API response times', () => {
      analytics.trackAPICall('/api/test', 'GET', 100, true)
      analytics.trackAPICall('/api/test', 'GET', 200, true)
      analytics.trackAPICall('/api/test', 'GET', 150, true)

      const stats = analytics.getAPIStats('/api/test')
      expect(stats.count).toBe(3)
      expect(stats.avg).toBe(150)
      expect(stats.min).toBe(100)
      expect(stats.max).toBe(200)
    })
  })

  describe('trackError', () => {
    it('should track error with message', () => {
      const error = new Error('Test error')
      analytics.trackError(error)

      const data = analytics.exportData()
      expect(data.events[0].event).toBe('error')
      expect(data.events[0].properties?.message).toBe('Test error')
    })

    it('should include error context', () => {
      const error = new Error('Test error')
      analytics.trackError(error, { component: 'CVGenerator' })

      const data = analytics.exportData()
      expect(data.events[0].properties?.component).toBe('CVGenerator')
    })
  })

  describe('trackPerformance', () => {
    it('should track performance metric', () => {
      analytics.trackPerformance('page_load', 1500)

      const data = analytics.exportData()
      expect(data.events[0].event).toBe('performance')
      expect(data.events[0].properties?.metric).toBe('page_load')
      expect(data.events[0].properties?.value).toBe(1500)
    })

    it('should rate FCP performance correctly', () => {
      analytics.trackPerformance('FCP', 1500) // Good
      analytics.trackPerformance('FCP', 2500) // Needs improvement
      analytics.trackPerformance('FCP', 3500) // Poor

      const data = analytics.exportData()
      expect(data.events[0].properties?.rating).toBe('good')
      expect(data.events[1].properties?.rating).toBe('needs-improvement')
      expect(data.events[2].properties?.rating).toBe('poor')
    })
  })

  describe('getAPIStats', () => {
    it('should return stats for specific endpoint', () => {
      analytics.trackAPICall('/api/test', 'GET', 100, true)
      analytics.trackAPICall('/api/test', 'GET', 200, true)

      const stats = analytics.getAPIStats('/api/test')
      expect(stats.count).toBe(2)
      expect(stats.avg).toBe(150)
    })

    it('should return stats for all endpoints', () => {
      analytics.trackAPICall('/api/test1', 'GET', 100, true)
      analytics.trackAPICall('/api/test2', 'GET', 200, true)

      const stats = analytics.getAPIStats()
      expect(stats['/api/test1']).toBeDefined()
      expect(stats['/api/test2']).toBeDefined()
    })

    it('should return empty stats for unknown endpoint', () => {
      const stats = analytics.getAPIStats('/api/unknown')
      expect(stats.count).toBe(0)
    })
  })

  describe('exportData', () => {
    it('should export all analytics data', () => {
      analytics.setUserId('user-123')
      analytics.track('page_view')
      analytics.trackAPICall('/api/test', 'GET', 100, true)

      const data = analytics.exportData()
      expect(data.userId).toBe('user-123')
      expect(data.sessionId).toBeTruthy()
      expect(data.events.length).toBe(2)
      expect(data.apiStats).toBeDefined()
    })
  })

  describe('clear', () => {
    it('should clear all analytics data', () => {
      analytics.track('page_view')
      analytics.track('button_click')

      analytics.clear()

      const data = analytics.exportData()
      expect(data.events.length).toBe(0)
    })
  })
})

describe('trackedFetch', () => {
  beforeEach(() => {
    analytics.clear()
    global.fetch = jest.fn()
  })

  it('should track successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    })

    await trackedFetch('/api/test')

    const data = analytics.exportData()
    expect(data.events.length).toBe(1)
    expect(data.events[0].event).toBe('api_call')
    expect(data.events[0].properties?.endpoint).toBe('/api/test')
    expect(data.events[0].properties?.success).toBe(true)
  })

  it('should track failed fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })

    await trackedFetch('/api/test')

    const data = analytics.exportData()
    expect(data.events[0].properties?.success).toBe(false)
  })

  it('should track fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    try {
      await trackedFetch('/api/test')
    } catch (error) {
      // Expected to throw
    }

    const data = analytics.exportData()
    expect(data.events[0].properties?.success).toBe(false)
  })

  it('should measure request duration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    })

    await trackedFetch('/api/test')

    const data = analytics.exportData()
    expect(data.events[0].properties?.duration).toBeGreaterThan(0)
  })
})
