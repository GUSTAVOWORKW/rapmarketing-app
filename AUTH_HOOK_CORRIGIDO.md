# 🔧 CONFIGURAÇÃO CORRETA - Auth Hook Supabase

## ❗ PROBLEMA IDENTIFICADO

O Auth Hook do Supabase tem apenas 2 campos:
- **URL**: Para onde enviar os webhooks
- **Secret**: Para autenticação

Ele envia **TODOS** os eventos de autenticação para a URL, não permite filtrar por evento.

## ✅ CONFIGURAÇÃO CORRETA

### 1. Variáveis de Ambiente
Dashboard Supabase > Settings > Edge Functions:

```
WEBHOOK_SECRET=v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
SUPABASE_URL=https://ntreksvrwflivedhvixs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_do_dashboard
```

### 2. Auth Hook
Dashboard Supabase > Authentication > Hooks:

**Tipo**: HTTPS
- **URL**: `https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook`  
- **Secret**: `v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn`

### 3. Edge Function Atualizada
A Edge Function precisa ser atualizada para:
- Aceitar o secret no header `authorization` como `Bearer {secret}`
- Filtrar apenas eventos `identity_linked` do provider `spotify`
- Ignorar todos os outros eventos (login Google, etc.)

## 🚨 PROBLEMA ATUAL

O Auth Hook está sendo chamado para **TODOS** os eventos:
- ✅ Login Google → Hook dispara → **Deve ignorar**
- ✅ Spotify Connect → Hook dispara → **Deve processar**

## 🎯 SOLUÇÃO

1. **Configurar** o Auth Hook com URL + Secret corretos
2. **Atualizar** a Edge Function para filtrar eventos
3. **Testar** que login Google funciona (eventos ignorados)
4. **Testar** que Spotify Connect salva tokens

## 📝 Próximos Passos

1. Configure o Auth Hook com as informações acima
2. A Edge Function atual já filtra corretamente por `identity_linked` + `spotify`
3. Teste o login Google (deve funcionar)
4. Teste a conexão Spotify (deve salvar tokens)

---

**A Edge Function já está preparada para filtrar eventos corretamente!**
