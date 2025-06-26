import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const ReggaeCosmic: React.FC<Partial<SmartLink>> = ({
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
    // Estilos específicos do template Reggae Cosmic
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Comfortaa:wght@300;400;700&display=swap');
      
      .reggae-cosmic {
        background: radial-gradient(ellipse at center, #1a0033 0%, #2d0a4e 30%, #0a1a0a 70%, #000000 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Comfortaa', cursive;
      }
      
      .reggae-cosmic::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 2px, transparent 2px),
          radial-gradient(circle at 80% 30%, rgba(255, 0, 0, 0.08) 3px, transparent 3px),
          radial-gradient(circle at 40% 70%, rgba(0, 255, 0, 0.08) 2px, transparent 2px),
          radial-gradient(circle at 70% 80%, rgba(255, 215, 0, 0.06) 1px, transparent 1px),
          radial-gradient(circle at 10% 60%, rgba(138, 43, 226, 0.1) 4px, transparent 4px);
        background-size: 200px 200px, 300px 300px, 250px 250px, 150px 150px, 400px 400px;
        animation: estrelas-cosmos 40s linear infinite, nebulosa-drift 60s ease-in-out infinite;
        pointer-events: none;
      }
      
      @keyframes estrelas-cosmos {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-50px) rotate(360deg); }
      }
      
      @keyframes nebulosa-drift {
        0%, 100% { opacity: 0.3; transform: scale(1) translateX(0); }
        50% { opacity: 0.8; transform: scale(1.1) translateX(20px); }
      }
      
      .reggae-cosmic::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(45deg, transparent 40%, rgba(255, 215, 0, 0.03) 41%, rgba(255, 215, 0, 0.03) 43%, transparent 44%),
          linear-gradient(-45deg, transparent 40%, rgba(255, 0, 0, 0.03) 41%, rgba(255, 0, 0, 0.03) 43%, transparent 44%),
          linear-gradient(90deg, transparent 48%, rgba(0, 255, 0, 0.02) 49%, rgba(0, 255, 0, 0.02) 51%, transparent 52%);
        animation: ondas-reggae 25s linear infinite;
        pointer-events: none;
      }
      
      @keyframes ondas-reggae {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(100px) translateY(-30px); }
      }
        .portal-dimensional {
        position: relative;
        border-radius: 50%;
        border: 6px solid transparent;
        background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #ff0000);
        background-size: 400% 400%;
        animation: portal-energia 2s linear infinite;
        padding: 6px;
        box-shadow: 
          0 0 30px rgba(255, 215, 0, 0.8),
          0 0 50px rgba(0, 255, 0, 0.6),
          0 0 70px rgba(255, 0, 0, 0.4);
      }
      
      @keyframes portal-energia {
        0% { 
          background-position: 0% 50%;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.8),
            0 0 50px rgba(0, 255, 0, 0.6),
            0 0 70px rgba(255, 0, 0, 0.4);
        }
        50% { 
          box-shadow: 
            0 0 40px rgba(0, 255, 0, 1),
            0 0 60px rgba(255, 215, 0, 0.8),
            0 0 80px rgba(255, 0, 0, 0.6);
        }
        100% { 
          background-position: 100% 50%;
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.8),
            0 0 50px rgba(0, 255, 0, 0.6),
            0 0 70px rgba(255, 0, 0, 0.4);
        }
      }
      
      .portal-dimensional::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: 50%;
        background: conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #ff0000);
        animation: portal-rotacao 3s linear infinite;
        z-index: -1;
        opacity: 0.8;
      }
      
      @keyframes portal-rotacao {
        0% { transform: rotate(0deg); opacity: 0.5; }
        100% { transform: rotate(360deg); opacity: 0.5; }
      }
        .portal-dimensional::after {
        content: '🦁';
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        animation: leao-cosmic 3s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) drop-shadow(0 0 30px rgba(255, 0, 0, 0.8));
        z-index: 15;
      }
      
      @keyframes leao-cosmic {
        0%, 100% { 
          transform: translateX(-50%) translateY(0px) scale(1);
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
        }
        50% { 
          transform: translateX(-50%) translateY(-8px) scale(1.1);
          filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1)) drop-shadow(0 0 35px rgba(0, 255, 0, 0.5));
        }
      }
      
      .nome-cosmic {
        background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: reggae-flow 6s ease-in-out infinite;
        font-family: 'Righteous', cursive;
        position: relative;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
        .nome-cosmic::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 255, 255, 0.7), 
          rgba(255, 215, 0, 0.5),
          transparent
        );
        animation: cosmic-wave 4s ease-in-out infinite;
        z-index: 1;
        border-radius: 4px;
      }
      
      @keyframes reggae-flow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
        @keyframes cosmic-wave {
        0% { transform: translateX(-100%); opacity: 0; }
        25% { opacity: 0.8; }
        75% { opacity: 0.8; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      
      .botao-cosmic {
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.15), rgba(255, 215, 0, 0.15), rgba(0, 255, 0, 0.15));
        border: 2px solid rgba(255, 215, 0, 0.6);
        backdrop-filter: blur(12px);
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
      }
      
      .botao-cosmic::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 215, 0, 0.4), 
          rgba(0, 255, 0, 0.3),
          transparent
        );
        transition: left 0.8s ease;
      }
      
      .botao-cosmic:hover {
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.25), rgba(255, 215, 0, 0.25), rgba(0, 255, 0, 0.25));
        border-color: #00ff00;
        transform: translateY(-3px);
        box-shadow: 
          0 8px 25px rgba(0, 255, 0, 0.4),
          0 0 40px rgba(255, 215, 0, 0.3);
      }
      
      .botao-cosmic:hover::before {
        left: 100%;
      }
      
      .social-cosmic {
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(138, 43, 226, 0.2));
        border: 2px solid rgba(255, 0, 0, 0.5);
        border-radius: 50%;
        padding: 0.6rem;
        transition: all 0.4s ease;
        position: relative;
      }
      
      .social-cosmic:hover {
        color: #ffff00;
        transform: scale(1.2) rotate(-10deg);
        border-color: #ffff00;
        box-shadow: 
          0 0 20px rgba(255, 215, 0, 0.6),
          0 0 40px rgba(0, 255, 0, 0.3);
      }
      
      .social-cosmic::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 55px;
        height: 55px;
        margin: -27.5px 0 0 -27.5px;
        border-radius: 50%;
        border: 1px solid rgba(255, 215, 0, 0.4);
        animation: cosmic-pulse 3.5s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes cosmic-pulse {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.5); opacity: 0.8; }
      }

      .spotify-cosmic-container {
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(255, 215, 0, 0.7);
        box-shadow: 
          0 0 30px rgba(0, 255, 0, 0.3),
          inset 0 0 30px rgba(255, 0, 0, 0.1);
        backdrop-filter: blur(15px);
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(0, 255, 0, 0.1));
      }
      
      .capa-cosmic {
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(0, 255, 0, 0.6);
      }
      
      .capa-cosmic::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(255, 0, 0, 0.15), 
          rgba(255, 215, 0, 0.15), 
          rgba(0, 255, 0, 0.15),
          rgba(138, 43, 226, 0.15)
        );
        mix-blend-mode: overlay;
      }
      
      .planetas-cosmic {
        position: absolute;
        top: 8%;
        right: 5%;
        font-size: 20px;
        opacity: 0.6;
        animation: planetas-orbit 15s linear infinite;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
      }
      
      .planetas-cosmic::before {
        content: '🌍';
        position: absolute;
        top: -40px;
        left: -30px;
        font-size: 16px;
        animation: planetas-orbit 12s linear infinite reverse;
      }
      
      .planetas-cosmic::after {
        content: '🌙';
        position: absolute;
        bottom: -30px;
        right: -25px;
        font-size: 18px;
        animation: planetas-orbit 18s linear infinite;
      }
      
      @keyframes planetas-orbit {
        0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
      }      .fumaca-cosmic {
        position: absolute;
        top: 15%;
        left: 5%;
        width: 60px;
        height: 80px;
        background: linear-gradient(180deg, 
          rgba(255, 215, 0, 0.9), 
          rgba(138, 43, 226, 0.8), 
          rgba(0, 255, 0, 0.6),
          transparent
        );
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        opacity: 1;
        animation: fumaca-flow 6s ease-in-out infinite;
        filter: blur(0.5px);
        z-index: 10;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
      }
      
      .fumaca-cosmic::before {
        content: '';
        position: absolute;
        top: -20px;
        left: 15px;
        width: 30px;
        height: 30px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.9), rgba(255, 0, 0, 0.7));
        border-radius: 50%;
        animation: fumaca-bolhas 4s ease-in-out infinite;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
      }
      
      .fumaca-cosmic::after {
        content: '';
        position: absolute;
        top: -35px;
        left: 25px;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(0, 255, 0, 0.8), rgba(138, 43, 226, 0.6));
        border-radius: 50%;
        animation: fumaca-bolhas 5s ease-in-out infinite reverse;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
      }
        @keyframes fumaca-flow {
        0%, 100% { 
          transform: translateY(0px) scaleX(1) scaleY(1); 
          opacity: 0.8; 
        }
        25% { 
          transform: translateY(-15px) scaleX(1.2) scaleY(1.5); 
          opacity: 0.9; 
        }
        50% { 
          transform: translateY(-25px) scaleX(0.8) scaleY(1.8); 
          opacity: 0.7; 
        }
        75% { 
          transform: translateY(-10px) scaleX(1.3) scaleY(1.2); 
          opacity: 0.8; 
        }
      }
      
      @keyframes fumaca-bolhas {
        0%, 100% { 
          opacity: 0.7; 
          transform: scale(1) translateY(0) translateX(0); 
        }
        33% { 
          opacity: 0.4; 
          transform: scale(1.8) translateY(-20px) translateX(-5px); 
        }
        66% { 
          opacity: 0.9; 
          transform: scale(0.5) translateY(-35px) translateX(10px); 
        }
      }      .paz-symbol {
        position: absolute;
        top: 30%;
        right: 8%;
        font-size: 35px;
        color: #FFD700;
        animation: paz-rotation 10s linear infinite;
        filter: drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 30px #00FF00);
        z-index: 10;
        opacity: 1;
        text-shadow: 0 0 10px #FFD700, 0 0 20px #FF0000;
      }
      
      @keyframes paz-rotation {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.2); }
        100% { transform: rotate(360deg) scale(1); }
      }
        /* Adicionando mais fumaçal visivel */
      .fumaca-extra {
        position: absolute;
        bottom: 20%;
        right: 8%;
        width: 50px;
        height: 70px;
        background: linear-gradient(180deg, 
          rgba(255, 215, 0, 0.9), 
          rgba(138, 43, 226, 0.8),
          rgba(0, 255, 0, 0.6),
          transparent
        );
        border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
        opacity: 1;
        animation: fumaca-extra-flow 7s ease-in-out infinite;
        filter: blur(0.5px);
        z-index: 10;
        box-shadow: 0 0 25px rgba(138, 43, 226, 0.7);
      }
      
      .fumaca-extra::before {
        content: '';
        position: absolute;
        top: -15px;
        left: 12px;
        width: 25px;
        height: 25px;
        background: radial-gradient(circle, rgba(138, 43, 226, 0.9), rgba(255, 215, 0, 0.7));
        border-radius: 50%;
        animation: fumaca-bolhas 5s ease-in-out infinite;
        box-shadow: 0 0 12px rgba(138, 43, 226, 0.8);
      }
      
      @keyframes fumaca-extra-flow {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scaleX(1); 
          opacity: 1; 
        }
        33% { 
          transform: translateY(-20px) rotate(5deg) scaleX(1.3); 
          opacity: 0.8; 
        }
        66% { 
          transform: translateY(-35px) rotate(-3deg) scaleX(0.9); 
          opacity: 0.9; 
        }
      }
        /* Adicionando ondas reggae mais visíveis */
      .ondas-reggae-visible {
        position: absolute;
        top: 45%;
        left: 0;
        right: 0;
        height: 8px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 0, 0, 0.8), 
          rgba(255, 215, 0, 1), 
          rgba(0, 255, 0, 0.8), 
          transparent
        );
        animation: ondas-reggae-move 6s ease-in-out infinite;
        z-index: 8;
        border-radius: 4px;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
      }
      
      .ondas-reggae-visible::before {
        content: '';
        position: absolute;
        top: 15px;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(0, 255, 0, 0.7), 
          rgba(255, 0, 0, 0.9), 
          rgba(255, 215, 0, 0.7), 
          transparent
        );
        animation: ondas-reggae-move 8s ease-in-out infinite reverse;
        border-radius: 2px;
      }
      
      @keyframes ondas-reggae-move {
        0%, 100% { transform: translateX(-50%) scaleX(0.3); opacity: 0.5; }
        50% { transform: translateX(50%) scaleX(1.2); opacity: 1; }
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

  const hasPlayer = player_url && player_url.includes('open.spotify.com');  return (
    <div className="reggae-cosmic text-white p-4 relative">
      {/* Decorações Espaciais */}
      <div className="planetas-cosmic">🪐</div>
      <div className="fumaca-cosmic"></div>
      <div className="fumaca-extra"></div>
      <div className="paz-symbol">☮</div>
      <div className="ondas-reggae-visible"></div>
      
      {/* Estrelas Rastafári Extras */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '15%',
        fontSize: '20px',
        color: '#FFD700',
        animation: 'paz-rotation 12s linear infinite',
        zIndex: 8,
        filter: 'drop-shadow(0 0 10px #FFD700)'
      }}>⭐</div>
      
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '12%',
        fontSize: '16px',
        color: '#00FF00',
        animation: 'paz-rotation 15s linear infinite reverse',
        zIndex: 8,
        filter: 'drop-shadow(0 0 8px #00FF00)'
      }}>✨</div>
      
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '85%',
        fontSize: '18px',
        color: '#FF0000',
        animation: 'paz-rotation 10s linear infinite',
        zIndex: 8,
        filter: 'drop-shadow(0 0 12px #FF0000)'
      }}>🌟</div>
      
      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">
          <div className="portal-dimensional">
            <img 
              src={avatar_url || '/assets/defaults/default-avatar.png'} 
              alt={artist_name} 
              className="w-20 h-20 rounded-full object-cover" 
            />
          </div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 border border-green-400 rounded-full animate-pulse opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold nome-cosmic uppercase tracking-wider">
          {artist_name || 'Cosmic Rasta'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-yellow-200 font-light mt-1 tracking-wide">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="spotify-cosmic-container my-4 max-w-md mx-auto">
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
            <div className="capa-cosmic max-w-sm mx-auto mb-4">
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
                  className="botao-cosmic flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide"
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
              className="botao-cosmic flex items-center justify-center p-3 rounded-xl text-white font-semibold text-sm uppercase tracking-wide w-full"
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
                    className="social-cosmic text-white text-xl"
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

export default ReggaeCosmic;
