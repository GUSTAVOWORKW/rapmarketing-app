// Versão simplificada do SpotifyCallbackHandler.js 
// considerando que a edge function auth-webhook já salva os tokens automaticamente

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export const SpotifyCallbackHandlerSimplified = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('Verificando conexão...');
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      console.log('🔍 [SpotifyCallback] Processando callback (webhook mode)...');
      
      // Limpar URL primeiro para remover tokens da URL
      window.history.replaceState({}, document.title, window.location.pathname);

      setStatus('Verificando usuário...');
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('❌ [SpotifyCallback] Usuário não autenticado:', userError);
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
          console.warn('⚠️ [SpotifyCallback] Tokens não encontrados, pode ser que webhook ainda esteja processando');
          setError('Conexão em processamento. Verifique em alguns segundos na página de configurações.');
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }

        console.log('✅ [SpotifyCallback] Tokens encontrados na base de dados!');
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
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-700">Conectando ao Spotify</h3>
            <p className="text-sm text-gray-600 mt-2">{status}</p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyCallbackHandlerSimplified;
