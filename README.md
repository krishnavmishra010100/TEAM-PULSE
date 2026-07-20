# TeamPulse API

A multi-tenant, role-based team status-update platform backend — built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 📖 Overview

TeamPulse allows multiple organizations to independently manage their own teams and status-update feeds within a single shared platform. Each organization's data is fully isolated (multi-tenancy), and access is controlled through role-based permissions (Admin, Manager, Member).

This project is built incrementally, with a strong emphasis on understanding core backend engineering concepts — REST API design, relational data modeling, authentication, authorization, and multi-tenant architecture — rather than following a tutorial blindly.

## 🚧 Project Status: In Progress

## ✅ Completed So Far

### Phase 1: Project Setup & Database Schema
- Initialized Node.js project and installed core dependencies (Express, Prisma, bcrypt, jsonwebtoken, dotenv)
- Set up Git version control with a proper `.gitignore`
- Designed and implemented the core data model:
  - **Organization** — represents a tenant, includes a unique invite code for member onboarding
  - **User** — includes role-based access (`ADMIN`, `MANAGER`, `MEMBER`), linked to a single Organization
  - **StatusUpdate** — team status posts, linked to both the posting User and their Organization
- Ran Prisma migrations and verified schema integrity via Prisma Studio

### Phase 2: Organization Onboarding & Authentication
- Built `POST /signup-org` — creates a new Organization and its first user as Admin
- Built `POST /login` — authenticates any user (regardless of role) and issues a JWT
- Implemented password hashing with bcrypt at signup
- Verified end-to-end: organization creation → admin user creation → successful login → valid JWT returned
- Manually tested all flows via Postman

## 🔜 Upcoming Phases

- `POST /join-org` — join an existing organization via invite code (Member role)
- JWT-based route protection middleware
- Status update CRUD routes (`POST /updates`, `GET /updates`, `PUT /updates/:id`, `DELETE /updates/:id`)
- Multi-tenant data isolation verification (cross-organization data leak testing)
- Role-based access control on sensitive routes
- Admin-only team management (`GET /team`, role updates, member removal)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken), bcrypt |
| API Testing | Postman |

## 📦 Getting Started

```bash
# Clone the repository
git clone <https://github.com/krishnavmishra010100/TEAM-PULSE.git>
cd teampulse

# Install dependencies
npm install

# Configure environment variables
# Create a .env file in the root directory:
# DATABASE_URL="postgresql://username:password@localhost:5432/teampulse?schema=public"

# Run database migrations
npx prisma migrate dev

# Start the server
node index.js
