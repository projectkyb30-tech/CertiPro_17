-- ==========================================
-- DASHBOARD PERFORMANCE OPTIMIZATION (v2)
-- ==========================================
-- Date: 05 Feb 2026
-- Description: 
-- 1. Creates a server-side RPC function to aggregate dashboard stats.
-- 2. Returns pre-aggregated data for Week (Daily), Month (Weekly), and All (Monthly).
-- ==========================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_xp INTEGER;
    v_streak INTEGER;
    v_level TEXT;
    v_lessons_today INTEGER;
    v_week_graph JSONB;
    v_month_graph JSONB;
    v_all_graph JSONB;
    v_recent_enrollment JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Get Profile Stats
    SELECT xp, streak INTO v_xp, v_streak
    FROM public.profiles
    WHERE id = v_user_id;

    -- Calculate Level
    IF v_xp >= 5000 THEN v_level := 'Avansat';
    ELSIF v_xp >= 1000 THEN v_level := 'Intermediar';
    ELSE v_level := 'Începător';
    END IF;

    -- 2. Count Lessons Completed Today
    SELECT COUNT(*) INTO v_lessons_today
    FROM public.user_progress
    WHERE user_id = v_user_id
    AND is_completed = TRUE
    AND completed_at >= CURRENT_DATE::timestamp;

    -- 3a. WEEK GRAPH (Last 7 Days - Daily)
    WITH last_7_days AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            '1 day'::interval
        )::date AS day
    ),
    daily_counts AS (
        SELECT completed_at::date AS day, COUNT(*) as cnt
        FROM public.user_progress
        WHERE user_id = v_user_id AND is_completed = TRUE
        AND completed_at >= (CURRENT_DATE - INTERVAL '6 days')
        GROUP BY completed_at::date
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', to_char(d.day, 'YYYY-MM-DD'),
            'label', CASE EXTRACT(ISODOW FROM d.day)
                        WHEN 1 THEN 'L' WHEN 2 THEN 'M' WHEN 3 THEN 'M'
                        WHEN 4 THEN 'J' WHEN 5 THEN 'V' WHEN 6 THEN 'S' WHEN 7 THEN 'D'
                     END,
            'value', COALESCE(c.cnt, 0)
        ) ORDER BY d.day
    ) INTO v_week_graph
    FROM last_7_days d
    LEFT JOIN daily_counts c ON d.day = c.day;

    -- 3b. MONTH GRAPH (Last 4 Weeks - Weekly)
    -- Simplified: Just group by week number relative to current date
    WITH last_4_weeks AS (
        SELECT generate_series(0, 3) AS week_offset
    ),
    weekly_counts AS (
        SELECT 
            floor((CURRENT_DATE - completed_at::date) / 7.0)::int as week_offset,
            COUNT(*) as cnt
        FROM public.user_progress
        WHERE user_id = v_user_id AND is_completed = TRUE
        AND completed_at >= (CURRENT_DATE - INTERVAL '27 days')
        GROUP BY 1
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'label', 'S' || (4 - w.week_offset),
            'value', COALESCE(c.cnt, 0)
        ) ORDER BY w.week_offset DESC
    ) INTO v_month_graph
    FROM last_4_weeks w
    LEFT JOIN weekly_counts c ON w.week_offset = c.week_offset;

    -- 3c. ALL GRAPH (Last 6 Months - Monthly)
    WITH last_6_months AS (
        SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
        )::date AS month_start
    ),
    monthly_counts AS (
        SELECT 
            date_trunc('month', completed_at)::date as month_start,
            COUNT(*) as cnt
        FROM public.user_progress
        WHERE user_id = v_user_id AND is_completed = TRUE
        AND completed_at >= (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months')
        GROUP BY 1
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'label', to_char(m.month_start, 'Mon'),
            'value', COALESCE(c.cnt, 0)
        ) ORDER BY m.month_start
    ) INTO v_all_graph
    FROM last_6_months m
    LEFT JOIN monthly_counts c ON m.month_start = c.month_start;

    -- 4. Get Most Recent Active Enrollment
    SELECT jsonb_build_object(
        'course_id', e.course_id,
        'progress_percent', e.progress_percent,
        'course_title', c.title,
        'total_lessons', c.total_lessons,
        'completed_at', e.completed_at
    ) INTO v_recent_enrollment
    FROM public.enrollments e
    JOIN public.courses c ON e.course_id = c.id
    WHERE e.user_id = v_user_id
    ORDER BY e.enrolled_at DESC
    LIMIT 1;

    -- Return Consolidated JSON
    RETURN jsonb_build_object(
        'xp', COALESCE(v_xp, 0),
        'streak', COALESCE(v_streak, 0),
        'level', v_level,
        'lessons_today', COALESCE(v_lessons_today, 0),
        'week_graph', COALESCE(v_week_graph, '[]'::jsonb),
        'month_graph', COALESCE(v_month_graph, '[]'::jsonb),
        'all_graph', COALESCE(v_all_graph, '[]'::jsonb),
        'recent_enrollment', v_recent_enrollment
    );
END;
$$;
