import React, { useEffect, useState } from 'react';
import { spotifyTokenService } from '../../services/spotifyTokenService';
import { FaSpotify, FaExclamationTriangle } from 'react-icons/fa';
import { useSpotifyConnection } from '../../hooks/useSpotifyConnection';
import { useAuth } from '../../context/AuthContext';

// Componente para exibir seguidores do Spotify
const SpotifyFollowersCounter = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isConnected, hasValidToken, loading: connectionLoading, refresh } = useSpotifyConnection();  useEffect(() => {
    const fetchSpotifyFollowers = async () => {
      // Se não estiver conectado, não fazer nada
      if (!isConnected) {
        setFollowers('-');
        setError('');
        return;
      }

      // Se não tem token válido, mostrar erro de token expirado
      if (!hasValidToken) {
        setFollowers('-');
        setError('Token expirado');
        return;
      }

      setLoading(true);
      setError('');
      setFollowers(null);
      
      try {        // Obtém token válido
        const accessToken = await spotifyTokenService.getAccessToken(user.id);
        
        if (!accessToken) {
          console.warn('Não foi possível obter token válido do Spotify');
          setError('Token do Spotify não disponível');
          setFollowers('-');
          return;
        }

        // Chama a API do Spotify para pegar dados do usuário
        const resp = await fetch('https://api.spotify.com/v1/me', {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resp.ok) {
          if (resp.status === 401) {
            console.warn('Token do Spotify ainda inválido após tentativa de refresh');
            setError('Token expirado');
            // Atualizar status da conexão
            refresh();
          } else {
            console.error('Erro da API do Spotify:', resp.status, resp.statusText);
            setError('Erro da API do Spotify');
          }
          setFollowers('-');
          return;
        }

        const data = await resp.json();
        setFollowers(data.followers?.total ?? 0);
        
      } catch (err) {
                console.error('Erro ao buscar seguidores do Spotify:', err);
        setError('Erro ao conectar com Spotify');
        setFollowers('-');
      } finally {
        setLoading(false);
      }
    };

    // Só executar se não estiver carregando a conexão
    if (!connectionLoading) {
      fetchSpotifyFollowers();
    }
  }, [isConnected, hasValidToken, connectionLoading, refresh, user]);

  // Estados de loading
  if (loading || connectionLoading) {
    return (
      <div className="flex items-center justify-center">
        <FaSpotify className="text-green-500 animate-pulse mr-2" />
        <span className="text-2xl font-bold text-white animate-pulse">...</span>
      </div>
    );
  }

  // Erro crítico
  if (error && error !== 'Token expirado' && error !== 'Token do Spotify não disponível') {
    return (
      <div className="flex flex-col items-center text-center">
        <FaExclamationTriangle className="text-yellow-500 mb-1" />
        <span className="text-red-400 text-sm">{error}</span>
      </div>
    );
  }
  // Spotify não conectado
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center text-center">
        <FaSpotify className="text-gray-400 mb-2 text-2xl" />
        <span className="text-white/60 text-sm font-medium">Conecte o Spotify</span>
        <a 
          href="/settings" 
          className="text-green-400 hover:text-green-300 text-xs underline mt-1 transition-colors"
        >
          Conectar agora
        </a>
      </div>
    );
  }

  // Token expirado ou problemas de acesso
  if (error === 'Token expirado' || error === 'Token do Spotify não disponível' || !hasValidToken) {
    return (
      <div className="flex flex-col items-center text-center">
        <FaSpotify className="text-yellow-500 mb-1" />
        <span className="text-yellow-400 text-sm">Token expirado</span>
        <a 
          href="/settings" 
          className="text-green-400 hover:text-green-300 text-xs underline mt-1 transition-colors"
        >
          Reconectar
        </a>
      </div>
    );
  }

  // Sucesso - exibir número de seguidores
  if (typeof followers === 'number') {
    return (
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-5xl font-extrabold text-white">
          {followers.toLocaleString('pt-BR')}
        </span>
        <div className="flex items-center mt-1 text-green-400">
          <FaSpotify className="mr-1 text-sm" />
          <span className="text-xs font-medium">seguidores</span>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center text-center">
      <FaSpotify className="text-gray-400 mb-2 text-2xl" />
      <span className="text-white/60 text-sm font-medium">Dados indisponíveis</span>
    </div>
  );
};

export default SpotifyFollowersCounter;
