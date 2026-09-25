# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build         # tsc -b && vite build (type-checks as part of build)
npm run typecheck     # tsc --noEmit only
npm run lint          # eslint .
npm run lint:fix       # eslint . --fix
npm run format         # prettier --write .
npm run format:check   # prettier --check .
```

There is no test runner configured in this project (no test script, no test files, no test framework in `package.json`).

## What this repo is

Read these docs before working on any feature — they are the actual spec, not duplicated here:

- **`docs/RULES.md`** — binding FE conventions (folder layout, import rules, component/form/API patterns, styling). Every file you write must follow this.
- **`docs/STRUCTURE.md`** — file map, boot flow, and wiring (page→hook→api, auth/guard/toast chains), Tailwind token table, done-checklist. Read it when scaffolding a feature, adding a route/primitive/token, or tracing a screen.
- **`../docs/modules-bvc-fe.md`** — the module/screen breakdown (M02–M06, rental module M06-07 explicitly excluded), build order, and a list of open spec ambiguities to check with BE before implementing a given screen. Cross-reference this before starting any new feature so you land in the right `features/{name}/` folder with the right scope.

## Architecture

### App shell (role-gated routing) — already wired, reuse it

```
AppProviders (src/app/providers/AppProviders.tsx)
  └─ AuthProvider (src/shared/context/AuthContext.tsx) — owns `UserInfo`, exposes useAuth()

AppRouter (src/app/router.tsx)
  ├─ public routes: /, /login, /register, /403
  └─ <ProtectedRoute>                          — redirects to /login if no user
       └─ <AppLayout>                          — sidebar (AppSidebar) + topbar + <Outlet/>
            ├─ /dashboard
            └─ <ProtectedRoute allowedRoles={[...]}>   — nest again for role-specific routes, redirects to /403
                 └─ <SomeFeaturePage/>
```

### Feature domains

`src/features/` has one folder per module, mapped from the spec's M02–M06 breakdown:

| Folder          | Spec module                                                                   | Status                                   |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| `auth`          | (unspecced — FE-only login/register/role)                                     | Implemented                              |
| `music-library` | M02 — songs, sheets, discovery, categorization                                | Structure only (`.gitkeep`, no code yet) |
| `classes`       | M03 — classes, roadmap, assignments                                           | Structure only                           |
| `community`     | M04 — bonus, submissions, verified content, leaderboard, challenges           | Structure only                           |
| `ensemble`      | M05 — ensemble practice session, mixer panel, tempo/timing analysis, playback | Structure only                           |
| `platform`      | M06 — users, system config, categories, notifications, help center            | Structure only                           |

Each feature follows the exact `pages/components/hooks/api/types/utils` layout from `docs/RULES.md` §13 — `features/auth/**` is the reference implementation to copy the shape of (thin `api/*Api.ts` wrapper around `axiosClient`, a hook owning loading/error state, `types/*Types.ts` plain interfaces, `utils/validate*.ts` zod schema + inferred form type).

### Shared UI kit

`src/shared/components/ui/` is a full Base UI (`@base-ui/react`) primitive kit already built (table, dialog, tabs, select, switch, checkbox, dropdown-menu, toast, field, etc.) styled with a Material-ish design-token system (`primary`, `surface-container*`, `on-surface*`, `outline-variant`, `error`, defined as Tailwind v4 theme tokens) — reuse these rather than introducing new colors or building new primitives. `toast` (from `ui/toast.tsx`) + `<Toaster/>` are already mounted app-wide. Forms: **use the plain `register()` + `Input` + manual conditional error paragraph pattern from `features/auth/components/LoginForm.tsx`** — the kit also has `Field`/`FieldControl`/`FieldError` Base UI primitives, but no form in this codebase has exercised RHF-through-`Field` integration yet, so prefer the proven pattern until that's validated once.
