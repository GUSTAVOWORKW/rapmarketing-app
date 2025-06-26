// src/components/PresaveTemplates/HolographicPresave.tsx
import React, { useEffect } from 'react';
import './HolographicPresave.css';
import { PresaveTemplateProps, PlatformLink, SocialLink, ContactLink } from '../../types/PresaveTemplate';
// Novos hooks reutilizáveis
import useCountdown from '../../hooks/common/useCountdown';
import usePlatformClick from '../../hooks/common/usePlatformClick';
import useCompatibleLinks from '../../hooks/common/useCompatibleLinks';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import { formatReleaseDate } from '../../utils/common/dateUtils';

const HolographicPresave: React.FC<PresaveTemplateProps> = ({
  id, // Adicionando ID para tracking
  artistName,
  trackName,
  releaseDate,
  artworkUrl,
  platformLinks = [],
  socialLinks = [],
  contactLinks = [],
  isMobilePreview = false,
  isReleased = false,
  onPlatformClick,
  // Compatibilidade com props legadas
  streamingLinks = [],
  socialMediaLinks = [],
  contactLinksList = []
}) => {  // Hook de tracking - usando todas as funções
  const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();

  // Track page view on component mount
  useEffect(() => {
    if (id) {
      trackPageView(id, 'presave');
    }
  }, [id, trackPageView]);  // Usar novos hooks para lógica reutilizável
  const { timeLeft, hasCountdown } = useCountdown(releaseDate, isReleased);
  const { handleLinkClick } = usePlatformClick(onPlatformClick);
  const { 
    platformLinks: platforms, 
    socialLinks: socials, 
    contactLinks: contacts 
  } = useCompatibleLinks({
    platformLinks,
    socialLinks,
    contactLinks,
    streamingLinks,
    socialMediaLinks,
    contactLinksList
  });

  // Símbolos de dinheiro para o background
  const moneySymbols = ['$', '₹', '£', '€', '¥', '₽', '₩', '₦', '₡'];

  return (
    <div className="holographic-container">
      {/* Background de chuva de dinheiro */}
      <div className="money-background">
        {moneySymbols.map((symbol, index) => (
          <div key={index} className="money-symbol">
            {symbol}
          </div>
        ))}
      </div>

      {/* Background holográfico */}
      <div className="holo-background"></div>

      {/* Conteúdo principal */}
      <div className="holo-content">
        {/* Header com tema trap */}
        <div className="holo-header">
          <div className="trap-logo">
            <span className="dollar-icon">💰</span>
            <h1 className="trap-title">TRAP FUTURE</h1>
            <span className="dollar-icon">💎</span>
          </div>
          <p className="trap-subtitle">MONEY MOVES PRESAVE</p>
        </div>

        {/* Artwork com moldura dourada */}
        <div className="artwork-section">
          <div className="artwork-frame">
            <img 
              src={artworkUrl || '/assets/defaults/default-artwork.jpg'} 
              alt={`${trackName} artwork`}
              className="artwork-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
              }}
            />
            {!isReleased && (
              <div className="money-badge">COMING SOON</div>
            )}
          </div>
        </div>

        {/* Informações da track */}
        <div className="track-info">
          <h2 className="track-name">{trackName || 'NOVA TRACK'}</h2>
          <h3 className="artist-name">{artistName || 'ARTISTA'}</h3>            <div className="release-info">
            {!isReleased && timeLeft && hasCountdown && (
              <div className="countdown-timer">
                DROP EM: {timeLeft}
              </div>
            )}
            {isReleased && (
              <div className="release-date">
                LANÇADO EM: {formatReleaseDate(releaseDate) || 'Data não definida'}
              </div>
            )}
          </div>
        </div>

        {/* Links das plataformas */}
        {platforms.length > 0 && (
          <div className="platforms-section">
            <h3 className="section-title">
              {isReleased ? 'STREAM NOW' : 'PRESAVE NOW'}
            </h3>            <div className="platforms-grid">
              {platforms.map((platform: any, index: number) => {
                const IconComponent = platform.icon;
                
                return (                  <button
                    key={platform.id || index}
                    className="platform-button"
                    onClick={() => {
                      handleLinkClick(platform);
                      if (id && platform.platform_id) {
                        trackClick(id, 'presave', platform.platform_id);
                      }
                    }}
                    style={{ borderColor: platform.color }}
                  >
                    <div className="platform-icon">
                      {IconComponent ? (
                        <IconComponent style={{ color: platform.color }} />
                      ) : platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} />
                      ) : (
                        <span>{platform.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span className="platform-name">
                      {platform.name || 'PLATAFORMA'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}        {/* Links sociais */}
        {socials.length > 0 && (
          <div className="social-section">
            <h3 className="section-title">FOLLOW THE WAVE</h3>
            <div className="social-links">
              {socials.map((social: any, index: number) => {
                const IconComponent = social.icon;
                
                return (                  <a
                    key={social.id || index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ color: social.color }}                    onClick={() => {
                      if (id && social.platform) {
                        trackShare(id, 'presave', social.platform);
                      }
                    }}
                  >
                    {IconComponent && <IconComponent className="social-icon" />}
                    <span>{social.platformName || social.platform || social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Links de contato */}
        {contacts.length > 0 && (
          <div className="contact-section">
            <h3 className="section-title">BUSINESS</h3>            <div className="contact-links">
              {contacts.map((contact: ContactLink, index: number) => (                <a
                  key={contact.id || index}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"                  onClick={() => {
                    if (id && contact.type) {
                      trackCustomEvent(id, 'presave', `contact_${contact.type}`);
                    }
                  }}
                >
                  {contact.type || contact.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="holo-footer">
          <p className="footer-text">POWERED BY RAPMARKETING</p>
        </div>
      </div>
    </div>
  );
};

export default HolographicPresave;
