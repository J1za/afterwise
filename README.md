# afterwise

> **Wisdom after the fact** / a mini-app that lets you record difficult life or work decisions, sends them to an LLM for analysis (cognitive biases, category, missed alternatives), and gives you a searchable history of every choice you've ever logged.

Afterwise is not a journaling app. It's a **retrospective decision coach**. You describe the situation, the choice you made, and (optionally) your reasoning. Claude analyses what happened and points out the biases and alternatives you may have missed / so the next time a similar fork appears in your life, you walk in with a clearer head.

---

## Table of contents

1. [What it does](#what-it-does)
2. [Tech stack](#tech-stack)
3. [Architecture at a glance](#architecture-at-a-glance)
4. [Project structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick start](#quick-start)
7. [Environment variables](#environment-variables)
8. [Database setup (Supabase)](#database-setup-supabase)
9. [Running the app](#running-the-app)
10. [Available scripts](#available-scripts)
11. [How the LLM pipeline works](#how-the-llm-pipeline-works)
12. [Authentication model](#authentication-model)
13. [Code conventions](#code-conventions)
14. [Internationalization](#internationalization)

---

## What it does

- **Capture.** Three-step form: situation / decision / reasoning (reasoning optional). Drafts auto-save to `localStorage`, so a refresh never loses your work.
- **Analyse.** The decision is inserted into Postgres with `status: 'processing'`, the response returns immediately, and the analysis runs in the background via Next.js `after()`. Claude returns a structured object: `category`, `summary`, up to 6 `cognitiveBiases`, and up to 5 `missedAlternatives`.
- **Live status.** Supabase Realtime pushes the row update to the browser the moment the analysis completes / no polling, no manual refresh. A toast appears (`Analysis ready` / `Analysis failed`).
- **History.** Every decision is a card in the timeline. Filter by status (processing / done / error) and category, sort newest/oldest, and click into the detail view to read the full analysis.
- **Retry on failure.** If the LLM call errors out, the row lands in `status: 'error'` with the error message. One click re-queues it.
- **Guest mode.** Try the app without signing up / anonymous auth gives you exactly one free decision. After that, the signup CTA gently nudges.
- **Dashboard.** Aggregate stats: total decisions, breakdown by category, top cognitive biases, monthly trend chart. Computed by a single Postgres RPC so the page is one round trip.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server Components by default, `after()` for background work, Route Handlers for the API, typed routes. |
| **Runtime** | [React 19](https://react.dev/) | Server Components, native `use()`, transitions. |
| **Language** | TypeScript 6 (strict) | Catches bugs before they ship. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first, theme tokens, zero runtime cost. |
| **UI primitives** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Copy-paste components I own and can edit, on top of accessible Radix primitives. |
| **Icons** | [lucide-react](https://lucide.dev/) | Consistent stroke-based icon set, tree-shakeable. |
| **Charts** | [Recharts](https://recharts.org/) | Declarative React charting, plays well with shadcn's `ChartContainer`. |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | The auth scene with the four blinking characters. |
| **Server state** | [TanStack Query v5](https://tanstack.com/query) | Every Supabase read goes through `useQuery`; writes use `useMutation` with cache patches. No `useEffect` + `fetch` anywhere. |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) via `@hookform/resolvers/zod` | Schema-first validation; the same Zod schema validates the API payload and the LLM output. |
| **Database** | [Supabase](https://supabase.com/) (Postgres) | Postgres + Auth + Realtime + RLS in one. |
| **Auth** | Supabase Auth (email/password + anonymous) | Real auth, RLS-enforced. Anonymous sessions get a `is_anonymous` flag. |
| **Realtime** | Supabase Realtime | Subscribed to the `decisions` table; status updates land in the React Query cache via `setQueryData` / `invalidateQueries`. |
| **LLM** | [Anthropic Claude](https://www.anthropic.com/) via the [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` + `@ai-sdk/anthropic`) | `generateObject` enforces the Zod schema on the model / no free-form parsing. Default model: `claude-haiku-4-5-20251001`. |
| **i18n** | [next-intl](https://next-intl.dev/) | English and Ukrainian out of the box; locale stored in a cookie. |
| **Theming** | [next-themes](https://github.com/pacanukeyev/next-themes) | System / light / dark. |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Toast for analysis completion and errors. |
| **Fonts** | [Geist Sans & Geist Mono](https://vercel.com/font) (via `geist`) | Monospace numerals for status timestamps, clean sans for the rest. |
| **Hosting** | [Vercel](https://vercel.com/) | Native Next.js host, edge functions, `after()` support. |

---

## Architecture at a glance

```
┌──────────────┐       ┌───────────────────────┐       ┌──────────────────┐
│   Browser    │──────▶│  Next.js (App Router) │──────▶│ Supabase (RLS)   │
│              │  SSR  │  Server Components    │  SQL  │  Postgres        │
│  React 19    │       │  Route Handlers       │       │  Auth            │
│  TanStack Q  │◀──────│  after() background   │       │  Realtime ───────┼──┐
└──────┬───────┘  WS   └───────────┬───────────┘       └──────────────────┘  │
       │                           │                                          │
       │                           ▼                                          │
       │                ┌─────────────────────┐                               │
       │                │  Anthropic Claude   │                               │
       │                │  via Vercel AI SDK  │                               │
       │                │  generateObject()   │                               │
       │                └─────────────────────┘                               │
       │                                                                      │
       └──────────────────────────────────────────────────────────────────────┘
                          Realtime status push (WebSocket)
```

**Read path.** Server Component / `getServerSupabase()` / `getServerAuthStatus()` (React `cache()`-wrapped, cookie-bound) / page renders with auth context / client islands hydrate / TanStack Query fetches via the `services/` layer.

**Write path.** Client form / `useMutation` / `POST /api/decisions` / Route Handler validates with Zod / inserts row with `status: 'processing'` / returns `201` / `after()` callback runs `runAnalysis()` out-of-band / updates row to `done` or `error` / Realtime broadcasts the update / all open browsers patch their TanStack Query cache / UI re-renders.

---

## Project structure

```
afterwise/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # /login, /signup / server shell + client form island
│   │   ├── (protected)/             # auth-required routes (sidebar + content)
│   │   │   ├── page.tsx             # / / home: hero grid + recent decisions
│   │   │   ├── dashboard/page.tsx   # /dashboard / charts (KPIs, categories, biases, trend)
│   │   │   └── decisions/
│   │   │       ├── page.tsx         # /decisions / list with filters
│   │   │       ├── new/page.tsx     # /decisions/new / 3-step capture form
│   │   │       └── [id]/page.tsx    # /decisions/[id] / detail + analysis
│   │   ├── api/
│   │   │   └── decisions/
│   │   │       ├── route.ts         # POST: create + queue analysis via after()
│   │   │       └── [id]/retry/route.ts  # POST: re-run analysis on a failed row
│   │   ├── actions/                 # Server Actions (locale switch)
│   │   └── layout.tsx               # Root layout: i18n + theme + Geist fonts
│   │
│   ├── components/                  # Atomic-design hierarchy
│   │   ├── atoms/                   # Brand, Typography, StatusBadge, GradientBackdrop
│   │   ├── molecules/               # PasswordInput, DecisionFilters, GuestBanner, AppSidebar
│   │   ├── organisms/               # AuthForm, DecisionForm, DecisionsList, DashboardCharts...
│   │   ├── templates/               # ProtectedLayout (sidebar + content shell)
│   │   └── ui/                      # shadcn/ui primitives (button, form, input, ...)
│   │
│   ├── hooks/                       # useDecisions, useDecision, useCreateDecision,
│   │                                # useRetryAnalysis, useDashboardStats, useSignIn,
│   │                                # useSignUp, useSignOut, useDecisionsRealtime, ...
│   │
│   ├── services/                    # Auth, Decisions, Dashboard, LLM / every DB call lives here
│   │
│   ├── lib/
│   │   ├── supabase.ts              # 3 factories: browser, server, admin (service-role)
│   │   ├── supabaseServer.ts        # cookies()-bound server client
│   │   ├── supabaseMiddleware.ts    # session refresh in middleware
│   │   └── utils.ts                 # cn() helper
│   │
│   ├── validations/                 # All Zod schemas (decision, auth, dashboard)
│   ├── types/                       # *.type.ts (TypeScript types only)
│   ├── constants/                   # queryKeys, llmPrompt, app constants
│   ├── utilities/                   # formatDate, getServerAuthStatus, translateAuthError, ...
│   ├── providers/                   # QueryClientProvider, ThemeProvider, AppProviders
│   ├── i18n/                        # next-intl config + request handler
│   └── locales/                     # en.json, uk.json
│
├── supabase/
│   └── migrations/                  # SQL migrations (tables, RLS policies, RPCs, realtime)
│
├── next.config.ts                   # Next.js config (typedRoutes, optimizePackageImports)
├── tailwind.config / globals.css    # Tailwind v4 theme tokens
├── tsconfig.json
└── package.json
```

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | `>= 24.13.0` | Use [nvm](https://github.com/nvm-sh/nvm) or [Volta](https://volta.sh/) to pin. |
| **pnpm** | `>= 9` | `npm install -g pnpm` or `corepack enable && corepack prepare pnpm@latest --activate`. |
| **Supabase account** | / | Free tier works. [supabase.com](https://supabase.com/) |
| **Anthropic API key** | / | [console.anthropic.com](https://console.anthropic.com/) |
| **(Optional) Supabase CLI** | `>= 2.0` | Only needed if you want to run Supabase locally via Docker. |
| **(Optional) Docker** | / | Required by the Supabase CLI for the local stack. |

---

## Quick start

The five-minute path, assuming you already have a Supabase project and an Anthropic key:

```bash
# 1. Clone and install
git clone <your-repo-url> afterwise
cd afterwise
pnpm install

# 2. Configure secrets
cp .env.example .env.local
# then open .env.local and fill in the four values

# 3. Push the migrations to your Supabase project
#    (or paste the SQL files into the Supabase SQL editor in order)
supabase link --project-ref <your-project-ref>
supabase db push

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login screen. Click **"Try as guest"** to skip signup and log your first decision in under a minute.

---

## Environment variables

Create `.env.local` at the repo root (it's gitignored). Every value is required for the app to boot, except `ANTHROPIC_MODEL` which has a sensible default.

```bash
# ────────────────────────────────────────────────────────────────
# Supabase / Settings / API
# ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Server-only. NEVER prefix with NEXT_PUBLIC_.
# Used by lib/supabase.ts / createAdminClient() inside route handlers
# and runAnalysis() to write the LLM result back without going through RLS.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ────────────────────────────────────────────────────────────────
# Anthropic / console.anthropic.com / API Keys
# ────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

**Rules of the road**

- Anything prefixed `NEXT_PUBLIC_` is **shipped to the browser**. Keep the service-role key and the Anthropic key without that prefix.
- The service-role key bypasses RLS / only `lib/supabase.ts / createAdminClient()` should ever import it, and that file is `server-only`.
- Don't commit `.env.local`. It's already in `.gitignore`.

---

## Database setup (Supabase)

The schema lives in `supabase/migrations/` as plain SQL / seven numbered files that must be applied in order. You have three ways to apply them:

### Option A / Supabase CLI (recommended)

```bash
# Install the CLI once
npm install -g supabase

# Link the local repo to your remote project
supabase link --project-ref <your-project-ref>

# Push every migration in order
supabase db push
```

### Option B / Manual paste in the SQL Editor

1. Open your project in the Supabase dashboard / **SQL Editor**.
2. For each file in `supabase/migrations/` (in numeric order: `0001_*` / `0007_*`), paste it into a new query and run.

### Option C / Local Supabase (Docker)

```bash
# Boots Postgres + Auth + Realtime + Studio in containers
supabase start

# Re-apply all migrations against the local DB
supabase db reset

# Studio at http://localhost:54323
# Postgres at postgres://postgres:postgres@127.0.0.1:54322/postgres
```

Then point `.env.local` at the local URL/keys printed by `supabase start`.

### What the migrations do

| File | Adds |
|---|---|
| `0001_init.sql` | `decisions` table, `decision_analyses` table, `decision_status` enum, indexes. |
| `0002_rls_realtime.sql` | Enables RLS on both tables, adds `auth.uid() = user_id` policies, adds tables to the `supabase_realtime` publication. |
| `0003_dashboard_stats_rpc.sql` | `dashboard_stats()` RPC / aggregates KPIs, by-category, by-bias, by-month in one round trip. |
| `0004_fix_set_updated_at_search_path.sql` | Hardens the `set_updated_at` trigger function with an explicit `search_path`. |
| `0005_anonymous_one_decision_limit.sql` | Trigger that caps anonymous users at one decision. |
| `0006_decisions_language.sql` | Adds `language` column to `decisions` so the LLM responds in the user's locale. |
| `0007_fix_anonymous_limit_recursion.sql` | Fixes a recursion bug in the anonymous-limit trigger. |

### Enable email/password auth

In the Supabase dashboard / **Authentication / Providers** / make sure **Email** is enabled. Anonymous sign-in (for guest mode) is under **Authentication / Settings / "Allow anonymous sign-ins"** / turn it on.

---

## Running the app

```bash
pnpm dev
```

The dev server starts on [http://localhost:3000](http://localhost:3000) with HMR. The first request compiles routes lazily; subsequent navigations are instant.

**What to try, in order:**

1. Hit `/`. You're redirected to `/login`.
2. Click **"Try as guest"** / anonymous session, you're now on `/`.
3. Click **"New decision"** / three-step form. Try refreshing in the middle of step 2; your draft is restored.
4. Submit. You're sent to `/decisions/[id]`. Watch the status badge flip from **processing** / **done** in a few seconds (Realtime, not polling).
5. Browse the analysis: summary, cognitive biases, missed alternatives.
6. Sign up (limit one decision as guest, so you'll need an account for the rest).
7. Visit `/dashboard` / KPIs and charts populate as you add more decisions.

---

## Available scripts

```bash
pnpm dev          # Start Next.js dev server (HMR, http://localhost:3000)
pnpm build        # Production build
pnpm start        # Serve the production build locally
pnpm lint         # ESLint (Next.js + React Compiler rules)
pnpm type-check   # tsc --noEmit (no emit, just typecheck)
```

For the Supabase local stack (only if you're using Option C above):

```bash
supabase start                              # Boot the local Docker stack
supabase stop                               # Tear it down
supabase db reset                           # Wipe + re-apply migrations locally
supabase db push                            # Push migrations to the linked remote project
supabase gen types typescript --local       # Regenerate src/types/supabase.type.ts
```

---

## How the LLM pipeline works

```
1.  Client                       2.  Route Handler                 3.  after() callback
─────────────                     ──────────────────                ────────────────────
  useCreateDecision               POST /api/decisions               runAnalysis(decisionId)
     mutate(input)                  │                                 │
        │                           ├─ Zod validates input            ├─ Load row via admin client
        ▼                           │                                 ├─ Call generateObject() with
  POST /api/decisions               ├─ Insert row, status=processing  │  the Zod schema as the
        │                           │  (user-scoped client, RLS ok)   │  expected output shape
        ▼                           │                                 │
  201 Created                       ├─ Respond 201 to the browser     ├─ On success:
  (decision row)                    │                                 │    UPDATE decisions
        │                           ▼                                 │    SET status='done'
        │                           after(() => runAnalysis(id))      │    INSERT decision_analyses
        │                                                             │
        ▼                                                             ├─ On failure:
  Realtime subscription                                               │    UPDATE decisions
  fires status update                                                 │    SET status='error',
        │                                                             │        error_message=...
        ▼
  setQueryData patches
  the cache; UI re-renders
```

**Key design choices**

- **`after()` over a queue.** This is an MVP; for the throughput we need, Next.js's `after()` (response-sent-then-run) is plenty. No Redis, no cron, no extra infra.
- **`generateObject`, not `generateText`.** The Vercel AI SDK enforces a Zod schema on the model's output. Either the response matches `decisionAnalysisResultSchema` or it throws / no JSON.parse, no hallucinated fields.
- **Service-role for the write-back.** `runAnalysis` updates the row using the admin client because the original user's cookies aren't available in the background context. RLS is intentionally bypassed here; the original `user_id` is preserved on the row.
- **Errors never throw uncaught.** Anything that goes wrong in `runAnalysis` is caught and persisted to `decisions.error_message`, so the UI can render the failure and offer a retry.

---

## Authentication model

Three identities, one schema:

1. **Email/password user.** Standard Supabase Auth. Full access to all features.
2. **Anonymous user.** `supabase.auth.signInAnonymously()` / gives the user a real `auth.uid()` so RLS policies still work, but flags the session as anonymous. Limited to **one decision** by a Postgres trigger (`0005_anonymous_one_decision_limit.sql`).
3. **No session.** Redirected to `/login` by the protected layout.

---

## Code conventions

- **No comments in source code.** Code is self-documenting via naming. The only exceptions are inline type-system hints.
- **camelCase everywhere** / file names, folders, variables, constants. No `kebab-case`, no `SCREAMING_SNAKE_CASE`, no `snake_case`. The only `snake_case` is in Postgres column names; bridge naming happens at the service layer.
- **shadcn/ui-only components.** `<Typography>`, `<Button>`, `<Input>`, etc. / never raw `<p>` or custom buttons.
- **TanStack Query for all server state.** No `useEffect` + `fetch`. Query keys live in `src/constants/app.constant.ts` under `queryKeys.<domain>.<view>(...)`.
- **react-hook-form + Zod for all forms.** No manual `useState` field state, no hand-rolled validation.
- **Atomic design folder layout** (`atoms/molecules/organisms/templates`) for components.
- **All DB calls go through `services/`.** Hooks and components never import `supabase` directly.
- **Tailwind theme tokens only.** No `bg-[#0a0a0f]` or `text-[14px]` / extend the theme or use a token.
- **No `as never`, no `as Route`, no `!important` Tailwind hacks.** Fix the type or the structure instead.

---

## Internationalization

Two locales ship today: **English** (`en`) and **Ukrainian** (`uk`). The active locale is stored in a cookie (`NEXT_LOCALE`), read by `next-intl/server` on every request.

- Translations live in `src/locales/<locale>.json`.
- The `LanguageToggle` in the sidebar (and the auth screen top-right) switches locale via a Server Action (`src/app/actions/setLocale.ts`).
- The LLM is told the user's locale (`decisions.language` column) and responds in that language.

To add a new locale, drop a `<code>.json` next to the existing files, then add it to `locales` in `src/i18n/config.ts`.
