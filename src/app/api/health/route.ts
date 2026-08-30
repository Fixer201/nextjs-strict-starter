import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Reports process liveness without checking external dependencies. */
export function GET() {
  return NextResponse.json(
    { status: 'ok' },
    { headers: { 'Cache-Control': 'no-store' }, status: 200 },
  )
}
