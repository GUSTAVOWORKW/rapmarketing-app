# Sistema de Renovação Automática de Tokens do Spotify

## Visão Geral

Este documento descreve a implementação do sistema de renovação automática de tokens do Spotify no aplicativo RapMarketing. O sistema foi projetado para melhorar a experiência do usuário eliminando a necessidade de reconexão manual frequente devido à expiração de tokens (que ocorre a cada hora).

## Problema Resolvido

**Antes**: Os tokens do Spotify expiravam em 1 hora (3600 segundos), exigindo que os usuários reconectassem manualmente suas contas frequentemente.

**Depois**: Sistema automatizado que:
- Verifica automaticamente a validade dos tokens
- Renova tokens automaticamente usando refresh tokens
- Mantém cache para evitar múltiplas requisições simultâneas
- Fornece interface consistente para verificação de status

## Arquitetura

### 1. SpotifyTokenService (`src/services/spotifyTokenService.js`)

**Classe singleton** que centraliza toda a lógica de gerenciamento de tokens.

#### Principais Métodos:

- `getAccessToken(userId)` - Obtém um token válido, renovando automaticamente se necessário
- `hasValidSpotifyConnection(userId)` - Verifica se o usuário tem uma conexão Spotify válida
- `refreshAccessToken(refreshToken)` - Renova tokens usando o refresh token
- `testTokenValidity(accessToken)` - Testa se um token ainda está válido na API Spotify

#### Funcionalidades:

- **Cache inteligente**: Evita múltiplos refreshes simultâneos
- **Buffer de expiração**: Renova tokens 5 minutos antes de expirarem
- **Tratamento de erros**: Logs detalhados e fallbacks apropriados

### 2. useSpotifyToken Hook (`src/hooks/useSpotifyToken.js`)

**Hook personalizado** que fornece uma interface React elegante para o serviço de tokens.

#### Estado Retornado:

```javascript
{
  isLoading: boolean,
  isConnected: boolean,
  hasValidToken: boolean,
  error: string | null,
  getValidToken: Function,
  makeSpotifyRequest: Function,
  refreshTokenStatus: Function
}
```

#### Funcionalidades:

- **Status reativo**: Atualiza automaticamente quando o status do token muda
- `makeSpotifyRequest()` - Faz chamadas autenticadas para a API Spotify
- `refreshTokenStatus()` - Força uma nova verificação do status

### 3. Componentes Atualizados

#### SpotifyFollowersCounter (`src/components/dashboard/SpotifyFollowersCounter.js`)

**Antes**: 
- Lógica complexa de busca manual de tokens
- Código duplicado para verificação de expiração
- Tratamento inconsistente de erros

**Depois**:

- Uso simples do `spotifyTokenService.getAccessToken()`
- Código limpo e focado na funcionalidade do componente
- Tratamento de erros padronizado

#### UserSettings (`src/pages/UserSettings.js`)

**Antes**:
- Função `checkSpotifyTokenValidity()` com lógica complexa
- Múltiplas tentativas de busca de tokens em diferentes locais
- Verificação manual de identidades e sessões

**Depois**:
- Uso do hook `useSpotifyToken` para gerenciamento completo
- Código simplificado para conexão/desconexão
- Interface mais responsiva com o `refreshTokenStatus()`

## Configuração Necessária

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```properties
# Spotify API Configuration
# Obtenha essas informações em: https://developer.spotify.com/dashboard/applications
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### Spotify Developer Dashboard

1. Acesse https://developer.spotify.com/dashboard/applications
2. Crie uma nova aplicação ou use uma existente
3. Configure as URLs de redirecionamento apropriadas
4. Copie o Client ID e Client Secret para as variáveis de ambiente

## Como Usar

### Para desenvolvedores - Usando o Hook

```javascript
import { useSpotifyToken } from '../hooks/useSpotifyToken';

function MeuComponente() {
  const { 
    isConnected, 
    isValidToken, 
    isLoading, 
    makeSpotifyRequest 
  } = useSpotifyToken();

  const buscarDadosSpotify = async () => {
    try {
      const response = await makeSpotifyRequest('https://api.spotify.com/v1/me');
      const userData = await response.json();
      console.log(userData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  if (isLoading) return <div>Verificando conexão...</div>;
  if (!isConnected) return <div>Spotify não conectado</div>;
  if (!isValidToken) return <div>Token expirado</div>;

  return <button onClick={buscarDadosSpotify}>Buscar Dados</button>;
}
```

### Para desenvolvedores - Usando o Serviço Diretamente

```javascript
import { spotifyTokenService } from '../services/spotifyTokenService';

async function exemploUso(userId) {
  // Verificar se tem conexão válida
  const hasConnection = await spotifyTokenService.hasValidSpotifyConnection(userId);
  
  if (!hasConnection) {
    console.log('Usuário não tem Spotify conectado ou token inválido');
    return;
  }

  // Obter token válido (com refresh automático)
  const token = await spotifyTokenService.getAccessToken(userId);
  
  if (token) {
    // Usar o token para chamadas à API
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

## Fluxo de Renovação Automática

1. **Verificação Inicial**: Quando um token é solicitado, o sistema verifica se existe e se está válido
2. **Verificação de Expiração**: Se o token expira em menos de 5 minutos, inicia o processo de renovação
3. **Renovação**: Usa o refresh token para obter um novo access token
4. **Cache**: Armazena o novo token em cache para evitar renovações desnecessárias
5. **Fallback**: Se a renovação falhar, retorna erro apropriado para o componente tratar

## Benefícios

### Para Usuários
- **Experiência Contínua**: Não precisam mais reconectar manualmente a cada hora
- **Interface Responsiva**: Status de conexão atualizado em tempo real
- **Menos Interrupções**: Sistema funciona em background sem interferir no uso

### Para Desenvolvedores
- **Código Limpo**: Lógica centralizada e reutilizável
- **Facilidade de Uso**: Hook simples com interface consistente
- **Manutenibilidade**: Mudanças futuras centralizadas em um local
- **Tratamento de Erros**: Sistema robusto com logs detalhados

## Testes e Validação

### Para testar o sistema:

1. **Conecte uma conta Spotify** através das Configurações
2. **Aguarde 1 hora** ou force a expiração do token
3. **Use funcionalidades que dependem do Spotify** (como visualizar seguidores)
4. **Verifique que a renovação ocorre automaticamente** sem intervenção do usuário

### Logs para monitoramento:

O sistema gera logs detalhados que podem ser visualizados no console do browser:
- `[SpotifyTokenService] Token refreshed com sucesso`
- `[SpotifyTokenService] Erro durante refresh do token`
- `[useSpotifyToken] Erro ao verificar status`

## Próximos Passos

1. **Monitoramento em Produção**: Acompanhar os logs para identificar possíveis problemas
2. **Otimizações**: Ajustar os tempos de cache e buffer conforme necessário
3. **Testes Adicionais**: Validar o comportamento em diferentes cenários de rede
4. **Documentação de API**: Documentar todos os métodos públicos para outros desenvolvedores

## Edge Functions

### refresh-spotify-token (Criada no Dashboard)

- **Localização**: Dashboard Supabase > Edge Functions
- **Função**: Atualiza tokens expirados
- **Variáveis**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

### auth-webhook (Novo - Implementado)

- **Arquivo**: `supabase/functions/auth-webhook/index.ts`
- **Função**: Salva tokens na tabela após OAuth do Spotify
- **Evento**: `identity.linked` com provider `spotify`
- **Variáveis necessárias**:
  - `WEBHOOK_SECRET`: Para validação de segurança
  - `SUPABASE_URL`: URL do projeto Supabase
  - `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role

## Configuração do Auth Hook no Supabase

Para que o sistema salve automaticamente os tokens após o OAuth, você deve:

1. **Fazer deploy da Edge Function `auth-webhook`**:

```bash
supabase functions deploy auth-webhook
```

2. **Configurar variáveis de ambiente** no Dashboard Supabase:
   - `WEBHOOK_SECRET`: Uma string secreta única (ex: um UUID)
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: A service role key do projeto

3. **Configurar o Auth Hook** no Dashboard:
   - Vá para `Authentication > Hooks`
   - Adicione um novo hook do tipo **HTTPS**
   - **URL**: `https://[SEU_PROJETO].supabase.co/functions/v1/auth-webhook`
   - **Secret**: O mesmo valor da variável `WEBHOOK_SECRET`
   - **Events**: Marque `identity.linked`

## Arquivos Modificados

- ✅ **Criado**: `src/services/spotifyTokenService.js` - Serviço centralizado
- ✅ **Criado**: `src/hooks/useSpotifyToken.js` - Hook personalizado  
- ✅ **Criado**: `src/hooks/useSpotifyConnection.js` - Hook para status de conexão
- ✅ **Modificado**: `src/components/dashboard/SpotifyFollowersCounter.js` - Usa novo serviço
- ✅ **Modificado**: `src/pages/UserSettings.js` - Usa novo hook
- ✅ **Modificado**: `.env` - Adicionadas variáveis de ambiente
- ✅ **Criado**: `supabase/functions/auth-webhook/index.ts` - Webhook para salvar tokens
- ✅ **Criado**: `SPOTIFY_TOKEN_SYSTEM.md` - Esta documentação

---

**Implementado por**: Sistema de Desenvolvimento Automatizado
**Data**: Junho 2025
**Versão**: 1.0.0
