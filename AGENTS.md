<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `npm exec --no -- intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npm exec --no -- intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Commands

- Dev: `npm run dev` (port 3000). Build: `npm run build`. No test script.
- Verify: `npx tsc --noEmit`, then `npm run lint`, then `npm run check` (`prettier --check .`).
- Format/fix: `npm run format` (`prettier --write . && eslint --fix`).
- Routes codegen: `npm run generate-routes` (`tsr generate`). Never hand-edit `src/routeTree.gen.ts`.
- DB (all require `.env.local`, prefix is already in scripts): `npm run db:push` / `db:migrate` / `db:seed` / `db:studio`. Prisma client output is `src/db/generated/prisma` — generated, do not edit.
- Note: `npm exec --no -- intent list` currently reports `@tanstack/intent is not installed`. Per block above, report it, do not install a replacement. Local skill dirs (`.agents/skills/`, `skills-lock.json`) still apply.
- Package manager is npm (`package-lock.json`). README `pnpm dlx shadcn` examples are stale; use `npx`.

## Architecture

- TanStack Start + TanStack Router (file routes in `src/routes/`) + TanStack Query with SSR integration (`src/router.tsx`, `src/integrations/tanstack-query/root-provider.tsx`). Vercel deploys Nitro output (`vercel.json`, `nitro` in `vite.config.ts`).
- Auth: Better Auth (`src/lib/auth.ts`, `src/lib/auth-client.ts`). Protected pages live under `src/routes/_authenticated/`; guard pattern is `beforeLoad: getSessionUser() -> redirect to /login?redirect` (see `src/routes/_authenticated.tsx`). Server functions in `src/features/auth/auth.functions.ts`.
- Feature layout: `src/features/<domain>/` holds domain logic + `*.queries.ts` + `components/`; shared table primitives in `src/components/data-table/`; dummy data in `src/data/*.dummy.ts` with shapes in `src/data/*.types.ts` mirroring future API responses.
- Data-fetch pattern: route `loader: ctx.queryClient.ensureQueryData(query())` + `useSuspenseQuery(query())` in component (see dashboard route). Query context comes from root route context (`src/routes/__root.tsx` provides `ThemeProvider` + `ToastProvider`).
- Tables are TanStack Table v9 modular (`@tanstack/react-table@9.2.8`): `tableFeatures({...})` in `data-table-features.ts`, `useTable({ features, ... })`, generics ordered `<TFeatures, TData>`. Not v8 `getCoreRowModel` API.
- UI: shadcn `new-york`, CSS vars, lucide (`components.json`; aliases `@/*` and `#/*` both map to `src/*`, css `src/styles.css`). Motion components from beui registry (`@beui` -> `https://beui.dev/r`). Tailwind v4 via `@tailwindcss/vite` — numeric spacing/z utilities are dynamic (`w-58`, `z-90` valid).

## Conventions

- Imports: always use `#/` alias (`#/features/...`, `#/components/...`), never relative `../../`. Path set in `package.json` `imports`, `tsconfig.json` paths, `vite.config.ts` `tsconfigPaths`.
- Prettier: `semi: false, singleQuote: true, trailingComma: all` (`prettier.config.js`). Match it; quote-only churn pollutes diffs.
- Env: `src/env.ts` via `@t3-oss/env-core`, `clientPrefix: 'VITE_'`. Secrets (`DATABASE_URL`, `BETTER_AUTH_*`, `GOOGLE_*`, `SENTRY_AUTH_TOKEN`) stay unprefixed in `.env.local`. `VITE_*` lands in browser bundle.
- Sentry: error collection auto in `src/router.tsx`. Wrap `createServerFn` bodies with `Sentry.startSpan({ name }, ...)` importing from `@sentry/tanstackstart-react` (see `.cursorrules`).
- shadcn: add components with `npx shadcn@latest add <name>`; `cn()` lives in `#/lib/utils` (a `cn` npm package also exists — prefer `#/lib/utils` for consistency).
