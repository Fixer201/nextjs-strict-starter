import { z } from 'zod'
import type { UserRecord } from '@/lib/users/user-repository'

export const createUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email('Invalid email format')),
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long').optional(),
  })
  .strict()

export const userSchema = z
  .object({
    createdAt: z.iso.datetime(),
    email: z.email(),
    id: z.uuidv7(),
    name: z.string().max(100).nullable(),
    updatedAt: z.iso.datetime(),
  })
  .strict()

export const userListSchema = z.array(userSchema).max(100)

export function toUserResponse(user: UserRecord) {
  return userSchema.parse({
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    id: user.id,
    name: user.name,
    updatedAt: user.updatedAt.toISOString(),
  })
}
