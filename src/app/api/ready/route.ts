import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkReadiness, type ReadinessProbe } from '@/lib/readiness'

export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

const databaseProbe: ReadinessProbe = {
  async check() {
    await db.$queryRaw`SELECT 1`
  },
}

export async function readinessResponse(probe: ReadinessProbe) {
  const result = await checkReadiness(probe)
  if (result.status === 'unavailable') {
    console.error('Database readiness probe failed:', result.cause)
    return NextResponse.json({ status: 'unavailable' }, { headers: NO_STORE_HEADERS, status: 503 })
  }

  return NextResponse.json({ status: 'ready' }, { headers: NO_STORE_HEADERS })
}

export function GET() {
  return readinessResponse(databaseProbe)
}
