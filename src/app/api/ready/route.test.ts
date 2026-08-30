import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import type { ReadinessProbe } from '@/lib/readiness'

mock.module('server-only', () => ({}))
process.env['DATABASE_URL'] ??= 'postgresql://postgres:postgres@localhost:5432/test'

const { readinessResponse } = await import('./route')

afterEach(() => {
  mock.restore()
})

describe('readinessResponse', () => {
  it('returns a non-cacheable ready response', async () => {
    const probe: ReadinessProbe = { check: () => Promise.resolve() }
    const response = await readinessResponse(probe)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ status: 'ready' })
  })

  it('returns a generic non-cacheable unavailable response', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => null)
    const probe: ReadinessProbe = {
      check: () => Promise.reject(new Error('database password leaked')),
    }
    const response = await readinessResponse(probe)

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ status: 'unavailable' })
    expect(consoleError).toHaveBeenCalled()
  })
})
