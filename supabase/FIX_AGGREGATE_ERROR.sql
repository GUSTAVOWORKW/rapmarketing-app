-- ============================================================================
-- CORREÇÃO DO ERRO DE AGREGAÇÃO ANINHADA - RAPMARKETING MÉTRICAS
-- ============================================================================
-- Este script corrige o erro "aggregate function calls cannot be nested"
-- na função get_user_metrics_summary
-- ============================================================================

-- ============================================================================
-- FUNÇÃO 1: get_user_metrics_summary (CORRIGIDA - SEM AGREGAÇÃO ANINHADA)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_metrics_summary(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_start_date TIMESTAMP;
    v_end_date TIMESTAMP;
BEGIN
    -- Definir período padrão se não fornecido
    v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, NOW());
    
    -- Log para debug
    RAISE NOTICE 'Buscando métricas para usuário % entre % e %', p_user_id, v_start_date, v_end_date;
    
    -- Construir resultado JSON
    WITH user_smartlinks AS (
        SELECT id, artist_name, release_title FROM smart_links WHERE user_id = p_user_id
    ),
    user_presaves AS (
        SELECT id, artist_name, track_name FROM presaves WHERE user_id = p_user_id
    ),
    all_clicks AS (
        -- Clicks de Smart Links
        SELECT 
            sc.smartlink_id as item_id,
            'smartlink' as item_type,
            sc.platform_id,
            sc.clicked_at,
            NOT COALESCE(sc.is_general_click, true) as is_page_view,
            COALESCE(sc.country_name, sc.country, 'Unknown') as country,
            COALESCE(sc.city_name, sc.city, 'Unknown') as city,
            sc.device_type,
            sc.os_type,
            sc.browser_type,
            sl.artist_name,
            sl.release_title as title
        FROM smartlink_clicks sc
        JOIN user_smartlinks sl ON sc.smartlink_id = sl.id
        WHERE sc.clicked_at BETWEEN v_start_date AND v_end_date
        
        UNION ALL
        
        -- Clicks de Presaves
        SELECT 
            pc.presave_id as item_id,
            'presave' as item_type,
            pc.platform_id,
            pc.clicked_at,
            COALESCE(pc.is_page_view, false) as is_page_view,
            COALESCE(pc.country_name, 'Unknown') as country,
            COALESCE(pc.city_name, 'Unknown') as city,
            pc.device_type,
            pc.os_type,
            pc.browser_type,
            p.artist_name,
            p.track_name as title
        FROM presave_clicks pc
        JOIN user_presaves p ON pc.presave_id = p.id
        WHERE pc.clicked_at BETWEEN v_start_date AND v_end_date
    ),
    summary_stats AS (
        SELECT
            COUNT(*) FILTER (WHERE is_page_view = false) as total_clicks,
            COUNT(*) FILTER (WHERE is_page_view = true) as total_views,
            (SELECT COUNT(*) FROM user_smartlinks) as total_smartlinks,
            (SELECT COUNT(*) FROM user_presaves) as total_presaves,
            (SELECT COUNT(*) FROM user_smartlinks) + (SELECT COUNT(*) FROM user_presaves) as total_items
        FROM all_clicks
    ),
    -- CORRIGIDO: Primeiro calculamos o total de clicks, depois usamos
    total_platform_clicks AS (
        SELECT SUM(clicks) as total_clicks
        FROM (
            SELECT 
                platform_id,
                COUNT(*) FILTER (WHERE is_page_view = false) as clicks
            FROM all_clicks
            WHERE platform_id != 'page_view' AND platform_id IS NOT NULL
            GROUP BY platform_id
        ) platform_counts
    ),
    platform_stats AS (
        SELECT 
            platform_id,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks,
            ROUND(
                (COUNT(*) FILTER (WHERE is_page_view = false) * 100.0 / 
                 NULLIF((SELECT total_clicks FROM total_platform_clicks), 0)), 
                1
            ) as percentage
        FROM all_clicks
        WHERE platform_id != 'page_view' AND platform_id IS NOT NULL
        GROUP BY platform_id
        HAVING COUNT(*) FILTER (WHERE is_page_view = false) > 0
        ORDER BY clicks DESC
        LIMIT 10
    ),
    top_items AS (
        SELECT 
            item_id as link_id,
            item_type as type,
            artist_name,
            title,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks,
            COUNT(*) FILTER (WHERE is_page_view = true) as views,
            CASE 
                WHEN COUNT(*) FILTER (WHERE is_page_view = true) > 0 
                THEN ROUND(
                    (COUNT(*) FILTER (WHERE is_page_view = false) * 100.0 / 
                     COUNT(*) FILTER (WHERE is_page_view = true)), 
                    1
                )
                ELSE 0 
            END as click_rate
        FROM all_clicks
        GROUP BY item_id, item_type, artist_name, title
        HAVING COUNT(*) > 0
        ORDER BY clicks DESC
        LIMIT 10
    ),
    recent_activity AS (
        SELECT 
            item_id as link_id,
            item_type as type,
            artist_name,
            title,
            platform_id,
            clicked_at
        FROM all_clicks
        WHERE is_page_view = false AND platform_id != 'page_view'
        ORDER BY clicked_at DESC
        LIMIT 20
    )
    
    SELECT json_build_object(
        'summary', (
            SELECT json_build_object(
                'total_clicks', COALESCE(total_clicks, 0),
                'total_views', COALESCE(total_views, 0),
                'total_items', COALESCE(total_items, 0),
                'total_smartlinks', COALESCE(total_smartlinks, 0),
                'total_presaves', COALESCE(total_presaves, 0)
            )
            FROM summary_stats
        ),
        'platform_stats', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'platform_id', platform_id,
                    'clicks', clicks,
                    'percentage', percentage
                )
            ), '[]'::json)
            FROM platform_stats
        ),
        'top_items', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'link_id', link_id,
                    'type', type,
                    'artist_name', artist_name,
                    'title', title,
                    'clicks', clicks,
                    'views', views,
                    'click_rate', click_rate
                )
            ), '[]'::json)
            FROM top_items
        ),
        'recent_activity', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'link_id', link_id,
                    'type', type,
                    'artist_name', artist_name,
                    'title', title,
                    'platform_id', platform_id,
                    'clicked_at', clicked_at
                )
            ), '[]'::json)
            FROM recent_activity
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MANTER A FUNÇÃO 2 INALTERADA (JÁ ESTÁ CORRETA)
-- ============================================================================
-- A função get_item_detailed_metrics não precisa de alteração pois não tem
-- agregação aninhada

-- ============================================================================
-- COMENTÁRIOS SOBRE A CORREÇÃO
-- ============================================================================

/*
PROBLEMA CORRIGIDO:

1. ERRO ORIGINAL:
   - Linha 86-88: SUM(COUNT(*) FILTER (...)) FROM all_clicks WHERE ... GROUP BY ()
   - PostgreSQL não permite agregações aninhadas (SUM de COUNT)

2. SOLUÇÃO IMPLEMENTADA:
   - Criada CTE "total_platform_clicks" que primeiro calcula todos os counts por plataforma
   - Depois faz o SUM desses counts em uma subconsulta separada
   - Uso da subconsulta na CTE "platform_stats" para obter o total

3. BENEFÍCIOS:
   - Remove o erro SQL de agregação aninhada
   - Mantém a mesma lógica de cálculo de percentuais
   - Performance similar ou melhor
   - Código mais legível e compreensível

Execute este script no Supabase SQL Editor para corrigir o erro.
*/
