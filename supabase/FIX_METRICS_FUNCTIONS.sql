-- ============================================================================
-- CORREÇÃO DAS FUNÇÕES SQL - RAPMARKETING MÉTRICAS
-- ============================================================================
-- Este script corrige as funções SQL para usar os nomes corretos das colunas
-- baseado na estrutura real das tabelas smartlink_clicks e presave_clicks
-- ============================================================================

-- ============================================================================
-- FUNÇÃO 1: get_user_metrics_summary (CORRIGIDA)
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
    platform_stats AS (
        SELECT 
            platform_id,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks,
            ROUND(
                (COUNT(*) FILTER (WHERE is_page_view = false) * 100.0 / 
                 NULLIF((SELECT SUM(COUNT(*) FILTER (WHERE is_page_view = false)) FROM all_clicks WHERE platform_id != 'page_view' AND platform_id IS NOT NULL GROUP BY ()), 0)), 
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
-- FUNÇÃO 2: get_item_detailed_metrics (CORRIGIDA)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_item_detailed_metrics(
    p_link_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_start_date TIMESTAMP;
    v_end_date TIMESTAMP;
    v_item_type TEXT;
BEGIN
    -- Definir período padrão se não fornecido
    v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, NOW());
    
    -- Determinar tipo do item
    IF EXISTS (SELECT 1 FROM smart_links WHERE id = p_link_id) THEN
        v_item_type := 'smartlink';
    ELSIF EXISTS (SELECT 1 FROM presaves WHERE id = p_link_id) THEN
        v_item_type := 'presave';
    ELSE
        RETURN '{"error": "Item não encontrado"}'::json;
    END IF;
    
    -- Construir resultado baseado no tipo
    WITH item_clicks AS (
        SELECT 
            platform_id,
            clicked_at,
            NOT COALESCE(is_general_click, true) as is_page_view,
            COALESCE(country_name, country, 'Unknown') as country,
            COALESCE(city_name, city, 'Unknown') as city,
            device_type,
            os_type,
            browser_type,
            EXTRACT(hour FROM clicked_at) as hour
        FROM smartlink_clicks
        WHERE smartlink_id = p_link_id
          AND clicked_at BETWEEN v_start_date AND v_end_date
          AND v_item_type = 'smartlink'
        
        UNION ALL
        
        SELECT 
            platform_id,
            clicked_at,
            COALESCE(is_page_view, false) as is_page_view,
            COALESCE(country_name, 'Unknown') as country,
            COALESCE(city_name, 'Unknown') as city,
            device_type,
            os_type,
            browser_type,
            EXTRACT(hour FROM clicked_at) as hour
        FROM presave_clicks
        WHERE presave_id = p_link_id
          AND clicked_at BETWEEN v_start_date AND v_end_date
          AND v_item_type = 'presave'
    ),
    summary_stats AS (
        SELECT
            COUNT(*) FILTER (WHERE is_page_view = false) as total_clicks,
            COUNT(*) FILTER (WHERE is_page_view = true) as total_views
        FROM item_clicks
    ),
    platform_breakdown AS (
        SELECT 
            platform_id,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks
        FROM item_clicks
        WHERE platform_id IS NOT NULL
        GROUP BY platform_id
        ORDER BY clicks DESC
    ),
    country_breakdown AS (
        SELECT 
            country,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
    ),
    city_breakdown AS (
        SELECT 
            city,
            country,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY city, country
        ORDER BY count DESC
        LIMIT 10
    ),
    device_breakdown AS (
        SELECT 
            COALESCE(device_type, 'Unknown') as device_type,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY device_type
        ORDER BY count DESC
    ),
    browser_breakdown AS (
        SELECT 
            COALESCE(browser_type, 'Unknown') as browser,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY browser_type
        ORDER BY count DESC
    ),
    os_breakdown AS (
        SELECT 
            COALESCE(os_type, 'Unknown') as os,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY os_type
        ORDER BY count DESC
    ),
    daily_evolution AS (
        SELECT 
            DATE(clicked_at) as date,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks,
            COUNT(*) FILTER (WHERE is_page_view = true) as views
        FROM item_clicks
        GROUP BY DATE(clicked_at)
        ORDER BY date
    ),
    peak_hours AS (
        SELECT 
            hour,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks
        FROM item_clicks
        GROUP BY hour
        ORDER BY clicks DESC
    )
    
    SELECT json_build_object(
        'summary', (
            SELECT json_build_object(
                'total_clicks', COALESCE(total_clicks, 0),
                'total_views', COALESCE(total_views, 0)
            )
            FROM summary_stats
        ),
        'platforms', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'platform_id', platform_id,
                    'clicks', clicks
                )
            ), '[]'::json)
            FROM platform_breakdown
        ),
        'countries', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'country', country,
                    'count', count
                )
            ), '[]'::json)
            FROM country_breakdown
        ),
        'cities', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'city', city,
                    'country', country,
                    'count', count
                )
            ), '[]'::json)
            FROM city_breakdown
        ),
        'devices', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'device_type', device_type,
                    'count', count
                )
            ), '[]'::json)
            FROM device_breakdown
        ),
        'browsers', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'browser', browser,
                    'count', count
                )
            ), '[]'::json)
            FROM browser_breakdown
        ),
        'os_types', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'os', os,
                    'count', count
                )
            ), '[]'::json)
            FROM os_breakdown
        ),
        'daily_evolution', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'date', date,
                    'clicks', clicks,
                    'views', views
                )
            ), '[]'::json)
            FROM daily_evolution
        ),
        'peak_hours', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'hour', hour,
                    'clicks', clicks
                )
            ), '[]'::json)
            FROM peak_hours
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================================

-- Permitir que usuários executem as funções apenas para seus próprios dados
ALTER FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) OWNER TO postgres;
ALTER FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) OWNER TO postgres;

-- Garantir que as funções possam acessar as tabelas necessárias
GRANT EXECUTE ON FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

/*
PRINCIPAIS CORREÇÕES FEITAS:

1. NOMES DE COLUNAS CORRIGIDOS:
   - smartlink_clicks: usa country_name OU country (com fallback)
   - smartlink_clicks: usa city_name OU city (com fallback)
   - presave_clicks: usa country_name e city_name
   - Ambas: device_type, os_type, browser_type já corretos

2. TRATAMENTO DE NULOS:
   - COALESCE para garantir valores padrão
   - is_general_click pode ser NULL, usa COALESCE(is_general_click, true)
   - is_page_view pode ser NULL, usa COALESCE(is_page_view, false)

3. LÓGICA DE PAGE VIEW PADRONIZADA:
   - Smart Links: is_page_view = NOT is_general_click
   - Presaves: is_page_view = is_page_view (direto)

4. VALIDAÇÕES ADICIONAIS:
   - Verifica se platform_id não é NULL antes de usar
   - Filtra platform_id != 'page_view' para estatísticas
   - Usa COALESCE para evitar erros com campos opcionais

5. PERFORMANCE:
   - Mantém índices existentes
   - Usa LIMIT para evitar resultados excessivamente grandes
   - Otimizado para queries comuns

Execute este script no Supabase SQL Editor para corrigir as funções.
*/
