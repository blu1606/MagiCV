import { NextResponse, NextRequest } from 'next/server'
import { getComponents, createComponent } from '@/services/data-service'

export async function GET() {
  console.log('🔔 API /api/components - GET called')
  try {
    console.log('🔍 API /api/components - Calling getComponents()...')
    const components = await getComponents()
    console.log('✅ API /api/components - getComponents returned, count:', Array.isArray(components) ? components.length : 'non-array')
    return NextResponse.json(components)
  } catch (error) {
    console.error('API Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🔔 API /api/components - POST called')
  try {
    const body = await request.json()
    console.log('📝 Creating component with data:', body)

    const newComponent = await createComponent(body)

    if (!newComponent) {
      return NextResponse.json(
        { error: 'Failed to create component' },
        { status: 400 }
      )
    }

    console.log('✅ Component created:', newComponent.id)
    return NextResponse.json(newComponent, { status: 201 })
  } catch (error) {
    console.error('API Error creating component:', error)
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    )
  }
}


