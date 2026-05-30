# HotelOS - Hotel Management Frontend

HotelOS is a multi-tenant hotel management SaaS frontend built with the Next.js App Router. It includes public hotel pages, customer booking flows, customer portal pages, tenant admin tools, and super-admin management screens.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **UI Runtime:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with CSS theme variables
- **State Management:** Zustand with persisted stores
- **Server State:** TanStack React Query
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`
- **Linting:** ESLint 9 with `eslint-config-next`

## Main Features

- Public website and hotel detail pages
- Hotel room listing and room booking flow
- Password and OTP based authentication screens
- Customer dashboard, bookings, favorites, and profile pages
- Tenant admin dashboard for bookings, rooms, pricing, promos, reports, settings, and profile
- Super-admin dashboard for tenants, hotels, users, and profile
- Tenant-aware API helpers for rooms, bookings, users, file uploads, and authentication
- Light/dark theme support with persisted preference

## Project Structure

```text
app/
  (auth)/                  Login and OTP verification pages
  (website)/               Public website routes
  (customer)/              Customer-facing hotel discovery and booking routes
  (customer-portal)/       Authenticated customer dashboard routes
  (admin)/                 Tenant admin dashboard routes
  (super-admin)/           Platform admin dashboard routes
  api/auth/                Local auth proxy/utility API routes
  globals.css              Tailwind import, theme tokens, dark-mode overrides
  layout.tsx               Root app shell and font setup
  providers.tsx            React Query, auth hydration, and theme hydration

components/
  dashboard/               Dashboard summary widgets
  forms/                   Login, booking, room, tenant, user, and profile forms
  hotel/                   Hotel, room, booking cards, and room lists
  layout/                  Header, footer, navbar, sidebar, auth guard, user menu
  tenant/                  Tenant and tenant-user list components
  ui/                      Shared primitive UI components

lib/
  auth-api.ts              Login and current-user API helpers
  tenant-api.ts            Tenant, room, booking, file, and user API helpers
  mock-data.ts             Local mock data for UI screens
  theme.ts                 Theme application helpers
  use-hydrated.ts          Hydration utility hook
  utils.ts                 Shared utility functions

store/
  auth-store.ts            Persisted auth/session state
  tenant-store.ts          Persisted active tenant state
  theme-store.ts           Persisted theme state

generated/
  generated.d.ts           Generated backend response/type definitions
```

## Route Groups

Route groups are used to separate user contexts without adding the group name to the URL.

- `(website)` contains public landing and hotel pages.
- `(customer)` contains customer hotel discovery and booking pages.
- `(customer-portal)` contains authenticated customer account pages under `/customer`.
- `(admin)` contains tenant admin pages under `/admin`.
- `(super-admin)` contains platform admin pages under `/super-admin`.
- `(auth)` contains `/login` and `/verify-otp`.

## Environment Variables

Create a `.env.local` file when backend URLs need to differ from the defaults.

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8084/api
NEXT_PUBLIC_TENANT_API_URL=http://localhost:8084/api/tenants
NEXT_PUBLIC_TENANT_ID=
```

Notes:

- `NEXT_PUBLIC_BACKEND_URL` is used by auth and tenant API helpers.
- `NEXT_PUBLIC_TENANT_API_URL` overrides the tenant auth endpoint base.
- `NEXT_PUBLIC_TENANT_ID` makes auth helpers call tenant-specific login/me endpoints.
- `next.config.ts` allows remote images from `localhost:8084/storage/**` and `localhost:8000/storage/**`.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Available Scripts

```bash
npm run dev      # Start the Next.js development server
npm run build    # Build the production app
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## Development Notes

- Use the `@/*` TypeScript path alias for imports from the project root.
- Shared client providers live in `app/providers.tsx`.
- Auth, tenant, and theme stores use Zustand persistence with manual hydration.
- Keep reusable UI in `components/ui`, feature components in their own folders, and API access in `lib`.
- Tenant API calls expect a bearer token and, where needed, the active tenant ID from `store/tenant-store.ts`.
