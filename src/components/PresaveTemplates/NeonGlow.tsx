// src/components/PresaveTemplates/NeonGlow.tsx
import React from 'react';
import { PresaveTemplateProps, PlatformLink, SocialLink, ContactLink } from '../../types/PresaveTemplate';
import styles from './NeonGlow.module.css';
// Novos hooks reutilizáveis
import useCountdown from '../../hooks/common/useCountdown';
import usePlatformClick from '../../hooks/common/usePlatformClick';
import useCompatibleLinks from '../../hooks/common/useCompatibleLinks';
import { formatReleaseDate } from '../../utils/common/dateUtils';

const NeonGlow: React.FC<PresaveTemplateProps & { disableInteractions?: boolean }> = ({
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
  disableInteractions = false, // Adiciona a nova prop
  // Compatibilidade com props legadas
  streamingLinks = [],
  socialMediaLinks = [],
  contactLinksList = []
}) => {
  // Usar novos hooks para lógica reutilizável
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
    socialMediaLinks,    contactLinksList
  });

  return (
    <div 
      className={`${styles.neonContainer} ${isMobilePreview ? styles.mobile : ''}`}
      style={disableInteractions ? { pointerEvents: 'none' } : {}}
    >
      {/* Background com efeito matrix */}
      <div className={styles.matrixBackground}>
        <div className={styles.matrixLines}></div>
        <div className={styles.matrixGrid}></div>
      </div>

      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Header com logo neon */}
        <div className={styles.header}>
          <div className={styles.neonLogo}>
            <span className={styles.neonText}>PRESAVE</span>
            <div className={styles.neonUnderline}></div>
          </div>
        </div>

        {/* Artwork com moldura neon */}
        <div className={styles.artworkSection}>
          <div className={styles.artworkFrame}>
            <div className={styles.artworkGlow}></div>
            <img 
              src={artworkUrl || '/assets/defaults/default-artwork.jpg'} 
              alt={`${trackName} artwork`}
              className={styles.artwork}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
              }}
            />
            {!isReleased && (
              <div className={styles.comingSoonBadge}>
                <span>INCOMING</span>
              </div>
            )}
          </div>
        </div>

        {/* Informações da música */}
        <div className={styles.trackInfo}>
          <h1 className={styles.trackName}>{trackName || 'Nome da Música'}</h1>
          <h2 className={styles.artistName}>{artistName || 'Nome do Artista'}</h2>
          <div className={styles.releaseDate}>
            <span className={styles.dateLabel}>
              {isReleased ? 'RELEASED' : 'DROPPING'}
            </span>
            <span className={styles.dateValue}>
              {formatReleaseDate(releaseDate) || 'Data não definida'}
            </span>
          </div>
        </div>

        {/* Links das plataformas */}
        {platforms.length > 0 && (
          <div className={styles.platformsSection}>
            <h3 className={styles.sectionTitle}>
              {isReleased ? 'STREAM NOW' : 'PRESAVE NOW'}
            </h3>            <div className={styles.platformGrid}>
              {platforms.map((platform: any, index: number) => {
                const IconComponent = platform.icon;
                
                return (
                  <button
                    key={platform.id || index}
                    className={styles.platformButton}
                    onClick={() => handleLinkClick(platform)}
                    style={{
                      '--platform-color': platform.color || platform.brand_color || '#00ffff'
                    } as React.CSSProperties}
                  >
                    <div className={styles.platformIcon}>
                      {IconComponent ? (
                        <IconComponent style={{ color: platform.color }} />
                      ) : platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} />
                      ) : (
                        <span>{platform.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span className={styles.platformName}>
                      {platform.name || 'Plataforma'}
                    </span>
                    <div className={styles.platformGlow}></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}        {/* Links sociais */}
        {socials.length > 0 && (
          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>CONNECT</h3>
            <div className={styles.socialGrid}>
              {socials.map((social: any, index: number) => {
                const IconComponent = social.icon;
                
                return (
                  <a
                    key={social.id || index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    style={{ color: social.color }}
                  >
                    <span className={styles.socialContent}>
                      {IconComponent && <IconComponent className={styles.socialIcon} />}
                      <span>{social.platformName || social.platform || social.name}</span>
                    </span>
                    <div className={styles.socialGlow}></div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Links de contato */}
        {contacts.length > 0 && (
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>CONTACT</h3>
            <div className={styles.contactGrid}>
              {contacts.map((contact: ContactLink, index: number) => (
                <a
                  key={contact.id || index}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <span>{contact.type || contact.name}</span>
                  <div className={styles.contactGlow}></div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer com efeito neon */}
        <div className={styles.footer}>
          <div className={styles.footerLine}></div>
          <span className={styles.footerText}>POWERED BY RAPMARKETING</span>
        </div>
      </div>
    </div>
  );
};

export default NeonGlow;