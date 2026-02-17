-- 23_db_integrity_performance.sql
-- 1. Consolidare tabele plăți (eliminare payments, păstrare user_purchases)
-- Verificăm dacă există date în 'payments' care trebuie migrate (în mod normal e mock/empty)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP TABLE public.payments CASCADE;
    END IF;
END $$;

-- 2. Adăugare constrângeri de integritate
ALTER TABLE public.courses ADD CONSTRAINT check_price_non_negative CHECK (price >= 0);

-- 3. Optimizare performanță prin indexare
-- Index pe course_id în user_purchases (folosit în admin stats)
CREATE INDEX IF NOT EXISTS idx_user_purchases_course_id ON public.user_purchases(course_id);

-- Index compus pe exam_attempts(user_id, course_id) (folosit frecvent la verificarea statusului)
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_course ON public.exam_attempts(user_id, course_id);

-- Index pe course_id în questions (folosit la încărcarea examenului)
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON public.questions(course_id);

-- 4. Securizare scripturi (eliminare DROP TABLE CASCADE din master setup viitor)
-- Aceasta este o notă pentru developeri: Folosiți migrații incrementale (ca aceasta) 
-- în loc de resetarea completă a bazei de date în producție.

-- 5. Funcție agregare lunară pentru Admin Stats
CREATE OR REPLACE FUNCTION public.admin_monthly_stats(p_since TIMESTAMPTZ)
RETURNS TABLE(month TEXT, users INTEGER, revenue NUMERIC)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT to_char(date_trunc('month', d), 'Mon') AS month,
         COALESCE(u.cnt, 0) AS users,
         COALESCE(r.sum, 0) AS revenue
  FROM generate_series(
         date_trunc('month', p_since),
         date_trunc('month', now()),
         interval '1 month'
       ) AS d
  LEFT JOIN (
    SELECT date_trunc('month', created_at) AS m, COUNT(*) AS cnt
    FROM public.profiles
    WHERE created_at >= p_since
    GROUP BY m
  ) u ON u.m = date_trunc('month', d)
  LEFT JOIN (
    SELECT date_trunc('month', created_at) AS m, SUM(amount_total)::numeric/100 AS sum
    FROM public.user_purchases
    WHERE created_at >= p_since
    GROUP BY m
  ) r ON r.m = date_trunc('month', d)
  ORDER BY d;
$$;
