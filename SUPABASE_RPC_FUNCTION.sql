-- Função RPC para atualizar artwork_url
-- Execute no Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_presave_artwork(
  presave_id UUID,
  artwork_url TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar se o usuário autenticado é o dono do presave
  IF NOT EXISTS (
    SELECT 1 FROM presaves 
    WHERE id = presave_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only update your own presaves';
  END IF;

  -- Atualizar o artwork_url
  UPDATE presaves 
  SET 
    artwork_url = update_presave_artwork.artwork_url,
    updated_at = NOW()
  WHERE id = presave_id 
  AND user_id = auth.uid();

  -- Retornar o resultado
  SELECT json_build_object(
    'success', true,
    'presave_id', presave_id,
    'artwork_url', artwork_url,
    'updated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;
