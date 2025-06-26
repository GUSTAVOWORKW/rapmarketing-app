import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export const SpotifyCallbackHandler = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processTokens = async () => {
      if (hasProcessed.current) return;

      const capturedHash = window.location.hash;
      if (!capturedHash || !capturedHash.includes('provider_token')) {
        return;
      }

      console.log('🚨 [SpotifyCallback] Tokens do Spotify detectados na URL.');
      setIsProcessing(true);
      hasProcessed.current = true;

      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        const params = new URLSearchParams(capturedHash.substring(1));
        const accessToken = params.get('provider_token');
        const refreshToken = params.get('provider_refresh_token');
        const expiresIn = params.get('expires_in') || '3600';

        if (!accessToken) {
          console.error('❌ [SpotifyCallback] Token de acesso do Spotify não encontrado na URL.');
          setIsProcessing(false);
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('❌ [SpotifyCallback] Usuário não autenticado no Supabase. Não é possível salvar os tokens do Spotify.', userError);
          setIsProcessing(false);
          return;
        }

        console.log('📦 [SpotifyCallback] Salvando tokens para o usuário:', user.id);

        const tokenData = {
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_at: Date.now() + (parseInt(expiresIn) * 1000),
        };

        const { error } = await supabase
          .from('spotify_tokens')
          .upsert([tokenData], { onConflict: 'user_id' });

        if (error) {
          console.error('❌ [SpotifyCallback] Erro ao salvar tokens do Spotify:', error);
        } else {
          console.log('✅ [SpotifyCallback] Tokens do Spotify salvos com sucesso!');
          window.dispatchEvent(new CustomEvent('spotify-connected'));
          setTimeout(() => {
            navigate('/settings');
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        console.error('❌ [SpotifyCallback] Erro geral no processamento de tokens:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    processTokens();
  }, [navigate]);

  if (isProcessing) {
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