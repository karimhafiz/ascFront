# ASC Frontend

React + Vite client for ASC — a community sports/events organisation. Browsing/booking events, tournaments, courses, and venue slots; ticket purchase and QR verification; an admin dashboard with analytics; and a moderator-reviewed page-content editing workflow.

## Tech stack

- **React 18** + **Vite 6**
- **React Router 7** — routes defined in `src/App.jsx`, most pages lazy-loaded
- **TanStack Query 5** — all server data access (reads via `useQuery`, writes via `useMutation`); see [Data fetching](#data-fetching) below
- **Tailwind CSS v4** + **DaisyUI 5** — canonical v4 utility classes, no legacy/arbitrary equivalents where a canonical one exists
- **react-helmet-async** — per-page `<title>`/meta
- **Chart.js** / **react-chartjs-2** — admin analytics charts
- **react-big-calendar**, **react-day-picker** — event/venue scheduling UI
- **Jest** + **React Testing Library** — tests

## Structure

```
src/pages/         route-level components (matches the router tree in App.jsx)
src/components/    shared/reusable pieces, grouped by domain:
                      admin/, profile/, events/, courses/, teams/, venues/, tickets/, auth/
                      common/ and ui/ for cross-domain primitives (modals, toolbars, buttons, cards)
src/hooks/         data hooks — useEvents, useCourses, use*Mutation, useAuth, useAuthState
src/api/
  queryKeys.js      single source of truth for TanStack query keys
  apiClient.js       fetchJSON/fetchPublicJSON convenience wrappers
src/auth/
  auth.js            fetchWithAuth (bearer token + 401-retry-after-refresh) and fetchOrThrow
                      (backend/DB/Stripe-down detection), isAdmin()/isModerator() role checks
  useAuthState.js     auth state hook backing useAuth
src/util/          errorUtil (ApiError, backend/database/rate-limit pub/sub), pageContentRequestStatus, compressImage
```

Admin-only vs moderator-only vs shared variants of a feature follow the existing split: `components/admin/*` for admin-dashboard pieces, `components/profile/*` for the equivalent profile-page pieces — see `ProfilePage.jsx`, which composes small row/panel components from `components/profile/` rather than being one large file.

## Environment variables

Copy `.env.example` to `.env` (and `.env.production` if deploying) — every var is documented there too, generated from what the code actually reads:

```
VITE_DEV_URI=...                       # backend base URL, e.g. http://localhost:5000/
VITE_GOOGLE_CLIENT_ID=...              # Google OAuth client ID (same project as the backend's)
VITE_EMAILJS_SERVICE_ID=...            # EmailJS — used for the site contact form
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

`import.meta.env.DEV` (Vite-provided) is also read to vary dev/prod behaviour — no setup needed.

## Data fetching

**All server data access in components goes through TanStack Query — not a raw `fetch`/`fetchWithAuth` call sitting in a `useEffect` or event handler.**

- **Reads**: `useQuery`, keyed via an entry in `api/queryKeys.js` — see `pages/content/Home.jsx` for the reference pattern (`enabled`/derived state, no manual `useEffect` fetch).
- **Writes** (POST/PUT/PATCH/DELETE): `useMutation`, invalidating or updating (`queryClient.setQueryData`/`invalidateQueries`) whatever query key the write affects, so other views of the same data don't go stale silently.
- `fetchWithAuth` (authenticated) / `fetchPublicJSON` (unauthenticated, built on `fetchOrThrow`) are the right thing to call *inside* a `queryFn`/`mutationFn` — the rule is about where the call is wired up, not about avoiding them.

`fetchWithAuth` attaches the bearer access token and retries once after a silent refresh on a 401. `fetchOrThrow` additionally classifies backend/database/Stripe-outage/rate-limited (429) responses so the UI can show a distinct state instead of a generic error — a full-page block for backend/DB down (`components/common/BackendStatusOverlay.jsx`), and a light dismissible banner for rate-limiting (`components/common/RateLimitBanner.jsx`), since a 429 is transient/self-resolving rather than the whole backend being down.

This is a separate layer from `pages/Errorpage.jsx`, which is wired as a React Router `errorElement` (reads via `useRouteError()`, not props) and only catches genuine render-time JS errors/bugs — not query/mutation failures, which TanStack already handles per-component via its own `error` state.

## Auth

`useAuth`/`useAuthState` track the current user from the access token (decoded client-side with `jwt-decode`) plus a proactive refresh timer. `ProtectedRoute` (any authenticated user) and `ModeratorRoute` (moderator/admin) gate routes in `App.jsx`; `isAdmin()`/`isModerator()` in `auth/auth.js` gate UI affordances (buttons, admin-only panels) at the component level.

Auth session, session expiry, and backend/DB-down status are managed via lightweight hand-rolled observable stores (a Set of subscriber callbacks + useSyncExternalStore) rather than a state-management library — the right level of abstraction for three global flags without adding a Redux/Zustand dependency.

## Styling

Tailwind v4 canonical utility names, not legacy/arbitrary equivalents when a canonical one exists — e.g. `bg-linear-to-r` not `bg-gradient-to-r`, `min-w-7` not `min-w-[28px]`; don't reach for an arbitrary bracket value when a scale value already covers it. Reusable primitives live in `components/common/` (`ConfirmModal` with a `variant` prop for danger actions, `FloatingBar`/`PageEditBar` for toolbars that hover over the page instead of reserving scroll space, `ImageWithFallback` for images that may 404) and `components/ui/` — check there before hand-rolling a new modal/toolbar/etc.

## Testing

Jest + React Testing Library. Prefer testing behaviour/logic over pure rendering — a component that's mostly markup with no branching logic doesn't need a dedicated test. Components using `<Helmet>` need a `HelmetProvider` wrapper in tests; components using `<Link>`/routing need a `MemoryRouter` wrapper.

## Running

```bash
npm install
npm run dev          # vite dev server
npm run build         # production build
npm run preview        # preview the production build locally
npm test              # jest
npm run lint            # eslint .
npm run format            # prettier --write .
```

Husky + lint-staged run eslint/prettier on staged `*.js`/`*.jsx` files pre-commit.
