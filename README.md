# Generic Complaint Management System (CMS)

A modern, generic, industry-agnostic Complaint Management System (CMS) featuring a soft-neumorphic tactile design system, animated state transitions, and a strict **two-route architecture** (`/user` and `/admin`).

---

## 🌟 Key Features

- **Strict Two-Route Architecture**:
  - `/user`: Single-page app rendering Login, Register, Forgot Password (inline), User Dashboard, Submit Complaint, My Complaints, Complaint Details (with status timeline & close action), and Profile (with password change).
  - `/admin`: Single-page admin app rendering Admin Login (strictly **NO** forgot password link), Executive Dashboard counters, Complaint Console (assign, change status, add remarks/resolutions), Category Management, and Admin Security Profile.
- **Soft Neumorphic Visual Language**: Off-white palette (`#e6e8ec`), soft raised/pressed shadow pairs (`box-shadow`), subtle depth, and Framer Motion micro-interactions.
- **Password Management & Permanent Admin Security Lock**:
  - **User**: (a) Inline pre-login forgot-password recovery flow, and (b) Logged-in profile password update flow.
  - **Admin**: Password is permanently locked to the seeded value configured via `ADMIN_PASSWORD` in `.env`. No forgot-password endpoint or password change form exists for admin by design. To update the admin password, update `ADMIN_PASSWORD` in `.env` and re-seed the database.
- **PostgreSQL & Prisma ORM**: Built with support for Neon serverless PostgreSQL (pooled `DATABASE_URL` and direct `DIRECT_URL`).

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT, bcryptjs.
- **Database**: PostgreSQL with Prisma ORM v5 (Neon serverless support).

---

## ⚙️ Environment Configuration

### Client (`/client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Server (`/server/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-pooler-xyz.region.aws.neon.tech/cms_db?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-direct-xyz.region.aws.neon.tech/cms_db?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
ADMIN_EMAIL="admin@cms.com"
ADMIN_PASSWORD="AdminPassword123!"
```

> **Note**: Never commit real database connection strings or secrets. Place placeholder values in `.env.example`.

---

## 🚀 Setup & Execution Guide

### 1. Backend Setup (`/server`)
```bash
cd server
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed default categories & initial ADMIN user
npx prisma db seed

# Start server in development mode
npm run dev
```

### 2. Frontend Setup (`/client`)
```bash
cd client
npm install

# Start Vite development server
npm run dev
```

The application will be accessible at:
- User Portal: `http://localhost:5173/user`
- Admin Portal: `http://localhost:5173/admin`

---

## 🔐 Important Security Note
The Admin account is seeded via the environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`. **The admin password cannot be modified through the application interface or API endpoints.** To change the admin password, update `ADMIN_PASSWORD` in `/server/.env` and re-run `npx prisma db seed`.
