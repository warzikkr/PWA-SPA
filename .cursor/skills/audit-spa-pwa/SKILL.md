---
name: audit-spa-pwa
description: Audit a React+TypeScript Spa PWA project for architecture, security, performance, and code quality issues. Use when the user asks to audit, review, or improve the codebase, or asks about best practices, code smells, or technical debt.
---

# Spa PWA Full Audit

## Tech Stack

React 19 · TypeScript · Vite · Zustand 5 · Supabase · React Router 7 · Tailwind CSS 4 · React Hook Form + Zod · i18next · PWA (custom SW)

## Project Layout

```
src/
  app/          — App.tsx, router.tsx
  features/     — admin, auth, kiosk, reception, therapist
  shared/       — reusable components + layouts
  components/   — legacy (migrating to shared/)
  stores/       — Zustand stores + selectors/
  services/     — Supabase API layer (one per entity)
  lib/          — supabaseClient.ts, realtimeSync.ts
  engine/       — dynamic form renderer
  types/        — shared TypeScript types
  i18n/         — translations
supabase/       — schema, migrations, seed
public/         — manifest.json, sw.js
```

## Audit Checklist

Copy and track progress:

```
Audit Progress:
- [ ] 1. Architecture & patterns
- [ ] 2. Security & Supabase RLS
- [ ] 3. State management
- [ ] 4. Performance
- [ ] 5. PWA correctness
- [ ] 6. Code quality & TypeScript
- [ ] 7. Summary & recommendations
```

---

## 1. Architecture & Patterns

Check for:

- **Feature isolation**: each feature in `features/{name}/` with own pages, components, hooks. No cross-feature imports except through `shared/` or `stores/`.
- **Legacy code**: `src/components/` should be empty or migrating to `shared/components/`. Flag any remaining usage.
- **Service layer**: each domain entity has a service in `services/`. Services should not import stores. Stores call services, not the other way around.
- **Mixed concerns**: orchestration logic (e.g., `kioskSubmissionService.ts`) should live in stores or a use-case layer, not in services.
- **Router structure** (`app/router.tsx`): `ProtectedRoute` wraps role-gated routes. Verify `allowedRoles` arrays match business requirements.

## 2. Security & Supabase RLS

Check for:

- **RLS enabled** on every table in `supabase/schema.sql`.
- **Policy completeness**: each role (`admin`, `reception`, `therapist`, `anon`) has explicit SELECT/INSERT/UPDATE/DELETE policies. No permissive gaps.
- **Anon access**: kiosk uses `anon` key — verify anon policies are minimal (insert bookings/clients/intakes only, no updates/deletes).
- **Auth flow** (`stores/authStore.ts`): uses `onAuthStateChange` with `INITIAL_SESSION`. No `getSession()` duplication. Checks `enabled` flag.
- **Secrets**: no hardcoded keys in source. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` only. Anon key is safe to expose (RLS enforces access).
- **Client-side role checks**: `ProtectedRoute` is UX-only; real security is RLS. Confirm no security-critical logic relies solely on client-side role checks.

## 3. State Management

Check for:

- **Store boundaries**: one Zustand store per domain (auth, booking, client, intake, config, etc.). No god-stores.
- **Realtime sync** (`lib/realtimeSync.ts`): subscribes to Postgres changes → reloads store data. Flag if full list reloads on every single change (inefficient for large datasets). Suggest selective updates or optimistic mutations.
- **Reload-after-mutate anti-pattern**: stores that call `addX()` then immediately `loadAll()`. Should upsert locally + let realtime confirm.
- **Selector layer** (`stores/selectors/`): derived state should be in selectors, not computed in components.
- **Memory leaks**: verify subscriptions are cleaned up on unmount (especially realtime channel in `App.tsx`).

## 4. Performance

Check for:

- **Bundle size**: unnecessary dependencies, missing tree-shaking. Run `npx vite-bundle-visualizer` if needed.
- **Lazy loading**: route-level code splitting with `React.lazy()` for admin/therapist/reception features. Kiosk loads separately.
- **Re-renders**: components subscribing to entire store instead of slices. Use Zustand selectors: `useStore(s => s.field)`.
- **List rendering**: large lists (bookings, clients) need virtualization or pagination.
- **Image/asset optimization**: check for unoptimized assets in `public/`.

## 5. PWA Correctness

Check for:

- **Service worker** (`public/sw.js`):
  - Cache versioning strategy (currently hardcoded `spa-salon-v1`). Needs cache-busting on deploy.
  - Offline fallback page missing.
  - No update notification — users may run stale code indefinitely.
- **Manifest** (`public/manifest.json`):
  - Proper icons (currently placeholder `vite.svg`).
  - Correct `start_url`, `scope`, `display`.
- **Offline UX**: detect `navigator.onLine` and show appropriate UI.
- **Install prompt**: handle `beforeinstallprompt` event for custom install UX.

## 6. Code Quality & TypeScript

Check for:

- **Type safety gaps**: `Record<string, unknown>`, `any`, unsafe `as` casts. Prefer Zod schemas for runtime validation of Supabase responses.
- **Error handling**: no centralized error handler. `console.error()` scattered across stores/services. Recommend error boundary + toast notification pattern.
- **Error boundaries**: missing React error boundaries. Each route should have one.
- **Consistent naming**: file/folder naming conventions, component naming.
- **Dead code**: unused exports, commented-out code, deprecated fields (e.g., `secondaryZones` in selectors).
- **i18n completeness**: all user-facing strings use `t()`. No hardcoded text.
- **Form validation**: React Hook Form + Zod schemas should cover all forms. Check for unvalidated inputs.
- **Magic strings**: roles, statuses, field names. Should be enums or const objects in `types/`.

## 7. Summary & Recommendations

After audit, produce a report:

```markdown
# Audit Report

## Critical (must fix)
- [list items with file references]

## Important (should fix)
- [list items with file references]

## Nice to have
- [list items with file references]

## Positive patterns to keep
- [list items]
```

Prioritize by **security > correctness > performance > code quality**.

---

## Running the Audit

1. Start with `git status` to understand current state
2. Follow the checklist sections 1–6 in order
3. For each issue found, note the file path and line
4. Produce the summary report (section 7)
5. Optionally create GitHub issues or TODOs for tracked items

For deeper investigation of specific areas, see [known-issues.md](known-issues.md).
