import { NextRequest, NextResponse } from 'next/server'
import { getSyncStatus, setSyncInProgress, setSyncProgress } from '@/lib/sync/status'

export async function GET() {
  return NextResponse.json(getSyncStatus())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (action === 'cancel') {
    setSyncInProgress(false)
    setSyncProgress('Sync cancelled', 0, 100)
    return NextResponse.json({ message: 'Sync cancelled successfully' })
  }

  if (action === 'start') {
    setSyncInProgress(true)
    setSyncProgress('Starting sync...', 0, 100)
    return NextResponse.json({ message: 'Sync started' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
