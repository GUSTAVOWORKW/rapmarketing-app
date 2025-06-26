-- ============================================================================
-- FUNÇÕES SQL COMPLETAS PARA SISTEMA DE MÉTRICAS - RAPMARKETING
-- ============================================================================
-- Este arquivo contém as funções SQL necessárias para o sistema de métricas
-- funcionar completamente com o componente SmartLinkMetrics.tsx
-- 
-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- FUNÇÃO 1: get_user_metrics_summary
-- Retorna métricas consolidadas de um usuário
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
            NOT sc.is_general_click as is_page_view,
            sc.country,
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
            pc.is_page_view,
            pc.country,
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
                 NULLIF((SELECT SUM(COUNT(*) FILTER (WHERE is_page_view = false)) FROM all_clicks GROUP BY ()), 0)), 
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
                    'percentage', COALESCE(percentage, 0)
                )
            ), '[]'::json)
            FROM platform_stats
        ),
        'top_items', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'link_id', link_id,
                    'type', type,
                    'artist_name', COALESCE(artist_name, 'Sem artista'),
                    'title', COALESCE(title, 'Sem título'),
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
                    'artist_name', COALESCE(artist_name, 'Sem artista'),
                    'title', COALESCE(title, 'Sem título'),
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
-- FUNÇÃO 2: get_item_detailed_metrics
-- Retorna métricas detalhadas de um item específico (Smart Link ou Presave)
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
    v_item_exists BOOLEAN := FALSE;
BEGIN
    -- Definir período padrão se não fornecido
    v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, NOW());
    
    -- Determinar tipo do item e verificar existência
    IF EXISTS (SELECT 1 FROM smart_links WHERE id = p_link_id) THEN
        v_item_type := 'smartlink';
        v_item_exists := TRUE;
    ELSIF EXISTS (SELECT 1 FROM presaves WHERE id = p_link_id) THEN
        v_item_type := 'presave';
        v_item_exists := TRUE;
    END IF;
    
    -- Retornar erro se item não existe
    IF NOT v_item_exists THEN
        RETURN json_build_object(
            'error', 'Item não encontrado',
            'summary', json_build_object(
                'total_clicks', 0,
                'total_views', 0
            ),
            'platforms', '[]'::json,
            'countries', '[]'::json,
            'cities', '[]'::json,
            'devices', '[]'::json,
            'browsers', '[]'::json,
            'os_types', '[]'::json,
            'daily_evolution', '[]'::json,
            'peak_hours', '[]'::json
        );
    END IF;
    
    -- Log para debug
    RAISE NOTICE 'Buscando métricas detalhadas para item % (tipo: %) entre % e %', p_link_id, v_item_type, v_start_date, v_end_date;
    
    -- Construir resultado baseado no tipo
    WITH item_clicks AS (
        SELECT 
            platform_id,
            clicked_at,
            NOT is_general_click as is_page_view,
            COALESCE(country, 'Desconhecido') as country,
            COALESCE(city, 'Desconhecida') as city,
            COALESCE(device_type, 'Desconhecido') as device_type,
            COALESCE(os_type, 'Desconhecido') as os_type,
            COALESCE(browser_type, 'Desconhecido') as browser_type,
            EXTRACT(hour FROM clicked_at)::integer as hour
        FROM smartlink_clicks
        WHERE smartlink_id = p_link_id
          AND clicked_at BETWEEN v_start_date AND v_end_date
          AND v_item_type = 'smartlink'
        
        UNION ALL
        
        SELECT 
            platform_id,
            clicked_at,
            is_page_view,
            COALESCE(country, 'Desconhecido') as country,
            COALESCE(city, 'Desconhecida') as city,
            COALESCE(device_type, 'Desconhecido') as device_type,
            COALESCE(os_type, 'Desconhecido') as os_type,
            COALESCE(browser_type, 'Desconhecido') as browser_type,
            EXTRACT(hour FROM clicked_at)::integer as hour
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
        WHERE platform_id != 'page_view' AND platform_id IS NOT NULL
        GROUP BY platform_id
        HAVING COUNT(*) FILTER (WHERE is_page_view = false) > 0
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
            device_type,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY device_type
        ORDER BY count DESC
    ),
    browser_breakdown AS (
        SELECT 
            browser_type as browser,
            COUNT(*) as count
        FROM item_clicks
        WHERE is_page_view = false
        GROUP BY browser_type
        ORDER BY count DESC
    ),
    os_breakdown AS (
        SELECT 
            os_type as os,
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
        WHERE is_page_view = false
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
-- FUNÇÃO 3: Função auxiliar para inserir clicks de teste
-- (Útil para desenvolvimento e testes)
-- ============================================================================
CREATE OR REPLACE FUNCTION insert_test_metrics_data(
    p_user_id UUID,
    p_num_smartlinks INTEGER DEFAULT 3,
    p_num_presaves INTEGER DEFAULT 2,
    p_clicks_per_item INTEGER DEFAULT 50
)
RETURNS TEXT AS $$
DECLARE
    v_smartlink_id UUID;
    v_presave_id UUID;
    -- Plataformas de streaming reais do RapMarketing
    v_streaming_platforms TEXT[] := ARRAY[
        'spotify', 'apple-music', 'deezer', 'youtube-music', 'soundcloud', 
        'tidal', 'amazon-music', 'youtube', 'napster', 'audiomack'
    ];
    -- Plataformas sociais para compartilhamento
    v_social_platforms TEXT[] := ARRAY[
        'share_instagram', 'share_tiktok', 'share_youtube', 'share_twitter', 
        'share_facebook', 'share_whatsapp'
    ];
    -- Eventos customizados
    v_custom_events TEXT[] := ARRAY[
        'custom_copy_link', 'custom_email_submit', 'template_modern', 
        'template_classic', 'template_minimal'
    ];
    -- Combinar todas as plataformas para testes
    v_all_platforms TEXT[];
    -- Países com foco no mercado brasileiro e internacional
    v_countries TEXT[] := ARRAY[
        'Brazil', 'United States', 'Mexico', 'Argentina', 'Colombia', 
        'Chile', 'Peru', 'United Kingdom', 'Germany', 'France', 
        'Spain', 'Italy', 'Portugal', 'Canada', 'Australia'
    ];
    -- Principais cidades brasileiras + algumas internacionais
    v_cities TEXT[] := ARRAY[
        'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
        'Brasília', 'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba',
        'Manaus', 'Belém', 'Goiânia', 'Campinas', 'São Luís',
        'New York', 'Los Angeles', 'London', 'Madrid', 'Buenos Aires',
        'Mexico City', 'Bogotá', 'Lima', 'Santiago'
    ];
    -- Tipos de dispositivos mais realistas
    v_devices TEXT[] := ARRAY['Mobile', 'Desktop', 'Tablet', 'Smart TV', 'Console'];
    -- Sistemas operacionais atualizados
    v_os TEXT[] := ARRAY[
        'iOS', 'Android', 'Windows 10', 'Windows 11', 'macOS', 
        'Linux', 'iPadOS', 'ChromeOS', 'Smart TV OS'
    ];
    -- Navegadores mais usados no Brasil
    v_browsers TEXT[] := ARRAY[
        'Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 
        'Samsung Internet', 'UC Browser', 'Brave'
    ];    i INTEGER;
    j INTEGER;
    v_selected_platform TEXT;
    v_selected_country TEXT;
    v_selected_city TEXT;
    v_is_page_view BOOLEAN;
BEGIN
    -- Combinar todas as plataformas para seleção aleatória mais realista
    v_all_platforms := v_streaming_platforms || v_social_platforms || v_custom_events;
    
    RAISE NOTICE 'Criando dados de teste com % plataformas disponíveis', array_length(v_all_platforms, 1);
    
    -- Criar Smart Links de teste
    FOR i IN 1..p_num_smartlinks LOOP
        INSERT INTO smart_links (user_id, artist_name, release_title, slug, created_at)
        VALUES (
            p_user_id, 
            'Artista Teste ' || i, 
            'Release Teste ' || i, 
            'teste-smartlink-' || i,
            NOW() - (RANDOM() * INTERVAL '30 days')
        ) RETURNING id INTO v_smartlink_id;
          -- Criar clicks para cada Smart Link com distribuição mais realista
        FOR j IN 1..p_clicks_per_item LOOP
            -- Selecionar plataforma com maior chance de ser streaming (80%) vs social/custom (20%)
            IF RANDOM() < 0.8 THEN
                v_selected_platform := v_streaming_platforms[1 + (RANDOM() * (array_length(v_streaming_platforms, 1) - 1))::INTEGER];
                v_is_page_view := RANDOM() < 0.2; -- 20% page views, 80% clicks reais para streaming
            ELSE
                -- 20% chance de ser social/custom
                IF RANDOM() < 0.5 THEN
                    v_selected_platform := v_social_platforms[1 + (RANDOM() * (array_length(v_social_platforms, 1) - 1))::INTEGER];
                ELSE
                    v_selected_platform := v_custom_events[1 + (RANDOM() * (array_length(v_custom_events, 1) - 1))::INTEGER];
                END IF;
                v_is_page_view := FALSE; -- Social e custom sempre são eventos reais
            END IF;
            
            -- Selecionar país com 70% chance de ser Brasil
            IF RANDOM() < 0.7 THEN
                v_selected_country := 'Brazil';
            ELSE
                v_selected_country := v_countries[1 + (RANDOM() * (array_length(v_countries, 1) - 1))::INTEGER];
            END IF;
            
            -- Selecionar cidade baseada no país
            IF v_selected_country = 'Brazil' THEN
                -- Selecionar uma das cidades brasileiras (primeiras 14 do array)
                v_selected_city := v_cities[1 + (RANDOM() * 13)::INTEGER];
            ELSE
                -- Selecionar uma das cidades internacionais (últimas 9 do array)
                v_selected_city := v_cities[15 + (RANDOM() * 8)::INTEGER];
            END IF;
            
            INSERT INTO smartlink_clicks (
                smartlink_id,
                platform_id,
                is_general_click,
                clicked_at,
                country,
                city,
                device_type,
                os_type,
                browser_type,
                user_agent
            ) VALUES (
                v_smartlink_id,
                v_selected_platform,
                NOT v_is_page_view, -- Inverte porque is_general_click = true para clicks reais
                NOW() - (RANDOM() * INTERVAL '30 days'),
                v_selected_country,
                v_selected_city,
                v_devices[1 + (RANDOM() * (array_length(v_devices, 1) - 1))::INTEGER],
                v_os[1 + (RANDOM() * (array_length(v_os, 1) - 1))::INTEGER],
                v_browsers[1 + (RANDOM() * (array_length(v_browsers, 1) - 1))::INTEGER],
                'Mozilla/5.0 (Test Agent) RapMarketing/1.0'
            );
        END LOOP;
    END LOOP;
    
    -- Criar Presaves de teste
    FOR i IN 1..p_num_presaves LOOP
        INSERT INTO presaves (user_id, artist_name, track_name, shareable_slug, created_at)
        VALUES (
            p_user_id, 
            'Artista Presave ' || i, 
            'Track Teste ' || i, 
            'teste-presave-' || i,
            NOW() - (RANDOM() * INTERVAL '30 days')
        ) RETURNING id INTO v_presave_id;
          -- Criar clicks para cada Presave com distribuição realista
        FOR j IN 1..p_clicks_per_item LOOP
            -- Selecionar plataforma com distribuição similar
            IF RANDOM() < 0.8 THEN
                v_selected_platform := v_streaming_platforms[1 + (RANDOM() * (array_length(v_streaming_platforms, 1) - 1))::INTEGER];
                v_is_page_view := RANDOM() < 0.3; -- 30% page views para presaves
            ELSE
                -- Social/custom para presaves
                IF RANDOM() < 0.6 THEN
                    v_selected_platform := v_social_platforms[1 + (RANDOM() * (array_length(v_social_platforms, 1) - 1))::INTEGER];
                ELSE
                    v_selected_platform := v_custom_events[1 + (RANDOM() * (array_length(v_custom_events, 1) - 1))::INTEGER];
                END IF;
                v_is_page_view := RANDOM() < 0.1; -- Poucos page views para eventos sociais/custom
            END IF;
            
            -- Mesma lógica de país e cidade
            IF RANDOM() < 0.7 THEN
                v_selected_country := 'Brazil';
                v_selected_city := v_cities[1 + (RANDOM() * 13)::INTEGER];
            ELSE
                v_selected_country := v_countries[1 + (RANDOM() * (array_length(v_countries, 1) - 1))::INTEGER];
                v_selected_city := v_cities[15 + (RANDOM() * 8)::INTEGER];
            END IF;
            
            INSERT INTO presave_clicks (
                presave_id,
                platform_id,
                is_page_view,
                clicked_at,
                country,
                city,
                device_type,
                os_type,
                browser_type,
                user_agent
            ) VALUES (
                v_presave_id,
                v_selected_platform,
                v_is_page_view,
                NOW() - (RANDOM() * INTERVAL '30 days'),
                v_selected_country,
                v_selected_city,
                v_devices[1 + (RANDOM() * (array_length(v_devices, 1) - 1))::INTEGER],
                v_os[1 + (RANDOM() * (array_length(v_os, 1) - 1))::INTEGER],
                v_browsers[1 + (RANDOM() * (array_length(v_browsers, 1) - 1))::INTEGER],
                'Mozilla/5.0 (Test Agent) RapMarketing/1.0'
            );
        END LOOP;
    END LOOP;
      RETURN 'Dados de teste COMPLETOS inseridos com sucesso! ' || 
           p_num_smartlinks || ' Smart Links e ' || p_num_presaves || ' Presaves, ' ||
           'cada um com ' || p_clicks_per_item || ' eventos. ' ||
           'Incluindo ' || array_length(v_streaming_platforms, 1) || ' plataformas de streaming, ' ||
           array_length(v_social_platforms, 1) || ' sociais, ' ||
           array_length(v_custom_events, 1) || ' eventos customizados, ' ||
           array_length(v_countries, 1) || ' países e ' ||
           array_length(v_cities, 1) || ' cidades.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================================

-- Garantir que apenas usuários autenticados possam executar as funções
GRANT EXECUTE ON FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_test_metrics_data(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION get_user_metrics_summary(UUID, TIMESTAMP, TIMESTAMP) IS 
'Retorna métricas consolidadas de um usuário incluindo resumo, top items, plataformas populares e atividade recente';

COMMENT ON FUNCTION get_item_detailed_metrics(UUID, TIMESTAMP, TIMESTAMP) IS 
'Retorna métricas detalhadas de um Smart Link ou Presave específico incluindo breakdown por plataforma, geografia, dispositivos e evolução temporal';

COMMENT ON FUNCTION insert_test_metrics_data(UUID, INTEGER, INTEGER, INTEGER) IS 
'Função auxiliar para inserir dados de teste COMPLETOS para desenvolvimento. Inclui todas as plataformas reais do RapMarketing (streaming, sociais, eventos customizados), principais cidades brasileiras e distribuição geográfica realista. NÃO usar em produção.';

-- ============================================================================
-- EXEMPLO DE USO
-- ============================================================================

/*
-- Buscar métricas gerais de um usuário
SELECT get_user_metrics_summary(
    'uuid-do-usuario'::UUID,
    '2024-01-01'::TIMESTAMP,
    '2024-12-31'::TIMESTAMP
);

-- Buscar métricas detalhadas de um item
SELECT get_item_detailed_metrics(
    'uuid-do-smartlink-ou-presave'::UUID,
    '2024-12-01'::TIMESTAMP,
    '2024-12-31'::TIMESTAMP
);

-- Inserir dados de teste COMPLETOS (apenas para desenvolvimento)
-- Inclui todas as plataformas: Spotify, Apple Music, Deezer, YouTube Music, 
-- SoundCloud, Tidal, Amazon Music, YouTube, Napster, Audiomack,
-- Instagram, TikTok, Twitter, Facebook, WhatsApp (shares),
-- copy_link, email_submit, templates diversos
SELECT insert_test_metrics_data(
    'uuid-do-usuario'::UUID,
    5,   -- 5 Smart Links
    3,   -- 3 Presaves  
    100  -- 100 eventos por item (mix de streaming, social, custom)
);
*/

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================
