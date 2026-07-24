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

### Phase 5: Multi-Tenancy Data Isolation & Status Management
* Verified **Multi-Tenant Data Isolation**: Created a secondary Organization (Org B) with its own Admin account and confirmed that querying `GET /api/updates` under Org B returned zero status updates from Org A, proving complete multi-tenant tenant isolation.
* Built `PUT /api/updates/:id` — allows users to update and edit their own status updates.
* Built `DELETE /api/updates/:id` — allows users to delete their own status updates.
* Added data ownership checks inside update and delete routes to prevent non-owner users from modifying or removing another member's post.

### Phase 6: Role-Based Access Control (RBAC) & Enhanced Permissions
* Created `roleMiddleware` (`requireAdmin`) to enforce route-level authorization based on the authenticated user's JWT role claim.
* Updated `DELETE /api/updates/:id` with role-based logic: Admins can delete any status update within their organization, while non-admin members can only delete their own updates.
* Built `GET /api/org/team` (and `/api/org/members`) — an Admin-only endpoint that returns a list of all team members belonging to the Admin's organization.
* Verified RBAC enforcement via Postman: confirmed regular `MEMBER` accounts receive a `403 Forbidden` response when attempting to access Admin-only routes.

### Phase 7: Team Management & Project Polish
* Built `PUT /api/org/team/:userId/role` — allows Admins to update a team member's role (e.g., upgrading a `MEMBER` to `ADMIN`).
* Built `DELETE /api/org/team/:userId` — allows Admins to remove a member from the organization, safely detaching their organization association while preventing self-removal.
* Handled edge cases including payload normalization (`organizationId` vs `orgId`, `userId` vs `id`) and error handling for missing/unauthorized users.
* Completed full end-to-end testing across all API routes using Postman with both Admin and Member JWT tokens. 

---

## 🎯 Project Status & Complete API Reference

**Status:** `Completed (100%)` — All core features, multi-tenancy isolation, RBAC permissions, and team management routes are fully implemented and verified.

### 🔌 API Endpoints Summary

#### 🔑 Authentication & Onboarding
* `POST /api/auth/signup` — Create a new Organization & initial Admin account
* `POST /api/auth/login` — Authenticate user credentials & receive JWT token
* `POST /api/auth/join-org` — Join an existing Organization using an invite code

#### 📝 Status Updates (Multi-Tenant Feed)
* `POST /api/updates` — Publish a new status update
* `GET /api/updates` — Fetch status updates (isolated exclusively to user's org)
* `PUT /api/updates/:id` — Edit a status update (Owner only)
* `DELETE /api/updates/:id` — Delete a status update (Owner or Org Admin)

#### 👥 Team Management & Admin (RBAC Protected)
* `GET /api/org/team` — List all members in the organization (`Admin Only`)
* `POST /api/org/invite` — Invite/Add an existing registered user to org (`Admin Only`)
* `PUT /api/org/team/:userId/role` — Update a member's role (`Admin Only`)
* `DELETE /api/org/team/:userId` — Remove a member from the organization (`Admin Only`)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken), bcrypt |
| API Testing | Postman |

---


