import { db } from '@/lib/db'
import { createPrismaUserRepository } from '@/lib/users/prisma-user-repository'
import { toUserResponse, userListSchema } from '@/lib/validations/user'

export const dynamic = 'force-dynamic'

const userRepository = createPrismaUserRepository(db)

export default async function Home() {
  let users

  try {
    const records = await userRepository.listNewest(10)
    users = userListSchema.parse(records.map((record) => toUserResponse(record)))
  } catch (error: unknown) {
    throw new Error('Failed to load users from the database', { cause: error })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col p-8">
      <h1 className="mb-6 text-3xl font-medium tracking-tight text-text-h">
        Next.js Linting Template
      </h1>
      <p className="mb-8">
        Strict Next.js, Prisma, and Tailwind starter. This page reads users from PostgreSQL and
        validates the public response shape with Zod.
      </p>

      <section>
        <h2 className="mb-4 text-xl font-medium text-text-h">Users</h2>
        {users.length === 0 ? (
          <p className="text-text">
            No users yet. Run{' '}
            <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">bun run db:seed</code>{' '}
            to add demo data.
          </p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-bg p-3"
                key={user.id}
              >
                <span className="font-medium text-text-h">{user.name ?? 'Unnamed'}</span>
                <code className="rounded bg-code-bg px-2 py-1 text-sm text-text">{user.email}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-text-h">Create a user</h2>
        <p className="mb-2 text-text">
          Send JSON to{' '}
          <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">POST /api/users</code>:
        </p>
        <pre className="overflow-auto rounded bg-code-bg p-4 text-sm">
          {`{
  "email": "user@example.com",
  "name": "User Name"
}`}
        </pre>
      </section>
    </main>
  )
}
