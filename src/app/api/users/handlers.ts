import { NextResponse } from 'next/server'
import { isJsonContentType } from '@/lib/http/content-type'
import { DuplicateEmailError, type UserRepository } from '@/lib/users/user-repository'
import { createUserSchema, toUserResponse, userListSchema } from '@/lib/validations/user'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { headers: NO_STORE_HEADERS, status })
}

export async function createUserHandler(request: Request, repository: UserRepository) {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return errorResponse('Content-Type must be application/json', 415)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { headers: NO_STORE_HEADERS, status: 422 },
    )
  }

  try {
    const created = await repository.create({
      email: parsed.data.email,
      name: parsed.data.name ?? null,
    })

    return NextResponse.json(toUserResponse(created), {
      headers: NO_STORE_HEADERS,
      status: 201,
    })
  } catch (error: unknown) {
    if (error instanceof DuplicateEmailError) {
      return errorResponse('A user with this email already exists', 409)
    }

    console.error('Failed to create user:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function listUsersHandler(repository: UserRepository) {
  try {
    const records = await repository.listNewest(100)
    const users = userListSchema.parse(records.map((record) => toUserResponse(record)))

    return NextResponse.json(users, { headers: NO_STORE_HEADERS })
  } catch (error: unknown) {
    console.error('Failed to list users:', error)
    return errorResponse('Internal server error', 500)
  }
}
