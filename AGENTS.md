# AGENTS.md — development contract

Read this file before changing the repository. It describes the behavior enforced by the current
toolchain; when commands or architecture change, update this file and `README.md` in the same change.

## Toolchain

| Concern          | Tool / command                              |
| ---------------- | ------------------------------------------- |
| Runtime          | Node.js 24+, Bun 1.4+                       |
| Framework        | Next.js App Router, React Server Components |
| Types            | `bun run typecheck`                         |
| Lint             | `bun run lint:ci`                           |
| Format           | `bun run format` / `bun run format:fix`     |
| Tests            | `bun run test` / `bun run test:coverage`    |
| Dead code        | `bun run knip`                              |
| Database         | Prisma 7 and PostgreSQL                     |
| Full fast gate   | `bun run check`                             |
| Full local gate  | `bun run verify`                            |
| Production build | `bun run build`                             |

Use `bun install`; the dependency graph must resolve without `--force`. CI uses `bun ci`, and local
reproducibility checks use `bun install --frozen-lockfile`.

## Working sequence

1. Inspect `git status --short` and preserve unrelated user changes.
2. Copy `.env.example` to `.env` and start PostgreSQL with `bun run db:up` when database access is
   needed.
3. Change the smallest coherent set of files.
4. Add or update tests for behavior changes.
5. Run `bun run format:fix`, then `bun run check`.
6. Run `bun run verify` before pushing application, dependency, environment, or Next.js changes.
7. For schema changes, create and commit a migration; never report schema work complete with only
   `db:push`.

Warnings fail `lint:ci`. Do not hide failures with shell fallbacks, blanket ignores, or unexplained
rule disables.

## TypeScript rules

The project extends `@tsconfig/strictest`. In particular:

- parse external `unknown` values at their boundary;
- use `import type` for type-only imports;
- handle unchecked indexed access and exact optional properties;
- use guards instead of non-null assertions;
- do not use `any`, `@ts-ignore`, double assertions through `unknown`, enums, or namespaces;
- preserve a caught error as `cause` when wrapping and rethrowing it;
- an omitted catch binding is allowed only when the error is intentionally irrelevant, such as
  malformed client JSON that maps directly to a 400 response.

Prefer inferred return types for local functions. Add explicit public types where they improve an API
boundary rather than duplicating an implementation.

## Next.js and React

Files are Server Components unless browser state, effects, or event handlers require `'use client'`.
Keep client boundaries narrow and pass only the data a client needs.

- Server Actions require the same authentication, authorization, validation, and rate limiting as an
  API route.
- Do not import `src/lib/db.ts`, server environment values, or generated Prisma runtime code into a
  Client Component.
- Start independent async work together and await it as late as practical.
- Make database-backed pages explicitly dynamic or give them an intentional cache and invalidation
  policy.
- Import modules directly; do not add barrel files.
- Inline event handlers are acceptable by default. Use `useCallback` when referential identity is
  observably required, not as ritual memoization.
- Use `next/image`, `next/link`, and `next/script` for their corresponding Next.js use cases.

## Data and API boundaries

Zod schemas define request and public response shapes. Prisma models define storage shapes; these are
not interchangeable.

- Use `.strict()` for JSON commands unless forward-compatible extra properties are intentional.
- Normalize values such as email addresses before uniqueness checks.
- Select explicit public fields in Prisma queries. Never serialize a whole record by default.
- Return generic internal errors to callers and log diagnostic context on the server.
- Distinguish expected client failures from infrastructure or programming failures.
- Write endpoints must validate content type and payload before touching the database.
- Authentication and authorization are product-specific and must be added before the demo write API
  is exposed.

The linter blocks unsafe Prisma APIs and requires explicit `select` clauses. Do not disable those
rules to make a query shorter.

## Prisma 7

`prisma.config.ts` owns CLI configuration. `prisma/schema.prisma` uses the `prisma-client` generator,
and generated output lives in ignored `src/generated/prisma`.

- Application code uses the singleton in `src/lib/db.ts`.
- Direct PostgreSQL connections use `@prisma/adapter-pg`.
- Runtime database configuration is parsed in `src/lib/env.ts`.
- Run `bun run db:generate` after schema changes.
- Commit both schema and generated SQL migration changes.
- Use `bun run db:migrate:deploy` in non-development environments.
- Keep database column names snake_case with Prisma `@map` where TypeScript names differ.

Do not edit generated Prisma files.

## Security

- Never commit `.env*` files other than `.env.example`.
- Never add secrets, realistic tokens, or production credentials to fixtures and documentation.
- Do not use `eval`, `Function`, `globalThis.Function`, unsafe raw SQL, DOM HTML sinks, or wildcard
  `postMessage` origins.
- Validate URLs, file paths, redirects, webhooks, and third-party responses at trust boundaries.
- External links opened in a new tab require `rel="noreferrer"`.
- Add HSTS and CSP only with deployment-aware HTTPS and nonce policies; do not paste a permissive
  generic CSP into the template.
- Gitleaks must be installed locally. A missing scanner is a failed hook, not a skipped success.

## Styling

Tailwind CSS 4 is configured in `src/app/globals.css`. Use design tokens rather than repeating raw
colors. Use `cn()` from `src/lib/utils.ts` when classes are conditional or may conflict. Plain static
class strings do not need `cn()`.

Do not add a component-variant dependency until a real component needs it. When variants become
necessary, prefer a typed variant API and add tests for its public combinations.

## Tests

Tests use `bun:test` and strict assertions. Keep tests next to the code they cover using
`*.test.ts` or `*.test.tsx`.

- Test boundary normalization and rejection paths, not only happy paths.
- Avoid implementation-only mocks when a pure function can be tested directly.
- Add integration coverage for database behavior that cannot be proven by schemas.
- Run `bun run test:integration` against an already migrated PostgreSQL database for database code.
- Keep the coverage thresholds meaningful; do not lower them to merge a change.

## Dependency and configuration changes

Every direct dependency must have a current use. Knip exceptions are reserved for runtime or
generated-code relationships Knip cannot observe. Explain new exceptions in the change.

GitHub Actions stay pinned to full commit SHAs. Dependabot updates the SHA and version comment. CI
shell commands must propagate failure; do not append `|| echo`, `|| true`, or equivalent success
fallbacks to a quality gate.

## Completion checklist

- `bun run verify` passes.
- `bun run test:integration` and `bun run db:migrate:check` pass for database changes.
- Schema changes include a migration and pass the migration workflow logic.
- The diff contains no secrets, generated Prisma client, unsafe type escapes, or unrelated changes.
- Documentation matches the implemented commands and behavior.
