// =======================================
// TESTE SPOTIFY WEBHOOK - NETLIFY ONLY
// Cole este código no console (F12) 
// =======================================

(async () => {
  console.clear();
  console.log('🎵 TESTE SPOTIFY WEBHOOK');
  console.log('========================\n');

  try {
    // 1. Verificar usuário logado
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ USUÁRIO NÃO LOGADO - Faça login primeiro');
      return;
    }
    
    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    // 2. Verificar token Spotify na tabela
    const { data: token, error: tokenError } = await supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !token) {
      console.log('\n❌ NENHUM TOKEN SPOTIFY ENCONTRADO');
      console.log('🚨 PROBLEMA: Webhook não está funcionando');
      console.log('\n💡 Vá para /settings e tente conectar Spotify');
      return;
    }
    
    // 3. Analisar token encontrado
    console.log('\n✅ TOKEN SPOTIFY ENCONTRADO:');
    console.log('📅 Criado:', new Date(token.created_at).toLocaleString('pt-BR'));
    console.log('🔄 Atualizado:', new Date(token.updated_at).toLocaleString('pt-BR'));
    console.log('⏰ Expira:', new Date(token.expires_at).toLocaleString('pt-BR'));
    
    const isExpired = new Date(token.expires_at) < new Date();
    console.log(`🔋 Status: ${isExpired ? '⚠️ EXPIRADO' : '✅ VÁLIDO'}`);
    
    if (isExpired) {
      console.log('💡 Token expirado é normal - deveria renovar automaticamente');
    } else {
      console.log('🎉 SISTEMA FUNCIONANDO!');
    }
    
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
})();

// Função para conectar Spotify manualmente
window.conectarSpotify = async () => {
  console.log('🎵 Conectando Spotify...');
  await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      redirectTo: `${window.location.origin}/spotify-callback`,
      scopes: 'user-read-private user-read-email user-follow-read'
    }
  });
};

console.log('\n💡 Para conectar manualmente: conectarSpotify()');
