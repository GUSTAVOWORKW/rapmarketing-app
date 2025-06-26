import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const BailePulsante: React.FC<Partial<SmartLink>> = ({
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
    // Estilos específicos do template Baile Pulsante - PISTA DE BAILE VIRTUAL AZUL
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Audiowide:wght@400&display=swap');
      
      :root {
        --azul-profundo: #1a237e;
        --azul-profundo-2: #283593;
        --azul-intermediario: #3949ab;
        --azul-claro: #5c6bc0;
        --azul-claro-2: #7986cb;
        --azul-muito-claro: #c5cae9;
        --branco: #ffffff;
        --batida-principal: 1.2s;
        --batida-secundaria: 0.6s;
      }

      /* --- CÓDIGO DO FUNDO CORRIGIDO --- */
      .baile-pulsante {
        background-color: var(--azul-profundo);
        background-image: 
          url('/assets/templates/caixadesom.png'),
          radial-gradient(circle at 25% 25%, rgba(121, 134, 203, 0.3) 0%, transparent 40%),
          radial-gradient(circle at 75% 75%, rgba(92, 107, 192, 0.3) 0%, transparent 40%);
        
        /* Ajustes para preencher a tela inteira e fixar o fundo */
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        background-attachment: fixed; /* Efeito Parallax */
        
        background-blend-mode: overlay;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Audiowide', sans-serif;
        color: var(--branco);
        animation: pista-pulsante var(--batida-principal) infinite;
      }

      .baile-pulsante::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle at 50% 50%, transparent 30%, var(--azul-claro) 31%, transparent 32%);
        animation: ondas-azuis-grave var(--batida-principal) infinite;
        opacity: 0.6;
        pointer-events: none;
      }
      
      .baile-pulsante::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border: 2px solid var(--azul-claro-2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: onda-azul-expandir 3s ease-out infinite;
        pointer-events: none;
      }

      /* --- ANIMAÇÕES SINCRONIZADAS AZUIS --- */
      @keyframes pista-pulsante {
        0%, 100% { filter: saturate(1) brightness(1); }
        50% { filter: saturate(1.2) brightness(1.1); }
      }
      @keyframes ondas-azuis-grave {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
        50% { transform: scale(1.1) rotate(180deg); opacity: 0.8; }
      }
      @keyframes onda-azul-expandir {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
      }
      @keyframes avatar-halo-azul {
        0%, 100% { box-shadow: 0 0 20px var(--azul-claro), 0 0 40px var(--azul-intermediario); }
        50% { box-shadow: 0 0 30px var(--azul-claro-2), 0 0 60px var(--azul-claro); }
      }
      @keyframes nome-batida-azul {
        0%, 100% { text-shadow: 0 0 10px var(--azul-claro), 0 0 20px var(--azul-intermediario); }
        50% { text-shadow: 0 0 15px var(--azul-claro-2), 0 0 30px var(--azul-claro), 0 0 45px var(--azul-profundo-2); }
      }
      @keyframes botao-streaming-azul-pulse {
        0%, 100% { transform: scale(1); border-color: var(--azul-intermediario); }
        50% { transform: scale(1.02); border-color: var(--azul-claro); }
      }
      @keyframes icone-speaker-azul-pulse {
        0%, 100% { color: var(--azul-claro); transform: scale(1); }
        50% { color: var(--azul-claro-2); transform: scale(1.1); }
      }
      @keyframes texto-azul-pulse {
        0%, 100% { color: var(--branco); }
        50% { color: var(--azul-claro-2); }
      }
      @keyframes social-azul-heartbeat {
        0%, 100% { transform: scale(1); background: var(--azul-profundo-2); }
        50% { transform: scale(1.05); background: var(--azul-intermediario); }
      }
      @keyframes contato-azul-mega-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 15px var(--azul-intermediario); }
        50% { transform: scale(1.03); box-shadow: 0 0 25px var(--azul-claro), 0 0 35px var(--azul-claro-2); }
      }
      @keyframes microfone-azul-pulse {
        0%, 100% { color: var(--branco); transform: scale(1); }
        50% { color: var(--azul-claro-2); transform: scale(1.1); }
      }
      @keyframes spotify-azul-mega-pulse {
        0%, 100% { border-color: var(--azul-intermediario); box-shadow: 0 0 10px var(--azul-profundo-2); }
        50% { border-color: var(--azul-claro); box-shadow: 0 0 20px var(--azul-claro); }
      }

      /* --- ELEMENTOS DE UI AZUIS --- */
      .titulo-baile {
        font-family: 'Black Ops One', sans-serif;
        color: var(--branco);
        animation: nome-batida-azul var(--batida-principal) infinite;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .avatar-pulsante {
        border-radius: 50%;
        border: 4px solid var(--azul-claro);
        animation: avatar-halo-azul var(--batida-principal) infinite;      }
      .player-dj-console {
        border-radius: 12px;
        padding: 4px;
        background: linear-gradient(145deg, var(--azul-profundo), var(--azul-profundo-2));
        border: 2px solid var(--azul-intermediario);
        animation: spotify-azul-mega-pulse var(--batida-principal) infinite;
        overflow: hidden;
      }
      .cover-pulsante {
         border-radius: 12px;
         animation: avatar-halo-azul var(--batida-principal) infinite;
         border: 4px solid var(--azul-claro);
      }
      .btn-streaming-azul {
        background: linear-gradient(135deg, var(--azul-profundo) 0%, var(--azul-profundo-2) 100%);
        border: 2px solid var(--azul-intermediario);
        color: var(--branco);
        text-transform: uppercase;
        font-weight: bold;
        font-family: 'Audiowide', sans-serif;
        transition: all 0.3s ease;
        animation: botao-streaming-azul-pulse var(--batida-principal) infinite;
        position: relative;
        overflow: hidden;
      }
      .btn-streaming-azul:hover {
        background: linear-gradient(135deg, var(--azul-intermediario) 0%, var(--azul-claro) 100%);
        border-color: var(--azul-claro-2);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 35, 126, 0.4);
      }
      .btn-streaming-azul .icone-speaker {
        animation: icone-speaker-azul-pulse var(--batida-principal) infinite;
      }
      .btn-streaming-azul span {
        animation: texto-azul-pulse var(--batida-principal) infinite;
      }
      .btn-contato-azul {
        background: linear-gradient(135deg, var(--azul-profundo-2) 0%, var(--azul-intermediario) 100%);
        border: 2px solid var(--azul-claro);
        color: var(--branco);
        text-transform: uppercase;
        font-weight: bold;
        font-family: 'Black Ops One', sans-serif;
        position: relative;
        animation: contato-azul-mega-pulse var(--batida-principal) infinite;
        transition: all 0.3s ease;
      }
      .btn-contato-azul:hover {
        background: linear-gradient(135deg, var(--azul-intermediario) 0%, var(--azul-claro) 100%);
        transform: translateY(-3px);
      }
      .btn-contato-azul .icone-microfone {
        animation: microfone-azul-pulse var(--batida-principal) infinite;
      }
      .social-azul {
        background: var(--azul-profundo-2);
        border: 2px solid var(--azul-intermediario);
        border-radius: 8px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--azul-claro-2);
        animation: social-azul-heartbeat var(--batida-principal) infinite;
        transition: all 0.3s ease;
      }
      .social-azul:hover {
        background: var(--azul-claro);
        color: var(--branco);
        transform: translateY(-2px);
        border-color: var(--azul-claro-2);
        box-shadow: 0 4px 15px rgba(92, 107, 192, 0.3);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className="baile-pulsante text-white p-4">
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">
          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-24 h-24 mx-auto avatar-pulsante object-cover" 
          />
        </div>
        <h1 className="text-4xl font-bold titulo-baile tracking-wider">
          {artist_name || 'Artista do Baile'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-lg text-blue-200 font-light mt-1 font-['Audiowide']">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      <main className="relative z-10">
        {hasPlayer ? (
          <div className="player-dj-console my-4 max-w-md mx-auto">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(player_url!);
              if (!embedUrl) {
                return (
                  <div className="text-red-400 text-center p-2 bg-red-900/50 rounded-md text-sm">
                    URL do Spotify inválida.
                  </div>
                );
              }              return (
                <iframe
                  style={{ 
                    borderRadius: '8px', 
                    border: 'none',
                    overflow: 'hidden'
                  }}
                  src={embedUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Player"
                />
              );
            })()}
          </div>
        ) : (
          cover_image_url && (
            <div className="max-w-sm mx-auto mb-4 p-1">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover cover-pulsante"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}
        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-blue-100 text-sm px-2">{bio}</p>}

        <section className="max-w-md mx-auto mb-6 px-2">
          <div className="flex flex-col space-y-3">
            {finalPlatforms?.map((platform, index) => {
              const Icon = platform.icon;
              if (platform.platform_id === 'spotify' && hasPlayer) {
                return null;
              }
              return (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-streaming-azul flex items-center justify-center p-4 rounded-lg text-white"
                >
                  {Icon && <Icon className="w-6 h-6 mr-3 icone-speaker" />}
                  <span>{platform.name}</span>
                  <FaVolumeUp className="w-4 h-4 ml-auto opacity-60" />
                </a>
              );
            })}
          </div>
        </section>

        {contact_button_url && (
          <section className="max-w-md mx-auto mb-8 px-2">
            <a
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contato-azul flex items-center justify-center p-4 rounded-lg text-white w-full"
            >
              <FaMicrophone className="w-5 h-5 mr-3 icone-microfone" />
              {contact_button_text}
            </a>
          </section>
        )}

        {finalSocials.length > 0 && (
          <footer className="text-center pb-6">
            {/* Para alinhar os ícones à esquerda, troque 'justify-center' por 'justify-start' na linha abaixo.
              Mantive 'justify-center' por ser visualmente mais equilibrado na maioria dos casos.
            */}
            <div className="flex justify-center items-center space-x-4 flex-wrap gap-3">
              {finalSocials.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-azul text-white text-2xl"
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

export default BailePulsante;