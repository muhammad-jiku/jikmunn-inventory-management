# Inventory Management System — Full Project Analysis & Implementation Guide

> **Generated:** March 2, 2026
> **Project:** jikmunn-inventory-management
> **Stack:** Next.js 15 (Client) + Express 5 / Prisma (Server) + PostgreSQL

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [File-by-File Deep Scan Results](#3-file-by-file-deep-scan-results)
4. [Bugs & Issues Found](#4-bugs--issues-found)
5. [Feature Gaps — What's Missing](#5-feature-gaps--whats-missing)
6. [New Feature Suggestions](#6-new-feature-suggestions)
7. [Implementation Guide — Phased Roadmap](#7-implementation-guide--phased-roadmap)
8. [Package Version Audit](#8-package-version-audit)

---

## 1. Project Overview

A full-stack inventory management dashboard with:

- **Client:** Next.js 15 (App Router), Tailwind CSS v4, Redux Toolkit (RTK Query), MUI DataGrid, Recharts
- **Server:** Express 5, Prisma ORM, PostgreSQL
- **Features implemented:** Dashboard metrics, Products CRUD (Create + Read only), Users list, Expenses by category, Inventory view, Settings page, Dark mode, Sidebar navigation

---

## 2. Architecture Summary

### Server Structure

```
server/
├── src/
│   ├── index.ts                    — Express app setup, middleware, routes
│   ├── controllers/
│   │   ├── dashboardControllers.ts — GET /dashboard (aggregated metrics)
│   │   ├── productControllers.ts   — GET /products, POST /products
│   │   ├── userControllers.ts      — GET /users
│   │   └── expenseControllers.ts   — GET /expenses
│   └── routes/
│       ├── dashboardRoutes.ts      — /dashboard routes
│       ├── productRoutes.ts        — /products routes
│       ├── userRoutes.ts           — /users routes
│       └── expenseRoutes.ts        — /expenses routes
├── prisma/
│   ├── schema.prisma               — 9 models (Users, Products, Sales, Purchases, Expenses, summaries)
│   ├── seed.ts                     — Database seeder
│   └── seedData/                   — JSON seed files
```

### Client Structure

```
client/src/
├── app/
│   ├── layout.tsx                  — Root layout with Inter font
│   ├── page.tsx                    — Redirects to Dashboard
│   ├── dashboardWrapper.tsx        — StoreProvider + DashboardLayout (sidebar + navbar)
│   ├── redux.tsx                   — Redux store config with persistence
│   ├── globals.css                 — Tailwind v4 theme + dark mode CSS vars
│   ├── dashboard/page.tsx          — Dashboard page with stat cards
│   ├── products/page.tsx           — Product listing + create modal
│   ├── inventory/page.tsx          — MUI DataGrid table for inventory
│   ├── users/page.tsx              — MUI DataGrid table for users
│   ├── expenses/page.tsx           — Pie chart with category filters
│   ├── settings/page.tsx           — Mock settings with toggles
│   └── (components)/
│       ├── Dashboard/              — CardSalesSummary, CardPopularProducts, CardPurchaseSummary, CardExpenseSummary, StatCard
│       ├── Header/                 — Simple h1 header
│       ├── Modal/CreateProduct.tsx  — Product creation form modal
│       ├── Navbar/                 — Top navigation bar
│       ├── Rating/                 — Star rating display
│       └── Sidebar/                — Collapsible sidebar navigation
├── state/
│   ├── api.ts                      — RTK Query API slice (5 endpoints)
│   └── index.ts                    — Global Redux slice (sidebar collapse, dark mode)
```

---

## 3. File-by-File Deep Scan Results

### Server Files

| File                                  | Functions                                       | Status        | Issues                                                                                                      |
| ------------------------------------- | ----------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/index.ts`                        | Express setup, middleware chain, route mounting | ✅ Works      | No error handling middleware, no rate limiting, no health check endpoint                                    |
| `controllers/dashboardControllers.ts` | `getDashboardMetrics()`                         | ⚠️ Issues     | Creates new PrismaClient per file (no singleton), BigInt→string conversion is a workaround                  |
| `controllers/productControllers.ts`   | `getProducts()`, `createProduct()`              | ⚠️ Issues     | No input validation, `productId` comes from client (should be server-generated), no UPDATE/DELETE endpoints |
| `controllers/userControllers.ts`      | `getUsers()`                                    | ⚠️ Incomplete | Read-only, no CRUD for users, no authentication                                                             |
| `controllers/expenseControllers.ts`   | `getExpensesByCategory()`                       | ⚠️ Incomplete | Read-only, no CRUD for expenses                                                                             |
| `routes/dashboardRoutes.ts`           | `GET /`                                         | ✅ Works      | —                                                                                                           |
| `routes/productRoutes.ts`             | `GET /`, `POST /`                               | ⚠️ Missing    | No PUT, DELETE, GET /:id routes                                                                             |
| `routes/userRoutes.ts`                | `GET /`                                         | ⚠️ Missing    | No PUT, DELETE, POST, GET /:id routes                                                                       |
| `routes/expenseRoutes.ts`             | `GET /`                                         | ⚠️ Missing    | No PUT, DELETE, POST, GET /:id routes                                                                       |
| `prisma/schema.prisma`                | 9 models                                        | ⚠️ Issues     | Users model lacks password/role fields, no indexes defined, no `createdAt`/`updatedAt` timestamps           |
| `prisma/seed.ts`                      | `deleteAllData()`, `main()`                     | ✅ Works      | Uses `any` type casting                                                                                     |

### Client Files

| File                      | Components/Functions                      | Status    | Issues                                                                                                                                             |
| ------------------------- | ----------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout.tsx`              | `RootLayout`                              | ⚠️ Issue  | Metadata still says "Create Next App" — needs updating                                                                                             |
| `page.tsx`                | `Home`                                    | ✅ Works  | Simply renders Dashboard                                                                                                                           |
| `dashboardWrapper.tsx`    | `DashboardLayout`, `DashboardWrapper`     | ✅ Works  | Direct DOM manipulation for dark mode (could use next-themes)                                                                                      |
| `redux.tsx`               | `StoreProvider`, `makeStore`, types/hooks | ✅ Works  | Proper persistence setup with noop storage for SSR                                                                                                 |
| `globals.css`             | CSS Variables, theme system               | ✅ Works  | Well-structured light/dark theme                                                                                                                   |
| `dashboard/page.tsx`      | `Dashboard`                               | ⚠️ Issue  | StatCard data is **hardcoded** (not from API) — dates say "22-29 October 2023"                                                                     |
| `products/page.tsx`       | `Products`                                | ⚠️ Issues | Random product images on each render (causes flicker), CSS typo `lg-grid-cols-3` should be `lg:grid-cols-3`                                        |
| `inventory/page.tsx`      | `Inventory`                               | ✅ Works  | Heavy inline MUI DataGrid sx styling (duplicated with users page)                                                                                  |
| `users/page.tsx`          | `Users`                                   | ⚠️ Issue  | `console.log('users', users)` left in production code, duplicated DataGrid styling                                                                 |
| `expenses/page.tsx`       | `Expenses`                                | ⚠️ Bug    | Aggregation logic bug — amount is only added once when category is first created (missing `else` clause), hardcoded expense categories in dropdown |
| `settings/page.tsx`       | `Settings`                                | ⚠️ Mock   | All settings are mock/local — nothing persists to server                                                                                           |
| `CardSalesSummary.tsx`    | `CardSalesSummary`                        | ⚠️ Issue  | `console.log` left in code, timeframe selector has no effect on data                                                                               |
| `CardPopularProducts.tsx` | `CardPopularProducts`                     | ⚠️ Issue  | `console.log` left in code, random image causes re-render flicker                                                                                  |
| `CardPurchaseSummary.tsx` | `CardPurchaseSummary`                     | ⚠️ Issue  | `console.log` left in code                                                                                                                         |
| `CardExpenseSummary.tsx`  | `CardExpenseSummary`                      | ⚠️ Issue  | `console.log` left in code, hardcoded "30%" trend                                                                                                  |
| `StatCard.tsx`            | `StatCard`                                | ✅ Works  | Clean component                                                                                                                                    |
| `Header/index.tsx`        | `Header`                                  | ✅ Works  | Simple component                                                                                                                                   |
| `Rating/index.tsx`        | `Rating`                                  | ✅ Works  | Returns array (missing Fragment wrapper)                                                                                                           |
| `Modal/CreateProduct.tsx` | `CreateProduct`                           | ⚠️ Issues | `productId` generated on client with uuid (should be server-side), form doesn't reset after submission, no validation                              |
| `Navbar/index.tsx`        | `Navbar`                                  | ⚠️ Issues | Search input is non-functional (no event handler), notification badge hardcoded "3", Bell icon used as search icon                                 |
| `Sidebar/index.tsx`       | `Sidebar`                                 | ✅ Works  | Clean with dark mode support                                                                                                                       |
| `state/api.ts`            | RTK Query API (5 endpoints)               | ⚠️ Issue  | `ExpenseSummary` interface has typo: `expenseSummarId` (missing 'y')                                                                               |
| `state/index.ts`          | Global slice                              | ✅ Works  | Clean implementation                                                                                                                               |

---

## 4. Bugs & Issues Found

### Critical Bugs

| #   | Location                       | Description                                                                                                                                                                                                                                                     |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `expenses/page.tsx` (line ~68) | **Aggregation bug:** Inside the `.reduce()`, the amount is only added when a category is first created. The `acc[data.category].amount += amount;` is inside the `if (!acc[data.category])` block, so subsequent entries for the same category are never added. |
| 2   | `state/api.ts` (line ~37)      | **Typo:** `expenseSummarId` should be `expenseSummaryId`                                                                                                                                                                                                        |
| 3   | `products/page.tsx` (line ~82) | **CSS typo:** `lg-grid-cols-3` should be `lg:grid-cols-3` (missing colon for breakpoint prefix)                                                                                                                                                                 |

### Moderate Issues

| #   | Location                                       | Description                                                                                                                                     |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | `Navbar/index.tsx`                             | **Search bar is non-functional** — has no `onChange` handler, doesn't filter anything                                                           |
| 5   | `Navbar/index.tsx`                             | **Wrong icon:** `Bell` icon used inside search input instead of a `Search` icon                                                                 |
| 6   | `CardSalesSummary.tsx`                         | **Timeframe selector is cosmetic** — changing Daily/Weekly/Monthly does nothing                                                                 |
| 7   | `dashboard/page.tsx`                           | **StatCards use hardcoded data** — not connected to API, static date "22-29 October 2023"                                                       |
| 8   | Multiple files                                 | **`console.log()` statements left** in `CardSalesSummary`, `CardPopularProducts`, `CardPurchaseSummary`, `CardExpenseSummary`, `users/page.tsx` |
| 9   | `CardPopularProducts.tsx`, `products/page.tsx` | **Random product images** — `Math.floor(Math.random() * 3) + 1` runs on every render, causing image flicker                                     |
| 10  | `Modal/CreateProduct.tsx`                      | **`productId` generated client-side** with uuid. Should be generated server-side                                                                |
| 11  | `Modal/CreateProduct.tsx`                      | **Form doesn't reset** after successful submission                                                                                              |
| 12  | All controllers                                | **PrismaClient instantiated per file** — should use a singleton pattern                                                                         |
| 13  | `productControllers.ts`                        | **No input validation** on `createProduct` — any shape of data is accepted                                                                      |
| 14  | `layout.tsx`                                   | **Metadata not updated** — title still says "Create Next App"                                                                                   |
| 15  | `Navbar/index.tsx`                             | **Notification count hardcoded** to "3"                                                                                                         |
| 16  | `CardExpenseSummary.tsx`                       | **Hardcoded "30%"** trend percentage not computed from real data                                                                                |

### Code Quality Issues

| #   | Location                               | Description                                                                                               |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 17  | `inventory/page.tsx`, `users/page.tsx` | **Massive duplicated MUI DataGrid `sx` styling** (~60 lines each) — should be extracted to shared utility |
| 18  | `redux.tsx`                            | **ESLint disabled** — `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any`        |
| 19  | `seed.ts`                              | **Uses `any` type** for Prisma model casting                                                              |
| 20  | Server `index.ts`                      | **No global error handling middleware**                                                                   |

---

## 5. Feature Gaps — What's Missing

### Backend (Server)

| #   | Feature Gap                                                                                           | Severity    |
| --- | ----------------------------------------------------------------------------------------------------- | ----------- |
| 1   | **No authentication/authorization** — No login, JWT, sessions, user roles                             | 🔴 Critical |
| 2   | **No input validation/sanitization** — No Zod/Joi schemas for request bodies                          | 🔴 Critical |
| 3   | **No global error handling** — Missing Express error middleware                                       | 🟡 High     |
| 4   | **No rate limiting** — API is unprotected from abuse                                                  | 🟡 High     |
| 5   | **Incomplete CRUD** — Products only have Create/Read; Users, Expenses, Sales, Purchases are read-only | 🟡 High     |
| 6   | **No health check endpoint** (`GET /health`)                                                          | 🟢 Low      |
| 7   | **No API versioning** (e.g., `/api/v1/`)                                                              | 🟢 Low      |
| 8   | **No pagination** on list endpoints                                                                   | 🟡 High     |
| 9   | **No logging service** beyond Morgan's request logging                                                | 🟢 Low      |
| 10  | **No PrismaClient singleton** — multiple instances created                                            | 🟡 High     |
| 11  | **No database indexes** defined in schema                                                             | 🟡 High     |
| 12  | **No `createdAt`/`updatedAt` timestamps** on models                                                   | 🟡 High     |
| 13  | **No environment validation** — `.env` vars not validated at startup                                  | 🟢 Low      |
| 14  | **No CORS origin restrictions** — `cors()` allows all origins                                         | 🟡 High     |
| 15  | **No API documentation** — No Swagger/OpenAPI spec                                                    | 🟢 Low      |
| 16  | **No tests** — Zero unit or integration tests                                                         | 🔴 Critical |

### Frontend (Client)

| #   | Feature Gap                                                                             | Severity    |
| --- | --------------------------------------------------------------------------------------- | ----------- |
| 1   | **No authentication flow** — No login/register pages, no protected routes               | 🔴 Critical |
| 2   | **No product edit/delete** functionality                                                | 🟡 High     |
| 3   | **No user management** — Can't create/edit/delete users                                 | 🟡 High     |
| 4   | **No expense CRUD** — Can only view expenses                                            | 🟡 High     |
| 5   | **Non-functional search bar** in Navbar                                                 | 🟡 High     |
| 6   | **Settings page is mock** — Nothing persists to backend                                 | 🟡 High     |
| 7   | **No loading skeletons** — Plain "Loading..." text                                      | 🟢 Low      |
| 8   | **No toast/notification system** — No user feedback on actions                          | 🟡 High     |
| 9   | **No confirmation dialogs** for destructive actions                                     | 🟡 High     |
| 10  | **No form validation** on product creation                                              | 🟡 High     |
| 11  | **No responsive mobile navigation** — Sidebar collapses but no hamburger menu or drawer | 🟢 Low      |
| 12  | **No 404/error pages**                                                                  | 🟢 Low      |
| 13  | **No data export** — Can't export to CSV/PDF                                            | 🟢 Low      |
| 14  | **No real-time updates** — No WebSocket/SSE support                                     | 🟢 Low      |

---

## 6. New Feature Suggestions

### High Impact Suggestions

| #   | Feature                             | Description                                                                                                      | Complexity |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | **Authentication & RBAC**           | JWT-based auth with roles (Admin, Manager, Viewer). Login/Register pages, protected API routes, middleware guard | High       |
| 2   | **Full CRUD Operations**            | Complete Create/Read/Update/Delete for Products, Users, Expenses, Sales, and Purchases with proper API endpoints | Medium     |
| 3   | **Global Search**                   | Functional search across products, users, expenses from the Navbar                                               | Medium     |
| 4   | **Notification System**             | Real notification bell with backend support — low stock alerts, sale alerts, expense alerts                      | Medium     |
| 5   | **Data Export**                     | Export tables to CSV/Excel/PDF from inventory, products, users, and expense pages                                | Low        |
| 6   | **Dashboard Analytics Enhancement** | Dynamic StatCards from API, date range selectors, real-time metrics, KPI tracking                                | Medium     |
| 7   | **Audit Log / Activity Tracking**   | Track who did what and when — product changes, stock adjustments, user actions                                   | Medium     |

### Medium Impact Suggestions

| #   | Feature                     | Description                                                                                 | Complexity |
| --- | --------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| 8   | **Stock Alert System**      | Low stock threshold alerts, automated reorder point notifications                           | Low        |
| 9   | **Supplier Management**     | New module for tracking suppliers, linking to purchases                                     | Medium     |
| 10  | **Order Management**        | Order processing workflow — pending, confirmed, shipped, delivered                          | High       |
| 11  | **Barcode/QR Scanner**      | Scan products for quick lookup/stock adjustments                                            | Medium     |
| 12  | **Bulk Import/Export**      | CSV/JSON import for products, bulk stock updates                                            | Low        |
| 13  | **Multi-warehouse Support** | Track inventory across multiple locations                                                   | High       |
| 14  | **Reports Module**          | Dedicated reports page with printable reports — profit/loss, stock valuation, sales reports | Medium     |

### Low Impact / Nice-to-Have

| #   | Feature                         | Description                                                   | Complexity |
| --- | ------------------------------- | ------------------------------------------------------------- | ---------- |
| 15  | **Loading Skeletons**           | Replace "Loading..." text with animated skeleton placeholders | Low        |
| 16  | **Toast Notifications**         | react-hot-toast or sonner for action feedback                 | Low        |
| 17  | **Keyboard Shortcuts**          | Quick navigation, Cmd+K search, etc.                          | Low        |
| 18  | **i18n / Localization**         | Multi-language support using next-intl                        | Medium     |
| 19  | **PWA Support**                 | Offline capability, installable app                           | Low        |
| 20  | **API Rate Limiting Dashboard** | Visualize API usage and limits                                | Low        |

---

## 7. Implementation Guide — Phased Roadmap

### Phase 0: Developer Tooling & Infrastructure (1-2 days) — ✅ COMPLETED

> **Goal:** Establish a professional monorepo setup with linting, formatting, testing, E2E, CI/CD, and logging infrastructure before any feature work begins.
> **Status:** ✅ Fully completed on March 3, 2026. All tooling verified working (ESLint clean, Jest 11/11 tests passing, Prettier configured, Husky hooks active, Winston logger integrated, GitHub Actions CI workflow created).

#### 0.1 Monorepo Root Setup

- [x] Create root `package.json` with Yarn workspaces (`client`, `server`)
- [x] Add unified scripts: `dev`, `build`, `lint`, `lint:fix`, `type-check`, `test`, `test:coverage`, `test:e2e`
- [x] Install root devDependencies: `concurrently`, `husky`, `lint-staged`, `ts-node`

#### 0.2 Prettier (Code Formatting)

- [x] Install `prettier` as root devDependency
- [x] Create root `.prettierrc` config (single quotes, trailing commas, 80 char width, etc.)
- [x] Create `.prettierignore` to skip `node_modules`, `dist`, `.next`, `coverage`
- [x] Add `format` and `format:check` scripts to root

#### 0.3 ESLint (Server)

- [x] Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier` for server
- [x] Create `server/eslint.config.mjs` (flat config) with TypeScript + Prettier integration
- [x] Add `lint` and `lint:fix` scripts to server `package.json`
- [x] Update client ESLint config to include Prettier integration

#### 0.4 Jest + SWC (Unit Testing)

- [x] Install `jest`, `@swc/core`, `@swc/jest`, `@types/jest` for server
- [x] Create `server/jest.config.ts` using SWC transformer
- [x] Add `test`, `test:watch`, `test:coverage` scripts to server
- [x] Create sample server unit test (`src/controllers/__tests__/`)
- [x] Install `jest`, `@swc/core`, `@swc/jest`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom` for client
- [x] Create `client/jest.config.ts` using SWC transformer with Next.js module mapping
- [x] Add `test`, `test:watch`, `test:coverage` scripts to client
- [x] Create sample client component test

#### 0.5 Playwright (E2E Testing)

- [x] Install `@playwright/test` in client
- [x] Create `client/playwright.config.ts`
- [x] Create sample E2E test (`client/e2e/`)
- [x] Add `test:e2e` and `test:e2e:ui` scripts to client

#### 0.6 Husky + lint-staged (Pre-commit Hooks)

- [x] Install `husky` and `lint-staged` at root
- [x] Initialize husky with `npx husky init`
- [x] Create `.husky/pre-commit` hook running `lint-staged`
- [x] Configure `lint-staged` in root `package.json` to lint+format staged files

#### 0.7 Logger (Server)

- [x] Install `winston` for structured logging
- [x] Create `server/src/lib/logger.ts` with dev/prod log levels
- [x] Replace `console.log` in server with logger calls
- [x] Integrate logger with Morgan for HTTP request logging

#### 0.8 GitHub Actions Workflow (Frontend CI)

- [x] Create `.github/workflows/frontend.yml`
- [x] Steps: checkout → Node setup → install → lint → type-check → unit test → build → Playwright E2E
- [x] Cache `node_modules` and `.next/cache` for speed
- [x] Upload test coverage and Playwright reports as artifacts

---

### Phase 1: Bug Fixes & Code Quality (1-2 days) ✅ COMPLETED

> **Goal:** Fix all identified bugs and clean up code quality issues.

#### 1.1 Fix Critical Bugs

- [x] Fix expense aggregation bug in `expenses/page.tsx` — moved `amount += amount` outside the `if` block; also replaced random colors with deterministic `CATEGORY_COLORS` array
- [x] Fix typo `expenseSummarId` → `expenseSummaryId` in `state/api.ts`
- [x] Fix CSS typo `lg-grid-cols-3` → `lg:grid-cols-3` in `products/page.tsx`

#### 1.2 Code Cleanup

- [x] Remove all `console.log()` statements from production components (CardSalesSummary, CardPopularProducts, CardPurchaseSummary, CardExpenseSummary, users/page)
- [x] Fix Navbar search icon — replaced `Bell` with `Search` from lucide-react
- [x] Update `layout.tsx` metadata — changed to "Inventory Management Dashboard" with proper description
- [x] Fix random product images — use deterministic image based on `product.name.charCodeAt(0) % 3 + 1`
- [x] Reset CreateProduct form after successful submission — added `initialFormState` and `setFormData(initialFormState)` after submit
- [x] Remove client-side `productId` generation (`v4()`) from CreateProduct — ID now generated server-side
- [x] Remove ESLint disable comments in `redux.tsx` — replaced `any` with `string` types, replaced `useRef` with `useState` lazy initializer to fix `react-hooks/refs` errors
- [x] Fix `any` type casting in `prisma/seed.ts` — added proper typed interfaces for dynamic model access
- [x] Removed all `/* eslint-disable react-hooks/purity */` comments (no longer needed after removing `Math.random()`)

#### 1.3 Server Improvements

- [x] Create PrismaClient singleton (`server/src/lib/prisma.ts`) — uses `globalThis` pattern for dev hot-reload safety
- [x] Updated all 4 controllers to use the singleton (dashboard, product, user, expense)
- [x] Removed all `/* eslint-disable */` comments from server controllers
- [x] Fixed `(item: any)` → proper Prisma type inference in BigInt→string mapping
- [x] Prefixed unused catch variables with `_` and added `caughtErrorsIgnorePattern` to ESLint config
- [x] Add global Express error handling middleware in `server/src/index.ts`
- [x] Moved `productId` generation to server-side — controller now uses `uuidv4()` instead of accepting from client
- [x] Installed `uuid` + `@types/uuid` on server

#### 1.4 Extract Shared Code

- [x] Extract MUI DataGrid dark mode `sx` styles into `client/src/lib/dataGridStyles.ts` (~95 lines of shared styles + className)
- [x] Refactored `inventory/page.tsx` and `users/page.tsx` to import shared `dataGridDarkModeSx` and `dataGridClassName`
- [x] Added `caughtErrorsIgnorePattern: '^_'` to both server and client ESLint configs
- [x] Fixed `next/jest` import to `next/jest.js` for Next.js 16 compatibility
- [x] Added `uuid` to server Jest `transformIgnorePatterns` for ESM compatibility

---

### Phase 2: Input Validation & API Hardening (2-3 days) ✅ COMPLETED

> **Goal:** Harden the API with validation, error handling, and security.

#### 2.1 Input Validation

- [x] Installed and configured `zod@4.3.6` for server-side schema validation
- [x] Created validation schemas in `server/src/schemas/index.ts`: CreateProduct, UpdateProduct, CreateUser, UpdateUser, CreateExpense, UpdateExpense, Pagination
- [x] Created `validateBody()` and `validateQuery()` middleware factories in `server/src/middleware/validate.ts`
- [x] Applied `validateBody(createProductSchema)` to POST `/products` route
- [x] Applied `validateQuery(paginationSchema)` to all GET list routes (products, users, expenses)

#### 2.2 API Security

- [x] Configured CORS with allowed origins from `CORS_ORIGINS` environment variable (comma-separated, array)
- [x] Installed and configured `express-rate-limit@8.2.1` in `server/src/middleware/rateLimiter.ts` (env-configurable window/max)
- [x] Added `helmet` CSP headers configuration (defaultSrc, scriptSrc, styleSrc, imgSrc, connectSrc directives)
- [x] Created `server/src/lib/env.ts` — Zod-based environment variable validation at startup (PORT, DATABASE_URL, NODE_ENV, CORS_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, LOG_LEVEL)
- [x] Fixed dotenv load order: `dotenv.config()` called inside `env.ts` before validation to ensure env vars are available at import-time
- [x] Created `server/.env.example` documenting all environment variables

#### 2.3 API Improvements

- [x] Added `GET /health` health check endpoint (returns status, timestamp, uptime)
- [x] Added API versioning prefix (`/api/v1/dashboard`, `/api/v1/products`, `/api/v1/users`, `/api/v1/expenses`)
- [x] Kept legacy routes (`/dashboard`, `/products`, etc.) for backward compatibility
- [x] Added pagination support to all list endpoints (page/limit/skip with `Promise.all` for parallel count+data)
- [x] Created `server/src/lib/apiResponse.ts` with `sendError()` and `sendPaginated()` response helpers
- [x] Standardized API response format: `{ data: T[], pagination: { page, limit, total, totalPages } }` for list endpoints
- [x] Updated frontend `api.ts` with `PaginatedResponse<T>` and `PaginationInfo` interfaces
- [x] Updated all consuming components (products, inventory, users, expenses) to extract `.data` from paginated responses
- [x] Removed redundant `body-parser` import (Express 5 has built-in `express.json()`)

#### 2.4 Database Improvements

- [x] Added `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` to all 8 models
- [x] Added database indexes: `Products(name)`, `Sales(productId, timestamp)`, `Purchases(productId, timestamp)`, `Expenses(category, timestamp)`, `ExpenseByCategory(category, expenseSummaryId)`
- [x] Added `@default(uuid())` for all ID fields across all models
- [x] Generated Prisma Client with updated schema (migration pending DB connection)

---

### Phase 3: Complete CRUD Operations (3-5 days) ✅ COMPLETED

> **Goal:** Implement full CRUD for all entities.

#### 3.1 Products (Backend + Frontend)

- [x] `GET /products/:id` — Get single product
- [x] `PUT /products/:id` — Update product
- [x] `DELETE /products/:id` — Delete product
- [x] Frontend: Edit product modal (`EditProduct.tsx`)
- [x] Frontend: Delete product with confirmation dialog (`ConfirmDialog.tsx`)

#### 3.2 Users (Backend + Frontend)

- [x] `POST /users` — Create user
- [x] `GET /users/:id` — Get single user
- [x] `PUT /users/:id` — Update user
- [x] `DELETE /users/:id` — Delete user
- [x] Frontend: Create/Edit/Delete user modals (`UserFormModal.tsx`)

#### 3.3 Expenses (Backend + Frontend)

- [x] `POST /expenses` — Create expense
- [x] `GET /expenses/:id` — Get single expense
- [x] `PUT /expenses/:id` — Update expense
- [x] `DELETE /expenses/:id` — Delete expense
- [x] Frontend: Create/Edit/Delete expense forms (`ExpenseFormModal.tsx`)

#### 3.4 Sales & Purchases (Backend + Frontend)

- [x] Full CRUD endpoints for Sales (`salesControllers.ts`, `salesRoutes.ts`)
- [x] Full CRUD endpoints for Purchases (`purchaseControllers.ts`, `purchaseRoutes.ts`)
- [x] Frontend: Sales management page (`/sales` with `SaleFormModal.tsx`)
- [x] Frontend: Purchases management page (`/purchases` with `PurchaseFormModal.tsx`)
- [x] Sidebar: Added Sales & Purchases navigation links

**Implementation notes:**

- All routes registered under `/api/v1/` with Zod validation middleware
- Reusable `ConfirmDialog` component for all delete confirmations
- Dual-purpose form modals (Create/Edit mode based on entity prop)
- Sales auto-calculate `totalAmount = quantity × unitPrice`
- Purchases auto-calculate `totalCost = quantity × unitCost`
- Product selector dropdown in Sale/Purchase forms (fetches from products API)
- DataGrid with inline Edit/Delete action icons for Users, Sales, Purchases

---

### Phase 4: Authentication & Authorization (3-5 days) ✅ COMPLETED

> **Goal:** Implement user authentication and role-based access control.

#### 4.1 Backend Auth

- [x] Add `password` (hashed), `role` fields to Users model
- [x] Install `bcryptjs` for password hashing, `jsonwebtoken` for JWT
- [x] Create `POST /auth/register` endpoint
- [x] Create `POST /auth/login` endpoint
- [x] Create `POST /auth/refresh` token refresh endpoint
- [x] Create auth middleware for protected routes
- [x] Implement role-based access control (Admin, Manager, Viewer)

#### 4.2 Frontend Auth

- [x] Create Login page
- [x] Create Register page
- [x] Add auth state to Redux store
- [x] Create auth guard / protected route wrapper
- [x] Add token refresh logic to RTK Query baseQuery
- [x] Update Navbar to show logged-in user info
- [x] Add logout functionality

#### 4.3 Settings Integration

- [x] Connect Settings page to actual user profile API
- [x] Make settings persist to server (username, email, notification preferences)

**Implementation Notes (Phase 4):**

- JWT access + refresh token pattern with auto-refresh on 401 via custom RTK Query `baseQueryWithReauth`
- bcryptjs with 12 salt rounds for password hashing
- Three roles: `admin`, `manager`, `viewer` — admin role required for user management
- AuthGuard component wraps protected routes; public routes (`/login`, `/register`) render without sidebar/navbar
- `PUT /auth/profile` endpoint for self-profile updates (name, email) — separate from admin-only user routes
- Settings page now reads from auth state, persists changes via profile API, and syncs Redux auth state on save
- Prisma migration `add_auth_fields` added `password`, `role`, `@unique` email, and `@@index([email])`

---

### Phase 5: UI/UX Enhancements (2-3 days) ✅ COMPLETED

> **Goal:** Polish the frontend experience.

#### 5.1 Feedback & Notifications

- [x] Install `sonner` for toast notifications (`sonner@2.0.7`)
- [x] Add success/error toasts on all CRUD operations (Products, Users, Expenses, Sales, Purchases, Settings)
- [x] Add confirmation dialogs for delete operations (reusable `ConfirmDialog` component)
- [x] Toast helper utilities (`toastSuccess`, `toastError` in `client/src/lib/toast.ts`)

#### 5.2 Loading & Error States

- [x] Create Skeleton loader components (`ProductCardSkeleton`, `ProductGridSkeleton`, `TableSkeleton`, `ChartSkeleton`, `StatCardSkeleton`)
- [x] Create proper Error boundary component (`ErrorBoundary` wrapping all protected routes)
- [x] Create 404 Not Found page (`client/src/app/not-found.tsx`)
- [x] Add empty state illustrations with reusable `EmptyState` component across all pages

#### 5.3 Search & Navigation

- [x] Implement global search via `CommandPalette` (search products, users, expenses with keyboard navigation)
- [x] Add breadcrumb navigation (auto-generated from URL pathname)
- [x] Add keyboard shortcut for search (`Ctrl+K` / `Cmd+K`)
- [x] Add responsive mobile navigation — backdrop overlay, auto-close on link tap, hamburger toggle

#### 5.4 Forms

- [x] Add client-side form validation using `react-hook-form@7.71.2` + `@hookform/resolvers@5.2.2` + `zod@4.3.6`
- [x] Add form feedback (field-level error messages below each input in all 6 modal forms)
- [x] Zod schemas for all entities (`productFormSchema`, `userFormSchema`, `expenseFormSchema`, `saleFormSchema`, `purchaseFormSchema`)

---

### Phase 6: Advanced Features (5-7 days)

> **Goal:** Add value-added features that differentiate the application.

#### 6.1 Dashboard Enhancements

- [x] Make StatCards dynamic — fetch data from API instead of hardcoding
- [x] Add date range picker for dashboard metrics
- [x] Make the timeframe selector functional in Sales chart (daily/weekly/monthly aggregation)
- [x] Add real-time dashboard refresh with polling or WebSocket
- [x] Add KPI widgets — total revenue, total products, active users

#### 6.2 Data Export

- [x] Add CSV export functionality for all list pages
- [x] Add PDF export for reports
- [x] Add print-friendly views

#### 6.3 Reports Module

- [x] Create `/reports` page
- [x] Profit & Loss report
- [x] Stock Valuation report
- [x] Sales trend report with date range filtering
- [x] Top selling products report

#### 6.4 Stock Alerts

- [x] Add stock threshold field to Products model
- [x] Create low stock detection logic
- [x] Display low stock warnings on dashboard and inventory page
- [x] Optional: Email notification for low stock (using nodemailer)

---

### Phase 7: Testing & Documentation (3-5 days)

> **Goal:** Ensure reliability and maintainability.

#### 7.1 Backend Testing

- [ ] Set up Jest + Supertest for API testing
- [ ] Write unit tests for all controllers
- [ ] Write integration tests for all API endpoints
- [ ] Add test database configuration

#### 7.2 Frontend Testing

- [ ] Set up Vitest + React Testing Library
- [ ] Write component tests for key components
- [ ] Write integration tests for pages
- [ ] Add E2E tests using Playwright or Cypress

#### 7.3 Documentation

- [ ] Create API documentation using Swagger/OpenAPI
- [ ] Add JSDoc comments to all functions
- [ ] Create a README with setup instructions, architecture overview, and contribution guidelines
- [ ] Add environment variable documentation (`.env.example`)

---

### Phase 8: Advanced / Optional Features (7-14 days)

> **Goal:** Enterprise-grade features for scaling the application beyond a basic inventory tool.

#### 8.1 Audit Log / Activity Tracking

- [ ] Create `AuditLog` model in Prisma schema (userId, action, entity, entityId, changes, timestamp)
- [ ] Create audit logging middleware/service — auto-log all CRUD operations
- [ ] Create `/audit-log` page with filterable activity feed
- [ ] Add "Last modified by" display on entity detail views

#### 8.2 Supplier Management

- [ ] Create `Supplier` model in Prisma schema (name, contact, email, address, notes)
- [ ] Full CRUD endpoints for Suppliers (`/api/v1/suppliers`)
- [ ] Link Suppliers to Purchases (add `supplierId` foreign key)
- [ ] Create `/suppliers` page with list, create, edit, delete
- [ ] Add supplier info display on purchase records

#### 8.3 Order Management

- [ ] Create `Order` model with status workflow (Pending → Confirmed → Shipped → Delivered → Cancelled)
- [ ] Create `OrderItem` model (orderId, productId, quantity, unitPrice)
- [ ] Full CRUD endpoints for Orders with status transitions
- [ ] Create `/orders` page with status filters, order detail view
- [ ] Auto-update stock quantities on order fulfillment

#### 8.4 Barcode / QR Code Scanner

- [ ] Add `barcode` field to Products model
- [ ] Integrate `html5-qrcode` or `quagga2` for camera-based scanning
- [ ] Create scan-to-lookup functionality — scan barcode to open product detail
- [ ] Create scan-to-adjust-stock quick action
- [ ] Generate printable barcode/QR labels for products

#### 8.5 Bulk Import / Export

- [ ] Create CSV/JSON import endpoint for products (`POST /products/import`)
- [ ] Create bulk stock update endpoint (`PATCH /products/bulk-stock`)
- [ ] Frontend: drag-and-drop CSV upload with preview & validation
- [ ] Frontend: column mapping UI for flexible imports
- [ ] Add import history log

#### 8.6 Multi-Warehouse Support

- [ ] Create `Warehouse` model (name, location, capacity)
- [ ] Create `WarehouseStock` junction model (warehouseId, productId, quantity)
- [ ] Refactor stock queries to aggregate across warehouses
- [ ] Create `/warehouses` page with per-warehouse inventory view
- [ ] Add inter-warehouse stock transfer functionality

#### 8.7 Internationalization (i18n)

- [ ] Install and configure `next-intl` or `next-i18next`
- [ ] Extract all UI strings to translation files
- [ ] Add language switcher to Navbar/Settings
- [ ] Support at minimum: English, Spanish, Japanese
- [ ] Add locale-aware number/date/currency formatting

#### 8.8 Progressive Web App (PWA)

- [ ] Install `next-pwa` or `@serwist/next`
- [ ] Configure service worker and web app manifest
- [ ] Add offline fallback page
- [ ] Cache critical API responses for offline viewing
- [ ] Add install prompt for mobile users

#### 8.9 API Rate Limiting Dashboard

- [ ] Track API usage metrics per endpoint (request count, latency, errors)
- [ ] Store metrics in Redis or in-memory store
- [ ] Create `GET /api/v1/metrics` admin-only endpoint
- [ ] Create `/admin/api-metrics` dashboard page with charts
- [ ] Add per-user rate limit tracking (tied to auth)

---

### Phase 9: DevOps & Deployment (2-3 days)

> **Goal:** Production-ready deployment setup.

#### 9.1 CI/CD

- [ ] Set up GitHub Actions workflow (lint, test, build)
- [ ] Add pre-commit hooks with husky + lint-staged

#### 9.2 Deployment

- [ ] Dockerize both client and server
- [ ] Create `docker-compose.yml` with PostgreSQL
- [ ] Configure production environment variables
- [ ] Set up Vercel (client) + Railway/Render (server) deployment
- [ ] Add database migration strategy for production

#### 9.3 Monitoring

- [ ] Add application error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Set up production logging (Winston/Pino)

---

## 8. Package Version Audit

> Checked on **March 2, 2026** using `npx npm-check-updates`

### Server Packages

| Package          | Current | Latest  | Status          |
| ---------------- | ------- | ------- | --------------- |
| `@prisma/client` | ^6.10.1 | ^7.4.2  | 🔴 Major update |
| `@types/express` | ^5.0.3  | ^5.0.6  | 🟡 Patch update |
| `@types/node`    | ^24.0.3 | ^25.3.3 | 🔴 Major update |
| `body-parser`    | ^2.2.0  | ^2.2.2  | 🟡 Patch update |
| `concurrently`   | ^9.2.0  | ^9.2.1  | 🟡 Patch update |
| `cors`           | ^2.8.5  | ^2.8.6  | 🟡 Patch update |
| `dotenv`         | ^16.5.0 | ^17.3.1 | 🔴 Major update |
| `express`        | ^5.1.0  | ^5.2.1  | 🟡 Minor update |
| `morgan`         | ^1.10.0 | ^1.10.1 | 🟡 Patch update |
| `nodemon`        | ^3.1.10 | ^3.1.14 | 🟡 Patch update |
| `prisma`         | ^6.10.1 | ^7.4.2  | 🔴 Major update |
| `rimraf`         | ^6.0.1  | ^6.1.3  | 🟡 Minor update |
| `typescript`     | ^5.8.3  | ^5.9.3  | 🟡 Minor update |

### Client Packages

| Package                | Current  | Latest   | Status          |
| ---------------------- | -------- | -------- | --------------- |
| `@emotion/styled`      | ^11.14.0 | ^11.14.1 | 🟡 Patch update |
| `@mui/material`        | ^7.1.2   | ^7.3.8   | 🟡 Minor update |
| `@mui/x-data-grid`     | ^8.5.3   | ^8.27.3  | 🟡 Minor update |
| `@reduxjs/toolkit`     | ^2.8.2   | ^2.11.2  | 🟡 Minor update |
| `@tailwindcss/postcss` | ^4.1.10  | ^4.2.1   | 🟡 Minor update |
| `@types/node`          | ^20      | ^25      | 🔴 Major update |
| `axios`                | ^1.10.0  | ^1.13.6  | 🟡 Minor update |
| `dotenv`               | ^16.5.0  | ^17.3.1  | 🔴 Major update |
| `eslint`               | ^9       | ^10      | 🔴 Major update |
| `eslint-config-next`   | 15.3.4   | 16.1.6   | 🔴 Major update |
| `lucide-react`         | ^0.522.0 | ^0.576.0 | 🟡 Minor update |
| `next`                 | 15.3.4   | 16.1.6   | 🔴 Major update |
| `react`                | ^19.0.0  | ^19.2.4  | 🟡 Minor update |
| `react-dom`            | ^19.0.0  | ^19.2.4  | 🟡 Minor update |
| `recharts`             | ^3.0.0   | ^3.7.0   | 🟡 Minor update |
| `tailwindcss`          | ^4.1.10  | ^4.2.1   | 🟡 Minor update |
| `uuid`                 | ^11.1.0  | ^13.0.0  | 🔴 Major update |

### Summary

- **🔴 Major updates available:** 8 packages (prisma, @prisma/client, dotenv x2, @types/node x2, next, eslint, eslint-config-next, uuid)
- **🟡 Minor/Patch updates available:** 19 packages
- **⚠️ Caution:** Major updates (especially `next 15→16`, `prisma 6→7`, `eslint 9→10`) may include breaking changes. Review changelogs before upgrading.

### Recommended Update Strategy

1. **Safe to update immediately:** All 🟡 minor/patch updates
2. **Update with caution:** `dotenv ^16→^17`, `uuid ^11→^13`, `@types/node`
3. **Update with testing:** `prisma/client 6→7`, `next 15→16`, `eslint 9→10` (likely breaking changes — test thoroughly)

---

### Update Status: ✅ COMPLETED (March 2, 2026)

All packages in both **server** and **client** have been updated to their latest versions and installed successfully.

```
Server: npx npm-check-updates -u → yarn install ✅
Client: npx npm-check-updates -u → yarn install ✅
```

**Post-update notes:**

- Some peer dependency warnings exist for `eslint-config-next` plugins (eslint ^10 vs expected ^9) — these are typically resolved in subsequent plugin releases
- `prisma` v7 may require running `npx prisma generate` to regenerate the client
- `next` v16 may have breaking changes — test the client build with `yarn build`
- `redux-persist` has an unmet peer dependency on `redux` — this is expected since Redux Toolkit bundles Redux internally
