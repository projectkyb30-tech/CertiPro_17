-- Create table for tracking user purchases
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    payment_intent_id TEXT,
    amount_total INTEGER NOT NULL, -- Amount in cents/ban
    currency TEXT NOT NULL DEFAULT 'ron',
    status TEXT NOT NULL DEFAULT 'paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view ONLY their own purchases
CREATE POLICY "Users can view own purchases" 
ON public.user_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: NO ONE can insert/update/delete via API (Service Role only via Backend)
-- Explicitly creating a deny-all for anon/authenticated roles is not strictly necessary 
-- as RLS denies by default if no policy matches, but we rely on that default behavior.

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_stripe_session_id ON public.user_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_payment_intent_id ON public.user_purchases(payment_intent_id);
