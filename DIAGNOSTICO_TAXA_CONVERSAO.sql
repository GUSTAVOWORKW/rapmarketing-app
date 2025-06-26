-- ============================================================================
-- DIAGNÓSTICO DE TAXA DE CONVERSÃO - RAPMARKETING
-- ============================================================================
-- Script para identificar problemas na taxa de conversão
-- Execute este script no Supabase SQL Editor

-- ============================================================================
-- 1. VERIFICAR DADOS RECENTES (ÚLTIMAS 24 HORAS)
-- ============================================================================

SELECT 
  'DADOS ÚLTIMAS 24H' as secao,
  'smartlink_clicks' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE is_general_click = false) as clicks_reais,
  COUNT(*) FILTER (WHERE is_general_click = true) as page_views,
  COUNT(DISTINCT smartlink_id) as smartlinks_unicos,
  COUNT(DISTINCT ip_address) as ips_unicos
FROM smartlink_clicks 
WHERE clicked_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'DADOS ÚLTIMAS 24H' as secao,
  'presave_clicks' as tabela,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE is_page_view = false) as clicks_reais,
  COUNT(*) FILTER (WHERE is_page_view = true) as page_views,
  COUNT(DISTINCT presave_id) as presaves_unicos,
  COUNT(DISTINCT ip_address) as ips_unicos
FROM presave_clicks 
WHERE clicked_at > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- 2. IDENTIFICAR POSSÍVEIS DUPLICAÇÕES
-- ============================================================================

-- Verificar múltiplos registros do mesmo IP no mesmo Smart Link
SELECT 
  'DUPLICACAO SMARTLINKS' as tipo,
  smartlink_id,
  ip_address,
  COUNT(*) as registros,
  STRING_AGG(DISTINCT platform_id, ', ') as plataformas,
  MIN(clicked_at) as primeiro_click,
  MAX(clicked_at) as ultimo_click
FROM smartlink_clicks 
WHERE clicked_at > NOW() - INTERVAL '7 days'
GROUP BY smartlink_id, ip_address
HAVING COUNT(*) > 5  -- Mais de 5 registros do mesmo IP
ORDER BY registros DESC
LIMIT 10;

-- Verificar múltiplos registros do mesmo IP no mesmo Presave
SELECT 
  'DUPLICACAO PRESAVES' as tipo,
  presave_id,
  ip_address,
  COUNT(*) as registros,
  STRING_AGG(DISTINCT platform_id, ', ') as plataformas,
  MIN(clicked_at) as primeiro_click,
  MAX(clicked_at) as ultimo_click
FROM presave_clicks 
WHERE clicked_at > NOW() - INTERVAL '7 days'
GROUP BY presave_id, ip_address
HAVING COUNT(*) > 5  -- Mais de 5 registros do mesmo IP
ORDER BY registros DESC
LIMIT 10;

-- ============================================================================
-- 3. VERIFICAR TAXAS DE CONVERSÃO ANÔMALAS
-- ============================================================================

-- Smart Links com taxa muito alta (possível problema)
WITH smartlink_stats AS (
  SELECT 
    sl.id,
    sl.artist_name,
    sl.release_title,
    sl.user_id,
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
  WHERE sl.created_at > NOW() - INTERVAL '60 days'
  GROUP BY sl.id, sl.artist_name, sl.release_title, sl.user_id
  HAVING COUNT(*) FILTER (WHERE sc.is_general_click) > 0
)
SELECT 
  'SMARTLINKS TAXA ANOMALA' as tipo,
  *
FROM smartlink_stats 
WHERE taxa_conversao > 50 OR taxa_conversao = 0  -- Taxa muito alta ou zero
ORDER BY taxa_conversao DESC
LIMIT 10;

-- Presaves com taxa muito alta (possível problema)
WITH presave_stats AS (
  SELECT 
    p.id,
    p.artist_name,
    p.track_name,
    p.user_id,
    COUNT(*) FILTER (WHERE NOT pc.is_page_view) as clicks,
    COUNT(*) FILTER (WHERE pc.is_page_view) as views,
    CASE 
      WHEN COUNT(*) FILTER (WHERE pc.is_page_view) > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE NOT pc.is_page_view) * 100.0 / 
         COUNT(*) FILTER (WHERE pc.is_page_view)), 
        1
      )
      ELSE 0 
    END as taxa_conversao
  FROM presaves p
  LEFT JOIN presave_clicks pc ON p.id = pc.presave_id
    AND pc.clicked_at > NOW() - INTERVAL '30 days'
  WHERE p.created_at > NOW() - INTERVAL '60 days'
  GROUP BY p.id, p.artist_name, p.track_name, p.user_id
  HAVING COUNT(*) FILTER (WHERE pc.is_page_view) > 0
)
SELECT 
  'PRESAVES TAXA ANOMALA' as tipo,
  *
FROM presave_stats 
WHERE taxa_conversao > 50 OR taxa_conversao = 0  -- Taxa muito alta ou zero
ORDER BY taxa_conversao DESC
LIMIT 10;

-- ============================================================================
-- 4. VERIFICAR PADRÕES SUSPEITOS
-- ============================================================================

-- IPs com atividade muito alta (possível bot/teste)
SELECT 
  'IPS SUSPEITOS' as tipo,
  ip_address,
  COUNT(*) as total_registros,
  COUNT(DISTINCT smartlink_id) as smartlinks_diferentes,
  COUNT(DISTINCT presave_id) as presaves_diferentes,
  MIN(clicked_at) as primeiro_registro,
  MAX(clicked_at) as ultimo_registro
FROM (
  SELECT ip_address, smartlink_id, NULL as presave_id, clicked_at 
  FROM smartlink_clicks 
  WHERE clicked_at > NOW() - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT ip_address, NULL as smartlink_id, presave_id, clicked_at 
  FROM presave_clicks 
  WHERE clicked_at > NOW() - INTERVAL '7 days'
) all_clicks
GROUP BY ip_address
HAVING COUNT(*) > 20  -- Mais de 20 registros em 7 dias
ORDER BY total_registros DESC
LIMIT 10;

-- ============================================================================
-- 5. RESUMO GERAL DE QUALIDADE DOS DADOS
-- ============================================================================

SELECT 
  'RESUMO QUALIDADE' as secao,
  'Smart Links' as tipo,
  COUNT(DISTINCT sl.id) as total_itens,
  COUNT(DISTINCT CASE WHEN sc.id IS NOT NULL THEN sl.id END) as itens_com_dados,
  ROUND(
    COUNT(DISTINCT CASE WHEN sc.id IS NOT NULL THEN sl.id END) * 100.0 / 
    NULLIF(COUNT(DISTINCT sl.id), 0), 1
  ) as percentual_com_dados,
  COUNT(sc.id) as total_registros_clicks,
  ROUND(COUNT(sc.id) * 1.0 / NULLIF(COUNT(DISTINCT sl.id), 0), 1) as media_registros_por_item
FROM smart_links sl
LEFT JOIN smartlink_clicks sc ON sl.id = sc.smartlink_id
  AND sc.clicked_at > NOW() - INTERVAL '30 days'
WHERE sl.created_at > NOW() - INTERVAL '60 days'

UNION ALL

SELECT 
  'RESUMO QUALIDADE' as secao,
  'Presaves' as tipo,
  COUNT(DISTINCT p.id) as total_itens,
  COUNT(DISTINCT CASE WHEN pc.id IS NOT NULL THEN p.id END) as itens_com_dados,
  ROUND(
    COUNT(DISTINCT CASE WHEN pc.id IS NOT NULL THEN p.id END) * 100.0 / 
    NULLIF(COUNT(DISTINCT p.id), 0), 1
  ) as percentual_com_dados,
  COUNT(pc.id) as total_registros_clicks,
  ROUND(COUNT(pc.id) * 1.0 / NULLIF(COUNT(DISTINCT p.id), 0), 1) as media_registros_por_item
FROM presaves p
LEFT JOIN presave_clicks pc ON p.id = pc.presave_id
  AND pc.clicked_at > NOW() - INTERVAL '30 days'
WHERE p.created_at > NOW() - INTERVAL '60 days';

-- ============================================================================
-- INSTRUÇÕES DE EXECUÇÃO
-- ============================================================================

/*
COMO USAR ESTE SCRIPT:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole este script completo
4. Execute (pode executar tudo de uma vez)
5. Analise os resultados em cada seção:

   - DADOS ÚLTIMAS 24H: Atividade recente
   - DUPLICACAO: Possíveis registros duplicados  
   - TAXA ANOMALA: Taxas de conversão suspeitas
   - IPS SUSPEITOS: Possível atividade de bots
   - RESUMO QUALIDADE: Estado geral dos dados

6. Com base nos resultados, identifique:
   - Se há registros duplicados
   - Se há IPs fazendo muitas requisições
   - Se há taxas de conversão irreais (>50% ou 0%)
   - Se há padrões anômalos nos dados

PRÓXIMOS PASSOS APÓS ANÁLISE:
- Se encontrar duplicações: Criar script de limpeza
- Se encontrar IPs suspeitos: Implementar rate limiting
- Se encontrar taxas anômalas: Verificar lógica do Edge Function
*/
