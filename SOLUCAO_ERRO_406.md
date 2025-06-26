# 🚨 SOLUÇÃO URGENTE - Erro 406 Spotify Tokens

## ❗ PROBLEMA IDENTIFICADO

O erro 406 indica que a **tabela `spotify_tokens` não existe** no banco de dados Supabase.

## ✅ SOLUÇÃO (2 MINUTOS)

### **1. Criar a Tabela no Supabase**

1. **Acesse** Dashboard Supabase > **SQL Editor**
2. **Copie e cole** todo o conteúdo do arquivo `SPOTIFY_TOKENS_TABLE.sql`
3. **Execute** o SQL (botão RUN)

### **2. Verificar se funcionou**

1. **Acesse** Dashboard Supabase > **Table Editor**
2. **Procure** pela tabela `spotify_tokens`
3. **Confirme** que foi criada com as colunas:
   - `id` (BIGSERIAL)
   - `user_id` (UUID)
   - `access_token` (TEXT)
   - `refresh_token` (TEXT)
   - `expires_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## 🧪 TESTE IMEDIATAMENTE

1. **Recarregue** seu app
2. **Tente conectar** o Spotify novamente
3. **Erro 406 deve sumir**
4. **Verifique** os logs da Edge Function `auth-webhook`
5. **Confirme** que os tokens foram salvos na tabela

## 🔍 SE AINDA DER ERRO

### Erro de RLS (Row Level Security)
- Verifique se as **políticas** foram criadas
- Confirme que a **service role** tem permissões

### Erro de Conexão
- Verifique se a **Edge Function** está deployada
- Confirme as **variáveis de ambiente**

## 📝 O QUE ACONTECE DEPOIS

1. **Conexão Spotify** → Tokens salvos automaticamente
2. **Sistema funciona** 100% automaticamente
3. **Renovação automática** antes de expirar
4. **Frontend detecta** conexão em tempo real

---

**PRIORIDADE**: Execute o SQL primeiro, depois teste!
