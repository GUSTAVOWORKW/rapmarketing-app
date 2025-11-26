import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { spotifyTokenService } from '../services/spotifyTokenService';
import { useAuth } from '../context/AuthContext'; // Importar o hook de contexto

export const useSpotifyConnection = () => {
  const { user, refreshProfile } = useAuth(); // Usar o contexto
  const [isConnected, setIsConnected] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSpotifyConnection = useCallback(async () => {
    // Se ainda não temos usuário, consideramos como não conectado e encerramos rápido
    if (!user) {
      setIsConnected(false);
      setHasValidToken(false);
      setLoading(false);
      return;
    }

    // Se o usuário está logado, checamos a identidade no Supabase e o token no nosso serviço
    setLoading(true);
    try {
      const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
      if (identitiesError) throw identitiesError;

      const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
      const connected = !!spotifyIdentity;
      setIsConnected(connected);

      if (connected) {
        try {
          const validToken = await spotifyTokenService.hasValidSpotifyConnection(user.id);
          setHasValidToken(validToken);
        } catch (tokenError) {
          console.error('[useSpotifyConnection] Erro ao validar token Spotify:', tokenError);
          // Mesmo com erro, não travar loading; apenas marcar como sem token válido
          setHasValidToken(false);
        }
      } else {
        setHasValidToken(false);
      }
    } catch (error) {
      console.error('[useSpotifyConnection] Erro ao verificar conexão:', error);
      setIsConnected(false);
      setHasValidToken(false);
    } finally {
      // Garantir que o loading sempre seja desligado, mesmo em qualquer tipo de erro
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSpotifyConnection();
  }, [checkSpotifyConnection]);

  const disconnectSpotify = useCallback(async () => {
    if (!user) return { success: false, error: 'Usuário não encontrado' };

    try {
      const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
      if (identitiesError) throw identitiesError;

      const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
      if (!spotifyIdentity) {
        return { success: false, error: 'Nenhuma conta Spotify conectada para desconectar.' };
      }

      const { error: unlinkError } = await supabase.auth.unlinkIdentity(spotifyIdentity);
      if (unlinkError) throw unlinkError;

      // Limpar o token do nosso banco de dados também
      await spotifyTokenService._clearSpotifyConnection(user.id);

      // Forçar a atualização do perfil para refletir a mudança em toda a UI
      await refreshProfile(user.id);

      setIsConnected(false);
      setHasValidToken(false);

      return { success: true };
    } catch (error) {
      console.error('[disconnectSpotify] Erro completo:', error);
      return { success: false, error: error.message };
    }
  }, [user, refreshProfile]);

  const refresh = useCallback(() => {
    checkSpotifyConnection();
  }, [checkSpotifyConnection]);

  return {
    isConnected,
    hasValidToken,
    loading,
    disconnectSpotify,
    refresh
  };
};
