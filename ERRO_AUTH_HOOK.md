# 🚨 ERRO URGENTE - Auth Hook Problem

## Problema Atual

Você está tendo erro 500 no Auth Hook que está **impedindo o login** com Google:

```
Error running hook URI: https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook
```

## ⚡ SOLUÇÃO IMEDIATA

### Opção 1: Desabilitar Auth Hook Temporariamente
1. **Dashboard Supabase** > **Authentication** > **Hooks**
2. **Delete** ou **Disable** o hook `auth-webhook`
3. **Teste o login** novamente

### Opção 2: Corrigir o Auth Hook

#### Passo 1: Verificar Edge Function
No Dashboard Supabase > Edge Functions > `auth-webhook`:
- ✅ Função existe?
- ✅ Está deployed?
- ✅ Logs mostram algum erro?

#### Passo 2: Verificar Variáveis
No Dashboard Supabase > Settings > Edge Functions:
```
WEBHOOK_SECRET=v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
SUPABASE_URL=https://ntreksvrwflivedhvixs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_aqui
```

#### Passo 3: Verificar Auth Hook
No Dashboard Supabase > Authentication > Hooks:
- **URL**: `https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook`
- **Event**: `identity_linked` (NÃO todos os eventos)
- **Headers**:  ```
  webhook-secret: v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
  Content-Type: application/json
  ```

## 🔍 Diagnóstico

O Auth Hook está configurado para disparar em **TODOS** os eventos de autenticação, incluindo login com Google. Isso está causando:

1. **Login Google** → **Auth Hook dispara** → **Erro 500** → **Login falha**

## ✅ SOLUÇÃO DEFINITIVA

### Cenário A: Hook só para Spotify
Se você quer que o hook **apenas** salve tokens do Spotify:

1. **Mantenha** o evento como `identity_linked`
2. **Verifique** se a Edge Function filtra corretamente:
   ```typescript
   if (payload.type !== 'identity.linked' || payload.record?.provider !== 'spotify') {
     return new Response(JSON.stringify({ message: 'Event ignored' }), {
       status: 200
     });
   }
   ```

### Cenário B: Hook está disparando em eventos errados
1. **Confirme** que o evento está como `identity_linked` (não `user.login` ou outros)
2. **Verifique** os logs da Edge Function para ver que eventos estão chegando

## 🚨 AÇÃO IMEDIATA RECOMENDADA

1. **Desabilite o Auth Hook** temporariamente
2. **Teste o login** com Google
3. **Se funcionar**, o problema é o hook
4. **Reabilite** e ajuste conforme necessário

## 📋 Checklist de Verificação

- [ ] Login Google funciona sem o hook?
- [ ] Edge Function `auth-webhook` existe e está deployed?
- [ ] Variáveis de ambiente estão corretas?
- [ ] Auth Hook está configurado apenas para `identity_linked`?
- [ ] Headers do Auth Hook estão corretos?
- [ ] Logs da Edge Function mostram algum erro específico?

---

**PRIORIDADE MÁXIMA**: Restaurar o login antes de continuar com o Spotify
