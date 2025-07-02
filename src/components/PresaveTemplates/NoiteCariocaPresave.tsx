// src/components/PresaveTemplates/NoiteCariocaPresave.tsx - NOITE CARIOCA
import React, { useState, useEffect } from 'react';
import { PresaveTemplateProps } from '../../types/PresaveTemplate';
import PlatformIcon from '../ui/PlatformIcon';
import styles from './NoiteCariocaPresave.module.css';

const NoiteCariocaPresave: React.FC<PresaveTemplateProps & { disableInteractions?: boolean }> = ({
  artistName,
  trackName,
  releaseDate,
  artworkUrl,
  platformLinks = [],
  socialLinks = [],
  contactLinks = [],
  isMobilePreview = false,
  isReleased = false,
  backgroundColor,
  customColors,
  onPlatformClick,
  // Compatibilidade com props legadas
  streamingLinks,
  socialMediaLinks,
  contactLinksList,
}) => {  const [timeLeft, setTimeLeft] = useState('');

  // Usar arrays novos ou fallback para legados
  const displayPlatformLinks = platformLinks.length > 0 ? platformLinks : (streamingLinks || []);
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : (socialMediaLinks || []);
  const displayContactLinks = contactLinks.length > 0 ? contactLinks : (contactLinksList || []);

  // Countdown timer
  useEffect(() => {
    if (!releaseDate || isReleased) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const releaseTime = new Date(releaseDate).getTime();
      const distance = releaseTime - now;

      if (distance < 0) {
        setTimeLeft('Já no ar!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [releaseDate, isReleased]);

  // Handler para cliques em plataformas
  const handlePlatformClick = (platformId: string, url: string) => {
    if (!url || url === '#') return;
    
    if (onPlatformClick) {
      onPlatformClick(platformId, url);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  // CSS custom properties usando backgroundColor do sistema
  const cssCustomProperties = {
    '--accent-color': backgroundColor || '#00D4FF',
    '--bg-color': backgroundColor || '#00D4FF',
  } as React.CSSProperties;

  return (
    <div 
      className={`${styles.noiteContainer} ${isMobilePreview ? styles.mobile : ''}`}
      style={{
        ...cssCustomProperties,
        ...(disableInteractions ? { pointerEvents: 'none' } : {}),
      }}
    >
      {/* Background Video/Image */}
      <div className={styles.backgroundMedia}>
        <div className={styles.cityLights}></div>
        <div className={styles.darkOverlay}></div>
      </div>

      {/* Lens Flare Effect */}
      <div className={styles.lensFlare}></div>

      {/* Container Principal */}
      <div className={styles.contentContainer}>
        
        {/* Header Cinematográfico */}
        <div className={styles.cinematicHeader}>
          <div className={styles.brandArea}>
            <div className={styles.templateLabel}>NOITE CARIOCA</div>
            <div className={styles.subtitle}>A ambição, a rua e a melancolia</div>
          </div>
        </div>

        {/* Área Central - Artwork e Info */}
        <div className={styles.centralArea}>
          
          {/* Artwork */}
          {artworkUrl && (
            <div className={styles.artworkSection}>
              <div className={styles.artworkFrame}>
                <img 
                  src={artworkUrl} 
                  alt={`${trackName} - ${artistName}`}
                  className={styles.artwork}
                />
                <div className={styles.artworkGlow}></div>
              </div>
            </div>
          )}

          {/* Informações da Música */}
          <div className={styles.trackInfo}>
            {artistName && (
              <h1 className={styles.artistName}>{artistName}</h1>
            )}
              {trackName && (
              <h2 className={styles.trackName}>{trackName}</h2>
            )}

            {/* Countdown */}
            {!isReleased && timeLeft && timeLeft !== 'Já no ar!' && (
              <div className={styles.countdown}>
                <div className={styles.countdownLabel}>LANÇA EM:</div>
                <div className={styles.countdownTimer}>{timeLeft}</div>
              </div>
            )}

            {/* Data de Lançamento (somente se já foi lançado) */}
            {isReleased && releaseDate && (
              <div className={styles.releaseInfo}>
                <div className={styles.releaseLabel}>Disponível desde</div>
                <div className={styles.releaseDate}>
                  {new Date(releaseDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })} às {new Date(releaseDate).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plataformas */}
        {displayPlatformLinks.length > 0 && (
          <div className={styles.platformsSection}>
            <h3 className={styles.sectionTitle}>
              {isReleased ? 'Disponível em' : 'Pré-salvar em'}
            </h3>
              <div className={styles.platformGrid}>
              {displayPlatformLinks
                .filter(link => link.url && link.url.trim() && link.url !== '#')
                .map((link: any) => {
                  const IconComponent = link.icon;
                  
                  return (
                    <button
                      key={link.id || link.platform_id}
                      className={styles.platformButton}
                      onClick={() => handlePlatformClick(link.platform_id || link.id, link.url)}
                      style={{ color: link.color }}
                    >
                      <div className={styles.platformIcon}>
                        {IconComponent ? (
                          <IconComponent className="platform-icon" />
                        ) : (
                          <span>{link.name?.charAt(0) || '?'}</span>
                        )}
                      </div>                      <div className={styles.platformName}>
                        {link.name || link.platform_id}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Redes Sociais */}
        {displaySocialLinks.length > 0 && (
          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>Conecte-se</h3>
              <div className={styles.socialGrid}>
              {displaySocialLinks
                .filter(link => link.url && link.url.trim() && link.url !== '#')
                .map((link: any) => {
                  const IconComponent = link.icon;
                  
                  return (
                    <button
                      key={link.id}
                      className={styles.socialButton}
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      style={{ color: link.color }}
                    >
                      <div className={styles.socialIcon}>
                        {IconComponent ? (
                          <IconComponent />
                        ) : (
                          <span>{link.platformName?.charAt(0) || link.platform?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span>{link.platformName || link.name || link.platform}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Contatos */}
        {displayContactLinks.length > 0 && (
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contato</h3>
            
            <div className={styles.contactList}>
              {displayContactLinks
                .filter(link => link.url && link.url.trim() && link.url !== '#')
                .map((link) => (
                  <button
                    key={link.id}
                    className={styles.contactButton}
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    {link.name || link.type}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Footer Cinematográfico */}
        <div className={styles.cinematicFooter}>
          <div className={styles.footerLine}></div>
          <div className={styles.footerText}>
            <span className={styles.attribution}>Som da madrugada</span>
            <span className={styles.brand}>RapMarketing</span>
          </div>
          <div className={styles.footerLine}></div>
        </div>

      </div>
    </div>
  );
};

export default NoiteCariocaPresave;
