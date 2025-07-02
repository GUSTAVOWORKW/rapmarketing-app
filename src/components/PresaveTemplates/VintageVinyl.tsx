// src/components/PresaveTemplates/VintageVinyl.tsx
import React from 'react';
import { PresaveTemplateProps, PlatformLink, SocialLink, ContactLink } from '../../types/PresaveTemplate';
import styles from './VintageVinyl.module.css';
// Novos hooks reutilizáveis
import usePlatformClick from '../../hooks/common/usePlatformClick';
import useCompatibleLinks from '../../hooks/common/useCompatibleLinks';
import { formatReleaseDate } from '../../utils/common/dateUtils';

const VintageVinyl: React.FC<PresaveTemplateProps> = ({
  artistName,
  trackName,
  releaseDate,
  artworkUrl,
  platformLinks = [],
  socialLinks = [],
  contactLinks = [],
  isMobilePreview = false,
  isReleased = false,
  disableInteractions = false,
  onPlatformClick,
  // Compatibilidade com props legadas
  streamingLinks = [],
  socialMediaLinks = [],
  contactLinksList = []
}) => {
  // Usar novos hooks para lógica reutilizável
  const { handleLinkClick } = usePlatformClick(onPlatformClick);
  const { 
    platformLinks: platforms, 
    socialLinks: socials, 
    contactLinks: contacts 
  } = useCompatibleLinks({
    platformLinks,
    socialLinks,
    contactLinks,
    streamingLinks,    socialMediaLinks,
    contactLinksList
  });

  return (
    <div 
      className={`${styles.vintageContainer} ${isMobilePreview ? styles.mobile : ''}`}
      style={disableInteractions ? { pointerEvents: 'none' } : {}}
    >
      {/* Background textures */}
      <div className={styles.paperTexture}></div>
      <div className={styles.vinylPattern}></div>

      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Header vintage */}
        <div className={styles.header}>
          <h1 className={styles.vintageTitle}>PRESAVE</h1>
          <p className={styles.subtitle}>Vintage Music Experience</p>
        </div>

        {/* Seção do disco de vinil */}
        <div className={styles.vinylSection}>
          <div className={styles.vinylRecord}>
            <div className={styles.vinylCenter}></div>
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
                EM BREVE
              </div>
            )}
          </div>
        </div>

        {/* Informações da música */}
        <div className={styles.trackInfo}>
          <h2 className={styles.trackName}>{trackName || 'Nome da Música'}</h2>
          <h3 className={styles.artistName}>{artistName || 'Nome do Artista'}</h3>
          <div className={styles.releaseInfo}>
            <span className={styles.dateLabel}>
              {isReleased ? 'Lançado em' : 'Lançamento'}
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
              {isReleased ? 'Ouça Agora' : 'Pré-Save Agora'}
            </h3>            <div className={styles.platformGrid}>
              {platforms.map((platform: any, index: number) => {
                const IconComponent = platform.icon;
                
                return (
                  <button
                    key={platform.id || index}
                    className={styles.platformButton}
                    onClick={() => handleLinkClick(platform)}
                    style={{ color: platform.color }}
                  >
                    <div className={styles.platformIcon}>
                      {IconComponent ? (
                        <IconComponent />
                      ) : platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} />
                      ) : (
                        <span>{platform.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>{platform.name || 'Plataforma'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}        {/* Links sociais */}
        {socials.length > 0 && (
          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>Redes Sociais</h3>
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
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Links de contato */}
        {contacts.length > 0 && (
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contato</h3>
            <div className={styles.contactGrid}>
              {contacts.map((contact: ContactLink, index: number) => (
                <a
                  key={contact.id || index}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  {contact.type || contact.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Powered by RapMarketing - Experience the vintage sound
          </p>
        </div>
      </div>
    </div>
  );
};

export default VintageVinyl;
