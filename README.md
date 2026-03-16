``# School Management System

MEAN stack school management system with server-authoritative RBAC for Admin, Teacher, and Student roles.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Local MongoDB or a reachable MongoDB Atlas database

## Project Structure

- `backend/` contains the Express 5 API, Mongoose models, auth pipeline, and seed script.
- `frontend/` contains the Angular 19 application and Cypress E2E suites.
- `docs/architecture.md` contains reviewer-facing architecture notes.

## Installation

Install dependencies in the root workspace and each application workspace:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Environment Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` to a local MongoDB instance or MongoDB Atlas connection string.
3. Replace `JWT_SECRET` if you are not using the local development default.
4. Keep `CLIENT_ORIGIN=http://localhost:4200` for local development unless you change the frontend port.

Available backend environment values:

- `PORT`: API port, default `3000`
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: signing secret for access tokens
- `JWT_EXPIRES_IN`: token lifetime, default `8h`
- `CLIENT_ORIGIN`: allowed browser origin for CORS
- `SEED_ADMIN_EMAIL`, `SEED_TEACHER_EMAIL`, `SEED_STUDENT_EMAIL`
- `SEED_DEFAULT_PASSWORD`

Production frontend builds can read a runtime override from `window.__schoolManagementEnv.apiBaseUrl`. If no override is provided, the production app defaults to `/api` so it can sit behind the same host or reverse proxy as the backend.

## Seed Data

After MongoDB is available, seed the baseline school records:

```bash
npm --prefix backend run seed
```

This creates one account per role plus sample grade, subject, enrollment, assignment, mark, and attendance data.

## Run Locally

- `npm run dev` starts the backend and frontend together.
- `npm --prefix backend run dev` starts only the API.
- `npm --prefix frontend run start` starts only the Angular app.
- `npm run build` builds both applications.
- `npm run test` runs backend and frontend automated tests.
- `npm run e2e` runs Cypress in the frontend workspace.

Local URLs:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`

## Validation Commands

Use these commands before handing the project to a reviewer:

```bash
npm run lint
npm run build
npm run test
npm run dev
npm run e2e
```

Keep `npm run dev` running in a separate terminal before executing `npm run e2e` so Cypress can reach the backend on port `3000` and the frontend on port `4200`.

## Admin Workflow Coverage

- Admin routes are available under the protected `/admin` area after signing in with the seeded administrator account.
- The admin workspace includes dedicated screens for teachers, students, subjects, grades, enrollments, teaching assignments, and attendance.
- Teacher and student records are deactivated instead of hard-deleted so academic history remains intact.
- Enrollment and teaching-assignment screens define the scope later used by teacher and student role workflows.

## Cross-Role Security Coverage

- Backend JWT middleware now distinguishes missing credentials, invalid tokens, and expired sessions.
- Backend middleware regression tests cover missing bearer headers, malformed tokens, expired tokens, missing claims, denied roles, and allowed roles.
- Cypress coverage now verifies that Admin, Teacher, and Student users are redirected away from unauthorized route areas.

## Seeded Accounts

The seed script creates one account per role using the email values in `backend/.env` and the shared development password from `SEED_DEFAULT_PASSWORD`.

- Default seeded emails:
  - Admin: `admin@school.local`
  - Teacher: `teacher@school.local`
  - Student: `student@school.local`
- Default development password: `Password123!`
- Default role routes after login:
  - Admin: `/admin`
  - Teacher: `/teacher`
  - Student: `/student`

## Deployment Notes

- Deploy the backend separately from the frontend unless you provide a reverse proxy that exposes the backend under `/api`.
- For separate frontend hosting, inject `window.__schoolManagementEnv = { apiBaseUrl: 'https://your-backend-host/api' }` before Angular bootstraps, or rebuild with an environment-specific replacement.
- Ensure `CLIENT_ORIGIN` on the backend matches the deployed frontend origin.
