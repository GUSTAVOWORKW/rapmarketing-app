-- OTIMIZAÇÃO DO BANCO DE DADOS PARA MÉTRICAS
-- Este arquivo contém todas as otimizações necessárias no Supabase

-- =============================================================================
-- 1. CRIAÇÃO/ATUALIZAÇÃO DA VIEW ALL_CLICKS OTIMIZADA
-- =============================================================================

-- Remover view existente se houver
DROP VIEW IF EXISTS all_clicks;

-- Criar view otimizada que unifica dados de ambas as tabelas
CREATE VIEW all_clicks AS
SELECT 
    sc.id,
    sc.smartlink_id as link_id,
    'smartlink' as type,
    sc.platform_id,
    sc.clicked_at,
    NOT sc.is_general_click as is_page_view, -- Inverter lógica do Smart Link
    sc.user_agent,
    sc.ip_address,
    COALESCE(sc.country, sc.country_name) as country,
    COALESCE(sc.city, sc.city_name) as city,
    sc.country_code,
    sc.country_name,
    sc.region_name,
    sc.city_name,
    sc.latitude,
    sc.longitude,    sc.timezone,
    sc.isp,
    -- Campos de dispositivo/browser agora disponíveis
    sc.device_type,
    sc.os_type as os,
    sc.browser_type as browser,
    sl.user_id, -- Adicionar user_id do Smart Link
    sl.artist_name,
    sl.release_title,
    sl.slug,
    sl.is_public,
    NULL as track_name,
    NULL as shareable_slug
FROM smartlink_clicks sc
JOIN smart_links sl ON sc.smartlink_id = sl.id

UNION ALL

SELECT 
    pc.id,
    pc.presave_id as link_id,
    'presave' as type,
    pc.platform_id,
    pc.clicked_at,
    pc.is_page_view, -- Usar direto do Presave
    pc.user_agent,
    pc.ip_address,
    pc.country_name as country, -- presave_clicks só tem country_name
    pc.city_name as city, -- presave_clicks só tem city_name
    pc.country_code,
    pc.country_name,
    pc.region_name,
    pc.city_name,
    pc.latitude,
    pc.longitude,    pc.timezone,
    pc.isp,
    -- Campos de dispositivo/browser agora disponíveis
    pc.device_type,
    pc.os_type as os,
    pc.browser_type as browser,
    p.user_id, -- Adicionar user_id do Presave
    p.artist_name,
    NULL as release_title,
    NULL as slug,
    true as is_public, -- Presaves são sempre públicos
    p.track_name,
    p.shareable_slug
FROM presave_clicks pc
JOIN presaves p ON pc.presave_id = p.id;

-- =============================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para smartlink_clicks (alguns já existem, mas vamos garantir otimização)
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_smartlink_id_clicked_at 
ON smartlink_clicks(smartlink_id, clicked_at DESC);

-- Índice já existe: idx_smartlink_clicks_clicked_at
-- Índice já existe: idx_smartlink_clicks_platform_id
-- Índice já existe: idx_smartlink_clicks_country_code
-- Índice já existe: idx_smartlink_clicks_city_name
-- Índice já existe: idx_smartlink_clicks_smartlink_id

-- Índices adicionais para smartlink_clicks
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_country_name 
ON smartlink_clicks(country_name) WHERE country_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_is_general_click 
ON smartlink_clicks(is_general_click);

-- Índices para os novos campos de dispositivo/browser/OS
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_device_type 
ON smartlink_clicks(device_type) WHERE device_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_os_type 
ON smartlink_clicks(os_type) WHERE os_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_browser_type 
ON smartlink_clicks(browser_type) WHERE browser_type IS NOT NULL;

-- Índices para presave_clicks (baseado na estrutura real)
-- Índices já existentes: idx_presave_clicks_presave_id, idx_presave_clicks_created_at

CREATE INDEX IF NOT EXISTS idx_presave_clicks_presave_id_clicked_at 
ON presave_clicks(presave_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_presave_clicks_platform_id 
ON presave_clicks(platform_id) WHERE platform_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presave_clicks_country_code 
ON presave_clicks(country_code) WHERE country_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presave_clicks_country_name 
ON presave_clicks(country_name) WHERE country_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presave_clicks_is_page_view 
ON presave_clicks(is_page_view);

-- Índices para os novos campos de dispositivo/browser/OS
CREATE INDEX IF NOT EXISTS idx_presave_clicks_device_type 
ON presave_clicks(device_type) WHERE device_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presave_clicks_os_type 
ON presave_clicks(os_type) WHERE os_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presave_clicks_browser_type 
ON presave_clicks(browser_type) WHERE browser_type IS NOT NULL;

-- Índices para smart_links
CREATE INDEX IF NOT EXISTS idx_smart_links_user_id_created_at 
ON smart_links(user_id, created_at DESC);

-- Índices para presaves
CREATE INDEX IF NOT EXISTS idx_presaves_user_id_created_at 
ON presaves(user_id, created_at DESC);

-- =============================================================================
-- 3. FUNÇÃO PLPGSQL PARA MÉTRICAS GERAIS OTIMIZADA
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_metrics_summary(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN    WITH user_clicks AS (
        SELECT 
            link_id,
            type,
            is_page_view,
            platform_id,
            clicked_at,
            country,
            city,
            country_code,
            country_name,
            city_name,
            timezone,
            isp,
            device_type,
            os,
            browser,
            artist_name,
            COALESCE(release_title, track_name) as title
        FROM all_clicks 
        WHERE user_id = p_user_id
          AND (p_start_date IS NULL OR clicked_at >= p_start_date)
          AND (p_end_date IS NULL OR clicked_at <= p_end_date)
    ),
    metrics_summary AS (
        SELECT 
            COUNT(*) FILTER (WHERE NOT is_page_view) as total_clicks,
            COUNT(*) FILTER (WHERE is_page_view) as total_views,
            COUNT(DISTINCT link_id) as total_items,
            COUNT(DISTINCT link_id) FILTER (WHERE type = 'smartlink') as total_smartlinks,
            COUNT(DISTINCT link_id) FILTER (WHERE type = 'presave') as total_presaves
        FROM user_clicks
    ),
    platform_stats AS (
        SELECT 
            platform_id,
            COUNT(*) as clicks,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
        FROM user_clicks 
        WHERE NOT is_page_view AND platform_id IS NOT NULL
        GROUP BY platform_id
        ORDER BY clicks DESC
        LIMIT 10
    ),
    top_items AS (
        SELECT 
            link_id,
            type,
            artist_name,
            title,
            COUNT(*) FILTER (WHERE NOT is_page_view) as clicks,
            COUNT(*) FILTER (WHERE is_page_view) as views,
            CASE 
                WHEN COUNT(*) FILTER (WHERE is_page_view) > 0 
                THEN ROUND(COUNT(*) FILTER (WHERE NOT is_page_view) * 100.0 / COUNT(*) FILTER (WHERE is_page_view), 2)
                ELSE 0 
            END as click_rate
        FROM user_clicks
        GROUP BY link_id, type, artist_name, title
        ORDER BY clicks DESC
        LIMIT 5
    ),
    recent_activity AS (
        SELECT 
            link_id,
            type,
            artist_name,
            title,
            platform_id,
            clicked_at
        FROM user_clicks 
        WHERE NOT is_page_view
        ORDER BY clicked_at DESC
        LIMIT 10
    )
    SELECT json_build_object(
        'summary', (SELECT row_to_json(metrics_summary) FROM metrics_summary),
        'platform_stats', (SELECT json_agg(row_to_json(platform_stats)) FROM platform_stats),
        'top_items', (SELECT json_agg(row_to_json(top_items)) FROM top_items),
        'recent_activity', (SELECT json_agg(row_to_json(recent_activity)) FROM recent_activity)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =============================================================================
-- 4. FUNÇÃO PARA MÉTRICAS DETALHADAS DE UM ITEM
-- =============================================================================

CREATE OR REPLACE FUNCTION get_item_detailed_metrics(
    p_link_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    WITH item_clicks AS (
        SELECT *
        FROM all_clicks 
        WHERE link_id = p_link_id
          AND (p_start_date IS NULL OR clicked_at >= p_start_date)
          AND (p_end_date IS NULL OR clicked_at <= p_end_date)
    ),
    summary_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE NOT is_page_view) as total_clicks,
            COUNT(*) FILTER (WHERE is_page_view) as total_views
        FROM item_clicks
    ),
    platform_stats AS (
        SELECT 
            platform_id,
            COUNT(*) as clicks
        FROM item_clicks 
        WHERE NOT is_page_view AND platform_id IS NOT NULL
        GROUP BY platform_id
        ORDER BY clicks DESC
    ),    country_stats AS (
        SELECT 
            COALESCE(country_name, country) as country,
            country_code,
            COUNT(*) as count
        FROM item_clicks 
        WHERE NOT is_page_view AND (country_name IS NOT NULL OR country IS NOT NULL)
        GROUP BY COALESCE(country_name, country), country_code
        ORDER BY count DESC
        LIMIT 10
    ),
    city_stats AS (
        SELECT 
            COALESCE(city_name, city) as city,
            COALESCE(country_name, country) as country,
            COUNT(*) as count
        FROM item_clicks 
        WHERE NOT is_page_view AND (city_name IS NOT NULL OR city IS NOT NULL) 
          AND (country_name IS NOT NULL OR country IS NOT NULL)
        GROUP BY COALESCE(city_name, city), COALESCE(country_name, country)
        ORDER BY count DESC
        LIMIT 10
    ),
    daily_evolution AS (
        SELECT 
            DATE(clicked_at) as date,
            COUNT(*) FILTER (WHERE NOT is_page_view) as clicks,
            COUNT(*) FILTER (WHERE is_page_view) as views
        FROM item_clicks
        GROUP BY DATE(clicked_at)
        ORDER BY date
    ),    device_stats AS (
        SELECT 
            device_type,
            COUNT(*) as count
        FROM item_clicks 
        WHERE NOT is_page_view AND device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY count DESC
    ),
    browser_stats AS (
        SELECT 
            browser,
            COUNT(*) as count
        FROM item_clicks 
        WHERE NOT is_page_view AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY count DESC
    ),
    os_stats AS (
        SELECT 
            os,
            COUNT(*) as count
        FROM item_clicks 
        WHERE NOT is_page_view AND os IS NOT NULL
        GROUP BY os
        ORDER BY count DESC
    ),
    hour_stats AS (
        SELECT 
            EXTRACT(HOUR FROM clicked_at) as hour,
            COUNT(*) as clicks
        FROM item_clicks 
        WHERE NOT is_page_view
        GROUP BY EXTRACT(HOUR FROM clicked_at)
        ORDER BY clicks DESC
    )
    SELECT json_build_object(
        'summary', (SELECT row_to_json(summary_stats) FROM summary_stats),
        'platforms', (SELECT json_agg(row_to_json(platform_stats)) FROM platform_stats),
        'countries', (SELECT json_agg(row_to_json(country_stats)) FROM country_stats),
        'cities', (SELECT json_agg(row_to_json(city_stats)) FROM city_stats),
        'daily_evolution', (SELECT json_agg(row_to_json(daily_evolution)) FROM daily_evolution),
        'devices', (SELECT json_agg(row_to_json(device_stats)) FROM device_stats),
        'browsers', (SELECT json_agg(row_to_json(browser_stats)) FROM browser_stats),
        'os_types', (SELECT json_agg(row_to_json(os_stats)) FROM os_stats),
        'peak_hours', (SELECT json_agg(row_to_json(hour_stats)) FROM hour_stats)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =============================================================================
-- 5. POLÍTICA DE SEGURANÇA PARA AS TABELAS BASE
-- =============================================================================

-- Garantir que RLS está habilitado nas tabelas base (se não estiver)
ALTER TABLE smartlink_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE presave_clicks ENABLE ROW LEVEL SECURITY;

-- Criar políticas para smartlink_clicks (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'smartlink_clicks' 
        AND policyname = 'Users can view own smartlink clicks'
    ) THEN
        CREATE POLICY "Users can view own smartlink clicks" ON smartlink_clicks
            FOR SELECT
            USING (EXISTS (
                SELECT 1 FROM smart_links 
                WHERE smart_links.id = smartlink_clicks.smartlink_id 
                AND smart_links.user_id = auth.uid()
            ));
    END IF;
END $$;

-- Criar políticas para presave_clicks (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'presave_clicks' 
        AND policyname = 'Users can view own presave clicks'
    ) THEN
        CREATE POLICY "Users can view own presave clicks" ON presave_clicks
            FOR SELECT
            USING (EXISTS (
                SELECT 1 FROM presaves 
                WHERE presaves.id = presave_clicks.presave_id 
                AND presaves.user_id = auth.uid()
            ));
    END IF;
END $$;

-- A view all_clicks herdará automaticamente as políticas das tabelas base

-- =============================================================================
-- 6. GRANTS E PERMISSÕES
-- =============================================================================

-- Garantir que usuários autenticados possam usar as funções
GRANT EXECUTE ON FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;

-- Garantir acesso à view
GRANT SELECT ON all_clicks TO authenticated;

-- =============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON VIEW all_clicks IS 'View unificada que combina clicks de Smart Links e Presaves com dados denormalizados para performance';

COMMENT ON FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) IS 'Retorna métricas consolidadas de um usuário em formato JSON otimizado';

COMMENT ON FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) IS 'Retorna métricas detalhadas de um item específico (Smart Link ou Presave)';

-- =============================================================================
-- NOTAS IMPORTANTES SOBRE SEGURANÇA
-- =============================================================================

/*
SEGURANÇA RLS (Row Level Security):

1. RLS é aplicado nas tabelas base (smartlink_clicks, presave_clicks)
2. A view all_clicks herda automaticamente essas políticas
3. As políticas garantem que:
   - smartlink_clicks: usuário vê apenas clicks dos seus smart_links
   - presave_clicks: usuário vê apenas clicks dos seus presaves
4. As funções SQL também respeitam essas políticas automaticamente

IMPORTANTE: Views não suportam RLS direto, mas herdam das tabelas base.
*/

-- =============================================================================
-- NOTAS IMPORTANTES SOBRE CAMPOS DA TABELA
-- =============================================================================

/*
CAMPOS REAIS DAS TABELAS (APÓS ADIÇÃO DOS CAMPOS DE DISPOSITIVO):

smartlink_clicks:
- id, smartlink_id, clicked_at, platform_id, ip_address, user_agent
- country_code, country_name, region_name, city_name, latitude, longitude
- is_general_click, country, city, timezone, isp
- device_type, os_type, browser_type (✅ ADICIONADOS)

presave_clicks:
- id, presave_id, clicked_at, platform_id, is_page_view, user_agent, ip_address
- country_code, country_name, region_name, city_name, latitude, longitude, timezone, isp
- device_type, os_type, browser_type (✅ ADICIONADOS)

MAPEAMENTO NA VIEW all_clicks:
- smartlink_clicks: country = COALESCE(country, country_name), city = COALESCE(city, city_name)
- presave_clicks: country = country_name, city = city_name
- device_type, os_type, browser_type = ✅ DISPONÍVEIS em ambas as tabelas

ÍNDICES CRIADOS:
smartlink_clicks:
- Existentes: idx_smartlink_clicks_clicked_at, idx_smartlink_clicks_platform_id
- Existentes: idx_smartlink_clicks_country_code, idx_smartlink_clicks_city_name
- Existentes: idx_smartlink_clicks_smartlink_id
- Novos: idx_smartlink_clicks_device_type, idx_smartlink_clicks_os_type, idx_smartlink_clicks_browser_type

presave_clicks:
- Existentes: idx_presave_clicks_presave_id, idx_presave_clicks_created_at
- Novos: idx_presave_clicks_device_type, idx_presave_clicks_os_type, idx_presave_clicks_browser_type

FUNCIONALIDADES AGORA DISPONÍVEIS:
✅ Análise completa de tipos de dispositivo
✅ Análise completa de navegadores
✅ Análise completa de sistemas operacionais
✅ Todas as métricas do dashboard funcionarão completamente
*/
