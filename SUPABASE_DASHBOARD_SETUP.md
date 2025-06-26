# Configuração do Dashboard Supabase - Sistema Spotify

## Resumo

Este guia mostra como configurar manualmente no dashboard web do Supabase as peças finais do sistema de tokens do Spotify. A **Edge Function `auth-webhook`** é a peça crítica que faltava para salvar os tokens após o OAuth.

## Situação Atual

✅ **Implementado no código**:
- Frontend completo com hooks e serviços
- Edge Function `refresh-spotify-token` (já criada no dashboard)
- Edge Function `auth-webhook` (código criado em `supabase/functions/auth-webhook/index.ts`)

⚠️ **Pendente no dashboard**:
- Criar Edge Function `auth-webhook` 
- Configurar variáveis de ambiente
- Configurar Auth Hook (HTTPS)

## Passo 1: Criar Edge Function auth-webhook

1. **Acesse** Dashboard Supabase > Edge Functions
2. **Clique** em "Create function"
3. **Nome**: `auth-webhook`
4. **Copie todo o código** de `supabase/functions/auth-webhook/index.ts`
5. **Cole** no editor do dashboard
6. **Deploy** a função

## Passo 2: Configurar Variáveis de Ambiente

No Dashboard Supabase > Settings > Edge Functions, adicione:

```
WEBHOOK_SECRET=v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
SUPABASE_URL=https://ntreksvrwflivedhvixs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Importante**: 
- Use um secret forte para `WEBHOOK_SECRET`
- `SUPABASE_URL` deve ser a URL do seu projeto
- `SUPABASE_SERVICE_ROLE_KEY` está em Settings > API

## Passo 3: Configurar Auth Hook

1. **Acesse** Dashboard Supabase > Authentication > Hooks
2. **Clique** em "Create a new hook"
3. **Configure**:
   - **Hook Type**: HTTPS
   - **Event**: `identity_linked`
   - **URL**: `https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook`
   - **HTTP Method**: POST   - **Headers**:
     ```
     webhook-secret: v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
     Content-Type: application/json
     ```

## Passo 4: Testar o Sistema

1. **Desconecte** Spotify nas configurações do app (se conectado)
2. **Conecte** novamente usando o botão no UserSettings
3. **Verifique** os logs da Edge Function `auth-webhook`
4. **Confirme** que tokens foram salvos na tabela `spotify_tokens`

## Fluxo Completo

```
1. Usuário clica "Conectar Spotify"
2. supabase.auth.linkIdentity({ provider: 'spotify' })
3. OAuth do Spotify retorna tokens
4. Supabase dispara evento identity_linked
5. Auth Hook chama auth-webhook Edge Function
6. Webhook salva tokens na tabela spotify_tokens
7. Frontend detecta conexão via useSpotifyConnection
8. Sistema funcional!
```

## Verificação Final

Para confirmar que tudo funciona:

1. **Logs da Edge Function**: Verifique se não há erros
2. **Tabela spotify_tokens**: Confirme que os tokens foram inseridos
3. **Frontend**: SpotifyFollowersCounter deve funcionar sem erros
4. **Renovação automática**: Tokens devem ser renovados automaticamente

## Troubleshooting

**Erro 401 Unauthorized**:
- Verifique se o `WEBHOOK_SECRET` está correto
- Confirme que o header `webhook-secret` está sendo enviado

**Tokens não salvos**:
- Verifique os logs da Edge Function
- Confirme que `SUPABASE_SERVICE_ROLE_KEY` está correto
- Verifique se a tabela `spotify_tokens` existe

**Frontend não detecta conexão**:
- Verifique se os tokens foram salvos na tabela
- Confirme que `useSpotifyConnection` está funcionando
- Verifique se o RLS da tabela está configurado corretamente

---

**Após esta configuração, o sistema de tokens do Spotify estará 100% funcional!**
