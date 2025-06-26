import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const SertaoHolografico: React.FC<Partial<SmartLink>> = ({
  artist_name,
  artist_title,
  title,
  bio,
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
    // Estilos específicos do template Sertão Holográfico
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
      
      .sertao-holografico {
        background: linear-gradient(135deg, #8B4513 0%, #CD853F 25%, #DAA520 50%, #B8860B 75%, #654321 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Fredoka', cursive;
      }
      
      .sertao-holografico::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 30% 20%, rgba(0, 100, 200, 0.15) 2px, transparent 2px),
          radial-gradient(circle at 70% 80%, rgba(34, 139, 34, 0.15) 1px, transparent 1px),
          radial-gradient(circle at 20% 60%, rgba(255, 215, 0, 0.1) 1px, transparent 1px);
        background-size: 150px 150px, 200px 200px, 100px 100px;
        animation: estrelas-sertao 25s linear infinite, vento-sertao 15s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes estrelas-sertao {
        0% { transform: translateY(0) translateX(0); }
        100% { transform: translateY(-20px) translateX(30px); }
      }
      
      @keyframes vento-sertao {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
      }
      
      .sertao-holografico::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(0, 100, 200, 0.03) 22px,
            rgba(0, 100, 200, 0.03) 24px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 15px,
            rgba(34, 139, 34, 0.03) 17px,
            rgba(34, 139, 34, 0.03) 19px
          );
        pointer-events: none;
      }
      
      .renda-holografica {
        position: relative;
        border-radius: 50%;
        border: 3px solid #DAA520;
        box-shadow: 0 0 20px rgba(218, 165, 32, 0.4);
      }
      
      .renda-holografica::before {
        content: '';
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 50%;
        border: 2px dashed transparent;
        background: linear-gradient(45deg, #0064C8, #228B22, #DAA520, #0064C8);
        background-size: 400% 400%;
        animation: renda-bordado 4s linear infinite;
        z-index: -1;
        mask: 
          radial-gradient(circle at 25% 25%, transparent 2px, black 4px),
          radial-gradient(circle at 75% 25%, transparent 2px, black 4px),
          radial-gradient(circle at 25% 75%, transparent 2px, black 4px),
          radial-gradient(circle at 75% 75%, transparent 2px, black 4px),
          radial-gradient(circle at 50% 0%, transparent 2px, black 4px),
          radial-gradient(circle at 50% 100%, transparent 2px, black 4px),
          radial-gradient(circle at 0% 50%, transparent 2px, black 4px),
          radial-gradient(circle at 100% 50%, transparent 2px, black 4px);
      }
      
      @keyframes renda-bordado {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .cordel-text {
        background: linear-gradient(45deg, #0064C8, #228B22, #DAA520);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: cordel-brilho 4s ease-in-out infinite;
        text-shadow: 0 0 10px rgba(218, 165, 32, 0.3);
        position: relative;
      }
      
      .cordel-text::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        animation: xilogravura-scan 3s ease-in-out infinite;
        z-index: 1;
      }
      
      @keyframes cordel-brilho {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes xilogravura-scan {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .forró-btn {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.3), rgba(218, 165, 32, 0.2));
        border: 2px solid rgba(218, 165, 32, 0.6);
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .forró-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(218, 165, 32, 0.4), 
          transparent
        );
        transition: left 0.6s ease;
      }
      
      .forró-btn:hover {
        background: linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(0, 100, 200, 0.1));
        border-color: #DAA520;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(218, 165, 32, 0.3);
      }
      
      .forró-btn:hover::before {
        left: 100%;
      }
      
      .social-sertao {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(34, 139, 34, 0.2));
        border: 2px solid rgba(34, 139, 34, 0.5);
        border-radius: 50%;
        padding: 0.5rem;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .social-sertao:hover {
        color: #228B22;
        transform: scale(1.15) rotate(5deg);
        border-color: #228B22;
        box-shadow: 0 0 15px rgba(34, 139, 34, 0.5);
      }
      
      .social-sertao::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 50px;
        height: 50px;
        margin: -25px 0 0 -25px;
        border-radius: 50%;
        border: 1px solid rgba(34, 139, 34, 0.3);
        animation: sertao-pulse 2.5s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes sertao-pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.3); opacity: 0.7; }
      }

      .spotify-sertao-container {
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(218, 165, 32, 0.6);
        box-shadow: 
          0 0 20px rgba(218, 165, 32, 0.2),
          inset 0 0 20px rgba(139, 69, 19, 0.1);
        backdrop-filter: blur(8px);
        background: rgba(139, 69, 19, 0.2);
      }
      
      .capa-sertao {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(0, 100, 200, 0.5);
      }
      
      .capa-sertao::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(0, 100, 200, 0.1), 
          rgba(34, 139, 34, 0.1), 
          rgba(218, 165, 32, 0.1)
        );
        mix-blend-mode: overlay;
      }
      
      .mandacaru-decoration {
        position: absolute;
        top: 10%;
        right: 5%;
        width: 30px;
        height: 40px;
        background: linear-gradient(180deg, #228B22, #32CD32);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        opacity: 0.3;
        animation: mandacaru-sway 6s ease-in-out infinite;
      }
      
      .mandacaru-decoration::before {
        content: '';
        position: absolute;
        top: -5px;
        left: 5px;
        width: 8px;
        height: 8px;
        background: #FFD700;
        border-radius: 50%;
        animation: flor-mandacaru 4s ease-in-out infinite;
      }
      
      @keyframes mandacaru-sway {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      
      @keyframes flor-mandacaru {
        0%, 50%, 100% { opacity: 1; transform: scale(1); }
        25%, 75% { opacity: 0.5; transform: scale(1.2); }
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
    <div className="sertao-holografico text-white p-4 relative">
      {/* Decoração Mandacaru */}
      <div className="mandacaru-decoration"></div>
      
      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">
          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-20 h-20 mx-auto renda-holografica object-cover" 
          />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 border border-yellow-400 rounded-full animate-pulse opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold cordel-text font-['Fredoka'] uppercase tracking-wide">
          {artist_name || 'Cantador do Sertão'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-yellow-200 font-medium mt-1">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="spotify-sertao-container my-4 max-w-md mx-auto">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(player_url!);
              if (!embedUrl) {
                return (
                  <div className="text-red-300 text-center p-2 bg-red-800/50 rounded-md text-sm">
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
            <div className="capa-sertao max-w-sm mx-auto mb-4">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}

        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-yellow-100 text-sm leading-relaxed">{bio}</p>}

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
                  className="forró-btn flex items-center justify-center p-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wide"
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
              className="forró-btn flex items-center justify-center p-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wide w-full"
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
                    className="social-sertao text-white text-xl"
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

export default SertaoHolografico;
