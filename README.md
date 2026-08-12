# Generic Complaint Management System (CMS)

A modern, generic, industry-agnostic Complaint Management System (CMS) featuring a soft-neumorphic tactile design system, animated state transitions, persistent state & route re-hydration, full mobile/tablet responsiveness with collapsible hamburger navigation, and a strict **two-route architecture** (`/user` and `/admin`).

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React + Vite)"]
        Landing["Landing Page (/)"]
        UserPortal["User Portal (/user)"]
        AdminPortal["Admin Portal (/admin)"]
        LocalStorage["Browser LocalStorage (Auth Tokens & State Persistence)"]
    end

    subgraph Server ["Backend (Express Node.js API)"]
        AuthMiddleware["JWT Auth Middleware"]
        UserRoutes["User Routes (/api/complaints, /api/auth)"]
        AdminRoutes["Admin Routes (/api/admin/*)"]
        CategoryRoutes["Category Routes (/api/categories)"]
    end

    subgraph Database ["Database Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL["PostgreSQL Database (Neon / Docker)"]
    end

    Landing -->|Navigate| UserPortal
    Landing -->|Navigate| AdminPortal
    UserPortal <-->|Persist Tab & Complaint ID| LocalStorage
    AdminPortal <-->|Persist Tab & Complaint ID| LocalStorage

    UserPortal -->|HTTP API Requests| AuthMiddleware
    AdminPortal -->|HTTP API Requests| AuthMiddleware

    AuthMiddleware --> UserRoutes
    AuthMiddleware --> AdminRoutes
    AuthMiddleware --> CategoryRoutes

    UserRoutes --> Prisma
    AdminRoutes --> Prisma
    CategoryRoutes --> Prisma

    Prisma --> PostgreSQL
```

---

## 🌟 Key Features

- **Strict Two-Route Architecture**:
  - `/user`: Single-page user portal rendering Login, Register, Forgot Password (inline), User Dashboard, Submit Complaint, My Complaints, Complaint Details (with status timeline & close action), and Profile Settings.
  - `/admin`: Single-page admin console rendering Admin Login (strictly **NO** forgot password link), Executive Dashboard counters, Complaint Management (assign, status updates, remarks, resolutions), Category Management, and Admin Profile.
- **State & Tab Persistence Across Refreshes**:
  - Automatically saves active view tabs (`userActiveTab`, `adminActiveTab`) and currently selected complaint details (`userSelectedComplaintId`, `adminSelectedComplaintId`) in `localStorage`. Page refreshes seamlessly restore exact user context.
- **Fully Responsive Mobile & Tablet Experience**:
  - Optimized for mobile, tablet, and desktop screens with collapsible hamburger navigation bar (`Menu` / `X` toggle).
- **Soft Neumorphic Visual Language**: Off-white palette (`#e6e8ec`), soft raised/pressed shadow pairs (`box-shadow`), subtle depth, and Framer Motion micro-interactions.
- **Password Management & Permanent Admin Security Lock**:
  - **User**: Pre-login forgot-password recovery flow & logged-in profile password update.
  - **Admin**: Password is permanently locked to the seeded value configured via `ADMIN_PASSWORD` in `.env`. Admin password updates occur by updating `ADMIN_PASSWORD` in `.env` and re-running database seed.
- **PostgreSQL & Prisma ORM**: Built with support for Neon serverless PostgreSQL (pooled `DATABASE_URL` and direct `DIRECT_URL`) as well as local Dockerized PostgreSQL.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router v7, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js v5, JWT, bcryptjs, Prisma ORM v6.
- **Database**: PostgreSQL (Neon Serverless or Docker).
- **Containerization**: Docker, Docker Compose, Nginx.

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
JWT_SECRET="cms_super_secret_jwt_key_2026"
ADMIN_EMAIL="admin@cms.com"
ADMIN_PASSWORD="123456"
```

---

## 🐳 Docker Deployment Guide

Run the full stack (PostgreSQL, Express Backend, and React Frontend Nginx container) using Docker Compose:

```bash
docker-compose up --build
```

The application services will be accessible at:
- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost:5000/api`
- **PostgreSQL Database**: `localhost:5432`

---

## 🚀 Manual Local Execution Guide

### 1. Backend Setup (`/server`)
```bash
cd server
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed default categories & initial ADMIN user (ADMIN_PASSWORD=123456)
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

Access the web portal locally at:
- **User Portal**: `http://localhost:5173/user`
- **Admin Portal**: `http://localhost:5173/admin`

---

## 🔐 Admin Credentials & Security Note

- **Default Admin Email**: `admin@cms.com`
- **Default Admin Password**: `123456`

The Admin password cannot be modified through the web interface or API endpoints by design. To update the admin password, modify `ADMIN_PASSWORD` in `/server/.env` and re-run `npx prisma db seed`.
