# Database Migration Chain (Authoritative)

## Purpose
- Define the single authoritative execution order for database setup.
- Separate executable migrations from optional seeds.
- Mark reference-only files that must never be executed.

## Authoritative Execution Order
**Base Schema**
1. db/01_master_setup.sql

**Migrations (apply in order)**
2. db/02_secure_enrollment.sql
3. db/03_progress_tracking.sql
4. db/04_add_profile_fields.sql
5. db/05_fix_profiles_rls.sql
6. db/06_reset_profiles_policies.sql
7. db/07_create_purchases_table.sql
8. db/08_exam_system_setup.sql
9. db/11_fix_exam_integrity.sql
10. db/12_security_overhaul.sql
11. db/13_performance_tuning.sql
12. db/14_exam_timing_security.sql
13. db/15_fix_exam_logic.sql
14. db/16_fix_exam_scoring_and_enrollment.sql
15. db/17_dashboard_performance.sql
16. db/18_harden_exam_validation.sql

## Optional Seeds (Non‑authoritative)
- db/09_seed_courses.sql
- db/10_seed_exams.sql

## Reference‑Only (Non‑executable)
- db/schema.sql — snapshot only, never part of the migration chain
- supabase_schema.sql — legacy baseline snapshot
- db/fix_missing_columns.sql — one‑off hotfix snapshot

## Active vs Legacy Summary
**Active (authoritative chain)**
- db/01_master_setup.sql
- db/02_secure_enrollment.sql
- db/03_progress_tracking.sql
- db/04_add_profile_fields.sql
- db/05_fix_profiles_rls.sql
- db/06_reset_profiles_policies.sql
- db/07_create_purchases_table.sql
- db/08_exam_system_setup.sql
- db/11_fix_exam_integrity.sql
- db/12_security_overhaul.sql
- db/13_performance_tuning.sql
- db/14_exam_timing_security.sql
- db/15_fix_exam_logic.sql
- db/16_fix_exam_scoring_and_enrollment.sql
- db/17_dashboard_performance.sql
- db/18_harden_exam_validation.sql

**Legacy / Reference‑only**
- db/schema.sql
- supabase_schema.sql
- db/fix_missing_columns.sql

