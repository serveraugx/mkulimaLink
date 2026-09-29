# 🚀 Next.js 14 Template

A production-ready **Next.js 14** starter with TypeScript, Tailwind CSS, Zustand, and the App Router. This template is structured to scale from a side project to a large enterprise application.

---

## 📁 Project Structure

```
nextjs-template/
│
├── public/                         # Static assets (served at /)
│   └── README.txt                  # Usage notes for the public dir
│
├── src/
│   ├── app/                        # Next.js App Router (file-based routing)
│   │   ├── layout.tsx              # Root layout — fonts, metadata, providers
│   │   ├── page.tsx                # Home page (/)
│   │   ├── loading.tsx             # Global loading UI (Suspense boundary)
│   │   ├── error.tsx               # Global error boundary (Client Component)
│   │   ├── not-found.tsx           # Custom 404 page
│   │   │
│   │   ├── (auth)/                 # 🔒 Route group — auth pages (no shared layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # /login
│   │   │   └── register/
│   │   │       └── page.tsx        # /register
│   │   │
│   │   ├── (dashboard)/            # 📊 Route group — dashboard with shared layout
│   │   │   ├── layout.tsx          # Dashboard layout: Sidebar + Header
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # /dashboard (overview)
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx    # /dashboard/analytics
│   │   │       └── settings/
│   │   │           └── page.tsx    # /dashboard/settings
│   │   │
│   │   └── api/                    # API Routes (Next.js Route Handlers)
│   │       ├── health/
│   │       │   └── route.ts        # GET  /api/health
│   │       └── users/
│   │           ├── route.ts        # GET /api/users  · POST /api/users
│   │           └── [id]/
│   │               └── route.ts    # GET · PATCH · DELETE /api/users/:id
│   │
│   ├── components/                 # Reusable React components
│   │   ├── layout/                 # App shell components
│   │   │   ├── Sidebar.tsx         # Navigation sidebar (active-link aware)
│   │   │   └── Header.tsx          # Top header with search & notifications
│   │   │
│   │   └── ui/                     # Primitive UI components (design system)
│   │       ├── Button.tsx          # Button — variants: primary, secondary, danger, ghost
│   │       ├── Input.tsx           # Input — with label, hint & error states
│   │       ├── Card.tsx            # Card, CardHeader, CardTitle, CardContent
│   │       └── Modal.tsx           # Accessible modal (native <dialog>)
│   │
│   ├── lib/                        # Shared library utilities
│   │   ├── api.ts                  # Axios instance — base URL, interceptors, auth
│   │   └── apiHelpers.ts           # Route handler helpers (withErrorHandler, successResponse)
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useFetch.ts             # Generic data-fetching hook with loading/error states
│   │   └── useIsMounted.ts         # SSR-safe client mount detection hook
│   │
│   ├── store/                      # Zustand global state stores
│   │   ├── authStore.ts            # Auth state: user, token, isAuthenticated (persisted)
│   │   └── uiStore.ts              # UI state: toast notifications, sidebar toggle
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── user.ts                 # User, UserRole, CreateUserDto, UpdateUserDto
│   │   └── global.ts               # ApiResponse, PaginatedResponse, ApiError, utility types
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── helpers.ts              # cn(), formatDate(), truncate(), generateId(), sleep()
│   │   └── validators.ts           # isValidEmail(), isStrongPassword(), validateUserForm()
│   │
│   ├── config/                     # App-wide configuration
│   │   ├── app.ts                  # App config (name, URL, API, auth, pagination)
│   │   └── navigation.ts           # Centralized nav link definitions (NAV_LINKS, AUTH_LINKS)
│   │
│   ├── styles/                     # Global CSS
│   │   └── globals.css             # Tailwind imports, CSS vars, base styles, animations
│   │
│   └── middleware.ts               # Edge Middleware — auth guard, redirect logic
│
├── .env.example                    # Environment variable template (copy → .env.local)
├── .eslintrc.json                  # ESLint configuration (extends next/core-web-vitals)
├── .gitignore                      # Git ignored files
├── .prettierrc                     # Prettier formatting rules
├── next.config.js                  # Next.js config: images, headers, redirects
├── package.json                    # Dependencies and npm scripts
├── postcss.config.js               # PostCSS with Tailwind and autoprefixer
├── tailwind.config.js              # Tailwind theme: colors, fonts, animations
└── tsconfig.json                   # TypeScript config with path aliases
```

---

## ✨ Tech Stack

| Layer         | Technology                                 |
|---------------|--------------------------------------------|
| Framework     | [Next.js 14](https://nextjs.org) (App Router) |
| Language      | [TypeScript 5](https://www.typescriptlang.org) |
| Styling       | [Tailwind CSS 3](https://tailwindcss.com)  |
| State         | [Zustand 4](https://zustand-demo.pmnd.rs)  |
| HTTP Client   | [Axios](https://axios-http.com)            |
| Icons         | [Lucide React](https://lucide.dev)         |
| Linting       | ESLint + Prettier                          |
| Testing       | Jest + React Testing Library               |

---

## 🗂 Architecture Decisions

### Route Groups `(auth)` and `(dashboard)`
Route groups allow different **layouts** for different sections without affecting the URL structure. The `(auth)` group uses no layout (just a centered card), while `(dashboard)` wraps pages with the `Sidebar + Header` shell.

### `src/lib/` vs `src/utils/`
- **`lib/`** — Singleton instances and complex integrations (Axios client, DB adapters, auth libraries).
- **`utils/`** — Stateless pure functions that don't depend on framework features.

### Zustand Stores
- **`authStore`** — Persisted to `localStorage` via `zustand/middleware`. Survives page refreshes.
- **`uiStore`** — In-memory only. Manages transient UI state like toast queues.

### Edge Middleware
The `src/middleware.ts` runs on the **Edge Runtime** (faster than Node.js). It guards all `/dashboard` routes and redirects unauthenticated users before the page renders.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Run Development Server
```bash
npm run dev
# App runs at http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start dev server with hot reload         |
| `npm run build`  | Build production bundle                  |
| `npm start`      | Start production server                  |
| `npm run lint`   | Run ESLint                               |
| `npm run type-check` | Run TypeScript type checking         |
| `npm run format` | Format all files with Prettier           |
| `npm test`       | Run Jest tests in watch mode             |
| `npm run test:ci`| Run Jest in CI mode (no watch)           |

---

## 🔐 Environment Variables

Copy `.env.example` → `.env.local` and fill in:

```env
# Public (exposed to browser — must prefix NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Private (server-side only)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

> **Never commit `.env.local`** — it is listed in `.gitignore`.

---

## 🧩 Path Aliases

All source paths are aliased in `tsconfig.json`:

```ts
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import config from '@/config/app';
import { formatDate } from '@/utils/helpers';
```

Available aliases: `@/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/store/*`, `@/types/*`, `@/utils/*`, `@/config/*`, `@/styles/*`

---

## 📡 API Routes

| Method   | Endpoint              | Description              |
|----------|-----------------------|--------------------------|
| `GET`    | `/api/health`         | Health check             |
| `GET`    | `/api/users`          | Paginated user list      |
| `POST`   | `/api/users`          | Create a new user        |
| `GET`    | `/api/users/:id`      | Get a user by ID         |
| `PATCH`  | `/api/users/:id`      | Update a user            |
| `DELETE` | `/api/users/:id`      | Delete a user            |

---

## 📐 Component Design System

All primitives live in `src/components/ui/`:

```tsx
// Button variants
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" isLoading>Deleting...</Button>

// Input with validation
<Input label="Email" error="Invalid email" id="email" type="email" />

// Card composition
<Card hover>
  <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
  <CardContent>Chart goes here</CardContent>
</Card>

// Accessible Modal
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
  Are you sure?
</Modal>
```

---

## 📄 License

MIT — feel free to use this as a starting point for any project.
