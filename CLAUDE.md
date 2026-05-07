# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Tech Stack

- **Frontend:** React 18 + TypeScript, built with Vite + SWC
- **UI:** Shadcn/ui (Radix UI + Tailwind CSS)
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Server State:** TanStack React Query v5
- **Forms:** React Hook Form + Zod validation
- **Maps:** React Leaflet; **Charts:** Recharts; **Email:** EmailJS

## Architecture

### Service Layer
Business logic lives in `src/services/` — each service class wraps Supabase queries directly (e.g., `studentAthleteService.ts`, `chatService.ts`, `collegeService.ts`). Services are consumed via custom hooks in `src/hooks/` that wrap calls with React Query.

### Authentication & Role-Based Routing
`src/contexts/AuthContext.tsx` manages global auth state via `useAuth()`. Users have one of five roles: `admin`, `athlete`, `high_school_athlete`, `family_friend`, `brand`. Each role has a dedicated dashboard page in `src/pages/` (e.g., `AdminDashboard`, `AthleteDashboard`, `BrandDashboard`).

### Component Structure
- `src/components/ui/` — Shadcn/ui primitives (do not edit these directly)
- `src/components/admin/`, `auth/`, `chat/` — feature-specific components
- `src/components/` root — page-level sections (Header, Footer, HeroSection, etc.)

### Data Patterns
- Pagination is done client-side: services fetch up to 1000 records, hooks paginate in memory
- Real-time chat uses Supabase Realtime (configured at 10 events/second max)
- Supabase profile fetches have a 5-second timeout enforced in AuthContext

## Configuration

- Dev server binds to `::` (IPv6) on port 8080 — configured in `vite.config.ts`
- Path alias `@` resolves to `./src`
- TypeScript is configured loosely (`noImplicitAny: false`, `strictNullChecks: false`)
- Custom Tailwind colors: `nil-navy` (#1A1F2C), `nil-orange` (#F97316); custom fonts: Space Grotesk, Roboto
- Environment variables in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_EMAILJS_*`
