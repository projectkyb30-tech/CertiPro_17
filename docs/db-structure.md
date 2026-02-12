# Database Structure

## Active Migrations
- Located in db/
- Executed in order defined in docs/migrations.md

## Seeds
- db/09_seed_courses.sql
- db/10_seed_exams.sql
- Optional, never part of migration chain

## Archive
- db/archive/*
- Reference only, never executed

## Update Rules
- Never edit executed migrations
- Add new numbered migration files
- Update docs/migrations.md when adding migrations
