// src/hooks/useSpotifyToken.js
import { useState, useEffect, useCallback } from 'react';
import { spotifyTokenService } from '../services/spotifyTokenService';
import { useAuth } from './useAuth';

export const useSpotifyToken = () => {
    const { user } = useAuth();
    const [tokenStatus, setTokenStatus] = useState({
        isLoading: true,
        isConnected: false,
        hasValidToken: false,
        error: null
    });

    // Verifica o status da conexão Spotify
    const checkTokenStatus = useCallback(async () => {
        if (!user?.id) {
            setTokenStatus({
                isLoading: false,
                isConnected: false,
                hasValidToken: false,
                error: 'Usuário não autenticado'
            });
            return;
        }

        try {
            setTokenStatus(prev => ({ ...prev, isLoading: true, error: null }));

            // Verifica se tem conexão Spotify válida
            const hasConnection = await spotifyTokenService.hasValidSpotifyConnection(user.id);

            setTokenStatus({
                isLoading: false,
                isConnected: hasConnection,
                hasValidToken: hasConnection,
                error: null
            });

        } catch (error) {
            console.error('[useSpotifyToken] Erro ao verificar status:', error);
            setTokenStatus({
                isLoading: false,
                isConnected: false,
                hasValidToken: false,
                error: 'Erro ao verificar conexão Spotify'
            });
        }
    }, [user?.id]);

    // Obtém um token válido
    const getValidToken = useCallback(async () => {
        if (!user?.id) {
            return null;
        }

        try {
            const token = await spotifyTokenService.getAccessToken(user.id);
            
            // Atualiza o status com base no resultado
            if (token) {
                setTokenStatus(prev => ({
                    ...prev,
                    hasValidToken: true,
                    error: null
                }));
            } else {
                setTokenStatus(prev => ({
                    ...prev,
                    hasValidToken: false,
                    error: 'Token não disponível'
                }));
            }

            return token;
        } catch (error) {
            console.error('[useSpotifyToken] Erro ao obter token:', error);
            setTokenStatus(prev => ({
                ...prev,
                hasValidToken: false,
                error: 'Erro ao obter token'
            }));
            return null;
        }
    }, [user?.id]);

    // Faz uma chamada autenticada para a API do Spotify
    const makeSpotifyRequest = useCallback(async (url, options = {}) => {
        const token = await getValidToken();
        
        if (!token) {
            throw new Error('Token Spotify não disponível');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token ainda inválido, atualiza status
            setTokenStatus(prev => ({
                ...prev,
                hasValidToken: false,
                error: 'Token expirado'
            }));
            throw new Error('Token Spotify expirado');
        }

        if (!response.ok) {
            throw new Error(`Erro da API Spotify: ${response.status} ${response.statusText}`);
        }

        return response;
    }, [getValidToken]);

    // Força uma verificação de token
    const refreshTokenStatus = useCallback(() => {
        spotifyTokenService.clearCache();
        checkTokenStatus();
    }, [checkTokenStatus]);

    // Verifica status inicial
    useEffect(() => {
        checkTokenStatus();
    }, [checkTokenStatus]);

    return {
        ...tokenStatus,
        getValidToken,
        makeSpotifyRequest,
        refreshTokenStatus,
        checkTokenStatus
    };
};

export default useSpotifyToken;
