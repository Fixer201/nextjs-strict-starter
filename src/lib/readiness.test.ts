import { describe, expect, it } from 'bun:test'
import { checkReadiness, type ReadinessProbe } from './readiness'

describe('checkReadiness', () => {
  it('returns ready after a successful probe', async () => {
    const probe: ReadinessProbe = { check: () => Promise.resolve() }

    expect(await checkReadiness(probe)).toEqual({ status: 'ready' })
  })

  it('keeps the internal cause when a probe fails', async () => {
    const cause = new Error('connection credentials leaked')
    const probe: ReadinessProbe = { check: () => Promise.reject(cause) }

    expect(await checkReadiness(probe)).toEqual({ cause, status: 'unavailable' })
  })
})
