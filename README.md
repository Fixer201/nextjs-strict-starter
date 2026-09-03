# Next.js Strict Starter

An opinionated App Router starter with strict TypeScript, PostgreSQL, Prisma, Zod, Tailwind CSS,
Bun-powered tooling, and explicit local and CI quality gates.

## Highlights

- Next.js 16, React 19, React Compiler, typed routes, and Turbopack
- TypeScript 6 extending `@tsconfig/strictest`
- Prisma 7 with its ESM-first generated client and the PostgreSQL driver adapter
- PostgreSQL 17 Compose service plus a committed initial migration
- Zod validation at request and public response boundaries
- oxlint, ESLint, oxfmt, Knip, CSpell, JSDoc, and Prisma-specific checks
- Bun unit tests with enforced coverage thresholds and separate PostgreSQL integration tests
- Lefthook, lint-staged, Gitleaks, pinned GitHub Actions, Dependabot, CodeQL, and Scorecard

Bun owns dependency installation, scripts, and tests. Node.js remains the supported runtime for the
Next.js application.

## Requirements

- Bun 1.4 or newer
- Node.js 24 or newer
- Docker with the Compose plugin for the included database workflow, or another PostgreSQL instance
- [Gitleaks](https://github.com/gitleaks/gitleaks#installing) before committing

## Quick Start

```bash
cp .env.example .env
bun ci
bun run db:up
bun run db:migrate:deploy
bun run db:seed
bun run dev
```

Open <http://localhost:3000>. PostgreSQL binds to `127.0.0.1:55432`; if that port is unavailable,
change `POSTGRES_PORT` and `DATABASE_URL` together. The included credentials are local development
defaults and must not be reused in shared or deployed environments.

The generated Prisma client lives in ignored `src/generated/prisma`. Generate it after schema
changes with `bun run db:generate`; installation and production builds also generate it when needed.

## Commands

| Purpose                             | Command                                      |
| ----------------------------------- | -------------------------------------------- |
| Start development                   | `bun run dev`                                |
| Run unit tests                      | `bun run test`                               |
| Run unit tests with coverage        | `bun run test:coverage`                      |
| Run the local quality suite         | `bun run check`                              |
| Run quality checks plus build       | `bun run verify`                             |
| Fix formatting                      | `bun run format:fix`                         |
| Fix supported lint findings         | `bun run lint:fix`                           |
| Analyze the production bundle       | `bun run analyze`                            |
| Start or stop PostgreSQL            | `bun run db:up` / `bun run db:down`          |
| Create a development migration      | `bun run db:migrate -- --name <name>`        |
| Apply committed migrations          | `bun run db:migrate:deploy`                  |
| Check migration status              | `bun run db:migrate:status`                  |
| Detect database/schema drift        | `bun run db:migrate:check`                   |
| Run PostgreSQL integration tests    | `bun run test:integration`                   |
| Seed demo users                     | `bun run db:seed`                            |
| Open Prisma Studio                  | `bun run db:studio`                          |
| Reset the local database and volume | `bun run db:reset` — destructive, local only |

## Project Structure

```text
src/app/                         App Router UI and API routes
src/app/api/users/handlers.ts   Framework-facing users HTTP contract
src/lib/users/                  Repository interface and Prisma adapter
src/lib/validations/            Request and public response schemas
src/lib/db.ts                   Application Prisma client singleton
src/lib/env.ts                  Validated server environment
prisma/                         Schema, migrations, and idempotent seed
tests/integration/              Explicit PostgreSQL integration suite
.github/workflows/              Quality, build, database, and security CI
```

Route files are thin production adapters. HTTP behavior is tested through injected repository and
probe interfaces, while database-specific behavior is tested against PostgreSQL.

## Quality Gates

`bun run check` runs formatting checks, strict lint with zero warnings, TypeScript, unit coverage,
Knip, and Prisma schema validation. `bun run verify` runs `check` and then a production build.

Pre-commit runs Gitleaks and lint-staged. Pre-push runs `bun run verify`. The main CI workflow keeps
quality checks, the production build, and dependency audit as separate required jobs. The Prisma
workflow applies migrations to PostgreSQL, runs `test:integration`, and checks schema drift.

Bun coverage requires at least 80% lines and functions for each production module loaded by the unit
suite. Test files are excluded. Generated Prisma code, `layout.tsx`, and `error.tsx` are intentionally
excluded because they are generated or framework shells. Bun does not add production modules that
the suite never loads to its report, so the percentage is not a claim of comprehensive application
coverage; the Prisma adapter is covered separately by the database integration suite.

## Example Application

The home page reads the newest users from PostgreSQL. The demonstration API exposes:

- `GET /api/health`: process liveness only;
- `GET /api/ready`: database readiness, returning 200 or 503 without connection details;
- `GET /api/users`: up to 100 newest public user records;
- `POST /api/users`: strict user creation with normalized email and name values.

`POST /api/users` accepts `application/json` case-insensitively, with optional syntactically valid
parameters such as `charset=utf-8`. Missing or other media types return 415; malformed JSON returns
400; invalid input returns 422; duplicate email returns 409. Responses are non-cacheable and
unexpected server failures use a generic public error.

`/api/users` is an unauthenticated demonstration. It does not provide production authorization,
rate limiting, audit logging, or abuse protection.

## Database Workflow

`prisma/schema.prisma` is the model source; `prisma/migrations` is deployment history. For a schema
change:

```bash
bun run db:up
bun run db:migrate -- --name describe_the_change
bun run db:generate
bun run test:integration
bun run db:migrate:check
bun run verify
```

Application database access starts at the singleton in `src/lib/db.ts` and flows through focused
repository adapters. The Prisma adapter may import generated Prisma types and errors to implement
that boundary. `prisma/seed.ts` owns a separate short-lived CLI client and disconnects it after use.
`db:push` is available for disposable prototyping but does not replace committed migrations.

Integration tests require `DATABASE_URL` to point to an already migrated test database. They clean
only their own fixture users and do not depend on seed data.

## Security Defaults

- Server environment values are parsed before use, and server modules import `server-only`.
- Prisma queries select explicit public fields; Zod validates serialized responses.
- API failures do not return database details or unintended validation internals.
- Baseline headers disable MIME sniffing and framing and restrict browser features.
- Gitleaks is mandatory in the local commit hook; security workflows run separately in GitHub.

Content Security Policy and HSTS are deployment-specific edge responsibilities because HTTPS,
origins, and nonce handling are not known to a generic starter.

## Adopting the Template

Replace the demo UI, user model, package metadata, database credentials, and repository links. Add
the authentication, authorization, observability, rate limits, and deployment policy required by
your product. Enable private vulnerability reporting or publish another private maintainer contact.

The repository already uses the MIT license. Keep it or replace it if the adopting project requires
a different licensing policy. Configure the `All gates passed` job as a required branch-protection
check.

## Additional Documentation

- [AGENTS.md](./AGENTS.md) — development contract and coding rules
- [SECURITY.md](./SECURITY.md) — vulnerability reporting policy
