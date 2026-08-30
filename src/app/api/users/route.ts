import { createUserHandler, listUsersHandler } from '@/app/api/users/handlers'
import { db } from '@/lib/db'
import { createPrismaUserRepository } from '@/lib/users/prisma-user-repository'

const users = createPrismaUserRepository(db)

export function POST(request: Request) {
  return createUserHandler(request, users)
}

export function GET() {
  return listUsersHandler(users)
}
