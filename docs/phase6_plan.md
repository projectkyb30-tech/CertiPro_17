# Plan detaliat — Faza 6 + restanțe

## Context curent (rezumat executiv)
- Faza 4 și Faza 5 sunt implementate.
- Backend a fost modularizat (config, middleware, routes, services).
- Frontend rulează local pe http://localhost:5173/.
- Lintul frontend eșuează din cauza erorilor existente, nelegate de Faza 5.
- Build frontend reușit (vite build).

## Faza 6 — Optimizare încărcare date + logging + monitorizare

### 6.1 Optimizare încărcare date (frontend)
- **Obiectiv:** reducere fetch-uri redundante și încărcare progresivă.
- **Acțiuni:**
  - Revizuire store pentru fetchCourses/fetchCourseDetails: cache, refetch controlat, invalidare pe evenimente cheie (login/logout/purchase).
  - Lazy loading pentru pagini și componente grele unde lipsește.
  - Centralizare fetch pentru lecții: consolidare între CoursePlayer și store cache.
  - Adăugare „stale-while-revalidate” în courseSlice pentru date statice (catalog).
- **Fișiere țintă:** src/store/slices/courseSlice.ts, src/pages/CoursePlayer.tsx, src/services/adapters/SupabaseCourseAdapter.ts
- **Criteriu de acceptare:** trafic API redus, fără impact UI, fără bug-uri de curs/progres.

### 6.2 Optimizare încărcare date (backend)
- **Obiectiv:** reducere costuri la requesturi frecvente.
- **Acțiuni:**
  - Adăugare simple memo/cache server pentru getCourseDetails.
  - Logare timp de răspuns per endpoint.
- **Fișiere țintă:** backend/src/services/courses.js, backend/src/middleware/logger.js
- **Criteriu de acceptare:** loguri cu timing și cache minimal funcțional.

### 6.3 Logging standardizat
- **Obiectiv:** loguri consistente și ușor de urmărit.
- **Acțiuni:**
  - Prefix pentru requestId (generat per request).
  - Level-uri basic (info/warn/error) fără PII.
- **Fișiere țintă:** backend/src/middleware/logger.js, backend/src/app.js
- **Criteriu de acceptare:** fiecare request are requestId, loguri lizibile.

### 6.4 Hookuri de monitorizare
- **Obiectiv:** puncte de extensie pentru Sentry/PostHog.
- **Acțiuni:**
  - Interfață minimă pentru monitorizare în frontend (ex: captureError).
  - Interfață minimă pentru monitorizare în backend (ex: captureException).
- **Fișiere țintă:** src/shared/monitoring, backend/src/lib/monitoring.js
- **Criteriu de acceptare:** un singur loc pentru integrarea tool-urilor externe.

### 6.5 Testare și verificare
- **Acțiuni:**
  - npm run lint (după fixarea erorilor).
  - npm run build.
- **Criteriu de acceptare:** lint și build trec.

## Restanțe tehnice (de rezolvat înainte/în timpul Fazei 6)

### 1) Erori Lint existente (frontend)
- **Blocante (errors):**
  - useLessonStatus în callback: src/features/courses/components/LearningMap.tsx
  - setState în effect: src/features/tutorial/components/AppTutorial.tsx
  - setState în effect: src/pages/CompleteProfile.tsx
  - setState în effect: src/pages/Profile.tsx
  - setState în effect: src/pages/Success.tsx
  - empty interface: src/pages/ExamRunner.tsx
  - @ts-ignore: src/features/dashboard/hooks/useDashboardStats.ts
- **Warning-uri**: any, unused vars, deps hooks, etc.
- **Obiectiv:** rezolvarea erorilor pentru a debloca lintul.

### 2) Backend env
- Asigură backend/.env folosind backend/.env.example ca template.
- Verifică variabilele: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.

### 3) Documentație
- Verifică coerența dintre docs/backend.md, docs/db-structure.md, docs/architecture.md.

## Plan de execuție recomandat (ordine)
1. Fixare erori lint (blocante).
2. Rulare lint + build.
3. Implementare optimizări Faza 6 (frontend).
4. Implementare logging/monitoring (backend + frontend).
5. Verificare finală lint + build.

## Rezultate așteptate
- Lint curat, build curat.
- Date încărcate eficient.
- Logging coerent și extensibil.
- Hookuri de monitorizare pregătite pentru integrare reală.
