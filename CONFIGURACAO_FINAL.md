# ✅ CONFIGURAÇÃO FINAL - Auth Hook Supabase

## 🎯 RESUMO DO PROBLEMA

O Auth Hook do Supabase é simples:
- **URL**: Onde enviar webhooks  
- **Secret**: Para autenticação
- **Envia TODOS os eventos** para a URL (não filtra)

## 🚀 CONFIGURAÇÃO CORRETA

### 1. Edge Function
**Use o código atualizado**: `supabase/functions/auth-webhook/index-v2.ts`

Este código:
- ✅ Aceita secret no formato `Bearer {secret}`
- ✅ Filtra apenas eventos `identity.linked` do Spotify
- ✅ Ignora login Google e outros eventos
- ✅ Logs detalhados para debug

### 2. Variáveis de Ambiente
Dashboard Supabase > Settings > Edge Functions:

```
WEBHOOK_SECRET=v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
SUPABASE_URL=https://ntreksvrwflivedhvixs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 3. Auth Hook
Dashboard Supabase > Authentication > Hooks:

**Tipo**: HTTPS
- **URL**: `https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook`
- **Secret**: `v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn`

## 📋 PASSOS PARA IMPLEMENTAR

1. **Copie o código** de `index-v2.ts`
2. **Substitua** no dashboard a Edge Function `auth-webhook`
3. **Configure** as variáveis de ambiente
4. **Configure** o Auth Hook
5. **Teste** o sistema

## 🧪 TESTES

### Login Google (deve funcionar)
- Login Google → Hook dispara → Evento ignorado → Login completo ✅

### Conexão Spotify (deve salvar tokens)
- Conectar Spotify → Hook dispara → Tokens salvos → Sistema funcional ✅

## 🔍 DEBUG

Verifique os logs da Edge Function no dashboard:
- `🔍 Auth webhook payload received` - Evento recebido
- `ℹ️ Event ignored` - Evento do Google ignorado
- `🎵 Processing Spotify` - Processando Spotify
- `✅ Tokens salvos` - Sucesso!
- `❌ Erro` - Problema identificado

## 🎉 RESULTADO FINAL

Após esta configuração:
- ✅ Login Google funcionando
- ✅ Spotify tokens salvos automaticamente
- ✅ Sistema 100% funcional
- ✅ Zero intervenção manual

---

**Use `index-v2.ts` para resolver o problema definitivamente!**
