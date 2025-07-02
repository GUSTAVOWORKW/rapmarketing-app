// =======================================
// TESTE SPOTIFY WEBHOOK - NETLIFY
// 1. Vá para /settings primeiro
// 2. Cole este código no console (F12) 
// =======================================

console.clear();
console.log('🎵 TESTE SPOTIFY WEBHOOK');
console.log('========================\n');

// Executar teste
(async () => {
  // Verificar se Supabase está disponível
  if (!window.supabase) {
    console.log('❌ SUPABASE NÃO ENCONTRADO');
    console.log('');
    console.log('📋 COMO RESOLVER:');
    console.log('1. Certifique-se de estar em /settings');
    console.log('2. Aguarde a página carregar completamente');
    console.log('3. Execute este script novamente');
    console.log('');
    console.log('💡 Se ainda não funcionar, recarregue a página /settings');
    return;
  }

  console.log('✅ Supabase client encontrado!');

  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ USUÁRIO NÃO LOGADO - Faça login primeiro');
      return;
    }
    
    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    const { data: token, error: tokenError } = await window.supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !token) {
      console.log('\n❌ NENHUM TOKEN SPOTIFY ENCONTRADO');
      console.log('🚨 PROBLEMA: Webhook não está funcionando');
      console.log('\n💡 Tente conectar Spotify no botão da página');
      
      // Expor função para conectar
      window.conectarSpotify = async () => {
        console.log('🎵 Conectando Spotify...');
        await window.supabase.auth.signInWithOAuth({
          provider: 'spotify',
          options: {
            redirectTo: `${window.location.origin}/spotify-callback`,
            scopes: 'user-read-private user-read-email user-follow-read'
          }
        });
      };
      console.log('💡 Ou execute: conectarSpotify()');
      return;
    }
    
    console.log('\n✅ TOKEN SPOTIFY ENCONTRADO:');
    console.log('📅 Criado:', new Date(token.created_at).toLocaleString('pt-BR'));
    console.log('🔄 Atualizado:', new Date(token.updated_at).toLocaleString('pt-BR'));
    console.log('⏰ Expira:', new Date(token.expires_at).toLocaleString('pt-BR'));
    
    const isExpired = new Date(token.expires_at) < new Date();
    console.log(`🔋 Status: ${isExpired ? '⚠️ EXPIRADO' : '✅ VÁLIDO'}`);
    
    if (isExpired) {
      console.log('💡 Token expirado é normal - deveria renovar automaticamente');
    } else {
      console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
    }
    
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
})();
