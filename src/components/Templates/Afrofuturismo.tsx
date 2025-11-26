import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const Afrofuturismo: React.FC<Partial<SmartLink>> = ({
  id, // Adicionando ID para tracking
  artist_name,
  artist_title,
  title,
  bio,
  feat, // Featuring/participação especial
  avatar_url,
  release_title,
  cover_image_url,
  player_url,
  platforms = [],
  social_links = [],
  contact_button_text = 'Contato',
  contact_button_url,
}) => {  // Hook de tracking
  const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();

  // Track page view on component mount
  useEffect(() => {
    if (id) {
      trackPageView(id, 'smartlink');
    }
  }, [id, trackPageView]);

  useEffect(() => {
    // Estilos específicos do template Afrofuturismo
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Exo+2:wght@300;400;600&display=swap');
      
      .afrofuturismo {
        background: radial-gradient(ellipse at center, #2F1B69 0%, #1A0F3D 50%, #0D0621 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Exo 2', sans-serif;
      }
      
      .afrofuturismo::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.1) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(205, 127, 50, 0.1) 1px, transparent 1px),
          radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.08) 3px, transparent 3px),
          radial-gradient(circle at 10% 90%, rgba(0, 71, 171, 0.08) 2px, transparent 2px);
        background-size: 120px 120px, 180px 180px, 200px 200px, 150px 150px;
        animation: energia-ancestral 30s linear infinite, circuitos-tribais 20s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes energia-ancestral {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-30px) rotate(360deg); }
      }
      
      @keyframes circuitos-tribais {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      .afrofuturismo::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(45deg, transparent 48%, rgba(255, 215, 0, 0.03) 49%, rgba(255, 215, 0, 0.03) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(205, 127, 50, 0.03) 49%, rgba(205, 127, 50, 0.03) 51%, transparent 52%);
        animation: padroes-geometricos 25s linear infinite;
        pointer-events: none;
      }
      
      @keyframes padroes-geometricos {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(50px) translateY(-25px); }
      }
        .coroa-ancestral {
        position: relative;
        border-radius: 50%;
        border: 4px solid #FFD700;
        box-shadow: 
          0 0 30px rgba(255, 215, 0, 0.6),
          inset 0 0 20px rgba(255, 215, 0, 0.2);
      }
      
      .coroa-ancestral::before {
        content: '';
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 50%;
        border: 4px solid transparent;
        background: linear-gradient(45deg, #FFD700, #CD7F32, #8A2BE2, #FFD700);
        background-size: 200% 200%;
        animation: coroa-real 3s linear infinite;
        z-index: -1;
      }
      
      @keyframes coroa-real {
        0% { 
          background-position: 0% 50%; 
          transform: rotate(0deg);
          opacity: 0.8;
        }
        50% { 
          opacity: 1;
        }
        100% { 
          background-position: 100% 50%; 
          transform: rotate(360deg);
          opacity: 0.8;
        }
      }
      
      .coroa-ancestral::after {
        content: '👑';
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        animation: coroa-float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
        z-index: 10;
      }
        @keyframes coroa-float {
        0%, 100% { transform: translateX(-50%) translateY(0px); }
        50% { transform: translateX(-50%) translateY(-5px); }
      }
      
      /* Animação para os pontos da coroa */
      .coroa-pontos {
        animation: pontos-brilho 2s ease-in-out infinite;
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
      }
      
      @keyframes pontos-brilho {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      
      .nome-ancestral {
        background: linear-gradient(45deg, #FFD700, #CD7F32, #8A2BE2);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: nome-poder 5s ease-in-out infinite;
        font-family: 'Cinzel', serif;
        position: relative;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
      
      .nome-ancestral::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: adinkra-scan 4s ease-in-out infinite;
        z-index: 1;
      }
      
      @keyframes nome-poder {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes adinkra-scan {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      
      .botao-ancestral {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(205, 127, 50, 0.15));
        border: 2px solid rgba(255, 215, 0, 0.6);
        backdrop-filter: blur(12px);
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
      }
      
      .botao-ancestral::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 215, 0, 0.4), 
          rgba(138, 43, 226, 0.2),
          transparent
        );
        transition: left 0.8s ease;
      }
      
      .botao-ancestral:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(138, 43, 226, 0.15));
        border-color: #FFD700;
        transform: translateY(-3px);
        box-shadow: 
          0 8px 25px rgba(255, 215, 0, 0.4),
          0 0 40px rgba(138, 43, 226, 0.3);
      }
      
      .botao-ancestral:hover::before {
        left: 100%;
      }
      
      .social-ancestral {
        background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(0, 71, 171, 0.2));
        border: 2px solid rgba(205, 127, 50, 0.5);
        border-radius: 50%;
        padding: 0.6rem;
        transition: all 0.4s ease;
        position: relative;
      }
      
      .social-ancestral:hover {
        color: #CD7F32;
        transform: scale(1.2) rotate(10deg);
        border-color: #CD7F32;
        box-shadow: 
          0 0 20px rgba(205, 127, 50, 0.6),
          0 0 40px rgba(255, 215, 0, 0.3);
      }
      
      .social-ancestral::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 55px;
        height: 55px;
        margin: -27.5px 0 0 -27.5px;
        border-radius: 50%;
        border: 1px solid rgba(205, 127, 50, 0.4);
        animation: ancestral-pulse 3s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes ancestral-pulse {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.4); opacity: 0.8; }
      }

      .spotify-ancestral-container {
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(255, 215, 0, 0.7);
        box-shadow: 
          0 0 30px rgba(255, 215, 0, 0.3),
          inset 0 0 30px rgba(138, 43, 226, 0.1);
        backdrop-filter: blur(15px);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(205, 127, 50, 0.1));
      }
      
      .capa-ancestral {
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(138, 43, 226, 0.6);
      }
      
      .capa-ancestral::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(255, 215, 0, 0.15), 
          rgba(205, 127, 50, 0.15), 
          rgba(138, 43, 226, 0.15),
          rgba(0, 71, 171, 0.15)
        );
        mix-blend-mode: overlay;
      }
      
      .simbolos-adinkra {
        position: absolute;
        top: 5%;
        right: 8%;
        font-size: 24px;
        opacity: 0.4;
        animation: adinkra-float 8s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
      }
      
      .simbolos-adinkra::before {
        content: '⚡';
        position: absolute;
        top: -30px;
        left: -20px;
        font-size: 18px;
        animation: adinkra-float 6s ease-in-out infinite reverse;
      }
      
      .simbolos-adinkra::after {
        content: '◊';
        position: absolute;
        bottom: -25px;
        right: -15px;
        font-size: 20px;
        animation: adinkra-float 7s ease-in-out infinite;
      }
      
      @keyframes adinkra-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-8px) rotate(5deg); }
        66% { transform: translateY(4px) rotate(-3deg); }
      }
      
      .energia-divina {
        position: absolute;
        top: 15%;
        left: 5%;
        width: 40px;
        height: 60px;
        background: linear-gradient(180deg, rgba(255, 215, 0, 0.3), rgba(138, 43, 226, 0.3));
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        opacity: 0.4;
        animation: energia-flow 10s ease-in-out infinite;
        filter: blur(1px);
      }
      
      @keyframes energia-flow {
        0%, 100% { transform: translateY(0px) scaleY(1); opacity: 0.4; }
        50% { transform: translateY(-15px) scaleY(1.2); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Lógica para mapear IDs para dados completos (ícones, nomes)
  const finalPlatforms = (platforms || [])
    .filter(link => link.url && link.platform_id)
    .map(link => {
      const platformData = PLATFORMS.find(p => p.id === link.platform_id);
      return { ...link, ...platformData };
    });

  const finalSocials = (social_links || [])
    .filter(link => link.url && link.platform)
    .map(link => {
      const socialData = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
      return { ...link, ...socialData };
    });

  const hasPlayer = player_url && player_url.includes('open.spotify.com');

  return (
    <div className="afrofuturismo text-white p-4 relative">
      {/* Decorações Culturais */}
      <div className="simbolos-adinkra">🔯</div>
      <div className="energia-divina"></div>
      
      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10">        <div className="relative inline-block mb-4">
          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-20 h-20 mx-auto coroa-ancestral object-cover" 
          />
          {/* Círculo pulsante dourado */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 -mt-14 -ml-14 border-2 border-amber-400 rounded-full animate-pulse opacity-30"></div>          {/* Pontos da coroa */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xs coroa-pontos">◆</div>
          <div className="absolute -top-1 left-3 text-yellow-400 text-xs coroa-pontos" style={{animationDelay: '0.2s'}}>◆</div>
          <div className="absolute -top-1 right-3 text-yellow-400 text-xs coroa-pontos" style={{animationDelay: '0.4s'}}>◆</div>
          <div className="absolute top-1 -left-2 text-yellow-400 text-xs coroa-pontos" style={{animationDelay: '0.6s'}}>◆</div>
          <div className="absolute top-1 -right-2 text-yellow-400 text-xs coroa-pontos" style={{animationDelay: '0.8s'}}>◆</div>
        </div>
        <h1 className="text-2xl font-bold nome-ancestral uppercase tracking-wider">
          {artist_name || 'Ancestral Digital'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-amber-200 font-light mt-1 tracking-wide">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="spotify-ancestral-container my-4 max-w-md mx-auto">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(player_url!);
              if (!embedUrl) {
                return (
                  <div className="text-red-300 text-center p-2 bg-red-900/50 rounded-md text-sm">
                    URL do Spotify inválida.
                  </div>
                );
              }
              return (
                <iframe
                  style={{ borderRadius: '15px' }}
                  src={embedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Player"
                />
              );
            })()}
          </div>
        ) : (
          cover_image_url && (
            <div className="capa-ancestral max-w-sm mx-auto mb-4">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}

        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-amber-100 text-sm leading-relaxed font-light">{bio}</p>}

        {/* Links de Plataformas de Streaming */}
        <section className="max-w-md mx-auto mb-6">
          <div className="flex flex-col space-y-3">
            {finalPlatforms?.map((platform, index) => {
              const Icon = platform.icon;
              // Não mostra o botão do Spotify se já tem player
              if (platform.platform_id === 'spotify' && hasPlayer) {
                return null;
              }
              return (                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="botao-ancestral flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide"
                  onClick={() => {
                    if (id && platform.platform_id) {
                      trackClick(id, 'smartlink', platform.platform_id);
                    }
                  }}
                >
                  {Icon && <Icon className="w-5 h-5 mr-2" />}
                  <span>{platform.name}</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Botão de Contato */}
        {contact_button_url && (
          <section className="max-w-md mx-auto mb-6">            <a
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-ancestral flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide w-full"              onClick={() => {
                if (id) {
                  trackCustomEvent(id, 'smartlink', 'contact_click');
                }
              }}
            >
              {contact_button_text}
            </a>
          </section>
        )}

        {/* Redes Sociais */}
        {finalSocials.length > 0 && (
          <footer className="text-center">
            <div className="flex justify-center items-center space-x-4 flex-wrap gap-3">
              {finalSocials.map((link, index) => {
                const Icon = link.icon;
                return (                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-ancestral text-white text-xl"
                    aria-label={link.name}                    onClick={() => {
                      if (id && link.platform) {
                        trackShare(id, 'smartlink', link.platform);
                      }
                    }}
                  >
                    {Icon && <Icon />}
                  </a>
                );
              })}
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default Afrofuturismo;
