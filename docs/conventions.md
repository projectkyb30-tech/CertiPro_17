# Conventions

## Naming
- Folders: kebab-case
- React component files: PascalCase
- React components: PascalCase
- Hooks: useXxx
- Functions: verbNoun
- RPCs: snake_case verbs (e.g., start_exam_attempt)
- Tables: plural snake_case (e.g., exam_attempts)
- Columns: snake_case, foreign keys use <table>_id

## Folder Layout
- src/pages: route-level UI only
- src/features/<feature>/api: data access wrappers
- src/features/<feature>/components: feature UI
- src/features/<feature>/hooks: feature logic
- src/shared/ui: shared visual components
- src/shared/components: shared non-visual components
- src/layout: app layouts and navigation
- src/services: low-level clients and adapters
- src/store: app state

## Import Rules
- Pages may import feature modules and shared UI
- Feature components should not import other feature pages
- Data access stays in api and services layers
