-- 🎵 CRIAÇÃO DA TABELA SPOTIFY_TOKENS
-- Execute este SQL no Dashboard Supabase > SQL Editor

-- 1. Criar a tabela spotify_tokens
CREATE TABLE IF NOT EXISTS spotify_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que cada usuário tenha apenas um registro
    UNIQUE(user_id)
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Política para permitir usuários verem apenas seus próprios tokens
CREATE POLICY "Usuários podem ver apenas seus próprios tokens Spotify"
ON spotify_tokens FOR SELECT
USING (auth.uid() = user_id);

-- 4. Política para permitir usuários inserirem seus próprios tokens
CREATE POLICY "Usuários podem inserir seus próprios tokens Spotify"
ON spotify_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Política para permitir usuários atualizarem seus próprios tokens
CREATE POLICY "Usuários podem atualizar seus próprios tokens Spotify"
ON spotify_tokens FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Política para permitir usuários deletarem seus próprios tokens
CREATE POLICY "Usuários podem deletar seus próprios tokens Spotify"
ON spotify_tokens FOR DELETE
USING (auth.uid() = user_id);

-- 7. Política especial para a service role (necessária para a Edge Function)
CREATE POLICY "Service role pode gerenciar todos os tokens"
ON spotify_tokens FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 8. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user_id ON spotify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_expires_at ON spotify_tokens(expires_at);

-- ✅ PRONTO! Tabela criada com todas as políticas necessárias
