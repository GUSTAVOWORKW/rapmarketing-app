-- Política RLS correta para bucket presave-artworks
-- Execute no Supabase SQL Editor

-- 1. Remover política INSERT existente (se existir)
DROP POLICY IF EXISTS "Allow authenticated uploads 1axpyfg_0" ON storage.objects;

-- 2. Criar política INSERT correta para o bucket presave-artworks
CREATE POLICY "Allow authenticated users to upload presave artworks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'presave-artworks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Alternativa mais simples (se a primeira não funcionar):
-- CREATE POLICY "Allow authenticated uploads to presave-artworks"
-- ON storage.objects
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (bucket_id = 'presave-artworks');

-- 3. Verificar se RLS está habilitado no storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
