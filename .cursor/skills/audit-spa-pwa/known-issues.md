# Known Issues & Technical Debt

Pre-identified issues from initial codebase analysis. Use as a starting point — verify each is still relevant.

## Architecture

| Issue | Location | Severity |
|-------|----------|----------|
| Legacy `components/` dir coexists with `shared/components/` | `src/components/` | Low |
| `kioskSubmissionService` orchestrates stores directly | `src/services/kioskSubmissionService.ts` | Medium |
| No use-case / application layer between stores and services | `src/stores/`, `src/services/` | Low |

## Security

| Issue | Location | Severity |
|-------|----------|----------|
| Verify anon RLS policies are minimal | `supabase/schema.sql` | High |
| Client-side role checks are UX-only | `app/router.tsx` ProtectedRoute | Info |

## State Management

| Issue | Location | Severity |
|-------|----------|----------|
| Full list reload after every mutation | All stores with `load*()` pattern | Medium |
| Realtime sync reloads full datasets on any row change | `src/lib/realtimeSync.ts` | Medium |
| Parallel store loading without coordination | `App.tsx` useEffect | Low |
| Custom lock replacing `navigator.locks` | `src/lib/supabaseClient.ts` | Low |

## Performance

| Issue | Location | Severity |
|-------|----------|----------|
| No route-level code splitting | `app/router.tsx` | Medium |
| Potential whole-store subscriptions | Various components | Medium |

## PWA

| Issue | Location | Severity |
|-------|----------|----------|
| Hardcoded cache version `spa-salon-v1` | `public/sw.js` | Medium |
| No offline fallback page | `public/sw.js` | Medium |
| No SW update notification | `src/main.tsx` | Medium |
| Placeholder icons (vite.svg) | `public/manifest.json` | Low |
| No offline detection UX | App-wide | Low |

## Code Quality

| Issue | Location | Severity |
|-------|----------|----------|
| `Record<string, unknown>` for intake data | `src/types/` | Medium |
| Unsafe `as` casts in services | `src/services/` | Medium |
| No React error boundaries | App-wide | Medium |
| No centralized error logging | App-wide | Medium |
| Deprecated `secondaryZones` in selector | `src/stores/selectors/therapistBrief.ts` | Low |
| Magic strings for statuses/roles | Various | Low |
