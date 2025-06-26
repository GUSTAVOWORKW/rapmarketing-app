-- ============================================================================
-- VERIFICAÇÃO E CORREÇÃO DE ESTRUTURA DAS TABELAS DE MÉTRICAS
-- ============================================================================
-- Este script verifica e corrige a estrutura das tabelas para garantir 
-- compatibilidade com as funções SQL de métricas
-- ============================================================================

-- ============================================================================
-- PASSO 1: Verificar estrutura atual das tabelas
-- ============================================================================

-- Verificar colunas da tabela smartlink_clicks
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'smartlink_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela presave_clicks
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'presave_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- PASSO 2: Adicionar colunas faltantes se necessário
-- ============================================================================

-- Adicionar colunas na tabela smartlink_clicks se não existirem
DO $$
BEGIN
    -- country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smartlink_clicks' 
          AND column_name = 'country'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE smartlink_clicks ADD COLUMN country VARCHAR(100);
        RAISE NOTICE 'Coluna country adicionada à tabela smartlink_clicks';
    END IF;
    
    -- city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smartlink_clicks' 
          AND column_name = 'city'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE smartlink_clicks ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Coluna city adicionada à tabela smartlink_clicks';
    END IF;
    
    -- device_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smartlink_clicks' 
          AND column_name = 'device_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE smartlink_clicks ADD COLUMN device_type VARCHAR(50);
        RAISE NOTICE 'Coluna device_type adicionada à tabela smartlink_clicks';
    END IF;
    
    -- os_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smartlink_clicks' 
          AND column_name = 'os_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE smartlink_clicks ADD COLUMN os_type VARCHAR(50);
        RAISE NOTICE 'Coluna os_type adicionada à tabela smartlink_clicks';
    END IF;
    
    -- browser_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smartlink_clicks' 
          AND column_name = 'browser_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE smartlink_clicks ADD COLUMN browser_type VARCHAR(50);
        RAISE NOTICE 'Coluna browser_type adicionada à tabela smartlink_clicks';
    END IF;
END $$;

-- Adicionar colunas na tabela presave_clicks se não existirem
DO $$
BEGIN
    -- country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presave_clicks' 
          AND column_name = 'country'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE presave_clicks ADD COLUMN country VARCHAR(100);
        RAISE NOTICE 'Coluna country adicionada à tabela presave_clicks';
    END IF;
    
    -- city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presave_clicks' 
          AND column_name = 'city'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE presave_clicks ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Coluna city adicionada à tabela presave_clicks';
    END IF;
    
    -- device_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presave_clicks' 
          AND column_name = 'device_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE presave_clicks ADD COLUMN device_type VARCHAR(50);
        RAISE NOTICE 'Coluna device_type adicionada à tabela presave_clicks';
    END IF;
    
    -- os_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presave_clicks' 
          AND column_name = 'os_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE presave_clicks ADD COLUMN os_type VARCHAR(50);
        RAISE NOTICE 'Coluna os_type adicionada à tabela presave_clicks';
    END IF;
    
    -- browser_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'presave_clicks' 
          AND column_name = 'browser_type'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE presave_clicks ADD COLUMN browser_type VARCHAR(50);
        RAISE NOTICE 'Coluna browser_type adicionada à tabela presave_clicks';
    END IF;
END $$;

-- ============================================================================
-- PASSO 3: Criar índices para performance
-- ============================================================================

-- Índices para smartlink_clicks
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_smartlink_id ON smartlink_clicks(smartlink_id);
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_clicked_at ON smartlink_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_platform_id ON smartlink_clicks(platform_id);
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_country ON smartlink_clicks(country);
CREATE INDEX IF NOT EXISTS idx_smartlink_clicks_device_type ON smartlink_clicks(device_type);

-- Índices para presave_clicks
CREATE INDEX IF NOT EXISTS idx_presave_clicks_presave_id ON presave_clicks(presave_id);
CREATE INDEX IF NOT EXISTS idx_presave_clicks_clicked_at ON presave_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_presave_clicks_platform_id ON presave_clicks(platform_id);
CREATE INDEX IF NOT EXISTS idx_presave_clicks_country ON presave_clicks(country);
CREATE INDEX IF NOT EXISTS idx_presave_clicks_device_type ON presave_clicks(device_type);

-- ============================================================================
-- PASSO 4: Verificar estrutura final
-- ============================================================================

-- Verificar estrutura final da tabela smartlink_clicks
SELECT 
    'smartlink_clicks' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'smartlink_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura final da tabela presave_clicks
SELECT 
    'presave_clicks' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'presave_clicks' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

/*
Ambas as tabelas devem ter estas colunas:

smartlink_clicks:
- id (uuid)
- smartlink_id (uuid)
- platform_id (varchar)
- clicked_at (timestamp)
- is_general_click (boolean)
- user_agent (text)
- ip_address (inet)
- country (varchar) ← ESTA
- city (varchar) ← ESTA  
- device_type (varchar) ← ESTA
- os_type (varchar) ← ESTA
- browser_type (varchar) ← ESTA

presave_clicks:
- id (uuid)
- presave_id (uuid)
- platform_id (varchar)
- clicked_at (timestamp)
- is_page_view (boolean)
- user_agent (text)
- ip_address (inet)
- country (varchar) ← ESTA
- city (varchar) ← ESTA
- device_type (varchar) ← ESTA
- os_type (varchar) ← ESTA
- browser_type (varchar) ← ESTA
*/
