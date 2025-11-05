import { NextRequest, NextResponse } from 'next/server'

/**
 * Analytics API endpoint
 * Receives and stores analytics events from the client
 */

const analyticsStore: any[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Store analytics event
    analyticsStore.push({
      ...data,
      receivedAt: new Date().toISOString(),
    })

    // In production, you would:
    // 1. Send to Google Analytics, Mixpanel, etc.
    // 2. Store in database for later analysis
    // 3. Process for real-time dashboards

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get analytics summary
  const summary = {
    totalEvents: analyticsStore.length,
    eventTypes: analyticsStore.reduce((acc: Record<string, number>, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    }, {}),
    recentEvents: analyticsStore.slice(-10),
  }

  return NextResponse.json(summary)
}
