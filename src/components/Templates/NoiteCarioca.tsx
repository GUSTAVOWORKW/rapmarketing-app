// src/components/Templates/NoiteCarioca.tsx
import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import type { SmartLink, SocialLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const NoiteCarioca: React.FC<Partial<SmartLink>> = ({
  id, // Adicionado para tracking
  artist_name,
  artist_title,
  title,
  bio,
  avatar_url,
  release_title,
  feat, // Featuring/participação especial
  cover_image_url,
  player_url,
  platforms = [], // Alterado de platform_links para platforms
  social_links = [],
  contact_button_text = 'Contato',
  contact_button_url,
}) => {
  // Hook de tracking - registra page view automaticamente
  const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();

  useEffect(() => {
    // Registrar page view apenas se temos um ID válido
    if (id) {
      trackPageView(id, 'smartlink');
    }
  }, [id, trackPageView]);
  useEffect(() => {
    // Estilos específicos do template Noite Carioca
    const style = document.createElement('style');
    style.textContent = `
      .noite-carioca {
        background: linear-gradient(135deg, #0A0A0A 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0A0A0A 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
      }
      
      .noite-carioca::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .neon-text {
        text-shadow: 0 0 5px #FF1493, 0 0 10px #FF1493, 0 0 15px #FF1493;
      }
      
      .gold-glow {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        border: 2px solid rgba(255, 215, 0, 0.4);
      }
      
      .platform-btn {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 20, 147, 0.1) 100%);
        border: 1px solid rgba(255, 215, 0, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      
      .platform-btn:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 20, 147, 0.2) 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
      }
      
      .social-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      
      .social-btn:hover {
        background: rgba(255, 20, 147, 0.2);
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(255, 20, 147, 0.4);
      }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 215, 0, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      
      .contact-btn {
        background: linear-gradient(135deg, #FFD700, #FF1493);
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        transition: all 0.3s ease;
      }
      
      .contact-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
      }
      
      @media (max-width: 640px) {
        .noite-carioca { padding: 1rem !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { if (style.parentNode) style.parentNode.removeChild(style); };
  }, []);

  // Preparar dados das plataformas, agora lendo da prop `platforms`
  const finalPlatforms = (platforms || [])
    .filter(link => link.url && link.platform_id)
    .map(link => {
      const platformData = PLATFORMS.find(p => p.id === link.platform_id);
      return {
        id: link.platform_id,
        name: platformData?.name || link.platform_id,
        url: link.url,
        icon: platformData?.icon,
        brandColor: platformData?.brand_color
      };
    });

  // Preparar dados das redes sociais, garantindo que não haja nulos
  const finalSocialLinks = (social_links || []).map(social => {
    const socialData = SOCIAL_PLATFORMS.find(sp => sp.id === social.platform);
    if (!socialData) return null;
      
    return {
      id: social.id,
      platform: social.platform,
      url: social.url,
      name: socialData.name,
      icon: socialData.icon,
      color: socialData.color
    };
  }).filter((link): link is SocialLink & { name: string; icon: React.FC<any>; color: string; } => link !== null);

  const finalCoverImageUrl = cover_image_url || '/assets/defaults/default-cover.png';
  const hasPlayer = player_url && player_url.includes('open.spotify.com');

  return (
    <div className="noite-carioca w-full min-h-screen p-2 font-sans relative">
      <div className="max-w-md mx-auto relative z-10">
          {/* Header - Avatar e Nome */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <img 
              src={avatar_url || '/avatars/perfilhomem1.png'} 
              alt={artist_name} 
              className="w-24 h-24 rounded-full object-cover gold-glow" 
            />
          </div>
          <h1 className="text-2xl font-bold text-white neon-text mb-1">
            {artist_name || 'Artista'}
          </h1>
          {feat && (
            <p className="text-pink-300 text-sm font-medium mb-1">
              feat. {feat}
            </p>
          )}
          {artist_title && (
            <p className="text-lg text-yellow-300 font-medium mb-2">
              {artist_title}
            </p>
          )}
          {bio && (
            <p className="text-gray-300 text-sm leading-relaxed glass-card rounded-lg p-3">
              {bio}
            </p>
          )}
        </div>

        {/* Seção Principal - Player ou Capa */}
        <div className="mb-6">          {hasPlayer ? (
            /* Player Spotify */
            <div className="glass-card rounded-xl p-2">
              {(() => {
                const embedUrl = getSpotifyEmbedUrl(player_url!);
                if (!embedUrl) {
                  return (
                    <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-center">
                      <p className="text-red-200 text-sm">⚠️ URL do Spotify inválido</p>
                    </div>
                  );
                }
                return (
                  <iframe 
                    style={{borderRadius:'12px'}} 
                    src={embedUrl} 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title="Spotify Player"
                  />
                );
              })()}
            </div>
          ) : (
            /* Capa e Informações da Música */
            <div className="glass-card rounded-xl p-4">
              <img 
                src={finalCoverImageUrl} 
                alt={release_title || title} 
                className="w-full rounded-lg object-cover mb-4 gold-glow" 
                style={{ aspectRatio: '1/1' }}
              />
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">
                  {release_title || title || 'Nova Música'}
                </h3>
                <p className="text-yellow-300 text-sm">
                  {artist_name || 'Artista'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Links de Streaming */}
        {finalPlatforms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold mb-4 text-center neon-text">
              🎵 Ouça nas Plataformas
            </h2>
            <div className="grid grid-cols-1 gap-3">              {finalPlatforms.map((platform) => {
                const Icon = platform.icon ? platform.icon : () => null;
                return (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="platform-btn flex items-center p-3 rounded-lg text-white font-bold text-lg"
                    onClick={() => {
                      // Registrar click na plataforma se temos ID válido
                      if (id) {
                        trackClick(id, 'smartlink', platform.id);
                      }
                    }}
                  >
                    <Icon className="w-6 h-6 mr-4" />
                    <span>{platform.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Redes Sociais */}
        {finalSocialLinks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold mb-4 text-center neon-text">
              Siga-me
            </h2>
            <div className="flex justify-center items-center space-x-4">              {finalSocialLinks.map((social) => {
                const Icon = social.icon ? social.icon : () => null;
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn w-12 h-12 rounded-full flex items-center justify-center text-white"
                    title={social.name}
                    onClick={() => {
                      // Registrar compartilhamento social se temos ID válido
                      if (id) {
                        trackShare(id, 'smartlink', social.platform);
                      }
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        )}        {/* Botão de Contato */}
        {contact_button_url && (
          <div className="text-center">
            <a 
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn inline-block text-black font-bold py-3 px-8 rounded-full text-lg"
              onClick={() => {
                // Registrar evento de contato se temos ID válido
                if (id) {
                  trackCustomEvent(id, 'smartlink', 'contact_click');
                }
              }}
            >
              {contact_button_text || 'Entre em Contato'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoiteCarioca;
