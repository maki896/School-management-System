# Architecture Overview

## Repository Layout

- `backend/`: Express 5 REST API with TypeScript, Mongoose models, JWT auth, and Jest-based API coverage.
- `frontend/`: Angular 19 standalone SPA with Angular Material, route-guarded role areas, and Cypress end-to-end coverage.
- `specs/001-school-rbac-system/`: planning artifacts, contract, and execution tasks for this feature.

## Runtime Shape

- The backend owns authentication, RBAC, validation, and canonical academic relationships.
- The frontend consumes the REST API and uses guards and interceptors for UX support, never as the source of truth for authorization.
- MongoDB persists users, roles, grades, subjects, enrollments, teaching assignments, marks, and attendance records.

## Authentication and Authorization Hardening

- Access tokens are signed on the backend and validated only on the backend before any protected route logic runs.
- JWT verification is constrained to the configured HMAC algorithm and now validates required claims before request state is trusted.
- The API returns distinct 401 codes for missing authentication, invalid tokens, and expired sessions so the client can respond consistently.
- Production configuration rejects the placeholder development JWT secret, and token lifetime is configurable through `JWT_EXPIRES_IN`.

## Admin Story Implementation

- The admin API now exposes CRUD and lifecycle endpoints for teachers, students, subjects, grades, enrollments, teaching assignments, and attendance under `/api/admin/*`.
- Enrollment and teaching-assignment services populate related names so the Angular admin screens can present context-rich summaries without extra client joins.
- Attendance management accepts optional subject and teacher context, allowing both general daily attendance and subject-specific attendance flows.
- The Angular admin area is organized as a routed workspace with focused pages for each managed record type, backed by a single admin data service.

## Teacher and Student Story Implementation

- Teacher APIs are scoped through teaching assignments and enrollments, which bound both dashboard visibility and write access for marks and attendance.
- Student APIs aggregate only the signed-in student's published marks and active attendance records.
- Angular teacher and student areas are split into dedicated feature routes with guard-level UX checks layered over the backend RBAC source of truth.

## Phase 6 Cross-Cutting Coverage

- Middleware regression coverage lives in `backend/tests/middleware/rbac.middleware.test.ts` and protects the auth/RBAC boundary against common token and role regressions.
- Cypress route-guard coverage lives in `frontend/cypress/e2e/rbac-guards.cy.ts` and exercises unauthorized navigation across all three roles.
- Frontend environment wiring supports a runtime API base URL override through `window.__schoolManagementEnv.apiBaseUrl`, with production defaulting to `/api` for reverse-proxy deployments.

## Deployment Shape

- Local development runs the Express API on port `3000` and the Angular app on port `4200`.
- Production can run with the frontend and backend on separate origins, provided the backend `CLIENT_ORIGIN` is updated and the frontend runtime API base URL points at the deployed backend.
- A same-host or reverse-proxy deployment can leave the production frontend API base URL at `/api`.
