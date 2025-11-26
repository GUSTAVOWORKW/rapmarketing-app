import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { FaMicrophone, FaLeaf, FaSun, FaTree, FaPaw } from 'react-icons/fa';
import { GiElephant, GiLion, GiBaobab, GiCactus, GiEagleHead, GiButterfly, GiDrum, GiFeather, GiPineTree } from 'react-icons/gi';
import { WiDaySunny, WiHot, WiDust } from 'react-icons/wi';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const SavanaVibrante: React.FC<Partial<SmartLink>> = ({
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
    // Estilos específicos do template Savana Vibrante
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&family=Kalam:wght@400;700&display=swap');
      
      :root {
        --terra-cota: #CD853F;
        --laranja-savana: #FF8C00;
        --amarelo-sol: #FFD700;
        --verde-acacia: #9ACD32;
        --verde-escuro: #228B22;
        --marrom-tronco: #8B4513;
        --creme-osso: #FFF8DC;
        --vermelho-terra: #B22222;
        --batida-natural: 1.5s;
        --respiracao-lenta: 3s;
      }

      .savana-vibrante {
        background: linear-gradient(135deg, var(--amarelo-sol) 0%, var(--laranja-savana) 25%, var(--terra-cota) 50%, var(--marrom-tronco) 100%);
        background-size: 400% 400%;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Ubuntu', sans-serif;
        color: var(--creme-osso);
        animation: horizonte-savana var(--respiracao-lenta) ease-in-out infinite;
      }
      
      /* Sol pulsante */
      .savana-vibrante::before {
        content: '';
        position: absolute;
        top: 10%;
        right: 10%;
        width: 120px;
        height: 120px;
        background: radial-gradient(circle, var(--amarelo-sol) 0%, var(--laranja-savana) 70%, transparent 100%);
        border-radius: 50%;
        animation: sol-pulsante var(--batida-natural) ease-in-out infinite;
        opacity: 0.8;
        pointer-events: none;
      }
      
      /* Acácias flutuantes */
      .savana-vibrante::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: 
          radial-gradient(ellipse at 20% 100%, var(--verde-acacia) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 100%, var(--verde-escuro) 0%, transparent 40%),
          radial-gradient(ellipse at 80% 100%, var(--verde-acacia) 0%, transparent 45%);
        animation: vento-savana var(--respiracao-lenta) ease-in-out infinite;
        pointer-events: none;
      }

      /* --- ANIMAÇÕES NATURAIS --- */
      @keyframes horizonte-savana {
        0%, 100% { background-position: 0% 50%; filter: saturate(1) brightness(1); }
        50% { background-position: 100% 50%; filter: saturate(1.2) brightness(1.1); }
      }
      @keyframes sol-pulsante {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
        50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
      }
      @keyframes vento-savana {
        0%, 100% { transform: translateX(0) scaleY(1); opacity: 0.7; }
        50% { transform: translateX(10px) scaleY(1.05); opacity: 0.9; }
      }
      @keyframes avatar-tribal {
        0%, 100% { 
          box-shadow: 0 0 20px var(--laranja-savana), 0 0 40px var(--amarelo-sol); 
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 30px var(--vermelho-terra), 0 0 60px var(--laranja-savana); 
          transform: scale(1.02);
        }
      }
      @keyframes nome-tribal {
        0%, 100% { 
          text-shadow: 0 0 10px var(--laranja-savana), 0 0 20px var(--amarelo-sol); 
        }
        50% { 
          text-shadow: 0 0 15px var(--vermelho-terra), 0 0 30px var(--laranja-savana), 0 0 45px var(--amarelo-sol); 
        }
      }
      @keyframes botao-organico-pulse {
        0%, 100% { transform: scale(1); border-color: var(--verde-acacia); }
        50% { transform: scale(1.02); border-color: var(--amarelo-sol); }
      }
      @keyframes icone-natureza-pulse {
        0%, 100% { color: var(--verde-acacia); transform: scale(1); }
        50% { color: var(--amarelo-sol); transform: scale(1.1); }
      }
      @keyframes texto-organico-pulse {
        0%, 100% { color: var(--creme-osso); }
        50% { color: var(--amarelo-sol); }
      }
      @keyframes social-tribal-heartbeat {
        0%, 100% { transform: scale(1); background: var(--marrom-tronco); }
        50% { transform: scale(1.05); background: var(--verde-acacia); }
      }
      @keyframes contato-tribal-mega-pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 15px var(--vermelho-terra); }
        50% { transform: scale(1.03); box-shadow: 0 0 25px var(--laranja-savana), 0 0 35px var(--amarelo-sol); }
      }
      @keyframes microfone-tribal-pulse {
        0%, 100% { color: var(--creme-osso); transform: scale(1); }
        50% { color: var(--amarelo-sol); transform: scale(1.1); }
      }      @keyframes player-tribal-pulse {
        0%, 100% { border-color: var(--verde-acacia); box-shadow: 0 0 10px var(--marrom-tronco); }
        50% { border-color: var(--amarelo-sol); box-shadow: 0 0 20px var(--laranja-savana); }
      }
      @keyframes vento-natural {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        33% { transform: translateX(2px) rotate(0.5deg); }
        66% { transform: translateX(-1px) rotate(-0.3deg); }
      }
      @keyframes migracao-lenta {
        0% { transform: translateX(-20px) scale(0.8); opacity: 0.2; }
        50% { opacity: 0.4; }
        100% { transform: translateX(20px) scale(1); opacity: 0.2; }
      }
      @keyframes chama-tribal {
        0% { transform: scale(1) rotate(-2deg); opacity: 0.6; }
        50% { transform: scale(1.1) rotate(2deg); opacity: 0.8; }
        100% { transform: scale(1) rotate(-2deg); opacity: 0.6; }
      }

      /* --- ELEMENTOS DE UI NATURAIS --- */

      /* Header e Avatar */
      .titulo-savana {
        font-family: 'Kalam', cursive;
        color: var(--creme-osso);
        animation: nome-tribal var(--batida-natural) infinite;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 700;
      }
      .avatar-tribal {
        border-radius: 50%;
        border: 4px solid var(--laranja-savana);
        animation: avatar-tribal var(--batida-natural) infinite;
      }
      
      /* Player Spotify tribal */
      .player-tribal {
        border-radius: 12px;
        padding: 4px;
        background: linear-gradient(145deg, var(--marrom-tronco), var(--terra-cota));
        border: 2px solid var(--verde-acacia);
        animation: player-tribal-pulse var(--batida-natural) infinite;
        overflow: hidden;
      }
      .cover-tribal {
         border-radius: 12px;
         animation: avatar-tribal var(--batida-natural) infinite;
         border: 4px solid var(--laranja-savana);
      }

      /* Botões de Streaming (Orgânicos) */
      .btn-organico {
        background: linear-gradient(135deg, var(--marrom-tronco) 0%, var(--terra-cota) 100%);
        border: 2px solid var(--verde-acacia);
        color: var(--creme-osso);
        text-transform: uppercase;
        font-weight: bold;
        font-family: 'Ubuntu', sans-serif;
        transition: all 0.3s ease;
        animation: botao-organico-pulse var(--batida-natural) infinite;
        position: relative;
        overflow: hidden;
      }
      .btn-organico:hover {
        background: linear-gradient(135deg, var(--verde-acacia) 0%, var(--amarelo-sol) 100%);
        border-color: var(--laranja-savana);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
        color: var(--marrom-tronco);
      }
      .btn-organico .icone-natureza {
        animation: icone-natureza-pulse var(--batida-natural) infinite;
      }
      .btn-organico span {
        animation: texto-organico-pulse var(--batida-natural) infinite;
      }

      /* Botão de Contato (Tribal) */
      .btn-contato-tribal {
        background: linear-gradient(135deg, var(--vermelho-terra) 0%, var(--laranja-savana) 100%);
        border: 2px solid var(--amarelo-sol);
        color: var(--creme-osso);
        text-transform: uppercase;
        font-weight: bold;
        font-family: 'Kalam', cursive;
        position: relative;
        animation: contato-tribal-mega-pulse var(--batida-natural) infinite;
        transition: all 0.3s ease;
      }
      .btn-contato-tribal:hover {
        background: linear-gradient(135deg, var(--laranja-savana) 0%, var(--amarelo-sol) 100%);
        transform: translateY(-3px);
        color: var(--marrom-tronco);
      }
      .btn-contato-tribal .icone-microfone-tribal {
        animation: microfone-tribal-pulse var(--batida-natural) infinite;
      }

      /* Redes Sociais (Tribais) */
      .social-tribal {
        background: var(--marrom-tronco);
        border: 2px solid var(--verde-acacia);
        border-radius: 12px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--amarelo-sol);
        animation: social-tribal-heartbeat var(--batida-natural) infinite;
        transition: all 0.3s ease;
      }
      .social-tribal:hover {
        background: var(--amarelo-sol);
        color: var(--marrom-tronco);
        transform: translateY(-2px);
        border-color: var(--laranja-savana);
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      }

      /* Elementos decorativos */
      .decorativo-animal {
        position: absolute;
        color: var(--terra-cota);
        opacity: 0.3;
        font-size: 2rem;
        animation: vento-savana var(--respiracao-lenta) ease-in-out infinite;
        pointer-events: none;
      }      .decorativo-animal.girafa {
        top: 20%;
        left: 5%;
        animation-delay: 0s;
      }
      .decorativo-animal.leao {
        top: 60%;
        right: 10%;
        animation-delay: 0.5s;
      }
      .decorativo-animal.elefante {
        bottom: 30%;
        right: 5%;
        animation-delay: 1s;
      }      .decorativo-animal.arvore {
        top: 40%;
        left: 15%;
        animation-delay: 2s;
      }
      
      /* Novos elementos decorativos */
      .animal-flutuante {
        position: absolute;
        pointer-events: none;
        opacity: 0.3;
        animation: migracao-lenta 8s ease-in-out infinite;
      }
      .elemento-climatico {
        position: absolute;
        pointer-events: none;
        opacity: 0.4;
      }
      .arvore-savana {
        position: absolute;
        pointer-events: none;
        opacity: 0.5;
        animation: vento-natural 4s ease-in-out infinite;
      }
      .chama-efeito {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 12px;
        background: linear-gradient(to top, var(--vermelho-terra), var(--laranja-savana), var(--amarelo-sol));
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation: chama-tribal 1s ease-in-out infinite alternate;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Lógica para mapear IDs para dados completos (ícones, nomes) - SEM ALTERAÇÕES
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
    <div className="savana-vibrante text-white p-4">
      {/* Elementos decorativos originais */}
      <FaPaw className="decorativo-animal girafa" />
      <GiLion className="decorativo-animal leao" />
      <GiElephant className="decorativo-animal elefante" />
      <FaTree className="decorativo-animal arvore" />

      {/* Novos elementos decorativos - Animais flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GiElephant className="animal-flutuante top-1/3 left-4 text-4xl text-yellow-600" 
                   style={{animationDelay: '0s', animationDuration: '8s'}} />
        <GiLion className="animal-flutuante top-1/2 right-8 text-3xl text-orange-600" 
                style={{animationDelay: '2s', animationDuration: '10s'}} />
        
        {/* Pássaros voando */}
        <GiEagleHead className="elemento-climatico top-1/5 left-1/3 text-2xl text-amber-800 animate-ping" 
                     style={{animationDelay: '0.5s'}} />
        <GiButterfly className="elemento-climatico top-2/5 right-1/3 text-xl text-orange-500 animate-bounce" 
                    style={{animationDelay: '1.5s'}} />
        
        {/* Elementos climáticos */}
        <WiDaySunny className="elemento-climatico top-8 right-8 text-8xl text-yellow-400 animate-spin" 
                    style={{animationDuration: '20s'}} />
        <WiHot className="elemento-climatico top-1/2 left-1/2 text-6xl text-orange-400 animate-pulse transform -translate-x-1/2 -translate-y-1/2" />
        <WiDust className="elemento-climatico bottom-1/4 right-1/4 text-4xl text-amber-600 animate-bounce" 
                style={{animationDelay: '1s', animationDuration: '3s'}} />
        
        {/* Árvores da savana */}
        <GiBaobab className="arvore-savana bottom-4 left-8 text-6xl text-green-600" 
                  style={{animationDuration: '4s'}} />
        <GiPineTree className="arvore-savana bottom-2 right-12 text-7xl text-green-700" 
                    style={{animationDelay: '1s', animationDuration: '5s'}} />
        <GiCactus className="arvore-savana bottom-6 left-1/3 text-4xl text-green-500" 
                  style={{animationDelay: '2s', animationDuration: '3s'}} />
      </div>

      {/* Header com Avatar e Nomes */}
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">          <img 
            src={avatar_url || '/assets/defaults/default-avatar.png'} 
            alt={artist_name} 
            className="w-24 h-24 mx-auto avatar-tribal object-cover hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-500 hover:scale-105" 
          />
        </div>
        <h1 className="text-4xl font-bold titulo-savana tracking-wider">
          {artist_name || 'Artista da Savana'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-lg text-yellow-200 font-light mt-1 font-['Ubuntu']">
            {artist_title || release_title}
          </h2>
        )}
      </header>

      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="player-tribal my-4 max-w-md mx-auto">
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
                className="w-full rounded-lg object-cover cover-tribal"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}
        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-yellow-100 text-sm px-2">{bio}</p>}

        {/* Links de Plataformas de Streaming */}
        <section className="max-w-md mx-auto mb-6 px-2">
          <div className="flex flex-col space-y-3">
            {finalPlatforms?.map((platform, index) => {
              const Icon = platform.icon;
              if (platform.platform_id === 'spotify' && hasPlayer) {
                return null;
              }
              return (                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-organico flex items-center justify-center p-4 rounded-lg text-white group relative overflow-hidden"
                >
                  {Icon && <Icon className="w-6 h-6 mr-3 icone-natureza group-hover:animate-pulse transition-all" />}
                  <span className="group-hover:text-yellow-200 transition-colors">{platform.name}</span>
                  <div className="absolute -right-2 -top-2 opacity-30">
                    <GiFeather className="text-green-400 text-xl animate-pulse" 
                               style={{animationDelay: '0.5s'}} />
                  </div>
                  <FaLeaf className="w-4 h-4 ml-auto opacity-60 group-hover:text-green-300 transition-colors" />
                </a>
              );
            })}
          </div>
        </section>

        {/* Botão de Contato */}
        {contact_button_url && (
          <section className="max-w-md mx-auto mb-8 px-2">            <a
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contato-tribal flex items-center justify-center p-4 rounded-lg text-white w-full relative group"
            >
              <div className="chama-efeito"></div>
              <GiDrum className="w-6 h-6 mr-3 animate-pulse group-hover:animate-bounce transition-all" />
              <span className="relative z-10 group-hover:text-yellow-200 transition-colors">{contact_button_text}</span>
            </a>
          </section>
        )}

        {/* Redes Sociais */}
        {finalSocials.length > 0 && (
          <footer className="text-center pb-6">
            <div className="flex justify-center items-center space-x-4 flex-wrap gap-3">              {finalSocials.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tribal text-white text-2xl hover:shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300 group"
                    aria-label={link.name}
                  >
                    {Icon && <Icon className="group-hover:animate-pulse transition-colors" />}
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

export default SavanaVibrante;
