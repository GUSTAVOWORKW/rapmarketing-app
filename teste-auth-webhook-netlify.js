// SCRIPT DE TESTE PARA VERIFICAR AUTH WEBHOOK - VERSÃO NETLIFY
// Execute este código no console do browser (F12) após acessar sua app no Netlify

console.log('=== TESTE DE VERIFICAÇÃO AUTH WEBHOOK - NETLIFY ===');

// 1. Verificar se o usuário está logado no Supabase
const checkUser = async () => {
  try {
    // Verificar se o supabase está disponível globalmente
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase client não encontrado. Tentando acessar através do React...');
      return null;
    }

    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Erro ao verificar usuário:', error);
      return null;
    }

    if (user) {
      console.log('✅ Usuário logado:', user.id);
      console.log('📧 Email:', user.email);
      return user;
    } else {
      console.log('❌ Usuário não logado');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao verificar usuário:', error);
    return null;
  }
};

// 2. Verificar se existe token na tabela spotify_tokens
const checkSpotifyToken = async (userId) => {
  try {
    console.log('🔍 Buscando token Spotify para user:', userId);
    
    const { data, error } = await window.supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Nenhum token Spotify encontrado (tabela vazia)');
      } else {
        console.log('❌ Erro ao buscar token Spotify:', error);
      }
      return null;
    }

    if (data) {
      console.log('✅ Token Spotify encontrado:');
      console.log('- ID:', data.id);
      console.log('- Criado em:', new Date(data.created_at).toLocaleString('pt-BR'));
      console.log('- Atualizado em:', new Date(data.updated_at).toLocaleString('pt-BR'));
      console.log('- Expira em:', new Date(data.expires_at).toLocaleString('pt-BR'));
      console.log('- Tem access_token:', !!data.access_token);
      console.log('- Tem refresh_token:', !!data.refresh_token);
      
      // Verificar se token está expirado
      const isExpired = new Date(data.expires_at) < new Date();
      console.log(`- Status: ${isExpired ? '⚠️ EXPIRADO' : '✅ VÁLIDO'}`);
      
      return data;
    }

    console.log('❌ Nenhum token Spotify encontrado');
    return null;
  } catch (error) {
    console.log('❌ Erro ao verificar token:', error);
    return null;
  }
};

// 3. Testar se a edge function auth-webhook está respondendo
const testAuthWebhook = async () => {
  try {
    console.log('🔍 Testando se a edge function auth-webhook está acessível...');
    
    const response = await fetch('https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok || response.status === 200) {
      console.log('✅ Edge function auth-webhook está acessível');
      return true;
    } else {
      console.log('❌ Edge function auth-webhook não está acessível:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar edge function:', error);
    return false;
  }
};

// 4. Verificar configuração do ambiente
const checkEnvironment = () => {
  console.log('🔍 Verificando ambiente...');
  console.log('- URL atual:', window.location.href);
  console.log('- Hostname:', window.location.hostname);
  console.log('- Is Netlify:', window.location.hostname.includes('netlify.app'));
  
  // Verificar se há dados relevantes no localStorage
  const keys = Object.keys(localStorage);
  const relevantKeys = keys.filter(key => 
    key.includes('supabase') || 
    key.includes('spotify') || 
    key.includes('auth')
  );
  
  if (relevantKeys.length > 0) {
    console.log('📦 Dados relevantes no localStorage:', relevantKeys);
  } else {
    console.log('📦 Nenhum dado relevante no localStorage');
  }
};

// 5. Verificar identities do usuário (para debug)
const checkUserIdentities = async (userId) => {
  try {
    console.log('🔍 Verificando identities do usuário...');
    
    // Esta query pode não funcionar se RLS estiver ativo
    const { data, error } = await window.supabase
      .from('auth.identities')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.log('❌ Não foi possível verificar identities (normal devido ao RLS):', error.message);
    } else {
      console.log('✅ Identities encontradas:', data);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar identities:', error);
  }
};

// 6. Executar todos os testes
const runAllTests = async () => {
  console.log('🚀 Iniciando verificação completa no Netlify...\n');
  
  // Verificar ambiente
  checkEnvironment();
  console.log('');
  
  // Teste 1: Usuário logado
  const user = await checkUser();
  if (!user) {
    console.log('❌ PARE AQUI: Faça login primeiro');
    console.log('💡 Vá para /login e faça login, depois execute este script novamente');
    return;
  }
  console.log('');

  // Teste 2: Token na tabela
  const token = await checkSpotifyToken(user.id);
  console.log('');
  
  // Teste 3: Edge function acessível
  await testAuthWebhook();
  console.log('');
  
  // Teste 4: Identities (debug)
  await checkUserIdentities(user.id);
  console.log('');
  
  console.log('\n=== RESUMO ===');
  if (token) {
    const isExpired = new Date(token.expires_at) < new Date();
    console.log('✅ Tem token Spotify na tabela');
    console.log(`${isExpired ? '⚠️' : '✅'} Token ${isExpired ? 'EXPIRADO' : 'VÁLIDO'}`);
    
    if (isExpired) {
      console.log('💡 Token expirado - mas isso é normal, deveria renovar automaticamente');
    }
  } else {
    console.log('❌ NÃO tem token Spotify na tabela');
    console.log('💡 PROBLEMA: Auth webhook não está salvando tokens');
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  if (!token) {
    console.log('1. ❌ PROBLEMA PRINCIPAL: Webhook não está funcionando');
    console.log('2. 🔧 Verificar webhook configurado no Supabase Dashboard');
    console.log('3. 🔧 Verificar variáveis de ambiente da edge function');
    console.log('4. 🔧 Verificar logs da edge function');
    console.log('5. 🧪 Tentar conectar Spotify novamente em /settings');
  } else {
    console.log('1. ✅ Sistema aparenta estar funcionando');
    console.log('2. 🧪 Se houver problemas, verificar refresh de tokens');
    console.log('3. 🧪 Testar disconnect/reconnect do Spotify');
  }

  console.log('\n🔗 URLs importantes:');
  console.log('- Settings:', `${window.location.origin}/settings`);
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/ntreksvrwflivedhvixs');
  console.log('- Edge Functions: https://supabase.com/dashboard/project/ntreksvrwflivedhvixs/functions');
};

// 7. Função para testar conexão Spotify manualmente
const testSpotifyConnection = async () => {
  console.log('🎵 Testando conexão manual com Spotify...');
  
  if (!window.supabase) {
    console.log('❌ Supabase não disponível');
    return;
  }

  try {
    const user = await checkUser();
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }

    console.log('🔗 Iniciando OAuth com Spotify...');
    
    const { data, error } = await window.supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/spotify-callback`,
        scopes: 'user-read-private user-read-email user-follow-read'
      }
    });

    if (error) {
      console.log('❌ Erro no OAuth:', error);
    } else {
      console.log('✅ OAuth iniciado:', data);
      console.log('💡 Você será redirecionado para o Spotify...');
    }
  } catch (error) {
    console.log('❌ Erro ao testar conexão:', error);
  }
};

// Adicionar funções ao window para fácil acesso
window.testSpotifyWebhook = runAllTests;
window.testSpotifyConnection = testSpotifyConnection;
window.checkSpotifyToken = checkSpotifyToken;

console.log('\n🎯 COMANDOS DISPONÍVEIS:');
console.log('- window.testSpotifyWebhook() - Executar todos os testes');
console.log('- window.testSpotifyConnection() - Testar conexão manual');
console.log('- window.checkSpotifyToken(userId) - Verificar token específico');

// Executar automaticamente
runAllTests();
