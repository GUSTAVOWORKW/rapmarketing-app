import React, { useEffect } from 'react';
import { PLATFORMS as allPlatforms } from '../../data/platforms';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaTiktok, FaAt } from 'react-icons/fa';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import { SOCIAL_PLATFORMS } from '../../data/socials';

interface Platform {
  id: string;
  name: string;
  url: string;
  icon?: any;
}
interface SocialLink {
  id: string;
  name: string;
  url: string;
}

interface HolographicProps {
  artistName: string;
  artistTitle?: string;
  avatarUrl: string;
  bio?: string;
  releaseTitle: string;
  feat?: string;
  coverImageUrl: string;
  playerUrl?: string;
  platforms: Platform[];
  socialLinks: SocialLink[];
  contactButtonText?: string;
  contactButtonUrl?: string;
}

const Holographic: React.FC<HolographicProps> = ({ 
  artistName, 
  artistTitle = '', 
  avatarUrl, 
  bio = '', 
  releaseTitle, 
  feat = '', 
  coverImageUrl, 
  playerUrl = '', 
  platforms = [], 
  socialLinks = [], 
  contactButtonText = '💼 Contato para Shows', 
  contactButtonUrl = '#' 
}) => {
  useEffect(() => {
    // Adicionar estilos específicos do template sem afetar o global
    const style = document.createElement('style');
    style.textContent = `
      .holo-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
      }
      .holo-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      }
      .holo-avatar {
        border: 3px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 0 20px rgba(103, 126, 234, 0.5);
      }
      .holo-platform-btn {
        background: linear-gradient(135deg, rgba(103, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }
      .holo-platform-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(103, 126, 234, 0.4);
      }
      .holo-social-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }
      .holo-social-btn:hover {
        background: rgba(103, 126, 234, 0.3);
        transform: scale(1.1);
      }
      .holo-contact-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        box-shadow: 0 4px 15px rgba(103, 126, 234, 0.4);
        transition: all 0.3s ease;
      }
      .holo-contact-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(103, 126, 234, 0.6);
      }
      .holo-floating-elements {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }
      .holo-floating-orb {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: float 6s ease-in-out infinite;
      }
      .holo-floating-orb:nth-child(1) {
        width: 100px;
        height: 100px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      .holo-floating-orb:nth-child(2) {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 15%;
        animation-delay: 2s;
      }
      .holo-floating-orb:nth-child(3) {
        width: 80px;
        height: 80px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @media (max-width: 500px) {
        .holo-container { padding: 0.5rem !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { if (style.parentNode) style.parentNode.removeChild(style); };
  }, []);

  // Garantir coverImageUrl padrão
  const finalCoverImageUrl = coverImageUrl || '/assets/defaults/default-cover.png';

  return (
    <div className="holo-container max-w-full mx-auto p-4 min-h-full relative font-sans">
      {/* Elementos flutuantes holográficos */}
      <div className="holo-floating-elements">
        <div className="holo-floating-orb"></div>
        <div className="holo-floating-orb"></div>
        <div className="holo-floating-orb"></div>
      </div>

      {/* Card principal */}
      <div className="holo-card rounded-2xl p-6 relative z-10">
        {/* Seção do perfil */}
        <div className="text-center mb-6">
          {avatarUrl && (
            <img 
              src={avatarUrl} 
              alt={artistName} 
              className="holo-avatar w-24 h-24 rounded-full object-cover mx-auto mb-4" 
            />
          )}
          <h1 className="text-2xl font-bold text-white mb-1">{artistName}</h1>
          {artistTitle && (
            <p className="text-lg text-blue-200 font-medium mb-2">{artistTitle}</p>
          )}
          {bio && (
            <p className="text-gray-200 text-sm leading-relaxed">{bio}</p>
          )}
        </div>

        {/* Seção do lançamento */}
        <div className="mb-6">
          {finalCoverImageUrl && (
            <img src={finalCoverImageUrl} alt={releaseTitle} className="w-full rounded-xl object-cover mb-4 max-h-48" />
          )}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-1">{releaseTitle}</h3>
            {feat && (
              <p className="text-blue-300 text-sm">Feat: {feat}</p>
            )}
          </div>
        </div>

        {/* Player Spotify */}
        {playerUrl && playerUrl.includes('open.spotify.com') && (
          <div className="mb-6">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(playerUrl);
              return embedUrl ? (
                <iframe
                  style={{ borderRadius: 12 }}
                  src={embedUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Player"
                  className="rounded-xl"
                />
              ) : (
                <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-center">
                  <p className="text-red-200 text-sm">⚠️ URL do Spotify inválido</p>
                  <p className="text-red-300 text-xs mt-1">Formato esperado: https://open.spotify.com/track/ID ou album/ID</p>
                </div>
              );
            })()}
          </div>
        )}        {/* Plataformas de streaming */}
        {platforms && platforms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold mb-4 text-center">🎵 Ouça nas Plataformas</h2>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p, idx) => {
                // Encontrar plataforma usando p.id que agora é o platform_id real
                const platformData = allPlatforms.find(pl => pl.id === p.id);
                const Icon = platformData?.icon;
                
                if (!Icon) {
                  console.error(`Ícone não encontrado para a plataforma: ${p.id}`, { platformData, allPlatforms: allPlatforms.map(ap => ap.id) });
                  throw new Error(`Ícone não encontrado para a plataforma: ${p.id}`);
                }
                
                // Usar o nome correto da plataforma dos dados centralizados
                const platformName = platformData?.name || p.name;
                
                return (
                  <a
                    key={p.id + idx}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="holo-platform-btn flex items-center gap-2 px-3 py-2 rounded-xl text-white font-medium text-sm"
                  >
                    {React.createElement(Icon as React.ComponentType<any>, { size: 20 })}
                    <span className="truncate">{platformName}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Redes sociais */}
        {socialLinks && socialLinks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold mb-4 text-center">📱 Redes Sociais</h2>
            <div className="flex justify-center gap-3 flex-wrap">
              {socialLinks.filter(s => s.url).map(social => {
                const socialData = SOCIAL_PLATFORMS.find(sp => sp.id === social.id || sp.name.toLowerCase() === social.name.toLowerCase());
                const Icon = socialData?.icon;
                if (!Icon) throw new Error(`Ícone não encontrado para a rede social: ${social.id}`);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="holo-social-btn flex items-center justify-center w-12 h-12 rounded-xl text-white"
                    title={social.name}
                  >
                    {React.createElement(Icon as React.ComponentType<any>, { size: 20 })}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão de contato */}
        {contactButtonText && contactButtonUrl && (
          <a
            href={contactButtonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="holo-contact-btn block w-full text-center py-3 rounded-xl text-white font-bold"
          >
            {contactButtonText}
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-white/60 text-xs mt-4">
        Criado com <a href="https://rapmarketing.link" className="text-blue-300 font-medium hover:text-blue-200">RapMarketing.link</a>
      </div>
    </div>
  );
};

export default Holographic;
