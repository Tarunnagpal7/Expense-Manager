# 💼 Expense Management System (MERN + Prisma + PostgreSQL)

An advanced yet easy-to-understand **Expense Management System** built using **MERN Stack** with **Prisma ORM** and **PostgreSQL** as the database.

This project allows employees to submit expenses, managers to approve or reject them, and admins to manage the entire process — from submission to reimbursement — with full audit logging.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / Next.js, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database ORM** | Prisma |
| **Database** | PostgreSQL |
| **Authentication** | JWT / Clerk / Auth0 |
| **Storage** | Cloudinary / AWS S3 |
| **Deployment** | Vercel (Frontend) + Render / Railway (Backend) |

---

## 🧩 Features

✅ Employee expense creation and submission  
✅ Receipt upload and optional OCR extraction  
✅ Manager approval/rejection system  
✅ Role-based authentication (Admin / Manager / Employee)  
✅ Audit logs for every action  
✅ Admin dashboard to view all company expenses and approvals  
✅ Multi-step approval workflow (customizable)

---


## Database Design :
![PHOTO-2025-10-04-08-42-36](https://github.com/user-attachments/assets/02966aa7-62f6-4f28-a76a-5a7a5974ef3e)

## 🏗️ Database Schema (Simplified Overview)

### Main Entities
- **Company**
- **User**
- **Expense**
- **Receipt**
- **ApprovalFlow**
- **ApprovalStep**
- **ApprovalInstance**
- **ApprovalInstanceStep**
- **ApprovalStepDecision**
- **AuditLog**

### Core Relationships
- A **Company** has many **Users** and **Expenses**
- A **User** submits many **Expenses**
- An **Expense** can have many **Receipts** and **Approvals**
- **AuditLogs** record all important actions
- **ApprovalFlows** define how expenses move through approval stages

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/expense-management-system.git
cd expense-management-system
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
```bash
Create a .env file in the root:

DATABASE_URL="postgresql://user:password@localhost:5432/expense_db"
JWT_SECRET="your-secret-key"
CLOUDINARY_URL="your-cloudinary-url"
```

### 4️⃣ Run Prisma Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```


## 🧠 API Endpoints
### 🔐 Authentication
| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| ⁠ POST ⁠ | ⁠ /api/auth/register ⁠ | Register new user       |
| ⁠ POST ⁠ | ⁠ /api/auth/login ⁠    | Login and get JWT token |
| ⁠ GET ⁠  | ⁠ /api/auth/profile ⁠  | Get logged-in user info |


### 🏢 Company APIs
| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| ⁠ POST ⁠ | ⁠ /api/companies ⁠     | Create a new company |
| ⁠ GET ⁠  | ⁠ /api/companies ⁠     | Get all companies    |
| ⁠ GET ⁠  | ⁠ /api/companies/:id ⁠ | Get company by ID    |


### 👥 User APIs
| Method   | Endpoint         | Description                |
| -------- | ---------------- | -------------------------- |
| ⁠ GET ⁠    | ⁠ /api/users ⁠     | Get all users (Admin only) |
| ⁠ GET ⁠    | ⁠ /api/users/:id ⁠ | Get user details           |
| ⁠ PATCH ⁠  | ⁠ /api/users/:id ⁠ | Update user info           |
| ⁠ DELETE ⁠ | ⁠ /api/users/:id ⁠ | Remove user (Admin only)   |

## 💰 Expense APIs
| Method   | Endpoint                   | Description                         |
| -------- | -------------------------- | ----------------------------------- |
| ⁠ POST ⁠   | ⁠ /api/expenses ⁠            | Create a new expense                |
| ⁠ GET ⁠    | ⁠ /api/expenses ⁠            | Get all expenses for logged-in user |
| ⁠ GET ⁠    | ⁠ /api/expenses/:id ⁠        | Get expense details                 |
| ⁠ PATCH ⁠  | ⁠ /api/expenses/:id ⁠        | Update expense (before submit)      |
| ⁠ POST ⁠   | ⁠ /api/expenses/:id/submit ⁠ | Submit expense for approval         |
| ⁠ DELETE ⁠ | ⁠ /api/expenses/:id ⁠        | Delete expense (if draft)           |

## 🧾 Receipt APIs
| Method   | Endpoint                   | Description                     |
| -------- | -------------------------- | ------------------------------- |
| ⁠ POST ⁠   | ⁠ /api/receipts/:expenseId ⁠ | Upload receipt for an expense   |
| ⁠ GET ⁠    | ⁠ /api/receipts/:expenseId ⁠ | Get all receipts for an expense |
| ⁠ DELETE ⁠ | ⁠ /api/receipts/:id ⁠        | Delete a specific receipt       |

### ✅ Approval APIs
| Method | Endpoint | Description |
|--------|-----------|-------------|
| ⁠ GET ⁠  | ⁠ /api/approvals ⁠ | Get pending approvals for manager |
| ⁠ POST ⁠ | ⁠ /api/approvals/:expenseId ⁠ | Approve/Reject an expense |
| ⁠ GET ⁠  | ⁠ /api/approval-flows ⁠ | Get all approval flows |
| ⁠ POST ⁠ | ⁠ /api/approval-flows ⁠ | Create a new approval flow |
| ⁠ GET ⁠  | ⁠ /api/approval-flows/:id ⁠ | Get flow details |

---


### 📜 Audit Logs
| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| ⁠ GET ⁠  | ⁠ /api/audit-logs ⁠     | Get all audit logs (Admin only) |
| ⁠ GET ⁠  | ⁠ /api/audit-logs/:id ⁠ | Get specific log entry          |


### 🧮 Roles & Permissions
| Role         | Access                                          |
| ------------ | ----------------------------------------------- |
| *ADMIN*    | Manage company, users, view all expenses & logs |
| *MANAGER*  | Approve/reject expenses, view team expenses     |
| *EMPLOYEE* | Submit and view own expenses                    |


### 🖥️ Frontend Pages
| Path                | Description                       |
| ------------------- | --------------------------------- |
| ⁠ /login ⁠            | User login page                   |
| ⁠ /register ⁠         | Register new user                 |
| ⁠ /dashboard ⁠        | Expense overview                  |
| ⁠ /expenses/new ⁠     | Create new expense                |
| ⁠ /expenses/:id ⁠     | Expense detail and receipt upload |
| ⁠ /approvals ⁠        | Manager approval list             |
| ⁠ /admin/dashboard ⁠  | Admin dashboard                   |
| ⁠ /admin/audit-logs ⁠ | Audit log viewer                  |

## 🧰 Project Modules
### 1️⃣ Backend Module 1 – User & Company Management

Handles authentication, user management, and company setup.

### 2️⃣ Backend Module 2 – Expense & Approval Workflow

Handles expense submission, approval flow logic, and audit logs.

### 3️⃣ Frontend Module 1 – Employee Portal

Allows employees to create, submit, and track expenses.

### 4️⃣ Frontend Module 2 – Manager/Admin Dashboard

Manages approvals, analytics, and system logs.



