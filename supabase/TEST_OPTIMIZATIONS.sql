-- SCRIPT DE TESTE PARA VERIFICAR AS OTIMIZAÇÕES
-- Execute este script no Supabase para testar se tudo está funcionando

-- 1. Testar se a view all_clicks foi criada
SELECT 'View all_clicks' as test, COUNT(*) as total_records FROM all_clicks;

-- 2. Testar se as funções foram criadas (substituir USER_ID_AQUI pelo seu UUID real)
-- SELECT 'Função métricas gerais' as test, get_user_metrics_summary('USER_ID_AQUI'::uuid);

-- 3. Verificar se os índices foram criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('smartlink_clicks', 'presave_clicks')
    AND indexname LIKE '%device_type%' 
    OR indexname LIKE '%os_type%' 
    OR indexname LIKE '%browser_type%'
ORDER BY tablename, indexname;

-- 4. Verificar se as políticas RLS foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('smartlink_clicks', 'presave_clicks')
ORDER BY tablename;

-- 5. Verificar estrutura da view all_clicks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'all_clicks'
ORDER BY ordinal_position;
