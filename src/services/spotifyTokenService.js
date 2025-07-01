// src/services/spotifyTokenService.js
import { supabase } from './supabase';

class SpotifyTokenService {
  constructor() {
    this.tokenCache = new Map();
    this.refreshPromises = new Map();
  }

  /**
   * Busca o token de acesso do Spotify para um usuário
   * @param {string} userId - ID do usuário autenticado
   * @returns {Promise<string|null>} Token de acesso ou null
   */
  async getAccessToken(userId) {
    try {
      // Verifica cache primeiro
      const cached = this.tokenCache.get(userId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.token;
      }      // Busca direto da tabela spotify_tokens
      const { data: tokenData, error } = await supabase
        .from('spotify_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .single();

      if (error || !tokenData) {
        console.error('Erro ao buscar token Spotify:', error);
        return null;
      }

      const { access_token, refresh_token, expires_at } = tokenData;
      
      if (!access_token) {
        console.error('Token de acesso não encontrado');
        return null;
      }

      // expires_at pode vir como string ISO ou timestamp
      let expiresAtTime;
      if (typeof expires_at === 'string') {
        expiresAtTime = new Date(expires_at).getTime();
      } else {
        expiresAtTime = parseInt(expires_at);
      }
      
      const needsRefresh = expiresAtTime <= Date.now() + (5 * 60 * 1000); // 5 min buffer

      // Se o token precisa ser renovado
      if (needsRefresh && refresh_token) {
        return await this.refreshAccessToken(userId, refresh_token);
      }

      // Armazena no cache
      this.tokenCache.set(userId, {
        token: access_token,
        expiresAt: expiresAtTime
      });      return access_token;
    } catch (error) {
      // Log menos verboso se for um erro comum (usuário sem conexão Spotify)
      if (error?.code === 'PGRST116') {
        // Código para "no rows returned" - usuário não tem conexão Spotify
        return null;
      }
      
      console.warn('Erro ao obter token de acesso Spotify:', {
        error: error.message,
        userId: userId?.substring(0, 8) + '...'
      });
      return null;
    }
  }

  /**
   * Renova o token de acesso usando o refresh token
   * @param {string} userId - ID do usuário
   * @param {string} refreshToken - Refresh token do Spotify
   * @returns {Promise<string|null>} Novo token de acesso ou null
   */
  async refreshAccessToken(userId, refreshToken) {
    if (!refreshToken) {
      console.error('Refresh token não disponível');
      return null;
    }

    // Evita múltiplas renovações simultâneas para o mesmo usuário
    if (this.refreshPromises.has(userId)) {
      return this.refreshPromises.get(userId);
    }

    const refreshPromise = this._performTokenRefresh(userId, refreshToken);
    this.refreshPromises.set(userId, refreshPromise);

    try {
      const newToken = await refreshPromise;
      return newToken;
    } finally {
      this.refreshPromises.delete(userId);
    }
  }
  /**
   * Executa a renovação do token
   * @private
   */
  async _performTokenRefresh(userId, refreshToken) {
    try {
      // Chama a Edge Function do Supabase para renovar o token
      const { data, error } = await supabase.functions.invoke('refresh-spotify-token', {
        body: { userId, refreshToken }
      });

      if (error) {
        console.warn('Erro na Edge Function refresh-spotify-token:', {
          error: error.message,
          status: error.status,
          userId: userId?.substring(0, 8) + '...' // Log parcial por segurança
        });
        
        // Se for erro 500, Edge Function não está funcionando - para de tentar
        if (error.status === 500) {
          console.error('Erro 500 na Edge Function - removendo conexão para evitar loops');
          // Remove o token para evitar loops infinitos
          await this._clearSpotifyConnection(userId);
          throw new Error('Serviço Spotify temporariamente indisponível.');
        }
        
        // Para outros erros, limpar conexão
        if (error.status === 400 || error.status === 401) {
          console.warn('Token Spotify inválido - removendo conexão');
          await this._clearSpotifyConnection(userId);
        }
        
        throw new Error(`Erro ao renovar token Spotify: ${error.message}`);
      }

      if (!data?.access_token) {
        console.warn('Edge Function não retornou access_token válido');
        return null;
      }

      // Atualiza o cache
      this.tokenCache.set(userId, {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      });

      // Atualiza o token na tabela
      try {
        await supabase
          .from('spotify_tokens')
          .update({
            access_token: data.access_token,
            expires_at: Date.now() + (data.expires_in * 1000),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } catch (dbError) {
        console.warn('Erro ao atualizar token na tabela:', dbError);
        // Continuar mesmo com erro de DB, pois o token foi renovado
      }

      return data.access_token;
    } catch (error) {
      console.error('Erro geral ao renovar token Spotify:', {
        error: error.message,
        userId: userId?.substring(0, 8) + '...'
      });
      throw error; // Re-throw the error
    }
  }

  /**
   * Remove conexão Spotify inválida
   * @private
   */
  async _clearSpotifyConnection(userId) {
    try {
      // Remove do cache
      this.tokenCache.delete(userId);
      
      // Remove da tabela
      await supabase
        .from('spotify_tokens')
        .delete()
        .eq('user_id', userId);
        
      console.info('Conexão Spotify removida para usuário');
    } catch (error) {
      console.warn('Erro ao limpar conexão Spotify:', error);
    }
  }

  /**
   * Verifica se o usuário tem uma conexão Spotify válida
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>}
   */
  async hasValidSpotifyConnection(userId) {
    const token = await this.getAccessToken(userId);
    return !!token;
  }

  /**
   * Faz uma requisição autenticada para a API do Spotify
   * @param {string} userId - ID do usuário
   * @param {string} endpoint - Endpoint da API do Spotify
   * @param {object} options - Opções da requisição
   * @returns {Promise<Response>}
   */
  async makeSpotifyRequest(userId, endpoint, options = {}) {
    const token = await this.getAccessToken(userId);
    
    if (!token) {
      throw new Error('Token Spotify não disponível');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expirado, tenta renovar
      this.tokenCache.delete(userId);
      const newToken = await this.getAccessToken(userId);
      
      if (newToken) {
        // Tenta novamente com o novo token
        return fetch(`https://api.spotify.com/v1${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      }
    }

    return response;
  }

  /**
   * Limpa o cache de tokens
   */
  clearCache(userId = null) {
    if (userId) {
      this.tokenCache.delete(userId);
    } else {
      this.tokenCache.clear();
    }
  }
}

export const spotifyTokenService = new SpotifyTokenService();