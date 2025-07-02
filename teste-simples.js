// =======================================
// TESTE SPOTIFY SIMPLES - NETLIFY
// Execute PRIMEIRO este comando para expor o Supabase:
// =======================================

// PASSO 1: Cole este código primeiro para expor o Supabase
if (typeof window !== 'undefined') {
  // Buscar o Supabase client através dos módulos da aplicação
  const findSupabase = () => {
    // Tentar através de módulos webpack
    if (window.webpackChunkAdminDashboard || window.webpackChunkReact) {
      const chunks = window.webpackChunkAdashboard || window.webpackChunkReact || [];
      for (let chunk of chunks) {
        if (chunk && chunk[1]) {
          for (let moduleId in chunk[1]) {
            try {
              const module = chunk[1][moduleId];
              if (module && module.toString().includes('supabase')) {
                // Tentar executar o módulo
                const exports = {};
                module(exports, {}, () => {});
                if (exports.supabase) return exports.supabase;
              }
            } catch (e) {}
          }
        }
      }
    }
    return null;
  };

  window.__SUPABASE_CLIENT__ = findSupabase();
}

// PASSO 2: Cole este código para testar
(async () => {
  console.clear();
  console.log('🎵 TESTE SPOTIFY SIMPLES');
  console.log('=======================\n');

  // Método alternativo: buscar através do DOM/React
  const getSupabaseFromReact = () => {
    const reactRoot = document.querySelector('#root')?._reactInternalInstance || 
                     document.querySelector('#root')?._reactInternals ||
                     document.querySelector('[data-reactroot]')?._reactInternalInstance;
    
    if (reactRoot) {
      let current = reactRoot;
      let attempts = 0;
      
      while (current && attempts < 20) {
        if (current.memoizedProps && current.memoizedProps.supabase) {
          return current.memoizedProps.supabase;
        }
        if (current.child) current = current.child;
        else if (current.sibling) current = current.sibling;
        else if (current.return) current = current.return;
        else break;
        attempts++;
      }
    }
    return null;
  };

  let supabase = window.__SUPABASE_CLIENT__ || getSupabaseFromReact();
  
  if (!supabase) {
    console.log('❌ SUPABASE NÃO ENCONTRADO');
    console.log('💡 SOLUÇÃO: Execute este comando no console:');
    console.log('💡 window.__SUPABASE_CLIENT__ = supabase');
    console.log('💡 (onde supabase é o client da sua aplicação)');
    return;
  }

  console.log('✅ Supabase encontrado!');

  try {
    // Verificar usuário
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('❌ USUÁRIO NÃO LOGADO');
      return;
    }
    
    console.log('✅ Usuário:', user.email);
    
    // Verificar token
    const { data: token, error: tokenError } = await supabase
      .from('spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !token) {
      console.log('❌ SEM TOKEN SPOTIFY - Webhook não funcionando');
      return;
    }
    
    console.log('✅ TOKEN ENCONTRADO!');
    console.log('📅 Atualizado:', new Date(token.updated_at).toLocaleString());
    
    const isExpired = new Date(token.expires_at) < new Date();
    console.log(`🔋 Status: ${isExpired ? 'EXPIRADO' : 'VÁLIDO'}`);
    
  } catch (error) {
    console.log('❌ ERRO:', error.message);
  }
})();
