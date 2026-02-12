# Architecture Overview

## Purpose
This document explains system boundaries, entry points, and data flow so a new team can make changes safely.

## Entry Points
- Frontend bootstrap: src/main.tsx → src/App.tsx
- Frontend routing: src/routes/AppRoutes.tsx
- Backend API: backend/server.js
- Database migrations: db/01_master_setup.sql followed by docs/migrations.md order

## Frontend Boundaries
- UI pages: src/pages
- Feature modules: src/features/<feature>/
  - api: data access wrappers for a feature
  - components: feature UI pieces
  - hooks: feature logic hooks
- Shared UI/components: src/shared/ui, src/shared/components
- Layout: src/layout
- State: src/store
- Data clients/services: src/services

## Backend Boundaries
- REST endpoints and webhooks live in backend/server.js
- Backend is the only place allowed to use service role keys

## Database Boundaries
- Authoritative chain in docs/migrations.md
- Optional seeds are never part of the migration chain
- Archived SQL is read-only reference

## Data Flow
- Auth: UI → features/auth/api → services/authService → Supabase auth
- Courses: UI → store → features/courses/api → services/courseService → Supabase
- Exams: UI → features/exams/api → services/examService → RPCs
- Billing: UI → features/billing/api → backend REST → Stripe + Supabase

## Internal-Only Areas
- db/ and backend/ are internal-only and require review for changes

## Scalability Pattern
- New courses: add to DB and use features/courses with courseApi
- New exams: add RPCs and use features/exams with examApi
- New modules: create a new feature folder using docs/feature-template.md

## Reference Docs
- docs/duplication_report.md
- docs/feature-template.md
- docs/onboarding.md
- docs/backend.md
- docs/db-structure.md
