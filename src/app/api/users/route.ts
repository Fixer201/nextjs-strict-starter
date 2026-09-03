import { createUserHandler, listUsersHandler } from '@/app/api/users/handlers'
import { db } from '@/lib/db'
import { createPrismaUserRepository } from '@/lib/users/prisma-user-repository'

const users = createPrismaUserRepository(db)

/** Handles user creation using the production Prisma repository. */
export function POST(request: Request) {
  return createUserHandler(request, users)
}

/** Lists users using the production Prisma repository. */
export function GET() {
  return listUsersHandler(users)
}
