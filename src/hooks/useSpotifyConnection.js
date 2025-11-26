import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { spotifyTokenService } from '../services/spotifyTokenService';
import { useAuth } from '../context/AuthContext'; // Importar o hook de contexto

export const useSpotifyConnection = () => {
  const { user, refreshProfile } = useAuth(); // Usar o contexto
  const [isConnected, setIsConnected] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Ref para rastrear se já verificamos a conexão para este userId
  const checkedUserIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Effect único para verificar conexão - executa apenas quando user.id muda
  useEffect(() => {
    isMountedRef.current = true;
    
    const checkConnection = async () => {
      const userId = user?.id;
      
      // Se não tem usuário, reseta estado e encerra
      if (!userId) {
        setIsConnected(false);
        setHasValidToken(false);
        setLoading(false);
        checkedUserIdRef.current = null;
        return;
      }
      
      // Se já verificamos para este userId, não verifica novamente
      if (checkedUserIdRef.current === userId) {
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
        if (identitiesError) throw identitiesError;

        const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
        const connected = !!spotifyIdentity;
        
        if (isMountedRef.current) {
          setIsConnected(connected);

          if (connected) {
            try {
              const validToken = await spotifyTokenService.hasValidSpotifyConnection(userId);
              if (isMountedRef.current) {
                setHasValidToken(validToken);
              }
            } catch (tokenError) {
              console.error('[useSpotifyConnection] Erro ao validar token Spotify:', tokenError);
              if (isMountedRef.current) {
                setHasValidToken(false);
              }
            }
          } else {
            setHasValidToken(false);
          }
          
          // Marca que já verificamos para este userId
          checkedUserIdRef.current = userId;
        }
      } catch (error) {
        console.error('[useSpotifyConnection] Erro ao verificar conexão:', error);
        if (isMountedRef.current) {
          setIsConnected(false);
          setHasValidToken(false);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkConnection();

    return () => {
      isMountedRef.current = false;
    };
  }, [user?.id]); // Apenas user.id como dependência

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
      
      // Resetar o ref para permitir re-verificação após desconectar
      checkedUserIdRef.current = null;

      return { success: true };
    } catch (error) {
      console.error('[disconnectSpotify] Erro completo:', error);
      return { success: false, error: error.message };
    }
  }, [user, refreshProfile]);

  const refresh = useCallback(() => {
    // Resetar o ref para forçar nova verificação
    checkedUserIdRef.current = null;
    // Re-trigger do effect acontecerá naturalmente na próxima renderização
    // Ou podemos forçar chamando diretamente
    setLoading(true);
    const checkConnection = async () => {
      const userId = user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: identities } = await supabase.auth.getUserIdentities();
        const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
        const connected = !!spotifyIdentity;
        setIsConnected(connected);

        if (connected) {
          const validToken = await spotifyTokenService.hasValidSpotifyConnection(userId);
          setHasValidToken(validToken);
        } else {
          setHasValidToken(false);
        }
        checkedUserIdRef.current = userId;
      } catch (error) {
        console.error('[useSpotifyConnection] refresh error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, [user?.id]);

  return {
    isConnected,
    hasValidToken,
    loading,
    disconnectSpotify,
    refresh
  };
};
