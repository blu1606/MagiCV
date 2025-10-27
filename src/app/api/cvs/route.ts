import { NextResponse } from 'next/server'
import { getCVs } from '@/lib/services/data-service'

export async function GET() {
  try {
    const cvs = await getCVs()
    return NextResponse.json(cvs)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    )
  }
}



