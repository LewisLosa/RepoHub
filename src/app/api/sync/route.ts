import { NextRequest, NextResponse } from 'next/server'
import { MetadataFetcher } from '@/services/metadataFetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform_id, all_platforms } = body

    if (all_platforms) {
      // Sync all platforms
      await MetadataFetcher.syncAllPlatforms()
      return NextResponse.json({ 
        message: 'All platforms synced successfully',
        timestamp: new Date().toISOString()
      })
    } else if (platform_id) {
      // Sync specific platform
      await MetadataFetcher.syncPlatform(platform_id)
      return NextResponse.json({ 
        message: `Platform ${platform_id} synced successfully`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Either platform_id or all_platforms must be specified' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error during sync:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return sync status (would need to implement status tracking)
    return NextResponse.json({
      status: 'ready',
      last_sync: null,
      platforms: ['ubuntu', 'fedora', 'arch', 'windows', 'macos']
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
