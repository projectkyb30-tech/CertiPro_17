# Duplicate and Ambiguous Code Report

## Purpose
List duplicated or ambiguous logic and define the current source of truth for each area.

## Payments
- Duplicate entry points: src/features/courses/components/CourseCard.tsx and src/pages/Checkout.tsx both start checkout.
- Source of truth: src/features/billing/api/billingApi.ts
- Notes: Both UIs must use billingApi only.

## Exams
- Duplicate RPC definitions across migrations (submit_exam, start_exam_attempt).
- Source of truth: last migration in chain (db/18_harden_exam_validation.sql).
- Notes: Earlier definitions are historical and should not be executed out of order.

## Auth Profile Updates
- User profile updates are centralized in src/services/authService.ts.
- Source of truth: authService.updateProfile.

## Course Data Access
- Course data access is centralized in src/services/courseService.ts.
- Source of truth: courseService methods, used via src/features/courses/api/courseApi.ts.

## Exam Data Access
- Exam data access is centralized in src/services/examService.ts.
- Source of truth: examService methods, used via src/features/exams/api/examApi.ts.

## Dashboard Stats
- Dashboard stats are centralized in RPC get_dashboard_stats.
- Source of truth: dashboardApi.getDashboardStats.
