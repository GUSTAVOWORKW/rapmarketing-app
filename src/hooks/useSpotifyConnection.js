import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { spotifyTokenService } from '../services/spotifyTokenService';
import { useAuth } from '../context/AuthContext';

export const useSpotifyConnection = () => {
  const { user, refreshProfile } = useAuth();
  
  // Inicializar estados do cache do sessionStorage
  const [isConnected, setIsConnected] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`spotify_connected_${user?.id}`);
      return cached === 'true';
    } catch {
      return false;
    }
  });
  const [hasValidToken, setHasValidToken] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`spotify_valid_${user?.id}`);
      return cached === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(() => {
    // Se já temos cache, não mostrar loading
    const cached = sessionStorage.getItem(`spotify_checked_${user?.id}`);
    return !cached;
  });

  // Effect único para verificar conexão
  useEffect(() => {
    let cancelled = false;
    
    const checkConnection = async () => {
      const userId = user?.id;
      
      // Se não tem usuário, reseta estado
      if (!userId) {
        setIsConnected(false);
        setHasValidToken(false);
        setLoading(false);
        return;
      }
      
      const cacheKey = `spotify_checked_${userId}`;
      
      // Se já verificamos (sessionStorage), não verifica novamente
      if (sessionStorage.getItem(cacheKey)) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
        if (identitiesError) throw identitiesError;

        const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
        const connected = !!spotifyIdentity;
        
        if (cancelled) return;
        
        setIsConnected(connected);
        sessionStorage.setItem(`spotify_connected_${userId}`, String(connected));

        if (connected) {
          try {
            const validToken = await spotifyTokenService.hasValidSpotifyConnection(userId);
            if (!cancelled) {
              setHasValidToken(validToken);
              sessionStorage.setItem(`spotify_valid_${userId}`, String(validToken));
            }
          } catch (tokenError) {
            console.error('[useSpotifyConnection] Erro ao validar token:', tokenError);
            if (!cancelled) {
              setHasValidToken(false);
              sessionStorage.setItem(`spotify_valid_${userId}`, 'false');
            }
          }
        } else {
          setHasValidToken(false);
          sessionStorage.setItem(`spotify_valid_${userId}`, 'false');
        }
        
        // Marca que já verificamos
        sessionStorage.setItem(cacheKey, 'true');
        
      } catch (error) {
        console.error('[useSpotifyConnection] Erro:', error);
        if (!cancelled) {
          setIsConnected(false);
          setHasValidToken(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkConnection();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

      // Limpar o token do nosso banco de dados
      await spotifyTokenService._clearSpotifyConnection(user.id);

      // Limpar cache do sessionStorage
      sessionStorage.removeItem(`spotify_checked_${user.id}`);
      sessionStorage.removeItem(`spotify_connected_${user.id}`);
      sessionStorage.removeItem(`spotify_valid_${user.id}`);

      // Forçar a atualização do perfil
      await refreshProfile(user.id);

      setIsConnected(false);
      setHasValidToken(false);

      return { success: true };
    } catch (error) {
      console.error('[disconnectSpotify] Erro:', error);
      return { success: false, error: error.message };
    }
  }, [user, refreshProfile]);

  const refresh = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;
    
    // Limpar cache para forçar nova verificação
    sessionStorage.removeItem(`spotify_checked_${userId}`);
    
    setLoading(true);
    
    try {
      const { data: identities } = await supabase.auth.getUserIdentities();
      const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
      const connected = !!spotifyIdentity;
      
      setIsConnected(connected);
      sessionStorage.setItem(`spotify_connected_${userId}`, String(connected));

      if (connected) {
        const validToken = await spotifyTokenService.hasValidSpotifyConnection(userId);
        setHasValidToken(validToken);
        sessionStorage.setItem(`spotify_valid_${userId}`, String(validToken));
      } else {
        setHasValidToken(false);
        sessionStorage.setItem(`spotify_valid_${userId}`, 'false');
      }
      
      sessionStorage.setItem(`spotify_checked_${userId}`, 'true');
    } catch (error) {
      console.error('[useSpotifyConnection] refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    isConnected,
    hasValidToken,
    loading,
    disconnectSpotify,
    refresh
  };
};
