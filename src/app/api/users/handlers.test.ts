import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import {
  type CreateUserInput,
  DuplicateEmailError,
  type UserRecord,
  type UserRepository,
} from '@/lib/users/user-repository'
import { createUserHandler, listUsersHandler } from './handlers'

const USER: UserRecord = {
  createdAt: new Date('2026-08-30T12:00:00.000Z'),
  email: 'alice@example.com',
  id: '0198f6bc-65c0-7000-8000-000000000001',
  name: 'Alice',
  updatedAt: new Date('2026-08-30T12:00:00.000Z'),
}

class FakeUserRepository implements UserRepository {
  readonly createInputs: CreateUserInput[] = []
  readonly listLimits: number[] = []

  constructor(
    private readonly records: UserRecord[] = [USER],
    private readonly errors: { readonly create?: Error; readonly list?: Error } = {},
  ) {}

  create(input: CreateUserInput): Promise<UserRecord> {
    this.createInputs.push(input)
    if (this.errors.create !== undefined) {
      return Promise.reject(this.errors.create)
    }

    return Promise.resolve({ ...(this.records.at(0) ?? USER), ...input })
  }

  listNewest(limit: number): Promise<UserRecord[]> {
    this.listLimits.push(limit)
    if (this.errors.list !== undefined) {
      return Promise.reject(this.errors.list)
    }

    return Promise.resolve(this.records)
  }
}

function jsonRequest(body: string, contentType = 'application/json') {
  return new Request('http://localhost/api/users', {
    body,
    headers: { 'Content-Type': contentType },
    method: 'POST',
  })
}

afterEach(() => {
  mock.restore()
})

describe('createUserHandler', () => {
  it('creates and returns a normalized public user', async () => {
    const repository = new FakeUserRepository()
    const response = await createUserHandler(
      jsonRequest(JSON.stringify({ email: ' ALICE@EXAMPLE.COM ', name: ' Alice ' })),
      repository,
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(repository.createInputs).toEqual([{ email: 'alice@example.com', name: 'Alice' }])
    expect(await response.json()).toEqual({
      ...USER,
      createdAt: USER.createdAt.toISOString(),
      updatedAt: USER.updatedAt.toISOString(),
    })
  })

  it('rejects malformed JSON', async () => {
    const response = await createUserHandler(jsonRequest('{'), new FakeUserRepository())

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' })
  })

  it.each([undefined, 'text/plain'])('rejects an invalid Content-Type', async (contentType) => {
    const headers = new Headers()
    if (contentType !== undefined) {
      headers.set('Content-Type', contentType)
    }

    const request = new Request('http://localhost/api/users', {
      body: '{}',
      headers,
      method: 'POST',
    })
    const response = await createUserHandler(request, new FakeUserRepository())

    expect(response.status).toBe(415)
    expect(await response.json()).toEqual({ error: 'Content-Type must be application/json' })
  })

  it('returns validation issues for an invalid body', async () => {
    const response = await createUserHandler(jsonRequest('{}'), new FakeUserRepository())
    const body = (await response.json()) as { error: string; issues: unknown[] }

    expect(response.status).toBe(422)
    expect(body.error).toBe('Validation failed')
    expect(body.issues.length).toBeGreaterThan(0)
  })

  it('maps duplicate emails to a conflict', async () => {
    const repository = new FakeUserRepository([USER], { create: new DuplicateEmailError() })
    const response = await createUserHandler(
      jsonRequest(JSON.stringify({ email: USER.email })),
      repository,
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'A user with this email already exists' })
  })

  it('hides unexpected repository errors', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => null)
    const repository = new FakeUserRepository([USER], {
      create: new Error('database password leaked'),
    })
    const response = await createUserHandler(
      jsonRequest(JSON.stringify({ email: USER.email })),
      repository,
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
    expect(consoleError).toHaveBeenCalled()
  })
})

describe('listUsersHandler', () => {
  it('returns public users and requests the newest 100 records', async () => {
    const repository = new FakeUserRepository()
    const response = await listUsersHandler(repository)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(repository.listLimits).toEqual([100])
    expect(await response.json()).toEqual([
      {
        ...USER,
        createdAt: USER.createdAt.toISOString(),
        updatedAt: USER.updatedAt.toISOString(),
      },
    ])
  })

  it('rejects an invalid repository record', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => null)
    const invalidUser = { ...USER, id: 'not-a-uuid' }
    const response = await listUsersHandler(new FakeUserRepository([invalidUser]))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
    expect(consoleError).toHaveBeenCalled()
  })

  it('hides repository failures', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => null)
    const repository = new FakeUserRepository([USER], { list: new Error('connection failed') })
    const response = await listUsersHandler(repository)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
    expect(consoleError).toHaveBeenCalled()
  })
})
