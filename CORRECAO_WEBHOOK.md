# 🔧 CORREÇÃO URGENTE - Auth Hook

## ✅ Secret Correto Identificado

Você tem o webhook secret correto:
```
v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
```

## 🚀 Passos para Corrigir AGORA

### 1. Atualizar Variáveis de Ambiente
Dashboard Supabase > Settings > Edge Functions:

```
WEBHOOK_SECRET=v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn
SUPABASE_URL=https://ntreksvrwflivedhvixs.supabase.co  
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_do_dashboard
```

### 2. Configurar Auth Hook (SIMPLIFICADO)
Dashboard Supabase > Authentication > Hooks:

**Tipo**: HTTPS
- **URL**: `https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook`
- **Secret**: `v1,whsec_h8aR7xecHcuS0Udb3A//VO4qKCMDKKHdDB11TlncT+fMC+40cbUmYdxSG9tKfpNSiYj1FUkFyvlIK/Jn`

**IMPORTANTE**: O Auth Hook do Supabase envia TODOS os eventos de autenticação para a URL. A Edge Function deve filtrar apenas os eventos `identity_linked` do Spotify.

### 3. Verificar Edge Function
Dashboard Supabase > Edge Functions > `auth-webhook`:

- ✅ Existe?
- ✅ Deployed?
- ✅ Código correto colado?

### 4. Testar
1. **Desconecte** do Spotify (se conectado)
2. **Faça login** com Google (deve funcionar agora)
3. **Conecte** o Spotify
4. **Verifique** logs da Edge Function
5. **Confirme** tokens na tabela `spotify_tokens`

## 🎯 Após Correção

- Login Google: ✅ Funcionando
- Spotify Connect: ✅ Tokens salvos automaticamente  
- Sistema: ✅ 100% funcional

---

**Se ainda der erro, desabilite o Auth Hook temporariamente para restaurar o login!**
