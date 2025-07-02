// SCRIPT DE TESTE PARA VERIFICAR AUTH WEBHOOK
// Execute este código no console do browser (F12) após fazer login no seu app

console.log('=== TESTE DE VERIFICAÇÃO AUTH WEBHOOK ===');

// 1. Verificar se o usuário está logado
const checkUser = async () => {
  try {
    const response = await fetch(`${window.location.origin}/api/user`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Usuário logado:', user.id);
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
    // Usando o Supabase client que já está disponível na sua app
    const { data, error } = await window.supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('❌ Erro ao buscar token Spotify:', error);
      return null;
    }

    if (data) {
      console.log('✅ Token Spotify encontrado:');
      console.log('- Criado em:', new Date(data.created_at).toLocaleString());
      console.log('- Atualizado em:', new Date(data.updated_at).toLocaleString());
      console.log('- Expira em:', new Date(data.expires_at).toLocaleString());
      console.log('- Tem refresh_token:', !!data.refresh_token);
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
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
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

// 4. Verificar configuração do Spotify no localStorage/sessionStorage
const checkSpotifyConfig = () => {
  console.log('🔍 Verificando configuração do Spotify...');
  
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'Não encontrado';
  console.log('- Client ID:', clientId);
  
  // Verificar se há dados do Spotify no storage
  const spotifyData = localStorage.getItem('spotify') || sessionStorage.getItem('spotify');
  if (spotifyData) {
    console.log('✅ Dados do Spotify no storage:', JSON.parse(spotifyData));
  } else {
    console.log('❌ Nenhum dado do Spotify no storage');
  }
};

// 5. Executar todos os testes
const runAllTests = async () => {
  console.log('🚀 Iniciando verificação completa...\n');
  
  // Teste 1: Usuário logado
  const user = await checkUser();
  if (!user) {
    console.log('❌ Pare aqui: Faça login primeiro');
    return;
  }

  // Teste 2: Token na tabela
  const token = await checkSpotifyToken(user.id);
  
  // Teste 3: Edge function acessível
  await testAuthWebhook();
  
  // Teste 4: Configuração
  checkSpotifyConfig();
  
  console.log('\n=== RESUMO ===');
  if (token) {
    const isExpired = new Date(token.expires_at) < new Date();
    console.log('✅ Tem token Spotify na tabela');
    console.log(`${isExpired ? '⚠️' : '✅'} Token ${isExpired ? 'expirado' : 'válido'}`);
  } else {
    console.log('❌ Não tem token Spotify na tabela');
    console.log('💡 Problema: Auth webhook não está salvando tokens');
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  if (!token) {
    console.log('1. Verificar webhook configurado no Supabase Dashboard');
    console.log('2. Verificar variáveis de ambiente da edge function');
    console.log('3. Verificar logs da edge function');
    console.log('4. Tentar conectar Spotify novamente');
  } else {
    console.log('1. Sistema funcionando corretamente');
    console.log('2. Se houver problemas, verificar refresh de tokens');
  }
};

// Executar automaticamente
runAllTests();
