// SpotifyCallbackHandler.js - Versão simplificada
// A edge function auth-webhook já salva os tokens automaticamente
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

export const SpotifyCallbackHandler = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('Verificando conexão...');
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      console.log('🔍 [SpotifyCallback] Processando callback (webhook mode)...');
      
      // Limpar URL primeiro para remover tokens da URL
      window.history.replaceState({}, document.title, window.location.pathname);

      setStatus('Verificando usuário...');
      
      try {
        // const { data: { user }, error: userError } = await supabase.auth.getUser(); // Removido, usando user do useAuth

        if (!user || !user.id) {
          console.error('❌ [SpotifyCallback] Usuário não autenticado.');
          setError('Usuário não autenticado. Faça login e tente novamente.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('✅ [SpotifyCallback] Usuário autenticado:', user.id);
        setStatus('Verificando tokens do Spotify...');

        // Aguardar um momento para a edge function auth-webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar se os tokens foram salvos pela edge function
        const { data: tokenData, error: tokenError } = await supabase
          .from('spotify_tokens')
          .select('access_token, expires_at')
          .eq('user_id', user.id)
          .single();

        if (tokenError || !tokenData) {
          console.warn('⚠️ [SpotifyCallback] Tokens não encontrados via webhook, tentando fallback...');
          
          // FALLBACK: Extrair tokens da URL e salvar manualmente
          const capturedHash = window.location.hash;
          if (capturedHash) {
            const params = new URLSearchParams(capturedHash.substring(1));
            const accessToken = params.get('provider_token');
            const refreshToken = params.get('provider_refresh_token');
            const expiresIn = params.get('expires_in') || '3600';

            if (accessToken) {
              console.log('🔧 [SpotifyCallback] Salvando tokens manualmente...');
              setStatus('Salvando tokens do Spotify...');

              const tokenData = {
                user_id: user.id,
                access_token: accessToken,
                refresh_token: refreshToken || '',
                expires_at: Date.now() + (parseInt(expiresIn) * 1000),
              };

              const { error: saveError } = await supabase
                .from('spotify_tokens')
                .upsert([tokenData], { onConflict: 'user_id' });

              if (saveError) {
                console.error('❌ [SpotifyCallback] Erro ao salvar tokens manualmente:', saveError);
                setError('Erro ao salvar conexão. Verifique se a tabela spotify_tokens existe.');
                setTimeout(() => navigate('/settings'), 3000);
                return;
              }
              
              console.log('✅ [SpotifyCallback] Tokens salvos manualmente com sucesso!');
            } else {
              setError('Tokens não encontrados na URL. Tente conectar novamente.');
              setTimeout(() => navigate('/settings'), 3000);
              return;
            }
          } else {
            setError('Webhook não funcionou e não há tokens na URL. Verifique a configuração.');
            setTimeout(() => navigate('/settings'), 3000);
            return;
          }
        } else {
          console.log('✅ [SpotifyCallback] Tokens encontrados via webhook!');
        }

        setStatus('Conexão estabelecida com sucesso!');
        
        // Dispara evento para atualizar outros componentes
        window.dispatchEvent(new CustomEvent('spotify-connected'));
        
        setTimeout(() => {
          navigate('/settings');
          window.location.reload();
        }, 1500);

      } catch (err) {
        console.error('❌ [SpotifyCallback] Erro no processamento:', err);
        setError('Erro inesperado. Tente conectar novamente.');
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    // Aguardar um momento para garantir que a URL foi carregada
    setTimeout(processCallback, 500);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {error ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-700">Erro na Conexão</h3>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
                <button 
                  onClick={() => navigate('/settings')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Voltar às Configurações
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
                <h3 className="text-lg font-semibold text-green-700">Conectando ao Spotify</h3>
                <p className="text-sm text-gray-600 mt-2">{status}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyCallbackHandler;