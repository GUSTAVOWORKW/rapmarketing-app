-- ============================================================================
-- LIMPEZA DE DADOS DUPLICADOS - RAPMARKETING
-- ============================================================================
-- Script para remover registros duplicados e corrigir taxa de conversão
-- Execute este script no Supabase SQL Editor

-- ============================================================================
-- 1. BACKUP DOS DADOS ANTES DA LIMPEZA
-- ============================================================================

-- Criar backup da tabela smartlink_clicks
CREATE TABLE IF NOT EXISTS smartlink_clicks_backup_20250624 AS 
SELECT * FROM smartlink_clicks;

-- Criar backup da tabela presave_clicks  
CREATE TABLE IF NOT EXISTS presave_clicks_backup_20250624 AS 
SELECT * FROM presave_clicks;

SELECT 'BACKUP CRIADO' as status, 
       'smartlink_clicks_backup_20250624' as tabela_backup,
       COUNT(*) as registros_backup
FROM smartlink_clicks_backup_20250624

UNION ALL

SELECT 'BACKUP CRIADO' as status,
       'presave_clicks_backup_20250624' as tabela_backup, 
       COUNT(*) as registros_backup
FROM presave_clicks_backup_20250624;

-- ============================================================================
-- 2. IDENTIFICAR E REMOVER DUPLICAÇÕES EXCESSIVAS  
-- ============================================================================

-- ETAPA 1: Remover registros suspeitos (mais de 10 do mesmo IP no mesmo item)
WITH suspicious_records AS (
  SELECT 
    id,
    smartlink_id,
    ip_address,
    platform_id,
    clicked_at,
    ROW_NUMBER() OVER (
      PARTITION BY smartlink_id, ip_address, platform_id, is_general_click
      ORDER BY clicked_at ASC
    ) as rn
  FROM smartlink_clicks
  WHERE clicked_at > NOW() - INTERVAL '7 days'
    AND ip_address IS NOT NULL  -- Manter apenas um registro por IP válido
),
records_to_keep AS (
  SELECT id 
  FROM suspicious_records 
  WHERE rn <= 3  -- Manter apenas os primeiros 3 registros por combinação
)
DELETE FROM smartlink_clicks 
WHERE id NOT IN (SELECT id FROM records_to_keep)
  AND clicked_at > NOW() - INTERVAL '7 days'
  AND ip_address IS NOT NULL;

-- ETAPA 2: Remover todos os registros com IP NULL (dados corrompidos)
DELETE FROM smartlink_clicks 
WHERE ip_address IS NULL 
  AND clicked_at > NOW() - INTERVAL '7 days';

-- ETAPA 3: Limitar page views por IP (máximo 2 page views por IP por Smart Link)
WITH page_view_cleanup AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY smartlink_id, ip_address 
      ORDER BY clicked_at ASC
    ) as rn
  FROM smartlink_clicks
  WHERE is_general_click = true  -- page views
    AND clicked_at > NOW() - INTERVAL '7 days'
)
DELETE FROM smartlink_clicks 
WHERE id IN (
  SELECT id 
  FROM page_view_cleanup 
  WHERE rn > 2  -- Manter apenas 2 page views por IP por Smart Link
);

-- ETAPA 4: Limitar clicks por plataforma (máximo 3 clicks por plataforma por IP)
WITH clicks_cleanup AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY smartlink_id, ip_address, platform_id
      ORDER BY clicked_at ASC
    ) as rn
  FROM smartlink_clicks
  WHERE is_general_click = false  -- clicks reais
    AND clicked_at > NOW() - INTERVAL '7 days'
)
DELETE FROM smartlink_clicks 
WHERE id IN (
  SELECT id 
  FROM clicks_cleanup 
  WHERE rn > 3  -- Manter apenas 3 clicks por plataforma por IP
);

-- ============================================================================
-- 3. VERIFICAR RESULTADO DA LIMPEZA
-- ============================================================================

SELECT 
  'APÓS LIMPEZA' as status,
  'smartlink_clicks' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE is_general_click = false) as clicks_reais,
  COUNT(*) FILTER (WHERE is_general_click = true) as page_views,
  COUNT(DISTINCT smartlink_id) as smartlinks_unicos,
  COUNT(DISTINCT ip_address) as ips_unicos
FROM smartlink_clicks 
WHERE clicked_at > NOW() - INTERVAL '24 hours';

-- Verificar nova taxa de conversão do Smart Link problemático
WITH smartlink_stats_clean AS (
  SELECT 
    sl.id,
    sl.artist_name,
    sl.release_title,
    COUNT(*) FILTER (WHERE NOT sc.is_general_click) as clicks,
    COUNT(*) FILTER (WHERE sc.is_general_click) as views,
    CASE 
      WHEN COUNT(*) FILTER (WHERE sc.is_general_click) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE NOT sc.is_general_click) * 100.0 / 
         COUNT(*) FILTER (WHERE sc.is_general_click)), 
        1
      )
      ELSE 0 
    END as taxa_conversao
  FROM smart_links sl
  LEFT JOIN smartlink_clicks sc ON sl.id = sc.smartlink_id
    AND sc.clicked_at > NOW() - INTERVAL '30 days'
  WHERE sl.id = '79787e9f-eb38-4b6d-9785-a31032ad2ee2'  -- Smart Link problemático
  GROUP BY sl.id, sl.artist_name, sl.release_title
)
SELECT 
  'TAXA CORRIGIDA' as status,
  *
FROM smartlink_stats_clean;

-- ============================================================================
-- 4. ESTATÍSTICAS FINAIS
-- ============================================================================

-- Comparar dados antes vs depois
SELECT 
  'COMPARAÇÃO' as tipo,
  'ANTES (backup)' as momento,
  COUNT(*) as total_registros
FROM smartlink_clicks_backup_20250624

UNION ALL

SELECT 
  'COMPARAÇÃO' as tipo,
  'DEPOIS (atual)' as momento,
  COUNT(*) as total_registros  
FROM smartlink_clicks;

-- Verificar se ainda há duplicações excessivas
SELECT 
  'VERIFICAÇÃO FINAL' as tipo,
  smartlink_id,
  ip_address,
  COUNT(*) as registros,
  STRING_AGG(DISTINCT platform_id, ', ') as plataformas
FROM smartlink_clicks 
WHERE clicked_at > NOW() - INTERVAL '7 days'
  AND ip_address IS NOT NULL
GROUP BY smartlink_id, ip_address
HAVING COUNT(*) > 5
ORDER BY registros DESC
LIMIT 5;

-- ============================================================================
-- 5. INSTRUÇÕES FINAIS
-- ============================================================================

/*
PRÓXIMOS PASSOS APÓS EXECUTAR ESTE SCRIPT:

1. ✅ VERIFICAR se a taxa de conversão foi corrigida
2. ✅ TESTAR o hook corrigido (useMetricsTracking.ts) 
3. ✅ VERIFICAR se o IP está sendo capturado corretamente
4. ✅ MONITORAR novos registros por algumas horas
5. ✅ CONFIRMAR que não há mais duplicações excessivas

SE OS RESULTADOS ESTIVEREM BONS:
- As tabelas de backup podem ser removidas em alguns dias
- O sistema deve funcionar normalmente

SE AINDA HOUVER PROBLEMAS:
- Restaurar dados do backup se necessário
- Investigar mais a fundo a Edge Function record-click
- Considerar implementar rate limiting no servidor
*/
