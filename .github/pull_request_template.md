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

- [ ] `bun run format` — no formatting changes required
- [ ] `bun run lint:ci` — 0 errors and 0 warnings
- [ ] `bun run typecheck` — 0 type errors
- [ ] `bun run test:coverage` — tests and thresholds pass
- [ ] `bun run knip` — 0 dead code
- [ ] `bun run db:validate` — schema valid
- [ ] `bun run build` — build succeeds

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
