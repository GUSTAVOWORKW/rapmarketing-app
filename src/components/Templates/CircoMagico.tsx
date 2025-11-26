import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const CircoMagico: React.FC<Partial<SmartLink>> = ({
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
    // Estilos específicos do template Circo Mágico
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Griffy:wght@400&display=swap');
      
      .circo-magico {
        background: radial-gradient(ellipse at center, #8B0000 0%, #4B0000 50%, #2F0000 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Griffy', cursive;
      }
      
      .circo-magico::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.15) 3px, transparent 3px),
          radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.12) 2px, transparent 2px),
          radial-gradient(circle at 40% 60%, rgba(65, 105, 225, 0.12) 2px, transparent 2px),
          radial-gradient(circle at 70% 30%, rgba(255, 69, 0, 0.1) 1px, transparent 1px);
        background-size: 100px 100px, 150px 150px, 120px 120px, 80px 80px;
        animation: confetes-magicos 20s linear infinite, luzes-palco 8s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes confetes-magicos {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-50px) rotate(180deg); }
      }
      
      @keyframes luzes-palco {
        0%, 100% { opacity: 0.4; }
        25% { opacity: 0.8; }
        50% { opacity: 0.6; }
        75% { opacity: 0.9; }
      }
      
      .circo-magico::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 15px,
            rgba(255, 215, 0, 0.05) 16px,
            rgba(255, 215, 0, 0.05) 18px,
            rgba(139, 0, 0, 0.05) 19px,
            rgba(139, 0, 0, 0.05) 21px
          );
        animation: cortinas-circo 15s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes cortinas-circo {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
      }
      
      .cartola-magica {
        position: relative;
        border-radius: 50%;
        border: 4px solid #FFD700;
        box-shadow: 
          0 0 25px rgba(255, 215, 0, 0.6),
          inset 0 0 15px rgba(255, 215, 0, 0.2);
        background: radial-gradient(circle at center, rgba(0, 0, 0, 0.3), rgba(139, 0, 0, 0.2));
      }
      
      .cartola-magica::before {
        content: '🎩';
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 28px;
        animation: cartola-float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
        z-index: 10;
      }
      
      @keyframes cartola-float {
        0%, 100% { transform: translateX(-50%) translateY(0px) rotate(-2deg); }
        50% { transform: translateX(-50%) translateY(-8px) rotate(2deg); }
      }
      
      .cartola-magica::after {
        content: '';
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 50%;
        border: 3px solid transparent;
        background: linear-gradient(45deg, #FFD700, #FF1493, #4169E1, #FFD700);
        background-size: 300% 300%;
        animation: magia-circundante 4s linear infinite;
        z-index: -1;
      }
      
      @keyframes magia-circundante {
        0% { 
          background-position: 0% 50%; 
          transform: rotate(0deg);
          opacity: 0.7;
        }
        50% { 
          opacity: 1;
        }
        100% { 
          background-position: 100% 50%; 
          transform: rotate(360deg);
          opacity: 0.7;
        }
      }
      
      .nome-artista-magico {
        background: linear-gradient(45deg, #FFD700, #FF1493, #4169E1);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: nome-magico 4s ease-in-out infinite;
        font-family: 'Creepster', cursive;
        position: relative;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
      
      .nome-artista-magico::before {
        content: '✨';
        position: absolute;
        left: -30px;
        top: 50%;
        transform: translateY(-50%);
        animation: estrela-esquerda 3s ease-in-out infinite;
        font-size: 16px;
      }
      
      .nome-artista-magico::after {
        content: '✨';
        position: absolute;
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        animation: estrela-direita 3s ease-in-out infinite;
        font-size: 16px;
      }
      
      @keyframes nome-magico {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes estrela-esquerda {
        0%, 100% { transform: translateY(-50%) rotate(0deg) scale(1); }
        50% { transform: translateY(-50%) rotate(180deg) scale(1.2); }
      }
      
      @keyframes estrela-direita {
        0%, 100% { transform: translateY(-50%) rotate(0deg) scale(1); }
        50% { transform: translateY(-50%) rotate(-180deg) scale(1.2); }
      }
      
      .botao-magico {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(139, 0, 0, 0.3));
        border: 3px solid rgba(255, 215, 0, 0.7);
        backdrop-filter: blur(10px);
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
      }
      
      .botao-magico::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 215, 0, 0.5), 
          rgba(255, 20, 147, 0.3),
          transparent
        );
        transition: left 0.6s ease;
      }
      
      .botao-magico:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 20, 147, 0.2));
        border-color: #FF1493;
        transform: translateY(-3px) scale(1.02);
        box-shadow: 
          0 8px 25px rgba(255, 215, 0, 0.4),
          0 0 30px rgba(255, 20, 147, 0.3);
      }
      
      .botao-magico:hover::before {
        left: 100%;
      }
      
      .social-magico {
        background: linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(255, 20, 147, 0.2));
        border: 2px solid rgba(65, 105, 225, 0.6);
        border-radius: 50%;
        padding: 0.6rem;
        transition: all 0.4s ease;
        position: relative;
      }
      
      .social-magico:hover {
        color: #4169E1;
        transform: scale(1.25) rotate(15deg);
        border-color: #FF1493;
        box-shadow: 
          0 0 20px rgba(65, 105, 225, 0.6),
          0 0 30px rgba(255, 20, 147, 0.4);
      }
      
      .social-magico::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        margin: -30px 0 0 -30px;
        border-radius: 50%;
        border: 1px solid rgba(255, 20, 147, 0.4);
        animation: magia-social 2.5s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes magia-social {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
        50% { transform: scale(1.4) rotate(180deg); opacity: 0.8; }
      }

      .spotify-magico-container {
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(255, 215, 0, 0.8);
        box-shadow: 
          0 0 25px rgba(255, 215, 0, 0.4),
          inset 0 0 25px rgba(139, 0, 0, 0.2);
        backdrop-filter: blur(12px);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(139, 0, 0, 0.15));
      }
      
      .capa-magica {
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(255, 20, 147, 0.7);
      }
      
      .capa-magica::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(255, 215, 0, 0.15), 
          rgba(255, 20, 147, 0.15), 
          rgba(65, 105, 225, 0.15)
        );
        mix-blend-mode: overlay;
      }
      
      .varinha-magica {
        position: absolute;
        top: 12%;
        right: 8%;
        font-size: 20px;
        opacity: 0.5;
        animation: varinha-movimento 6s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
        transform-origin: bottom center;
      }
      
      @keyframes varinha-movimento {
        0%, 100% { transform: rotate(-10deg) translateY(0px); }
        25% { transform: rotate(10deg) translateY(-5px); }
        50% { transform: rotate(-5deg) translateY(-8px); }
        75% { transform: rotate(15deg) translateY(-3px); }
      }
      
      .carta-magica {
        position: absolute;
        top: 20%;
        left: 5%;
        font-size: 18px;
        opacity: 0.4;
        animation: carta-flutuante 8s ease-in-out infinite;
        filter: drop-shadow(0 0 8px rgba(255, 20, 147, 0.6));
      }
      
      @keyframes carta-flutuante {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
        33% { transform: translateY(-10px) rotate(5deg); opacity: 0.7; }
        66% { transform: translateY(5px) rotate(-3deg); opacity: 0.5; }
      }
      
      .fumaca-magica {
        position: absolute;
        bottom: 10%;
        left: 10%;
        font-size: 24px;
        opacity: 0.3;
        animation: fumaca-dispersao 10s ease-in-out infinite;
        filter: blur(1px);
      }
      
      @keyframes fumaca-dispersao {
        0% { transform: translateY(0px) scale(1); opacity: 0.3; }
        50% { transform: translateY(-20px) scale(1.3); opacity: 0.6; }
        100% { transform: translateY(-40px) scale(1.8); opacity: 0; }
      }
      
      /* Estrelas cintilantes */
      .estrelas-magicas {
        position: absolute;
        top: 8%;
        left: 15%;
        width: 70%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
        animation: cintilacao 4s ease-in-out infinite;
      }
      
      @keyframes cintilacao {
        0%, 100% { opacity: 0; transform: scaleX(0); }
        50% { opacity: 1; transform: scaleX(1); }
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
    <div className="circo-magico text-white p-4 relative">
      {/* Decorações Mágicas */}
      <div className="varinha-magica">🪄</div>
      <div className="carta-magica">🃏</div>
      <div className="fumaca-magica">💨</div>
      <div className="estrelas-magicas"></div>
      
      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">
          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-20 h-20 mx-auto cartola-magica object-cover" 
          />
          {/* Círculo mágico pulsante */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 -mt-14 -ml-14 border-2 border-yellow-400 rounded-full animate-pulse opacity-25"></div>
          {/* Estrelas ao redor */}
          <div className="absolute -top-1 left-2 text-yellow-400 text-sm animate-pulse">⭐</div>
          <div className="absolute -top-1 right-2 text-pink-400 text-sm animate-pulse" style={{animationDelay: '0.5s'}}>⭐</div>
          <div className="absolute bottom-0 left-0 text-blue-400 text-sm animate-pulse" style={{animationDelay: '1s'}}>⭐</div>
          <div className="absolute bottom-0 right-0 text-red-400 text-sm animate-pulse" style={{animationDelay: '1.5s'}}>⭐</div>
        </div>
        <h1 className="text-2xl font-bold nome-artista-magico uppercase tracking-wider">
          {artist_name || 'Mágico do Circo'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-yellow-200 font-medium mt-1 tracking-wide">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="spotify-magico-container my-4 max-w-md mx-auto">
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
            <div className="capa-magica max-w-sm mx-auto mb-4">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}

        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-yellow-100 text-sm leading-relaxed font-light">{bio}</p>}

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
                  className="botao-magico flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide"
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
              className="botao-magico flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide w-full"
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
                    className="social-magico text-white text-xl"
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

export default CircoMagico;
