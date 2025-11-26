import React, { useEffect } from 'react';
import { SmartLink, SocialLink } from '../../types';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';

const PorDoSolNoArpoador: React.FC<Partial<SmartLink>> = ({
  artist_name,
  artist_title,
  bio,
  feat, // Featuring/participação especial
  avatar_url,
  cover_image_url,
  player_url,
  platforms = [],
  social_links = [],
  contact_button_text = 'Contato',
  contact_button_url,
}) => {

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .por-do-sol-arpoador {
        background: url('/assets/templates/arpoador-sunset.jpg') no-repeat center center fixed;
        background-size: cover;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
      }
      .por-do-sol-arpoador::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(to top, rgba(29, 15, 4, 0.7) 0%, rgba(101, 52, 0, 0.3) 50%, rgba(255, 147, 41, 0.1) 100%);
        pointer-events: none;
      }
      .glass-card-arpoador {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .link-btn-arpoador {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        transition: all 0.3s ease;
      }
      .link-btn-arpoador:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
      .social-btn-arpoador {
        background: transparent;
        transition: all 0.3s ease;
      }
      .social-btn-arpoador:hover {
        transform: scale(1.15);
        color: #FFD700; /* Gold */
      }
    `;
    document.head.appendChild(style);
    return () => { if (style.parentNode) style.parentNode.removeChild(style); };
  }, []);

  const finalPlatforms = (platforms || [])
    .filter(link => link.url && link.platform_id)
    .map(link => {
      const platformData = PLATFORMS.find(p => p.id === link.platform_id);
      return {
        id: link.platform_id,
        name: platformData?.name || link.platform_id,
        url: link.url,
        icon: platformData?.icon,
      };
    });

  const finalSocialLinks = (social_links || []).map(social => {
    const socialData = SOCIAL_PLATFORMS.find(sp => sp.id === social.platform);
    if (!socialData) return null;
    return {
      id: social.id,
      platform: social.platform,
      url: social.url,
      icon: socialData.icon,
    };
  }).filter((link): link is SocialLink & { icon: React.FC<any> } => link !== null);

  const hasPlayer = player_url && player_url.includes('open.spotify.com');

  return (
    <div className="por-do-sol-arpoador w-full min-h-screen p-4 font-sans relative text-white">
      <div className="max-w-md mx-auto relative z-10">
        
        <header className="text-center mb-8">
          <img 
            src={avatar_url || '/avatars/perfilhomem1.png'} 
            alt={artist_name}
            className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-2 border-white/50 shadow-lg"
          />
          <h1 className="text-4xl font-bold text-white tracking-wide" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            {artist_name || 'Artista'}
          </h1>
          {feat && (
            <p className="text-amber-100 text-sm font-medium mt-1">
              feat. {feat}
            </p>
          )}
          {artist_title && (
            <p className="text-lg text-amber-200 font-light mt-1">
              {artist_title}
            </p>
          )}
        </header>

        <main>
          {hasPlayer ? (
            <div className="mb-6 glass-card-arpoador rounded-xl p-2">
              {(() => {
                const embedUrl = getSpotifyEmbedUrl(player_url!);
                if (!embedUrl) return <div className="text-center p-2">URL do Spotify inválida.</div>;
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
            cover_image_url && (
              <div className="mb-6">
                <img 
                  src={cover_image_url} 
                  alt={artist_name} 
                  className="w-full rounded-lg object-cover shadow-xl border-2 border-white/20"
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
            )
          )}

          {bio && (
            <div className="mb-8 text-center glass-card-arpoador rounded-lg p-4">
              <p className="text-gray-200 text-base leading-relaxed">{bio}</p>
            </div>
          )}

          <section className="mb-8">
            <div className="flex flex-col space-y-3">
              {finalPlatforms.map(platform => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn-arpoador flex items-center justify-center p-4 rounded-lg text-white font-bold text-lg"
                  >
                    {Icon && <Icon className="w-6 h-6 mr-3" />}
                    <span>{platform.name}</span>
                  </a>
                );
              })}
            </div>
          </section>

          {finalSocialLinks.length > 0 && (
            <footer className="text-center mb-6">
              <div className="flex justify-center items-center space-x-6">
                {finalSocialLinks.map(social => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-arpoador text-white/80 hover:text-amber-300"
                    >
                      <Icon size={28} />
                    </a>
                  );
                })}
              </div>
            </footer>
          )}

          {/* Botão de Contato */}
          {contact_button_url && (
            <div className="text-center mt-6">
              <a 
                href={contact_button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {contact_button_text || 'Entre em Contato'}
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PorDoSolNoArpoador;
