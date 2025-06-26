-- ============================================================================
-- SCRIPT DE DEBUG PARA MÉTRICAS - JUNHO 2025
-- ============================================================================
-- Este script ajuda a debugar problemas com números inconsistentes
-- nas métricas de Smart Links e Presaves

-- ============================================================================
-- 1. VERIFICAR DADOS BRUTOS NAS TABELAS
-- ============================================================================

-- Contar registros reais de Smart Links por usuário
SELECT 
    'Smart Links - Contagem Real' as tipo,
    sl.user_id,
    COUNT(*) as total_items,
    COUNT(DISTINCT sc.smartlink_id) as items_with_clicks
FROM smart_links sl
LEFT JOIN smartlink_clicks sc ON sl.id = sc.smartlink_id
WHERE sl.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
GROUP BY sl.user_id;

-- Contar registros reais de Presaves por usuário  
SELECT 
    'Presaves - Contagem Real' as tipo,
    p.user_id,
    COUNT(*) as total_items,
    COUNT(DISTINCT pc.presave_id) as items_with_clicks
FROM presaves p
LEFT JOIN presave_clicks pc ON p.id = pc.presave_id
WHERE p.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
GROUP BY p.user_id;

-- ============================================================================
-- 2. VERIFICAR DADOS DE CLICKS/VIEWS
-- ============================================================================

-- Análise de clicks de Smart Links nos últimos 30 dias
SELECT 
    'Smart Link Clicks' as tipo,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_general_click = true) as clicks_reais,
    COUNT(*) FILTER (WHERE is_general_click = false) as page_views,
    COUNT(DISTINCT smartlink_id) as smart_links_distintos
FROM smartlink_clicks sc
JOIN smart_links sl ON sc.smartlink_id = sl.id
WHERE sl.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
  AND sc.clicked_at >= NOW() - INTERVAL '30 days';

-- Análise de clicks de Presaves nos últimos 30 dias
SELECT 
    'Presave Clicks' as tipo,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_page_view = false) as clicks_reais,
    COUNT(*) FILTER (WHERE is_page_view = true) as page_views,
    COUNT(DISTINCT presave_id) as presaves_distintos
FROM presave_clicks pc
JOIN presaves p ON pc.presave_id = p.id
WHERE p.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
  AND pc.clicked_at >= NOW() - INTERVAL '30 days';

-- ============================================================================
-- 3. TESTAR FUNÇÃO get_user_metrics_summary DIRETAMENTE
-- ============================================================================

-- Executar a função com dados de debug
SELECT get_user_metrics_summary(
    'USER_ID_AQUI'::UUID, -- Substituir pelo ID real do usuário
    (NOW() - INTERVAL '30 days')::TIMESTAMP,
    NOW()::TIMESTAMP
) as resultado_funcao;

-- ============================================================================
-- 4. COMPARAR CONTAGENS MANUAIS VS FUNÇÃO
-- ============================================================================

-- Contagem manual de Smart Links
WITH manual_smartlinks AS (
    SELECT 
        COUNT(DISTINCT sl.id) as total_smartlinks,
        COALESCE(SUM(clicks_count.clicks), 0) as total_clicks,
        COALESCE(SUM(clicks_count.views), 0) as total_views
    FROM smart_links sl
    LEFT JOIN (
        SELECT 
            smartlink_id,
            COUNT(*) FILTER (WHERE is_general_click = true) as clicks,
            COUNT(*) FILTER (WHERE is_general_click = false) as views
        FROM smartlink_clicks
        WHERE clicked_at >= NOW() - INTERVAL '30 days'
        GROUP BY smartlink_id
    ) clicks_count ON sl.id = clicks_count.smartlink_id
    WHERE sl.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
),
manual_presaves AS (
    SELECT 
        COUNT(DISTINCT p.id) as total_presaves,
        COALESCE(SUM(clicks_count.clicks), 0) as total_clicks,
        COALESCE(SUM(clicks_count.views), 0) as total_views
    FROM presaves p
    LEFT JOIN (
        SELECT 
            presave_id,
            COUNT(*) FILTER (WHERE is_page_view = false) as clicks,
            COUNT(*) FILTER (WHERE is_page_view = true) as views
        FROM presave_clicks
        WHERE clicked_at >= NOW() - INTERVAL '30 days'
        GROUP BY presave_id
    ) clicks_count ON p.id = clicks_count.presave_id
    WHERE p.user_id = 'USER_ID_AQUI' -- Substituir pelo ID real do usuário
)
SELECT 
    'Contagem Manual' as metodo,
    sl.total_smartlinks,
    pr.total_presaves,
    (sl.total_smartlinks + pr.total_presaves) as total_items,
    (sl.total_clicks + pr.total_clicks) as total_clicks,
    (sl.total_views + pr.total_views) as total_views,
    CASE 
        WHEN (sl.total_views + pr.total_views) > 0 
        THEN ROUND(((sl.total_clicks + pr.total_clicks) * 100.0 / (sl.total_views + pr.total_views)), 1)
        ELSE 0 
    END as taxa_conversao
FROM manual_smartlinks sl, manual_presaves pr;

-- ============================================================================
-- 5. VERIFICAR PROBLEMAS COMUNS
-- ============================================================================

-- Verificar se há registros duplicados
SELECT 
    'Duplicados Smart Links' as problema,
    smartlink_id,
    COUNT(*) as ocorrencias
FROM smartlink_clicks
GROUP BY smartlink_id, clicked_at, platform_id
HAVING COUNT(*) > 1
LIMIT 10;

SELECT 
    'Duplicados Presaves' as problema,
    presave_id,
    COUNT(*) as ocorrencias
FROM presave_clicks
GROUP BY presave_id, clicked_at, platform_id
HAVING COUNT(*) > 1
LIMIT 10;

-- Verificar se há registros órfãos
SELECT 'Smart Links Órfãos' as problema, COUNT(*) as quantidade
FROM smartlink_clicks sc
LEFT JOIN smart_links sl ON sc.smartlink_id = sl.id
WHERE sl.id IS NULL;

SELECT 'Presaves Órfãos' as problema, COUNT(*) as quantidade
FROM presave_clicks pc
LEFT JOIN presaves p ON pc.presave_id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- 6. SCRIPT DE LIMPEZA (SE NECESSÁRIO)
-- ============================================================================

-- CUIDADO: Só execute se confirmar que há dados duplicados!
-- 
-- -- Remover duplicados de smartlink_clicks
-- DELETE FROM smartlink_clicks 
-- WHERE id NOT IN (
--     SELECT MIN(id)
--     FROM smartlink_clicks
--     GROUP BY smartlink_id, clicked_at, platform_id, user_agent
-- );
-- 
-- -- Remover duplicados de presave_clicks
-- DELETE FROM presave_clicks 
-- WHERE id NOT IN (
--     SELECT MIN(id)
--     FROM presave_clicks
--     GROUP BY presave_id, clicked_at, platform_id, user_agent
-- );

-- ============================================================================
-- 7. INSTRUÇÕES DE USO
-- ============================================================================

/*
COMO USAR ESTE SCRIPT:

1. Substitua 'USER_ID_AQUI' pelo ID real do usuário que está com problemas
2. Execute as queries uma por uma para investigar
3. Compare os resultados da contagem manual com os da função SQL

PROBLEMAS COMUNS E SOLUÇÕES:

A) Números muito altos (ex: 839 presaves):
   - Pode ser duplicação de registros
   - Verificar seção 5 deste script
   
B) Taxa de conversão inconsistente:
   - Diferentes cálculos entre funções
   - Verificar se is_page_view e is_general_click estão corretos
   
C) Dados que mudam a cada refresh:
   - Cache problem ou função SQL instável
   - Verificar se há condições de WHERE inconsistentes

D) Contadores zerados:
   - Problemas de permissão RLS
   - Verificar se user_id está sendo passado corretamente
*/
