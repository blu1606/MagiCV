import { NextRequest, NextResponse } from 'next/server'

/**
 * Performance Metrics API
 * Tracks and returns API performance statistics
 */

interface PerformanceData {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: string
}

const performanceData: PerformanceData[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    performanceData.push({
      ...data,
      timestamp: new Date().toISOString(),
    })

    // Keep only last 1000 records
    if (performanceData.length > 1000) {
      performanceData.shift()
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to record performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const endpoint = url.searchParams.get('endpoint')

  let filteredData = performanceData
  if (endpoint) {
    filteredData = performanceData.filter((d) => d.endpoint === endpoint)
  }

  // Calculate statistics
  const stats = calculateStats(filteredData)

  // Group by endpoint
  const byEndpoint = filteredData.reduce((acc: Record<string, PerformanceData[]>, data) => {
    if (!acc[data.endpoint]) {
      acc[data.endpoint] = []
    }
    acc[data.endpoint].push(data)
    return acc
  }, {})

  const endpointStats: Record<string, any> = {}
  Object.keys(byEndpoint).forEach((key) => {
    endpointStats[key] = calculateStats(byEndpoint[key])
  })

  return NextResponse.json({
    overall: stats,
    byEndpoint: endpointStats,
    recentCalls: filteredData.slice(-20),
    totalCalls: filteredData.length,
  })
}

function calculateStats(data: PerformanceData[]) {
  if (data.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      successRate: 0,
    }
  }

  const durations = data.map((d) => d.duration).sort((a, b) => a - b)
  const sum = durations.reduce((a, b) => a + b, 0)
  const successCount = data.filter((d) => d.status >= 200 && d.status < 300).length

  return {
    count: data.length,
    avgDuration: sum / data.length,
    minDuration: durations[0],
    maxDuration: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)],
    successRate: (successCount / data.length) * 100,
  }
}
