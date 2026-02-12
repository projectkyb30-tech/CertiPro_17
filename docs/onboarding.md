# Onboarding Guide

## First Steps
- Read docs/architecture.md
- Read docs/backend.md
- Read docs/conventions.md
- Read docs/db-structure.md
- Read docs/migrations.md
- Configure environment using docs/env.md

## Entry Points
- Frontend bootstrap: src/main.tsx → src/App.tsx
- Routes: src/routes/AppRoutes.tsx
- Backend: backend/server.js
- Database: db/01_master_setup.sql then docs/migrations.md chain

## Do Not Touch Without Review
- backend/server.js
- db/*.sql and db/archive/*
- src/services/supabase.ts
- src/features/billing/*

## Local Development
- Frontend: npm run dev
- Lint: npm run lint
- Build (typecheck + bundle): npm run build

## Feature Development Checklist
- Add new feature under src/features/<feature>/
- Add data access in src/features/<feature>/api
- Keep UI in src/features/<feature>/components
- Keep shared UI in src/shared/ui
