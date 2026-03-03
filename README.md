# jikmunn Inventory Management

A full-stack inventory management application built with **Next.js 16** and **Express 5**, featuring real-time dashboards, RBAC authentication, and automated low-stock alerts.

---

## Tech Stack

| Layer    | Tech                                                               |
| -------- | ------------------------------------------------------------------ |
| Frontend | Next.js 16, React 19, Redux Toolkit, Tailwind CSS v4, MUI DataGrid |
| Backend  | Express 5, Prisma ~6.9, PostgreSQL, Zod 4, JWT Auth, Nodemailer    |
| Testing  | Jest 30, Testing Library, Playwright (E2E), Supertest              |
| Docs     | Swagger / OpenAPI 3.0 (`/api-docs`)                                |

## Features

- **Dashboard** — KPI cards, popular products, sales/purchase/expense summaries
- **Products** — CRUD with search, pagination, stock threshold tracking
- **Sales & Purchases** — Auto-computed totals, product associations
- **Expenses** — Category-based tracking with Decimal precision
- **Users** — Admin-managed CRUD with hashed passwords and role-based access
- **Authentication** — JWT access + refresh tokens, profile management
- **Reports** — P&L, stock valuation, top products, sales trend
- **Low Stock Alerts** — Email notifications via SMTP or Ethereal dev fallback
- **API Documentation** — Interactive Swagger UI at `/api-docs`

## Prerequisites

- **Node.js** >= 18
- **Yarn** (v1)
- **PostgreSQL** 14+

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url> && cd jikmunn-inventory-management
cd server && yarn install
cd ../client && yarn install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL, JWT secrets, and optional SMTP settings
```

### 3. Database setup

```bash
cd server
npx prisma migrate dev     # Apply migrations
npx prisma db seed         # Seed sample data
```

### 4. Run

```bash
# Terminal 1 — Backend
cd server && yarn dev

# Terminal 2 — Frontend
cd client && yarn dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Swagger UI: http://localhost:3001/api-docs

## Testing

### Server unit tests (102 tests)

```bash
cd server && yarn test
```

### Client component tests (33 tests)

```bash
cd client && yarn test
```

### E2E tests (Playwright)

```bash
cd client && npx playwright test
```

## Project Structure

```
├── client/                  # Next.js frontend
│   ├── src/app/             # App Router pages & components
│   ├── src/state/           # Redux store & RTK Query API
│   └── e2e/                 # Playwright E2E tests
├── server/                  # Express backend
│   ├── src/controllers/     # Route handlers with JSDoc
│   ├── src/routes/          # Express routers with OpenAPI annotations
│   ├── src/middleware/       # Auth, validation, rate limiting
│   ├── src/lib/             # Prisma client, env, mailer, logger, swagger
│   ├── src/schemas/         # Zod validation schemas
│   └── prisma/              # Schema, migrations, seed data
└── docs/                    # Project analysis & implementation guide
```

## Environment Variables

See [`server/.env.example`](server/.env.example) for all supported variables:

| Variable             | Required | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string             |
| `JWT_SECRET`         | Yes      | Access token signing key (≥ 16 chars)    |
| `JWT_REFRESH_SECRET` | Yes      | Refresh token signing key (≥ 16 chars)   |
| `PORT`               | No       | Server port (default: 3001)              |
| `CORS_ORIGINS`       | No       | Comma-separated origins                  |
| `SMTP_HOST`          | No       | SMTP server (Ethereal fallback if empty) |
| `ALERT_EMAIL`        | No       | Default low-stock alert recipient        |

## API Overview

All endpoints are prefixed with `/api/v1`. Authentication required unless noted.

| Method | Path                                | Description                |
| ------ | ----------------------------------- | -------------------------- |
| POST   | `/api/v1/auth/register`             | Register (public)          |
| POST   | `/api/v1/auth/login`                | Login (public)             |
| POST   | `/api/v1/auth/refresh`              | Refresh tokens (public)    |
| GET    | `/api/v1/auth/me`                   | Current user profile       |
| GET    | `/api/v1/products`                  | List products (paginated)  |
| POST   | `/api/v1/products`                  | Create product             |
| GET    | `/api/v1/sales`                     | List sales                 |
| GET    | `/api/v1/purchases`                 | List purchases             |
| GET    | `/api/v1/expenses`                  | List expenses by category  |
| GET    | `/api/v1/users`                     | List users (admin only)    |
| GET    | `/api/v1/dashboard`                 | Dashboard metrics          |
| GET    | `/api/v1/dashboard/kpi`             | KPI metrics                |
| GET    | `/api/v1/dashboard/reports`         | Reports with P&L           |
| POST   | `/api/v1/dashboard/low-stock/email` | Send low stock alert email |

Full interactive documentation available at `/api-docs`.

## License

MIT
