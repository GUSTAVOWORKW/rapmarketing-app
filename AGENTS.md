# Instruções para Agentes de IA no Projeto RapMarketing

> Este documento é um guia rápido e prático para qualquer agente de IA (Copilot, ChatGPT, etc.) trabalhar neste repositório sem quebrar fluxos já consolidados.

## 1. Visão Geral da Arquitetura

- **Frontend:** SPA em React (Create React App) em `rapmarketing-app/`.
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions) + algumas Edge Functions em Deno/TypeScript dentro de `supabase/functions` (documentadas em `ANALISE_EDGE_FUNCTIONS_SPOTIFY.md` e `SUPABASE_EDGE_FUNCTION_SPOTIFY_TOKEN_EXCHANGE_FINAL.ts`).
- **Domínios de negócio principais:**
  - **Autenticação & Perfil** (`src/context/AuthContext.js`, `src/pages/UserSettings.js`).
  - **Smart Links** (bio/link-in-bio): criação, templates, preview e métricas (`CreateSmartLinkPage.tsx`, `src/context/smartlink/SmartLinkFormContext.tsx`, `src/components/Templates/**`, `SMARTLINK_TEMPLATE_GUIDE.md`).
  - **Pré-save de músicas:** fluxo multi-step completo e página pública (`CreatePresavePage.js`, `PresavePage.js`, `src/context/presave/PresaveFormContext.tsx`, `PRESAVE_SYSTEM_SUMMARY.md`).
  - **Métricas & Tracking:** painéis e hooks de tracking (`src/components/dashboard/SmartLinkMetrics.tsx`, `src/pages/MetricsPage.tsx`, `src/hooks/useMetricsTracking.ts`, plano em `PLANO_METRICAS_CLICKS.md`).

## 2. Fluxos Centrais

- **Roteamento e layout:**
  - Rotas definidas em `src/App.js` usando `react-router-dom@7`.
  - Rotas protegidas usam `ProtectedRoutes` + `AuthContext` e sempre renderizam dentro de `DashboardLayout`.
  - Páginas públicas importantes: `/:slug` (Smart Link público), `/presave/:slug` (página pública de pré-save), `/spotify-callback`, `/streaming-callback`.

- **Autenticação & Perfil (Supabase):**
  - Cliente Supabase único em `src/services/supabase.js` (NÃO criar novos clientes).
  - `AuthProvider` em `src/context/AuthContext.js` gerencia `session`, `user`, `profile` (tabela `profiles`) e expõe `useAuth()`.
  - Qualquer página protegida deve usar `useAuth()` para obter `user/profile` e nunca chamar `supabase.auth` diretamente.

- **Smart Links:**
  - Estado de formulário é centralizado via `SmartLinkFormProvider` (`src/context/smartlink/SmartLinkFormContext.tsx`) e consumido por `CreateSmartLinkPage.tsx`.
  - Templates visuais ficam em `src/components/Templates/**` e seguem o padrão documentado em `SMARTLINK_TEMPLATE_GUIDE.md`.
  - Sempre que criar novo template, registrar o ID e o componente conforme o guia, e usar `Partial<SmartLink>`.

- **Pré-save:**
  - Arquitetura descrita em `PRESAVE_SYSTEM_SUMMARY.md`.
  - Form multi-step usa `PresaveFormProvider` (`context/presave/PresaveFormContext.tsx`) e a página `CreatePresavePage.js`.
  - Serviços de persistência ficam em `src/services/presaveService.js` (reaproveitar funções lá ao invés de recriar chamadas ao Supabase).

## 3. Tracking, Métricas e Banco

- **Tracking no frontend:**
  - Usar SEMPRE o hook `useMetricsTracking` (`src/hooks/useMetricsTracking.ts`) em templates públicos (smart link/presave).
  - O hook delega toda lógica sensível para uma Edge Function de `record-click`/`record-view`; o cliente só envia eventos mínimos.
  - Não adicionar coleta manual de device/location no cliente; isso é responsabilidade do backend.

- **Métricas e dashboards:**
  - Dashboard principal: `src/components/dashboard/SmartLinkMetrics.tsx`.
  - Resumos simples de métricas: `src/pages/MetricsPage.tsx`.
  - Consultas SQL mais complexas e decisões de schema estão documentadas em `REVISAO_FINAL_SMARTLINKMETRICS.md`, `OTIMIZACAO_COMPLETA_SMARTLINKMETRICS.md` e arquivos `.sql` dentro da raiz (`SUPABASE_RPC_FUNCTION.sql`, `SPOTIFY_TOKENS_TABLE.sql`, etc.).
  - Antes de alterar queries ou estruturas, revisar esses arquivos de documentação para não quebrar funções RPC ou views em uso.

## 4. Integração com Spotify & Supabase

- **Configuração:**
  - Variáveis de ambiente frontend em `.env` (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `REACT_APP_SPOTIFY_*`).
  - Edge functions da Supabase usam variáveis próprias (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`) – ver `ANALISE_EDGE_FUNCTIONS_SPOTIFY.md`.

- **Fluxos principais Spotify:**
  - **Login do artista via Spotify:** `AuthContext` + edge `auth-webhook` documentada em `AUTH_HOOK_CORRIGIDO.md` e `auth-webhook-corrigida.ts`.
  - **Presave do fã:** uso da edge `spotify-token-exchange` em `SUPABASE_EDGE_FUNCTION_SPOTIFY_TOKEN_EXCHANGE_FINAL.ts`, que troca `authorization_code` por tokens e grava nas tabelas apropriadas.
  - **Callback no frontend:** rotas `/spotify-callback` (`SpotifyCallbackHandler`) e `/streaming-callback` tratam redirecionamentos e estado.

## 5. Convenções de Código

- **Stack:**
  - Frontend mistura **JS + TS** (páginas como `CreatePresavePage.js` e componentes TSX como `CreateSmartLinkPage.tsx`).
  - Tipos centrais em `src/types/index.ts` (ou arquivo equivalente).

- **Padrões que o agente deve seguir:**
  - Reutilizar **contexts existentes** (`AuthContext`, `SmartLinkFormContext`, `PresaveFormContext`) em vez de criar novo estado global.
  - Usar o cliente `supabase` já criado em `src/services/supabase.js`.
  - Manter estilização com **Tailwind + CSS utilitário** onde já existe, e respeitar as classes existentes em templates.
  - Ao adicionar novos campos em Smart Links ou Pré-save, atualizar **tipos**, **contextos**, **services** e, se necessário, **métricas** (tabelas no Supabase + hooks de tracking).

## 6. Workflows de Desenvolvimento

- **Comandos principais (rodar na raiz do projeto):**
  - `npm start` → entra em `rapmarketing-app/` e executa o CRA.
  - Dentro de `rapmarketing-app/`: `npm test`, `npm run build`, `npm run eject` (padrão Create React App).

- **Testes & Debug:**
  - Existem testes básicos em `src/App.test.js` e no setup padrão do CRA; priorizar testes de integração leves quando modificar lógica crítica de formulário, tracking ou Auth.
  - Para investigar problemas de métricas/SQL/edge functions, usar os arquivos de diagnóstico: `DEBUG_SPOTIFY_TOKENS.sql`, `DIAGNOSTICO_TAXA_CONVERSAO.sql`, `LIMPEZA_DADOS_DUPLICADOS.sql`.

## 7. Versionamento, Deploy e Como o agente deve propor mudanças

- Antes de refatorar algo grande (ex: métricas, templates, Auth), consultar os docs de refatoração: `REFACTORING_PLAN.md`, `REFATORACAO_PRESAVE_COMPLETA.md`, `REVISAO_FINAL_SMARTLINKMETRICS.md`, `RESUMO_CORRECOES_FINALIZADAS.md`.
- Evitar duplicar lógica já documentada nesses arquivos; em vez disso, centralizar e reaproveitar.
- Manter mensagens de log existentes (principalmente em edge functions e serviços) para facilitar debug em produção.
- **SEMPRE** que fizer uma alteração significativa (correção de bug, refatoração, novo fluxo), **criar commit e dar push** para o GitHub:
  - Adicionar arquivos: `git add .`
  - Commitar: `git commit -m "descrição clara da mudança"`
  - Enviar: `git push origin main` (ou o branch em uso).
- Evitar deixar alterações locais não versionadas, para que o histórico de deploy e debug fique sempre rastreável.

---

Se algo ainda parecer confuso, descreva no PR/comentário qual fluxo está alterando (Auth, Smart Link, Pré-save, Métricas, Spotify) e referencie os arquivos/documentos acima para manter o histórico de decisão claro.
