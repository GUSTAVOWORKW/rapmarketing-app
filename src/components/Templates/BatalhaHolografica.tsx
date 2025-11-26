import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const BatalhaHolografica: React.FC<Partial<SmartLink>> = ({
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
}) => {
  useEffect(() => {
    // Estilos específicos do template Batalha Holográfica
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
      
      .batalha-holografica {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f0f 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Orbitron', monospace;
      }
      
      .batalha-holografica::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          repeating-linear-gradient(90deg, transparent, transparent 98px, rgba(0, 255, 127, 0.1) 100px),
          radial-gradient(circle at 20% 20%, rgba(255, 165, 0, 0.1) 1px, transparent 1px),
          radial-gradient(circle at 80% 80%, rgba(0, 255, 127, 0.1) 1px, transparent 1px);
        background-size: 100px 100px, 200px 200px, 300px 300px;
        animation: matrix-flow 20s linear infinite, float-particles 30s linear infinite;
        pointer-events: none;
      }
      
      @keyframes matrix-flow {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      
      @keyframes float-particles {
        0% { transform: translate(0, 0) rotate(0deg); }
        100% { transform: translate(-50px, -100px) rotate(360deg); }
      }
      
      .batalha-holografica::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 127, 0.05) 2px, rgba(0, 255, 127, 0.05) 4px);
        animation: scan 2s linear infinite;
        pointer-events: none;
      }
      
      @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      
      .hologram-avatar {
        position: relative;
        border-radius: 50%;
        border: 3px solid #00ff7f;
        box-shadow: 0 0 20px rgba(0, 255, 127, 0.5);
      }
      
      .hologram-avatar::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border-radius: 50%;
        border: 2px solid transparent;
        background: linear-gradient(45deg, #1e90ff, #00ff7f, #ffa500, #1e90ff);
        background-size: 400% 400%;
        animation: hologram-rotate 3s linear infinite;
        z-index: -1;
      }
      
      @keyframes hologram-rotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .hologram-text {
        background: linear-gradient(45deg, #1e90ff, #00ff7f, #ffa500);
        background-size: 400% 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: text-glow 3s ease-in-out infinite;
        text-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
      }
      
      @keyframes text-glow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      .hologram-btn {
        background: rgba(0, 0, 0, 0.4);
        border: 2px solid rgba(0, 255, 127, 0.6);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .hologram-btn:hover {
        background: rgba(0, 255, 127, 0.1);
        border-color: #00ff7f;
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 255, 127, 0.4);
      }
      
      .hologram-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 127, 0.3), transparent);
        transition: left 0.5s ease;
      }
      
      .hologram-btn:hover::before {
        left: 100%;
      }
      
      .social-hologram {
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(30, 144, 255, 0.4);
        border-radius: 50%;
        padding: 0.5rem;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .social-hologram:hover {
        color: #1e90ff;
        transform: scale(1.2);
        border-color: #1e90ff;
        box-shadow: 0 0 15px rgba(30, 144, 255, 0.6);
      }
      
      .social-hologram::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        margin: -30px 0 0 -30px;
        border-radius: 50%;
        border: 1px solid rgba(30, 144, 255, 0.3);
        animation: social-pulse 2s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes social-pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.8; }
      }

      .spotify-hologram-container {
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(0, 255, 127, 0.6);
        box-shadow: 
          0 0 20px rgba(0, 255, 127, 0.3),
          inset 0 0 20px rgba(0, 255, 127, 0.1);
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.3);
      }
      
      .cover-hologram {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(30, 144, 255, 0.6);
      }
      
      .cover-hologram::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(30, 144, 255, 0.1), 
          rgba(0, 255, 127, 0.1), 
          rgba(255, 165, 0, 0.1)
        );
        mix-blend-mode: overlay;
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
    <div className="batalha-holografica text-white p-4">      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10"><div className="relative inline-block mb-4">
          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-20 h-20 mx-auto hologram-avatar object-cover" 
          />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 border border-cyan-400 rounded-full animate-pulse opacity-30"></div>
        </div><h1 className="text-2xl font-bold hologram-text font-['Orbitron'] uppercase tracking-wider">
          {artist_name || 'MC Batalha'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-cyan-300 font-light mt-1">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">        {hasPlayer ? (
          <div className="spotify-hologram-container my-4 max-w-md mx-auto">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(player_url!);
              if (!embedUrl) {
                return (
                  <div className="text-red-400 text-center p-2 bg-red-900/50 rounded-md text-sm">
                    URL do Spotify inválida.
                  </div>
                );
              }
              return (
                <iframe
                  style={{ borderRadius: '12px' }}
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
            <div className="cover-hologram max-w-sm mx-auto mb-4">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}{bio && <p className="text-center max-w-lg mx-auto mb-6 text-gray-300 text-sm">{bio}</p>}

        {/* Links de Plataformas de Streaming */}
        <section className="max-w-md mx-auto mb-6">
          <div className="flex flex-col space-y-3">
            {finalPlatforms?.map((platform, index) => {
              const Icon = platform.icon;
              // Não mostra o botão do Spotify se já tem player
              if (platform.platform_id === 'spotify' && hasPlayer) {
                return null;
              }
              return (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hologram-btn flex items-center justify-center p-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wide"
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
          <section className="max-w-md mx-auto mb-6">
            <a
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hologram-btn flex items-center justify-center p-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wide w-full"
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
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-hologram text-white text-xl"
                    aria-label={link.name}
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

export default BatalhaHolografica;
