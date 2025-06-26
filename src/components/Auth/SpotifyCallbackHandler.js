// src/components/Auth/SpotifyCallbackHandler.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

// Captura tokens IMEDIATAMENTE quando o arquivo carrega
const capturedHash = window.location.hash;
if (capturedHash && capturedHash.includes('provider_token')) {
  console.log('🚨 [SpotifyCallback] Tokens capturados no carregamento!');
  sessionStorage.setItem('spotify_tokens_pending', capturedHash);
  window.history.replaceState({}, document.title, window.location.pathname);
}

export const SpotifyCallbackHandler = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Processar tokens salvos
    const processTokens = async () => {
      if (hasProcessed.current) return;
      
      const storedHash = sessionStorage.getItem('spotify_tokens_pending');
      
      if (!storedHash) {
        return;
      }
      
      hasProcessed.current = true;
      console.log('💾 [SpotifyCallback] Processando tokens salvos...');
      
      try {
        // Parse dos tokens
        const params = new URLSearchParams(storedHash.substring(1));
        const accessToken = params.get('provider_token');
        const refreshToken = params.get('provider_refresh_token');
        const expiresIn = params.get('expires_in') || '3600';
        
        if (!accessToken) {
          console.error('❌ [SpotifyCallback] Token não encontrado');
          return;
        }
        
        // Obter usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ [SpotifyCallback] Usuário não autenticado:', userError);
          // Tentar novamente em 1 segundo se não houver usuário
          hasProcessed.current = false;
          setTimeout(processTokens, 1000);
          return;
        }
        
        console.log('📦 [SpotifyCallback] Salvando tokens para usuário:', user.id);
        
        // Preparar dados
        const tokenData = {
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_at: Date.now() + (parseInt(expiresIn) * 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Deletar registro anterior
        await supabase
          .from('spotify_tokens')
          .delete()
          .eq('user_id', user.id);
        
        // Inserir novo registro
        const { data, error } = await supabase
          .from('spotify_tokens')
          .insert([tokenData])
          .select();
        
        if (error) {
          console.error('❌ [SpotifyCallback] Erro ao salvar:', error);
        } else {
          console.log('✅ [SpotifyCallback] Tokens salvos com sucesso!', data);
          
          // Limpar do sessionStorage
          sessionStorage.removeItem('spotify_tokens_pending');
          
          // Disparar evento
          window.dispatchEvent(new CustomEvent('spotify-connected'));
          
          // Redirecionar
          setTimeout(() => {
            navigate('/settings');
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        console.error('❌ [SpotifyCallback] Erro geral:', err);
      }
    };

    processTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio pois queremos executar apenas uma vez

  // Mostrar indicador se tem tokens pendentes
  const hasPendingTokens = sessionStorage.getItem('spotify_tokens_pending');
  
  if (hasPendingTokens) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-lg">Conectando com Spotify...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SpotifyCallbackHandler;