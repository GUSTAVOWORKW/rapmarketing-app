// =======================================
// TESTE SPOTIFY WEBHOOK - NETLIFY ONLY
// 1. Vá para /settings primeiro
// 2. Cole este código no console (F12) 
// =======================================

console.clear();
console.log('🎵 TESTE SPOTIFY WEBHOOK');
console.log('========================\n');

// Buscar Supabase através do React DevTools ou diretamente
const findSupabase = () => {
  // Tentar acessar através de window.supabase (se exposto)
  if (window.supabase) return window.supabase;
  
  // Tentar através de módulos React (método mais confiável)
  try {
    const reactFiber = document.querySelector('#root')?._reactInternals || 
                      document.querySelector('#root')?._reactInternalInstance;
    
    if (reactFiber) {
      // Percorrer a árvore React para encontrar o Supabase client
      const findInFiber = (fiber) => {
        if (!fiber) return null;
        
        // Verificar props do componente
        if (fiber.memoizedProps) {
          const props = fiber.memoizedProps;
          if (props.supabase) return props.supabase;
          // Verificar se há uma instância do Supabase nos props
          for (let key in props) {
            if (props[key] && typeof props[key] === 'object' && 
                props[key].auth && props[key].from) {
              return props[key];
            }
          }
        }
        
        // Verificar state do componente
        if (fiber.memoizedState) {
          const state = fiber.memoizedState;
          if (state.memoizedState && state.memoizedState.supabase) {
            return state.memoizedState.supabase;
          }
        }
        
        // Buscar nos filhos
        let result = findInFiber(fiber.child);
        if (result) return result;
        
        // Buscar nos irmãos
        result = findInFiber(fiber.sibling);
        if (result) return result;
        
        return null;
      };
      
      return findInFiber(reactFiber);
    }
  } catch (e) {
    console.log('Erro ao buscar no React:', e.message);
  }
  
  return null;
};

// Executar teste
(async () => {
  const supabase = findSupabase();
  
  if (!supabase) {
    console.log('❌ SUPABASE NÃO ENCONTRADO');
    console.log('');
    console.log('� COMO RESOLVER:');
    console.log('1. Certifique-se de estar em /settings');
    console.log('2. Aguarde a página carregar completamente');
    console.log('3. Execute este script novamente');
    console.log('');
    console.log('� ALTERNATIVA MANUAL:');
    console.log('Execute: window.supabase = [COLE_O_CLIENT_AQUI]');
    return;
  }

  console.log('✅ Supabase client encontrado!');

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ USUÁRIO NÃO LOGADO - Faça login primeiro');
      return;
    }
    
    console.log('✅ Usuário logado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    const { data: token, error: tokenError } = await supabase
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
        await supabase.auth.signInWithOAuth({
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
