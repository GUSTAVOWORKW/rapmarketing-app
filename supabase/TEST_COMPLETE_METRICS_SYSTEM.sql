-- ============================================================================
-- SCRIPT DE TESTE COMPLETO - SISTEMA DE MÉTRICAS RAPMARKETING
-- ============================================================================
-- Este script testa todas as funcionalidades do sistema de métricas
-- Execute este script no Supabase SQL Editor APÓS executar COMPLETE_METRICS_FUNCTIONS.sql
-- ============================================================================

-- ============================================================================
-- PASSO 1: Verificar se as funções foram criadas
-- ============================================================================

SELECT 
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_user_metrics_summary',
    'get_item_detailed_metrics',
    'insert_test_metrics_data'
  )
ORDER BY routine_name;

-- ============================================================================
-- PASSO 2: Verificar estrutura das tabelas de clicks
-- ============================================================================

-- Verificar colunas da tabela smartlink_clicks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'smartlink_clicks'
ORDER BY ordinal_position;

-- Verificar colunas da tabela presave_clicks  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'presave_clicks'
ORDER BY ordinal_position;

-- ============================================================================
-- PASSO 3: Criar dados de teste (substitua UUID_DO_USUARIO pelo seu UUID)
-- ============================================================================

-- IMPORTANTE: Substitua 'UUID_DO_USUARIO' pelo UUID real do seu usuário
-- Você pode obter o UUID executando: SELECT auth.uid();

DO $$
DECLARE
    test_user_id UUID := 'UUID_DO_USUARIO'::UUID; -- SUBSTITUA AQUI
    test_smartlink_id UUID;
    test_presave_id UUID;
BEGIN
    -- Verificar se o usuário existe (substitua pela lógica adequada)
    IF test_user_id IS NULL OR test_user_id = 'UUID_DO_USUARIO'::UUID THEN
        RAISE NOTICE 'ATENÇÃO: Substitua UUID_DO_USUARIO pelo UUID real do usuário!';
        RETURN;
    END IF;
    
    -- Criar Smart Link de teste
    INSERT INTO smart_links (
        id, user_id, artist_name, release_title, slug, 
        is_public, created_at
    ) VALUES (
        gen_random_uuid(), test_user_id, 'Artista Teste', 'Release Teste',
        'teste-release-' || extract(epoch from now())::text,
        true, NOW()
    ) RETURNING id INTO test_smartlink_id;
    
    -- Criar Presave de teste
    INSERT INTO presaves (
        id, user_id, artist_name, track_name, shareable_slug,
        created_at
    ) VALUES (
        gen_random_uuid(), test_user_id, 'Artista Presave', 'Track Teste',
        'teste-presave-' || extract(epoch from now())::text,
        NOW()
    ) RETURNING id INTO test_presave_id;
    
    -- Inserir clicks de teste para Smart Link
    INSERT INTO smartlink_clicks (
        smartlink_id, platform_id, is_general_click, clicked_at,
        country, city, device_type, os_type, browser_type, user_agent
    ) VALUES 
    (test_smartlink_id, 'spotify', true, NOW() - INTERVAL '1 hour', 'Brazil', 'São Paulo', 'Mobile', 'iOS', 'Safari', 'Test Agent'),
    (test_smartlink_id, 'apple_music', true, NOW() - INTERVAL '2 hours', 'Brazil', 'Rio de Janeiro', 'Desktop', 'macOS', 'Chrome', 'Test Agent'),
    (test_smartlink_id, 'youtube', true, NOW() - INTERVAL '3 hours', 'United States', 'New York', 'Mobile', 'Android', 'Chrome', 'Test Agent'),
    (test_smartlink_id, 'page_view', false, NOW() - INTERVAL '30 minutes', 'Brazil', 'São Paulo', 'Mobile', 'iOS', 'Safari', 'Test Agent'),
    (test_smartlink_id, 'page_view', false, NOW() - INTERVAL '1 hour', 'Brazil', 'Rio de Janeiro', 'Desktop', 'macOS', 'Chrome', 'Test Agent');
    
    -- Inserir clicks de teste para Presave
    INSERT INTO presave_clicks (
        presave_id, platform_id, is_page_view, clicked_at,
        country, city, device_type, os_type, browser_type, user_agent
    ) VALUES 
    (test_presave_id, 'spotify', false, NOW() - INTERVAL '1 hour', 'Brazil', 'São Paulo', 'Mobile', 'iOS', 'Safari', 'Test Agent'),
    (test_presave_id, 'apple_music', false, NOW() - INTERVAL '2 hours', 'Brazil', 'Rio de Janeiro', 'Desktop', 'macOS', 'Chrome', 'Test Agent'),
    (test_presave_id, 'page_view', true, NOW() - INTERVAL '30 minutes', 'Brazil', 'São Paulo', 'Mobile', 'iOS', 'Safari', 'Test Agent'),
    (test_presave_id, 'page_view', true, NOW() - INTERVAL '1 hour', 'Brazil', 'Rio de Janeiro', 'Desktop', 'macOS', 'Chrome', 'Test Agent');
    
    RAISE NOTICE 'Dados de teste criados com sucesso!';
    RAISE NOTICE 'Smart Link ID: %', test_smartlink_id;
    RAISE NOTICE 'Presave ID: %', test_presave_id;
END $$;

-- ============================================================================
-- PASSO 4: Testar função get_user_metrics_summary
-- ============================================================================

-- IMPORTANTE: Substitua 'UUID_DO_USUARIO' pelo UUID real
SELECT get_user_metrics_summary(
    'UUID_DO_USUARIO'::UUID,
    NOW() - INTERVAL '7 days',
    NOW()
) as user_metrics;

-- ============================================================================
-- PASSO 5: Testar função get_item_detailed_metrics
-- ============================================================================

-- Buscar um Smart Link de teste para usar como exemplo
WITH test_smartlink AS (
    SELECT id FROM smart_links 
    WHERE artist_name = 'Artista Teste' 
    LIMIT 1
)
SELECT get_item_detailed_metrics(
    (SELECT id FROM test_smartlink),
    NOW() - INTERVAL '7 days',
    NOW()
) as item_metrics;

-- ============================================================================
-- PASSO 6: Verificar dados criados
-- ============================================================================

-- Contar clicks por tipo
SELECT 
    'smartlink_clicks' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_general_click = true) as actual_clicks,
    COUNT(*) FILTER (WHERE is_general_click = false) as page_views
FROM smartlink_clicks
WHERE smartlink_id IN (
    SELECT id FROM smart_links WHERE artist_name = 'Artista Teste'
)

UNION ALL

SELECT 
    'presave_clicks' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_page_view = false) as actual_clicks,
    COUNT(*) FILTER (WHERE is_page_view = true) as page_views
FROM presave_clicks
WHERE presave_id IN (
    SELECT id FROM presaves WHERE artist_name = 'Artista Presave'
);

-- ============================================================================
-- PASSO 7: Verificar performance das funções
-- ============================================================================

-- Testar performance da função de métricas gerais
EXPLAIN (ANALYZE, BUFFERS) 
SELECT get_user_metrics_summary(
    'UUID_DO_USUARIO'::UUID,
    NOW() - INTERVAL '30 days',
    NOW()
);

-- ============================================================================
-- PASSO 8: Testar casos extremos
-- ============================================================================

-- Testar com usuário inexistente
SELECT get_user_metrics_summary(
    gen_random_uuid(),
    NOW() - INTERVAL '7 days',
    NOW()
) as empty_user_metrics;

-- Testar com item inexistente
SELECT get_item_detailed_metrics(
    gen_random_uuid(),
    NOW() - INTERVAL '7 days',
    NOW()
) as empty_item_metrics;

-- ============================================================================
-- PASSO 9: Validar estrutura do JSON retornado
-- ============================================================================

-- Verificar se o JSON das métricas gerais tem a estrutura correta
WITH user_metrics AS (
    SELECT get_user_metrics_summary(
        'UUID_DO_USUARIO'::UUID,
        NOW() - INTERVAL '7 days',
        NOW()
    ) as data
)
SELECT 
    jsonb_pretty(data::jsonb) as formatted_json,
    
    -- Verificar se as chaves principais existem
    CASE 
        WHEN data::jsonb ? 'summary' THEN '✅ summary'
        ELSE '❌ summary missing'
    END as summary_check,
    
    CASE 
        WHEN data::jsonb ? 'platform_stats' THEN '✅ platform_stats'
        ELSE '❌ platform_stats missing'
    END as platform_stats_check,
    
    CASE 
        WHEN data::jsonb ? 'top_items' THEN '✅ top_items'
        ELSE '❌ top_items missing'
    END as top_items_check,
    
    CASE 
        WHEN data::jsonb ? 'recent_activity' THEN '✅ recent_activity'
        ELSE '❌ recent_activity missing'
    END as recent_activity_check
FROM user_metrics;

-- ============================================================================
-- PASSO 10: Limpeza dos dados de teste (OPCIONAL)
-- ============================================================================

-- DESCOMENTE AS LINHAS ABAIXO PARA LIMPAR OS DADOS DE TESTE
/*
DELETE FROM smartlink_clicks 
WHERE smartlink_id IN (
    SELECT id FROM smart_links WHERE artist_name = 'Artista Teste'
);

DELETE FROM presave_clicks 
WHERE presave_id IN (
    SELECT id FROM presaves WHERE artist_name = 'Artista Presave'
);

DELETE FROM smart_links WHERE artist_name = 'Artista Teste';
DELETE FROM presaves WHERE artist_name = 'Artista Presave';
*/

-- ============================================================================
-- RESULTADOS ESPERADOS
-- ============================================================================

/*
PASSO 1: Deve retornar 3 funções criadas
PASSO 2: Deve mostrar as colunas das tabelas incluindo device_type, os_type, browser_type
PASSO 3: Deve criar dados de teste sem erros
PASSO 4: Deve retornar JSON com métricas do usuário
PASSO 5: Deve retornar JSON com métricas detalhadas do item
PASSO 6: Deve mostrar contagem de clicks e page views
PASSO 7: Deve mostrar plano de execução das queries
PASSO 8: Deve retornar estruturas vazias para dados inexistentes
PASSO 9: Deve validar estrutura JSON correta

Se todos os passos passarem, o sistema está funcionando corretamente!
*/

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

/*
PROBLEMAS COMUNS:

1. "function does not exist"
   - Execute primeiro o COMPLETE_METRICS_FUNCTIONS.sql

2. "column does not exist" 
   - Execute primeiro o ADD_DEVICE_FIELDS.sql

3. "UUID_DO_USUARIO não encontrado"
   - Substitua pelo UUID real do usuário logado

4. "permission denied"
   - Verifique as políticas RLS das tabelas

5. "timeout"
   - Reduza o período de teste ou otimize os índices
*/
