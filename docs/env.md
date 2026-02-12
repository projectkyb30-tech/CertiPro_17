# Environment Configuration

## Frontend (.env.local)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_URL
- VITE_USE_MOCK

## Backend (backend/.env)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
 - Use backend/.env.example as template

## Rules
- Never commit secrets to git
- Use .env.local for local frontend variables
- Use backend/.env for backend variables
