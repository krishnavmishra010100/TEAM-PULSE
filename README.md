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
 
### Phase 3: Organization Joining & Route Protection
- Built `POST /join-org` — allows a new user to join an existing organization using its unique invite code, automatically assigned the `MEMBER` role
- Implemented `authMiddleware` — verifies JWT tokens and protects routes from unauthenticated access
- Verified multi-user, multi-role flow: two users can exist within the same organization with different roles (Admin and Member), and both can independently log in and receive valid tokens

### Phase 4: Status Updates & Multi-Tenant Feed Isolation
- Built POST /api/updates — allows authenticated users to publish team status updates tied directly to their account and organization
- Built GET /api/updates — fetches the organization’s status feed, enforcing multi-tenancy by filtering updates exclusively to the logged-in user’s organizationId
- Integrated Prisma include clauses to return relational author details (name, email, role) alongside each update while omitting sensitive password data
- Wired update routes through authMiddleware to extract user identity safely from JWT payload claims (userId, organizationId)
- Verified multi-tenant feed isolation via Postman, ensuring updates appear correctly within shared organization feeds 
- All flows manually tested end-to-end via Postman at each stage.

## 🔜 Upcoming Phases

- Multi-tenant data isolation verification (cross-organization data leak testing with a second organization)
- Role-based access control on sensitive routes (403 handling for unauthorized roles)
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
