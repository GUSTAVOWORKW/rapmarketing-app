# 🚨 ERRO 500 - SOLUÇÃO URGENTE

## ❗ PROBLEMA

A Edge Function está retornando erro 500, quebrando o login com Google.

## ✅ SOLUÇÃO IMEDIATA

### Opção A: Desabilitar Auth Hook (RÁPIDO)
1. **Dashboard Supabase** > **Authentication** > **Hooks**
2. **Delete** o Auth Hook
3. **Teste o login** - deve funcionar

### Opção B: Edge Function Mais Segura
**Use**: `supabase/functions/auth-webhook/index-v3-safe.ts`

Esta versão:
- ✅ **SEMPRE retorna 200** (nunca quebra o auth)
- ✅ Logs detalhados para debug
- ✅ Ignora eventos não-Spotify
- ✅ Trata todos os erros graciosamente

## 🔧 IMPLEMENTAÇÃO RÁPIDA

### 1. Substitua a Edge Function
Copie todo o código de `index-v3-safe.ts` e cole no dashboard.

### 2. Verifique os Logs
Dashboard Supabase > Edge Functions > `auth-webhook` > Logs

Procure por:
- `🚀 Auth webhook started` - Função executando
- `✅ Event ignored` - Login Google ignorado (correto!)
- `🎵 Processing Spotify` - Processando Spotify
- `❌ Database error` - Erro no banco mas auth não quebra

### 3. Teste Imediatamente
1. **Login Google** - deve funcionar agora
2. **Conectar Spotify** - deve salvar tokens

## 🎯 DIFERENÇA CRUCIAL

**Antes**: Erro 500 → Auth quebra → Login falha
**Agora**: Sempre 200 → Auth continua → Login funciona

## 📋 DEBUG

Se ainda der erro, verifique:
1. **Edge Function existe** no dashboard?
2. **Variáveis configuradas** corretamente?
3. **Logs mostram** algum erro específico?

---

**PRIORIDADE: Use `index-v3-safe.ts` para restaurar o login AGORA!**
