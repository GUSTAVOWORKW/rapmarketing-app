// pages/PresavePage.js - Página pública do pré-save (Mobile-First)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpotify, FaApple, FaAmazon, FaYoutube, FaPlay, FaShare, FaArrowLeft, FaCheck, FaExclamationTriangle, FaTimes, FaInstagram, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { SiTidal, SiDeezer, SiSoundcloud, SiYoutubemusic, SiThreads } from 'react-icons/si';
import { getPresaveBySlug } from '../services/presaveService';
import { getSpotifyAuthUrl } from '../services/streamingService';
import PresaveTemplateRenderer from '../components/presave/PresaveTemplateRenderer';

const PresavePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [presave, setPresave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReleased, setIsReleased] = useState(false);
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);  };

  // Efeito para lidar com notificações de callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const message = params.get('message');

    if (status) {
      if (status === 'success') {
        showNotification('Pré-save realizado com sucesso!', 'success');
      } else if (status === 'error') {
        showNotification(message || 'Ocorreu um erro ao realizar o pré-save.', 'error');
      }
      // Limpar os parâmetros da URL para evitar que a notificação reapareça
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  // ✅ Tracking removido - será feito pelos templates usando useMetricsTracking hook
  // Removidas funções handleRecordView e handleRecordClick

  useEffect(() => {
    const loadPresave = async () => {
      try {
        setLoading(true);
        const data = await getPresaveBySlug(slug);
        setPresave(data);        // Verificar se já foi lançado
        const releaseDate = new Date(data.release_date);
        const now = new Date();
        setIsReleased(now >= releaseDate);
        
        // ✅ Page view será registrado automaticamente pelo template via useMetricsTracking
        
      } catch (err) {
        console.error('Erro ao carregar pré-save:', err);
        setError(err.message || 'Pré-save não encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPresave();
    }
  }, [slug]);

  const handlePlatformClick = (platformId, url) => {
    if (!url) return;

    if (platformId === 'spotify' && !isReleased) {
      // Lógica de pré-save para Spotify
      const authUrl = getSpotifyAuthUrl(presave.id);
      window.location.href = authUrl;
    } else {
      // Comportamento padrão para outras plataformas ou após o lançamento
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${presave.artist_name} - ${presave.track_name}`,
          text: `Confira o novo lançamento de ${presave.artist_name}!`,
          url: url,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showNotification('Link copiado para a área de transferência!', 'success');
      } catch (err) {
        showNotification('Erro ao copiar link', 'error');
      }
    }
  };

  // Função para mapear ícones dos social links
  const getSocialLinksWithIcons = () => {
    if (!presave?.sociallinks) return [];
    
    return presave.sociallinks.map((socialLink) => {
      const platform = socialLink.platform;
      let icon = FaShare; // Ícone padrão
      let color = socialLink.color || '#333';
      let name = socialLink.platformName || 'Rede Social';
      
      // Mapear ícones específicos
      switch (platform) {
        case 'instagram':
          icon = FaInstagram;
          color = '#E4405F';
          name = 'Instagram';
          break;
        case 'facebook':
          icon = FaFacebook;
          color = '#1877F2';
          name = 'Facebook';
          break;
        case 'twitter':
          icon = FaTwitter;
          color = '#000000';
          name = 'Twitter/X';
          break;
        case 'threads':
          icon = SiThreads;
          color = '#000000';
          name = 'Threads';
          break;
        case 'whatsapp':
          icon = FaWhatsapp;
          color = '#25D366';
          name = 'WhatsApp';
          break;
        default:
          // Tentar detectar pela URL se a platform não for reconhecida
          if (socialLink.url) {
            if (socialLink.url.includes('instagram.com')) {
              icon = FaInstagram;
              color = '#E4405F';
              name = 'Instagram';
            } else if (socialLink.url.includes('facebook.com')) {
              icon = FaFacebook;
              color = '#1877F2';
              name = 'Facebook';
            } else if (socialLink.url.includes('twitter.com') || socialLink.url.includes('x.com')) {
              icon = FaTwitter;
              color = '#000000';
              name = 'Twitter/X';
            } else if (socialLink.url.includes('threads.net')) {
              icon = SiThreads;
              color = '#000000';
              name = 'Threads';
            } else if (socialLink.url.includes('whatsapp.com')) {
              icon = FaWhatsapp;
              color = '#25D366';
              name = 'WhatsApp';
            }
          }
          break;
      }
      
      return {
        ...socialLink,
        icon,
        color,
        platformName: name
      };
    });
  };  const getAvailablePlatforms = () => {
    if (!presave?.platforms) return [];
    
    return Object.entries(presave.platforms)
      .filter(([_, url]) => url && url.trim() && url !== '')
      .map(([platformId, url]) => {
        // Detectar plataforma pela URL se o platformId for inválido
        let detectedPlatform = platformId;
        let icon = FaPlay;
        let color = '#333';
        let name = 'Plataforma';
        
        if (platformId === 'undefined' || platformId === 'null' || !platformId) {
          if (url.includes('spotify.com')) {
            detectedPlatform = 'spotify';
            icon = FaSpotify;
            color = '#1DB954';
            name = 'Spotify';
          } else if (url.includes('music.apple.com')) {
            detectedPlatform = 'apple-music';
            icon = FaApple;
            color = '#FA243C';
            name = 'Apple Music';
          } else if (url.includes('music.amazon.com')) {
            detectedPlatform = 'amazon-music';
            icon = FaAmazon;
            color = '#FF9900';
            name = 'Amazon Music';
          } else if (url.includes('music.youtube.com')) {
            detectedPlatform = 'youtube-music';
            icon = SiYoutubemusic;
            color = '#FF0000';
            name = 'YouTube Music';
          } else if (url.includes('youtube.com')) {
            detectedPlatform = 'youtube';
            icon = FaYoutube;
            color = '#FF0000';
            name = 'YouTube';
          } else if (url.includes('tidal.com')) {
            detectedPlatform = 'tidal';
            icon = SiTidal;
            color = '#00FFFF';
            name = 'Tidal';
          } else if (url.includes('deezer.com')) {
            detectedPlatform = 'deezer';
            icon = SiDeezer;
            color = '#FEAA2D';
            name = 'Deezer';
          } else if (url.includes('soundcloud.com')) {
            detectedPlatform = 'soundcloud';
            icon = SiSoundcloud;
            color = '#FF5500';
            name = 'SoundCloud';
          }
        } else {
          // Se o platformId é válido, mapear diretamente
          switch (detectedPlatform) {
            case 'spotify':
              icon = FaSpotify;
              color = '#1DB954';
              name = 'Spotify';
              break;
            case 'apple-music':
              icon = FaApple;
              color = '#FA243C';
              name = 'Apple Music';
              break;
            case 'amazon-music':
              icon = FaAmazon;
              color = '#FF9900';
              name = 'Amazon Music';
              break;
            case 'youtube-music':
              icon = SiYoutubemusic;
              color = '#FF0000';
              name = 'YouTube Music';
              break;
            case 'youtube':
              icon = FaYoutube;
              color = '#FF0000';
              name = 'YouTube';
              break;
            case 'tidal':
              icon = SiTidal;
              color = '#00FFFF';
              name = 'Tidal';
              break;
            case 'deezer':
              icon = SiDeezer;
              color = '#FEAA2D';
              name = 'Deezer';
              break;            case 'soundcloud':
              icon = SiSoundcloud;
              color = '#FF5500';
              name = 'SoundCloud';
              break;
            default:
              icon = FaPlay;
              color = '#666666';
              name = 'Streaming';
              break;
          }
        }
        
        return {
          id: detectedPlatform,
          name: name,
          url,
          icon: icon,
          color: color,
        };
      });  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pré-save...</p>
        </div>
      </div>
    );
  }

  if (error || !presave) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pré-save não encontrado</h1>
          <p className="text-gray-600 mb-6">
            O link que você tentou acessar não existe ou foi removido.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Voltar à página inicial
          </button>
        </div>
      </div>
    );  }

  const platforms = getAvailablePlatforms();
  const socialLinksWithIcons = getSocialLinksWithIcons();

  return (
    <div className="min-h-screen relative">
      {/* Notificação personalizada */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto transform transition-all duration-300 ease-in-out ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white p-4 rounded-lg shadow-lg flex items-center justify-between`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FaCheck className="mr-3 text-lg" />
            ) : (
              <FaExclamationTriangle className="mr-3 text-lg" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-3 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      {/* Botão de compartilhar fixo */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={handleShare}
          className="p-3 bg-black bg-opacity-20 backdrop-blur-md rounded-full text-white hover:bg-opacity-30 transition-all shadow-lg"
        >
          <FaShare className="text-lg" />
        </button>
      </div>

      {/* Template do Pré-save em tela cheia */}
      <div className="w-full h-screen">        <PresaveTemplateRenderer
          templateId={presave.template_id || 'default'}
          presaveData={presave}
          platformLinks={platforms}
          socialLinks={socialLinksWithIcons}
          isReleased={isReleased}
          onPlatformClick={handlePlatformClick}
        />
      </div>
    </div>
  );
};

export default PresavePage;
