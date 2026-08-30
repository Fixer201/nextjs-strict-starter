import assert from 'node:assert/strict'
import { describe, it } from 'bun:test'
import { createUserSchema, toUserResponse, userSchema } from './user'

describe('createUserSchema', () => {
  it('normalizes email and name values', () => {
    const result = createUserSchema.parse({
      email: '  USER@Example.COM ',
      name: '  Ada Lovelace  ',
    })

    assert.deepEqual(result, {
      email: 'user@example.com',
      name: 'Ada Lovelace',
    })
  })

  it('rejects unexpected properties', () => {
    const result = createUserSchema.safeParse({
      email: 'user@example.com',
      role: 'admin',
    })

    assert.equal(result.success, false)
  })

  it('rejects blank names after trimming', () => {
    const result = createUserSchema.safeParse({
      email: 'user@example.com',
      name: ' '.repeat(3),
    })

    assert.equal(result.success, false)
  })
})

describe('user response validation', () => {
  it('serializes database dates to ISO timestamps', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z')
    const updatedAt = new Date('2026-02-03T04:05:06.000Z')

    const result = toUserResponse({
      createdAt,
      email: 'user@example.com',
      id: '0190c3e5-7b6a-7cc2-98e8-123456789abc',
      name: null,
      updatedAt,
    })

    assert.equal(result.createdAt, createdAt.toISOString())
    assert.equal(result.updatedAt, updatedAt.toISOString())
  })

  it('rejects malformed public records', () => {
    const result = userSchema.safeParse({
      createdAt: 'yesterday',
      email: 'not-an-email',
      id: '123',
      name: null,
      updatedAt: 'tomorrow',
    })

    assert.equal(result.success, false)
  })
})
