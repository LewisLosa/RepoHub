import { NextRequest, NextResponse } from 'next/server'
import { PlatformService } from '@/services/platformService'

export async function GET() {
  try {
    const platforms = await PlatformService.getAll()
    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const platform = await PlatformService.create(body)
    return NextResponse.json(platform, { status: 201 })
  } catch (error) {
    console.error('Error creating platform:', error)
    return NextResponse.json(
      { error: 'Failed to create platform' },
      { status: 500 }
    )
  }
}
