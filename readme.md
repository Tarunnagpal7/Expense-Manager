# 💼 Expense Management System (MERN + Prisma + PostgreSQL)

An advanced yet easy-to-understand Expense Management System built using a MERN-style stack with Prisma ORM and PostgreSQL. Employees submit expenses, managers approve/reject, and admins oversee end‑to‑end processing with full audit logging and a configurable multi‑step approval flow.

---

## 🚀 Tech Stack

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| **Frontend** | React (Vite), React Router, Axios, Tailwind CSS, Radix UI |
| **Backend**  | Node.js, Express.js                                       |
| **ORM**      | Prisma                                                    |
| **Database** | PostgreSQL                                                |
| **Auth**     | JWT (server‑side)                                         |
| **Storage**  | Local/Cloud (pluggable; e.g. Cloudinary/S3)               |
| **OCR**      | Custom OCR service wrapper (extensible)                   |

---

## 🧩 Key Features

- **Expense lifecycle**: draft → submit → multi‑step approval → reimbursement
- **Role‑based access**: Admin, Manager, Employee
- **Configurable approvals**: company‑specific approval flows and rules
- **Receipts & OCR**: upload receipts and optionally extract data
- **Dashboards**: employee, manager, and admin views
- **Audit logs**: every action tracked

---

## 📦 Monorepo Layout

```
.
├─ client/expense-manager/           # React app (Vite)
└─ server/                           # Express API + Prisma
   ├─ prisma/                        # Prisma schema and migrations
   └─ src/                           # Controllers, routes, services
```

Notable server modules:

- `src/services/approvalEngine.js`: approval routing and step advancement
- `src/middleware/auth.js` + `src/middleware/roleCheck.js`: JWT + roles
- `src/controllers/*`: request handling per domain
- `src/routes/*`: route registration per resource

---

## ⚙️ Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

## 🔧 Setup & Installation

1. Clone

```bash
git clone https://github.com/<your-username>/expense-management-system.git
cd expense-management-system
```

2. Install root tools (for Tailwind helper)

```bash
npm install
```

3. Install server and client deps

```bash
cd server && npm install && cd ..
cd client/expense-manager && npm install && cd ../..
```

4. Environment variables

Create `server/.env` with:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/expense_db"
JWT_SECRET="your-secret-key"
# Optional mail/storage
SMTP_HOST="localhost"
SMTP_PORT="2525"
SMTP_USER=""
SMTP_PASS=""
CLOUDINARY_URL=""
```

5. Prisma init (from `server/`)

```bash
npm run prisma:migrate
npm run prisma:generate
# Optional local seed (if implemented)
node prisma/seed.js
```

6. Run apps

```bash
# Terminal A
cd server && npm run dev

# Terminal B
cd client/expense-manager && npm run dev
```

Frontend dev server (default): `http://localhost:5173`

Backend API (default): `http://localhost:3000`

---

## 📜 NPM Scripts

Server (`server/package.json`):

- `dev`: start Express with nodemon
- `start`: start Express with node
- `prisma:migrate`: `prisma migrate dev`
- `prisma:generate`: regenerate Prisma client
- `prisma:studio`: open Prisma Studio

Client (`client/expense-manager/package.json`):

- `dev`: Vite dev server
- `build`: Vite production build
- `preview`: preview built app
- `lint`: run ESLint

---

## 🔐 Authentication & Roles

- **JWT**: issued on login; required for protected routes.
- **Roles**: `ADMIN`, `MANAGER`, `EMPLOYEE` enforced via `auth` + `roleCheck` middleware.
- **Protected UI**: guarded using a `ProtectedRoute` component client‑side.

---

## 🧠 Approval Workflow (High‑Level)

1. Employee creates an expense and uploads receipts.
2. On submit, an approval instance is created from the company’s active flow.
3. Managers at each step approve/reject; engine advances or stops accordingly.
4. Final approval marks expense approved for reimbursement; actions audited.

See `server/src/services/approvalEngine.js` and `server/src/services/approvalService.js` for orchestration details.

---

## 🗄️ Data Model (Conceptual)

- Company, User
- Expense, Receipt
- ApprovalFlow, ApprovalStep
- ApprovalInstance, ApprovalInstanceStep, ApprovalStepDecision
- AuditLog

Relationships (simplified):

- Company has many Users and Expenses
- User has many Expenses
- Expense has many Receipts and ApprovalInstances
- ApprovalFlow defines ordered steps; instances track runtime progress

---

## 🌐 API Overview

Base URL: `http://localhost:3000/api`

Auth

- POST `/auth/register`, POST `/auth/login`, GET `/auth/profile`

Company

- POST `/companies`, GET `/companies`, GET `/companies/:id`

Users

- GET `/users`, GET `/users/:id`, PATCH `/users/:id`, DELETE `/users/:id`

Expenses

- POST `/expenses`, GET `/expenses`, GET `/expenses/:id`
- PATCH `/expenses/:id`, POST `/expenses/:id/submit`, DELETE `/expenses/:id`

Receipts

- POST `/receipts/:expenseId`, GET `/receipts/:expenseId`, DELETE `/receipts/:id`

Approvals

- GET `/approvals`
- POST `/approvals/:expenseId` (approve/reject payload)
- GET `/approval-flows`, POST `/approval-flows`, GET `/approval-flows/:id`

Audit Logs

- GET `/audit-logs`, GET `/audit-logs/:id`

Refer to `server/src/routes/*` and controllers in `server/src/controllers/*` for exact shapes and middleware.

---

## 🖥️ Frontend

Key pages (examples):

- `/login`, `/register`
- `/dashboard` (overview)
- `/expenses/new`, `/expenses/:id`
- `/approvals` (manager)
- `/admin/dashboard`, `/admin/audit-logs`

Notable components: UI kits under `src/components/ui/*`, layout in `src/components/Layout.jsx`, auth in `src/lib/contexts/AuthContext.jsx`.

---

## 🧪 Testing (roadmap)

- Add integration tests for controllers (Jest + Supertest).
- Add component tests for React (Vitest + React Testing Library).

---

## 🚀 Deployment

Backend

- Set `DATABASE_URL`, `JWT_SECRET`, and SMTP/storage values in server env.
- Run migrations and `npm start`.

Frontend

- `npm run build` in `client/expense-manager` and deploy the `dist/` folder.

Database

- Use managed PostgreSQL (e.g., Render, Railway, Supabase). Apply Prisma migrations.

---

## 🛠️ Troubleshooting

- Prisma errors: verify `server/.env` `DATABASE_URL` and that Postgres is reachable.
- 401/403 responses: confirm Authorization header (`Bearer <token>`) and role permissions.
- CORS: check `server/src/app.js` CORS config and client origin.
- Build issues: align Node and dependency versions; clear node_modules and reinstall.

---

## 🤝 Contributing

1. Fork and create a feature branch
2. Follow code style and lint rules
3. Open a PR with a clear description and testing notes

---

## 📄 License

MIT (or your preferred license)

---

## 📚 Appendix: Quick Commands

```bash
# Server (from server/)
npm run dev
npm run prisma:migrate
npm run prisma:studio

# Client (from client/expense-manager/)
npm run dev
npm run build && npm run preview
```
