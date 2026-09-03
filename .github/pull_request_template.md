## Summary

<!-- Brief description of what this PR does -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI / tooling

## Quality gates passed

- [ ] `bun run verify` — formatting, lint, types, unit coverage, dead code, Prisma schema, and build pass
- [ ] `bun run test:integration` and `bun run db:migrate:check` pass when database code changes

## Security checklist

- [ ] No secrets / API keys in code
- [ ] No `eval()`, `Function()`, `dangerouslySetInnerHTML` without need
- [ ] No `any` types — use Zod schemas or `unknown` with type guards
- [ ] Server-only code imports `server-only` package
- [ ] API responses validated with Zod at boundary
- [ ] Prisma queries select only fields safe for the caller

## Database changes

- [ ] Schema changes include a committed migration, or this PR does not change the schema
- [ ] Migrations were applied to an empty database

## Notes

<!-- Anything reviewers should know -->
