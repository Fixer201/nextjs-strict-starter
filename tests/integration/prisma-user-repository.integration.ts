import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test'
import { DuplicateEmailError } from '@/lib/users/user-repository'
import { toUserResponse } from '@/lib/validations/user'

mock.module('server-only', () => ({}))

const [{ db }, { createPrismaUserRepository }] = await Promise.all([
  import('@/lib/db'),
  import('@/lib/users/prisma-user-repository'),
])

const FIXTURE_EMAILS = [
  'integration-create@example.test',
  'integration-duplicate@example.test',
] as const

const repository = createPrismaUserRepository(db)

async function deleteFixtures() {
  await db.user.deleteMany({ where: { email: { in: [...FIXTURE_EMAILS] } } })
}

beforeAll(deleteFixtures)
afterAll(async () => {
  await deleteFixtures()
  await db.$disconnect()
})

describe('Prisma user repository', () => {
  it('creates, lists, and serializes a public user', async () => {
    const created = await repository.create({
      email: FIXTURE_EMAILS[0],
      name: 'Integration User',
    })
    const records = await repository.listNewest(100)
    const response = toUserResponse(created)

    expect(records.some((record) => record.id === created.id)).toBe(true)
    expect(response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    )
    expect(response).toMatchObject({
      email: FIXTURE_EMAILS[0],
      name: 'Integration User',
    })
  })

  it('maps a duplicate email constraint to DuplicateEmailError', async () => {
    const input = { email: FIXTURE_EMAILS[1], name: null }
    await repository.create(input)

    expect(repository.create(input)).rejects.toBeInstanceOf(DuplicateEmailError)
  })
})
