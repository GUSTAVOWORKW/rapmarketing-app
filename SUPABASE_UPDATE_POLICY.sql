-- Política RLS para UPDATE na tabela presaves
-- Execute este comando no SQL Editor do Supabase

-- Política para permitir que usuários atualizem seus próprios presaves
CREATE POLICY "Allow users to update their own presaves" 
ON public.presaves 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Alternativa mais permissiva (se a primeira não funcionar)
-- CREATE POLICY "Allow authenticated users to update presaves" 
-- ON public.presaves 
-- FOR UPDATE 
-- TO authenticated 
-- USING (auth.uid() = user_id) 
-- WITH CHECK (auth.uid() = user_id);

-- Verificar políticas existentes
-- SELECT * FROM pg_policies WHERE tablename = 'presaves';
