import { NextResponse } from 'next/server'
import { Prisma } from '@/generated/prisma/client'
import { db } from '@/lib/db'
import { isJsonContentType } from '@/lib/http/content-type'
import { publicUserSelect } from '@/lib/users'
import { createUserSchema, toUserResponse, userListSchema } from '@/lib/validations/user'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { headers: NO_STORE_HEADERS, status })
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type')

  if (!isJsonContentType(contentType)) {
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
    const created = await db.user.create({
      data: { email: parsed.data.email, name: parsed.data.name ?? null },
      select: publicUserSelect,
    })

    return NextResponse.json(toUserResponse(created), {
      headers: NO_STORE_HEADERS,
      status: 201,
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse('A user with this email already exists', 409)
    }

    console.error('Failed to create user:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET() {
  try {
    const records = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: publicUserSelect,
      take: 100,
    })
    const users = userListSchema.parse(records.map((record) => toUserResponse(record)))

    return NextResponse.json(users, { headers: NO_STORE_HEADERS })
  } catch (error: unknown) {
    console.error('Failed to list users:', error)
    return errorResponse('Internal server error', 500)
  }
}
