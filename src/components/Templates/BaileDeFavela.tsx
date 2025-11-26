import React, { useEffect } from 'react';
import { SmartLink } from '../../types';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import './BaileDeFavela.css'; // Importa o CSS refatorado

// Usar Partial<SmartLink> para que o componente funcione tanto no preview (com dados parciais) quanto na página pública
type BaileDeFavelaProps = Partial<SmartLink>;

// Função para extrair o ID do conteúdo do Spotify a partir de uma URL
const getSpotifyEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        const urlObject = new URL(url);
        const pathParts = urlObject.pathname.split('/').filter(part => part);
        // Ex: /track/12345 -> ['track', '12345']
        if (pathParts.length >= 2) {
            const embedType = pathParts[0]; // track, album, playlist, artist
            const embedId = pathParts[1];
            // Apenas tipos que funcionam bem com o player compacto
            if (['track', 'album', 'playlist'].includes(embedType)) {
                return `https://open.spotify.com/embed/${embedType}/${embedId}?utm_source=generator&theme=0`;
            }
        }
    } catch (error) {
        console.error("URL do Spotify inválida:", error);
        return null;
    }
    return null;
};

const BaileDeFavela: React.FC<BaileDeFavelaProps> = (data) => {
    const {
        id, // Adicionando o ID para tracking
        artist_name = 'Nome do Artista',
        release_title = 'Título do Lançamento',
        feat, // Featuring/participação especial
        avatar_url, // Recebe a URL da imagem do avatar (pode ser blob ou URL final)
        cover_image_url, // Recebe a URL da imagem de capa
        platforms = [],
        social_links = [],
        contact_button_text = 'Contato',
        contact_button_url,
    } = data;

    // Hook de tracking
    const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();    // Track page view on component mount
    useEffect(() => {
        if (id) {
            trackPageView(id, 'smartlink');
        }
    }, [id, trackPageView]);

    // Encontra o link do Spotify para o player embutido
    const spotifyLink = (platforms || []).find(p => p.platform_id === 'spotify' && p.url);
    const spotifyEmbedUrl = spotifyLink ? getSpotifyEmbedUrl(spotifyLink.url) : null;

    // Mapeia os links recebidos para incluir os dados completos da plataforma (ícone, nome, etc.)
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

    // Fallback para o avatar se a URL não estiver presente
    const avatarSrc = avatar_url || '/assets/defaults/default-avatar.png';
    const coverSrc = cover_image_url || '/assets/defaults/default-cover.png';

    // Estilo do container principal com a imagem de fundo e um overlay mais sutil
    const containerStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${process.env.PUBLIC_URL}/assets/templates/concrete-wall.jpg)`,
    };

    return (
        <div style={containerStyle} className="baile-de-favela-bg flex items-center justify-center">
          <div className="max-w-md w-full mx-auto relative z-10 p-4">
            
            <header className="text-center mb-6">              <div className="relative w-32 h-32 mx-auto mb-4">
                <img 
                  src={avatarSrc} 
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover urban-avatar-border cursor-pointer"
                  onClick={() => {
                    if (id) {
                      trackCustomEvent(id, 'smartlink', 'avatar_click');
                    }
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {artist_name}
              </h1>
              {feat && (
                <p className="text-yellow-400 text-sm font-medium mt-1">
                  feat. {feat}
                </p>
              )}
              {release_title && (
                <p className="text-lg text-gray-300 font-light mt-1">
                  {release_title}
                </p>
              )}
            </header>
  
            <main>
              {/* Player do Spotify embutido, se houver um link válido */}
              {spotifyEmbedUrl && (
                <div className="spotify-embed-container">
                    <iframe
                        title="Spotify Embed Player"
                        src={spotifyEmbedUrl}
                        width="100%"
                        height="80" // Altura para o player compacto
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    ></iframe>
                </div>
              )}

              {/* Renderiza a imagem de capa se não houver player do Spotify */}
              {!spotifyEmbedUrl && cover_image_url && (
                <div className="mb-6">
                  <img 
                    src={coverSrc} 
                    alt={artist_name} 
                    className="w-full rounded-lg object-cover shadow-xl border-2 border-gray-600"
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              )}
  
              <section className="mb-8">
                <div className="flex flex-col space-y-4">
                  {finalPlatforms.map((link, index) => {
                    const Icon = link.icon;
                    // Não renderiza o botão do Spotify se o player já estiver visível
                    if (link.platform_id === 'spotify' && spotifyEmbedUrl) {
                        return null;
                    }
                    return (                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="urban-link-btn"
                        onClick={() => {
                            if (id && link.platform_id) {
                                trackClick(id, 'smartlink', link.platform_id);
                            }
                        }}
                      >
                        {Icon && <Icon className="w-6 h-6 mr-4" />}
                        <span>{link.name || link.platform_id}</span>
                      </a>
                    );
                  })}
                </div>
              </section>
  
              {finalSocials.length > 0 && (
                <footer className="text-center mb-6">
                  <div className="social-links-container">
                    {finalSocials.map((link, index) => {
                      const Icon = link.icon;
                      return (                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="urban-social-btn"
                          aria-label={link.name}                          onClick={() => {
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

              {/* Botão de Contato */}
              {contact_button_url && (
                <div className="text-center mt-6">
                  <a 
                    href={contact_button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
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

export default BaileDeFavela;
