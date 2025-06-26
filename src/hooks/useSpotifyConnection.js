// src/hooks/useSpotifyConnection.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { spotifyTokenService } from '../services/spotifyTokenService';

/**
 * Hook para gerenciar o estado da conexão Spotify
 * Compartilha o estado entre UserSettings e SpotifyFollowersCounter
 */
export const useSpotifyConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const checkSpotifyConnection = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        setIsConnected(false);
        setHasValidToken(false);
        setUser(null);
        return;
      }

      setUser(currentUser);

      // Buscar identidades usando a API correta
      const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
      
      if (identitiesError) {
        console.error('[useSpotifyConnection] Erro ao buscar identidades:', identitiesError);
        setIsConnected(false);
        setHasValidToken(false);
        return;      }      // Verificar se existe identidade Spotify
      const spotifyIdentity = identities?.identities?.find(id => id.provider === 'spotify');
      const connected = !!spotifyIdentity;
      setIsConnected(connected);

      // Se conectado, verificar se o token é válido
      if (connected) {
        const validToken = await spotifyTokenService.hasValidSpotifyConnection(currentUser.id);
        setHasValidToken(validToken);
      } else {
        setHasValidToken(false);
      }

    } catch (error) {
      console.error('[useSpotifyConnection] Erro ao verificar conexão:', error);
      setIsConnected(false);
      setHasValidToken(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar conexão na inicialização
  useEffect(() => {
    checkSpotifyConnection();
  }, [checkSpotifyConnection]);

  // Escutar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSpotifyConnection();
    });

    return () => subscription.unsubscribe();
  }, [checkSpotifyConnection]);

  /**
   * Conectar com Spotify
   */
  const connectSpotify = useCallback(async () => {
    try {
      const { error } = await supabase.auth.linkIdentity({ provider: 'spotify' });
      if (error) throw error;
      
      // Atualizar estado após conexão
      setTimeout(checkSpotifyConnection, 1000);
      
      return { success: true };
    } catch (error) {
      console.error('[useSpotifyConnection] Erro ao conectar Spotify:', error);
      return { success: false, error: error.message };
    }
  }, [checkSpotifyConnection]);  /**
   * Desconectar do Spotify
   */
  const disconnectSpotify = useCallback(async () => {
    console.log('DEBUG: Entrou no disconnectSpotify');
    try {
      // Buscar identidades do usuário
      const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
      if (identitiesError) {
        throw new Error(`Erro ao buscar identidades: ${identitiesError.message}`);
      }
      if (!identities?.identities || identities.identities.length === 0) {
        console.error('[DEBUG identities] Nenhuma identidade encontrada:', identities);
        return { success: false, error: 'Nenhuma identidade encontrada para desconectar.' };
      }
      // Logar todas as identidades para debug
      console.log('[DEBUG identities]', identities.identities);
      // Buscar a identidade do Spotify
      const spotifyIdentity = identities.identities.find(id => id.provider === 'spotify');
      if (!spotifyIdentity) {
        console.error('[DEBUG] Identidade do Spotify não encontrada no array de identidades.');
        return { success: false, error: 'Nenhuma conta Spotify conectada para desconectar.' };
      }
      console.log('[DEBUG spotifyIdentity]', spotifyIdentity);
      // Logar todos os campos disponíveis
      Object.keys(spotifyIdentity).forEach(key => {
        console.log(`[DEBUG campo SpotifyIdentity] ${key}:`, spotifyIdentity[key]);
      });
      // Tentar ambos os campos: id e identity_id
      const identityId = spotifyIdentity.id || spotifyIdentity.identity_id;
      console.log('[DEBUG identityId passado para unlinkIdentity]', identityId);
      if (!identityId) {
        return { success: false, error: 'ID da identidade Spotify não encontrado. Veja os logs para os campos disponíveis.' };
      }
      // Validação extra: checar se é um UUID válido (regex simples)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(identityId)) {
        return { success: false, error: 'O ID da identidade não é um UUID válido: ' + identityId };
      }
      const { error } = await supabase.auth.unlinkIdentity(identityId);
      if (error) throw error;
      setIsConnected(false);
      setHasValidToken(false);
      setTimeout(checkSpotifyConnection, 500);
      return { success: true };
    } catch (error) {
      console.error('[disconnectSpotify] Erro completo:', error);
      return { success: false, error: error.message };
    }
  }, [checkSpotifyConnection]);

  /**
   * Forçar atualização da verificação
   */
  const refresh = useCallback(() => {
    checkSpotifyConnection();
  }, [checkSpotifyConnection]);
  return {
    isConnected,        // Se existe identidade Spotify
    hasValidToken,      // Se o token é válido/não expirado
    loading,
    user,
    connectSpotify,
    disconnectSpotify,
    refresh
  };
};
