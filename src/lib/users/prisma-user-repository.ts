import 'server-only'
import { Prisma } from '@/generated/prisma/client'
import {
  type CreateUserInput,
  DuplicateEmailError,
  type UserRecord,
  type UserRepository,
} from '@/lib/users/user-repository'
import type { PrismaClient } from '@/generated/prisma/client'

const publicUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  name: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

function isEmailUniqueConstraint(error: Prisma.PrismaClientKnownRequestError) {
  if (error.code !== 'P2002' || error.meta?.['modelName'] !== 'User') {
    return false
  }

  const target = error.meta['target']
  if (
    (Array.isArray(target) && target.includes('email')) ||
    (typeof target === 'string' && target.includes('email'))
  ) {
    return true
  }

  const driverError = error.meta['driverAdapterError']
  if (!(driverError instanceof Error) || typeof driverError.cause !== 'object') {
    return false
  }

  const cause = driverError.cause as { constraint?: { fields?: unknown; index?: unknown } }
  return (
    cause.constraint?.index === 'users_email_key' ||
    (Array.isArray(cause.constraint?.fields) && cause.constraint.fields.includes('email'))
  )
}

export function createPrismaUserRepository(client: PrismaClient): UserRepository {
  return {
    async create(input: CreateUserInput): Promise<UserRecord> {
      try {
        return await client.user.create({ data: input, select: publicUserSelect })
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          isEmailUniqueConstraint(error)
        ) {
          throw new DuplicateEmailError()
        }

        throw error
      }
    },

    listNewest(limit: number): Promise<UserRecord[]> {
      return client.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: publicUserSelect,
        take: limit,
      })
    },
  }
}
