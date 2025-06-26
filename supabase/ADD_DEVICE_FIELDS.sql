-- ADIÇÃO DE CAMPOS PARA ANÁLISE DE DISPOSITIVOS
-- Execute este script no Supabase para adicionar os campos necessários

-- Adicionar campos à tabela smartlink_clicks
ALTER TABLE public.smartlink_clicks 
ADD COLUMN IF NOT EXISTS device_type TEXT NULL,
ADD COLUMN IF NOT EXISTS os_type TEXT NULL,
ADD COLUMN IF NOT EXISTS browser_type TEXT NULL;

-- Adicionar campos à tabela presave_clicks  
ALTER TABLE public.presave_clicks
ADD COLUMN IF NOT EXISTS device_type TEXT NULL,
ADD COLUMN IF NOT EXISTS os_type TEXT NULL,
ADD COLUMN IF NOT EXISTS browser_type TEXT NULL;

-- Comentários para documentação
COMMENT ON COLUMN smartlink_clicks.device_type IS 'Tipo de dispositivo (Mobile, Desktop, Tablet)';
COMMENT ON COLUMN smartlink_clicks.os_type IS 'Sistema operacional (Windows, macOS, Android, iOS, etc.)';
COMMENT ON COLUMN smartlink_clicks.browser_type IS 'Navegador (Chrome, Firefox, Safari, etc.)';

COMMENT ON COLUMN presave_clicks.device_type IS 'Tipo de dispositivo (Mobile, Desktop, Tablet)';
COMMENT ON COLUMN presave_clicks.os_type IS 'Sistema operacional (Windows, macOS, Android, iOS, etc.)';
COMMENT ON COLUMN presave_clicks.browser_type IS 'Navegador (Chrome, Firefox, Safari, etc.)';
