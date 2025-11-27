# Correção de Loading Infinito no Dashboard

## Problema
As páginas `/dashboard` e `/dashboard/metrics` ficavam em loading infinito ao trocar de aba no navegador e voltar. Isso ocorria porque as requisições de dados ficavam pendentes ou eram interrompidas silenciosamente quando a aba entrava em background, e o estado de `loading` nunca era resetado.

## Solução Implementada

### 1. Hook `useMetricsData` (usado em `/dashboard/metrics`)
- Adicionado `AbortController` para gerenciar o cancelamento de requisições.
- Implementado cancelamento automático de requisições anteriores ao iniciar uma nova ou desmontar o componente.
- Adicionados listeners para os eventos `visibilitychange` e `focus` do navegador.
  - Quando o usuário volta para a aba, os dados são recarregados automaticamente.
- Adicionado suporte a `abortSignal` nas chamadas do Supabase para permitir cancelamento real da requisição de rede.
- Tratamento de erro aprimorado para ignorar erros de cancelamento (`AbortError`) e garantir que o estado de loading seja limpo corretamente.

### 2. Componente `UserDashboard` (usado em `/dashboard`)
- Aplicada a mesma lógica de `AbortController` e listeners de visibilidade para:
  - Carregamento de dados do Spotify (`fetchSpotifyData`).
  - Carregamento de dados gerais do dashboard (`fetchDashboardData`).
- Adicionado suporte a `abortSignal` nas chamadas do Supabase.
- Garantia de que o estado de loading é resetado mesmo se a requisição falhar ou for abortada (exceto se uma nova requisição já estiver em andamento).

## Benefícios
- **Recuperação Automática:** Ao voltar para a aba, o dashboard atualiza os dados automaticamente, eliminando o loading infinito.
- **Economia de Recursos:** Requisições obsoletas são canceladas, evitando processamento desnecessário.
- **Melhor UX:** O usuário sempre vê dados atualizados ao retornar ao dashboard.
