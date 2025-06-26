-- ============================================================================
-- TESTE DAS FUNÇÕES SQL CORRIGIDAS - RAPMARKETING MÉTRICAS
-- ============================================================================
-- Este script testa as funções SQL corrigidas para garantir que estão funcionando
-- ============================================================================

-- ============================================================================
-- TESTE 1: Verificar se as funções foram criadas corretamente
-- ============================================================================

-- Verificar se as funções existem
SELECT 
    routine_name,
    routine_type,
    routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_metrics_summary', 'get_item_detailed_metrics');

-- ============================================================================
-- TESTE 2: Verificar estrutura das tabelas de clicks
-- ============================================================================

-- Verificar colunas da tabela smartlink_clicks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'smartlink_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela presave_clicks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'presave_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- TESTE 3: Verificar dados existentes
-- ============================================================================

-- Contar registros em cada tabela
SELECT 
    'smartlink_clicks' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT smartlink_id) as unique_smartlinks,
    COUNT(DISTINCT platform_id) as unique_platforms,
    MIN(clicked_at) as oldest_click,
    MAX(clicked_at) as newest_click
FROM smartlink_clicks
WHERE clicked_at IS NOT NULL

UNION ALL

SELECT 
    'presave_clicks' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT presave_id) as unique_presaves,
    COUNT(DISTINCT platform_id) as unique_platforms,
    MIN(clicked_at) as oldest_click,
    MAX(clicked_at) as newest_click
FROM presave_clicks
WHERE clicked_at IS NOT NULL;

-- ============================================================================
-- TESTE 4: Verificar usuários com dados
-- ============================================================================

-- Encontrar usuários que têm smart links ou presaves
SELECT 
    'users_with_smartlinks' as type,
    COUNT(DISTINCT user_id) as user_count
FROM smart_links
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'users_with_presaves' as type,
    COUNT(DISTINCT user_id) as user_count
FROM presaves
WHERE user_id IS NOT NULL;

-- ============================================================================
-- TESTE 5: Testar função get_user_metrics_summary (se houver dados)
-- ============================================================================

-- Buscar um usuário que tenha smart links ou presaves para testar
WITH test_user AS (
    SELECT user_id
    FROM smart_links
    WHERE user_id IS NOT NULL
    LIMIT 1
)
SELECT 
    'Testing get_user_metrics_summary for user:' as message,
    user_id
FROM test_user;

-- Execute manualmente com um user_id real:
-- SELECT get_user_metrics_summary('USER_ID_AQUI'::uuid);

-- ============================================================================
-- TESTE 6: Verificar campos de localização
-- ============================================================================

-- Verificar campos de localização em smartlink_clicks
SELECT 
    COUNT(*) as total_records,
    COUNT(country) as has_country,
    COUNT(country_name) as has_country_name,
    COUNT(city) as has_city,
    COUNT(city_name) as has_city_name,
    COUNT(CASE WHEN country IS NOT NULL OR country_name IS NOT NULL THEN 1 END) as has_any_country,
    COUNT(CASE WHEN city IS NOT NULL OR city_name IS NOT NULL THEN 1 END) as has_any_city
FROM smartlink_clicks;

-- Verificar campos de localização em presave_clicks
SELECT 
    COUNT(*) as total_records,
    COUNT(country_name) as has_country_name,
    COUNT(city_name) as has_city_name
FROM presave_clicks;

-- ============================================================================
-- TESTE 7: Verificar campos de dispositivo
-- ============================================================================

-- Verificar campos de dispositivo em smartlink_clicks
SELECT 
    COUNT(*) as total_records,
    COUNT(device_type) as has_device_type,
    COUNT(os_type) as has_os_type,
    COUNT(browser_type) as has_browser_type,
    COUNT(is_general_click) as has_is_general_click
FROM smartlink_clicks;

-- Verificar campos de dispositivo em presave_clicks
SELECT 
    COUNT(*) as total_records,
    COUNT(device_type) as has_device_type,
    COUNT(os_type) as has_os_type,
    COUNT(browser_type) as has_browser_type,
    COUNT(is_page_view) as has_is_page_view
FROM presave_clicks;

-- ============================================================================
-- TESTE 8: Verificar permissões das funções
-- ============================================================================

-- Verificar privilégios das funções
SELECT 
    routine_name,
    routine_type,
    security_type,
    definer_rights
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_metrics_summary', 'get_item_detailed_metrics');

-- ============================================================================
-- INSTRUÇÕES PARA TESTE MANUAL
-- ============================================================================

/*
APÓS EXECUTAR ESTE SCRIPT, FAÇA OS TESTES MANUAIS:

1. TESTE COM USUÁRIO REAL:
   - Copie um user_id real da tabela smart_links ou presaves
   - Execute: SELECT get_user_metrics_summary('USER_ID_AQUI'::uuid);

2. TESTE COM ITEM REAL:
   - Copie um id real da tabela smart_links ou presaves
   - Execute: SELECT get_item_detailed_metrics('ITEM_ID_AQUI'::uuid);

3. TESTE COM PARÂMETROS DE DATA:
   - Execute: SELECT get_user_metrics_summary('USER_ID'::uuid, '2024-01-01'::timestamp, '2024-12-31'::timestamp);

4. VERIFICAR RESULTADOS:
   - Os resultados devem ser JSON válidos
   - Não deve haver erros de coluna não encontrada
   - Os dados devem fazer sentido

5. TESTE NO FRONTEND:
   - Abra o dashboard de métricas no React
   - Verifique se os dados são carregados corretamente
   - Teste filtros e navegação entre seções
*/
