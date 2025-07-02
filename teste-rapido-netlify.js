// ========================================
// TESTE RÁPIDO SPOTIFY WEBHOOK - NETLIFY
// Cole este código completo no console (F12)
// ========================================

(async () => {
  console.clear();
  console.log('🎵 TESTE SPOTIFY WEBHOOK - NETLIFY');
  console.log('=====================================\n');

  // Verificar usuário
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ USUÁRIO NÃO LOGADO');
      console.log('💡 Faça login primeiro em /login');
      return;
    }
    
    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    // Verificar token Spotify
    const { data: token, error: tokenError } = await supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !token) {
      console.log('\n❌ NENHUM TOKEN SPOTIFY ENCONTRADO');
      console.log('🚨 PROBLEMA: Auth webhook NÃO está funcionando');
      console.log('\n📋 O que fazer:');
      console.log('1. Verificar webhook no Supabase Dashboard');
      console.log('2. Verificar edge function auth-webhook');
      console.log('3. Tentar conectar Spotify em /settings');
      return;
    }
    
    console.log('\n✅ TOKEN SPOTIFY ENCONTRADO:');
    console.log('📅 Criado:', new Date(token.created_at).toLocaleString('pt-BR'));
    console.log('🔄 Atualizado:', new Date(token.updated_at).toLocaleString('pt-BR'));
    console.log('⏰ Expira:', new Date(token.expires_at).toLocaleString('pt-BR'));
    
    const isExpired = new Date(token.expires_at) < new Date();
    console.log(`🔋 Status: ${isExpired ? '⚠️ EXPIRADO' : '✅ VÁLIDO'}`);
    
    if (isExpired) {
      console.log('\n⚠️ TOKEN EXPIRADO - Isso é normal');
      console.log('💡 Deveria renovar automaticamente ao usar');
    } else {
      console.log('\n🎉 SISTEMA FUNCIONANDO CORRETAMENTE!');
    }
    
    // Teste edge function
    try {
      const response = await fetch('https://ntreksvrwflivedhvixs.supabase.co/functions/v1/auth-webhook', {
        method: 'OPTIONS'
      });
      console.log(`\n🔗 Edge function: ${response.ok ? '✅ ACESSÍVEL' : '❌ INACESSÍVEL'}`);
    } catch (e) {
      console.log('\n🔗 Edge function: ❌ ERRO DE CONEXÃO');
    }
    
  } catch (error) {
    console.log('❌ ERRO GERAL:', error.message);
  }
})();

// Função para testar conexão manual
window.conectarSpotify = async () => {
  console.log('🎵 Iniciando conexão manual com Spotify...');
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/spotify-callback`,
        scopes: 'user-read-private user-read-email user-follow-read'
      }
    });
  } catch (error) {
    console.log('❌ Erro:', error);
  }
};

console.log('\n💡 Para testar conexão: digite "conectarSpotify()" no console');
