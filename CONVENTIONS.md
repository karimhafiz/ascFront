# ascFront conventions

React + Vite + TanStack Query + Tailwind v4 + DaisyUI + react-router-dom.

## Structure

- `pages/` — route-level components (matches `src/App.jsx`'s router tree).
- `components/` — shared/reusable pieces, grouped by domain: `admin/`, `profile/`, `events/`, `courses/`, `teams/`, `venues/`, plus `common/`/`ui/` for cross-domain primitives.
- `hooks/` — **all** `useMutation` calls live here, one file per resource/domain (e.g. `useCourseMutation.js`, `useEnrollmentMutation.js`, `usePageContentMutation.js`), never inline in the component that calls them — even a mutation used by exactly one component. This is a flat rule, not "extract only if reused": a mixed inline/extracted split makes a mutation's location unpredictable, and grouping by domain (not by calling component) also surfaces genuine duplication — e.g. `useEnrollmentMutation.js` is shared by `EnrolledPanel.jsx` and `EnrollmentRow.jsx`, which independently reimplemented the same cancel/reactivate calls before this was noticed. Query-side data hooks (`useEvents`, `useCourses`) follow the same domain-file grouping. `useAuth`/`useAuthState` are the exception (auth state, not server data).
- `api/queryKeys.js` — single source of truth for TanStack query keys. Add a new entry here before writing a new `useQuery`/`useMutation`; don't inline ad-hoc key arrays. Prune entries here when the call site that used them is deleted or rewritten — a stale key with no reads is easy to miss since nothing errors, it just silently stops caching anything.
- `auth/auth.js` — `fetchWithAuth` (auth-aware fetch: attaches the bearer token, retries once on 401 after a refresh) and `isAdmin()`/`isModerator()` role checks.

When a page needs an admin-only vs moderator-only vs shared variant of something, follow the existing split: `components/admin/*` for admin-dashboard pieces, `components/profile/*` for the equivalent profile-page pieces (see `ProfilePage.jsx`, which composes small row/panel components from `components/profile/` rather than being one large file).

## Data fetching — TanStack Query only, no bare `fetch`

All server data access in components must go through TanStack Query — not a raw `fetch`/`fetchWithAuth` call sitting in a `useEffect` or an event handler.

- **Reads**: `useQuery`, keyed via an entry in `queryKeys.js`. See `pages/content/Home.jsx` for the reference pattern.
- **Writes** (POST/PUT/PATCH/DELETE): a `useMutation`-returning hook in `hooks/` (see above), invalidating or updating (`queryClient.setQueryData`/`invalidateQueries`) whatever query key the write affects, so other views of the same data don't go stale silently. Component-specific UI reactions (local state, toasts, redirects) belong in the *calling* component, passed as the second argument to `.mutate(variables, { onSuccess, onError })` — the hook itself should only own the network call and the cache update, not page-specific behavior.
- `fetchWithAuth` is still the right thing to call *inside* a `queryFn`/`mutationFn` — the rule is about where the call is wired up, not about avoiding `fetchWithAuth` itself. Exceptions where a call deliberately does **not** go through `fetchWithAuth`/`fetchJSON`: public GETs anyone can view without a token (page content, `Home.jsx`/`About.jsx`), and logout (`useLogoutMutation`) — both would break if `fetchWithAuth` were used, since it throws on a missing/expired token.
- `api/apiClient.js#fetchJSON(url, options)` wraps `fetchWithAuth` and does the unwrap-and-throw-on-error boilerplate — use it inside a `mutationFn`/`queryFn` instead of hand-rolling `res.ok`/`res.json()` checks.

This is enforced as of 2026-08-12 — `feature/tanstack-consistency-refactor` converted every remaining bare-`fetch`/`fetchWithAuth` call site to this pattern and merged the mutation hooks into `hooks/`.

## Styling — Tailwind v4 canonical classes

Use Tailwind v4's canonical utility names, not legacy/arbitrary equivalents, when a canonical one exists — e.g. `bg-linear-to-r` not `bg-gradient-to-r`, `min-w-7` not `min-w-[28px]`. Don't reach for an arbitrary bracket value (`min-h-[34rem]`, `w-[500px]`) when a scale value already covers it.

Reusable UI primitives live in `components/common/` (`ConfirmModal` with a `variant` prop for danger actions, `FloatingBar`/`PageEditBar` for toolbars that hover over the page instead of reserving scroll space, `ImageWithFallback` for images that may 404) and `components/ui/`. Check there before hand-rolling a new modal/toolbar/etc.

## Testing

Jest + React Testing Library. Prefer testing behavior/logic over pure rendering — a component that's mostly markup with no branching logic doesn't need a dedicated test.
