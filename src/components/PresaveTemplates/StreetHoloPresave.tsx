// src/components/PresaveTemplates/StreetHoloPresave.tsx - RITMO DA D17 - BAILES DE RUA SP
import React, { useState, useEffect } from 'react';
import { PresaveTemplateProps } from '../../types/PresaveTemplate';
import styles from './StreetHoloPresave.module.css';

const StreetHoloPresave: React.FC<PresaveTemplateProps> = ({
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
  const [strobeActive, setStrobeActive] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);

  // Merge de props novas e legadas
  const platforms = platformLinks.length > 0 ? platformLinks : streamingLinks;
  const socials = socialLinks.length > 0 ? socialLinks : socialMediaLinks;
  const contacts = contactLinks.length > 0 ? contactLinks : contactLinksList;

  // Efeito estroboscópico
  useEffect(() => {
    const strobeInterval = setInterval(() => {
      setStrobeActive(prev => !prev);
    }, 2000);

    return () => clearInterval(strobeInterval);
  }, []);

  // Pulsação no ritmo da batida
  useEffect(() => {
    const beatInterval = setInterval(() => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 150);
    }, 600); // BPM típico do funk

    return () => clearInterval(beatInterval);
  }, []);
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLinkClick = (platform: any) => {
    if (onPlatformClick) {
      onPlatformClick(platform.platform_id || platform.id, platform.url);
    } else if (platform.url) {
      window.open(platform.url, '_blank');
    }
  };

  const getPlatformAction = (platformName: string) => {
    if (isReleased) {
      return 'OUVIR AGORA';
    }
    
    const lowerName = platformName.toLowerCase();
    if (lowerName.includes('spotify') || lowerName.includes('apple') || lowerName.includes('deezer')) {
      return 'PRÉ-SAVE';
    }
    return 'ACESSAR';
  };

  return (
    <div 
      className={`${styles.d17Container} ${isMobilePreview ? styles.mobile : ''}`}
      style={disableInteractions ? { pointerEvents: 'none' } : {}}
    >
      {/* Background de Rua com Textura */}
      <div className={styles.streetBackground}>
        <div className={styles.concreteTexture}></div>
        <div className={styles.graffitiWall}>
          <div className={styles.d17Tag}>17</div>
        </div>
        <div className={`${styles.strobeLight} ${strobeActive ? styles.active : ''}`}></div>
      </div>

      {/* Card Principal - Estética de Rua */}
      <div className={`${styles.streetCard} ${beatPulse ? styles.beatPulse : ''}`}>
        
        {/* Header com Logo D17 */}
        <div className={styles.streetHeader}>
          <div className={styles.logoArea}>
            <span className={styles.logoText}>RapMarketing</span>
            <div className={styles.districtTag}>D17</div>
          </div>
          <div className={styles.statusIndicator}>
            <span className={`${styles.statusDot} ${isReleased ? styles.live : styles.upcoming}`}></span>
            <span className={styles.statusText}>
              {isReleased ? 'NO AR' : 'EM BREVE'}
            </span>
          </div>
        </div>

        {/* Artwork Central com Efeitos Neon */}
        <div className={styles.artworkZone}>
          <div className={styles.artworkFrame}>
            <div className={styles.neonGlow}></div>
            <img 
              src={artworkUrl || '/assets/defaults/default-artwork.jpg'} 
              alt={`${trackName} artwork`}
              className={styles.artwork}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
              }}
            />
            <div className={styles.scanlines}></div>
          </div>
        </div>

        {/* Info do Track - Tipografia de Rua */}
        <div className={styles.trackInfo}>
          <h1 className={styles.trackTitle}>
            {trackName?.toUpperCase() || 'NOVO HIT'}
          </h1>
          <h2 className={styles.artistName}>
            {artistName?.toUpperCase() || 'MC ARTIST'}
          </h2>
          <div className={styles.releaseInfo}>
            <span className={styles.dateLabel}>LANÇAMENTO:</span>
            <span className={styles.releaseDate}>
              {formatDate(releaseDate) || 'EM BREVE'}
            </span>
          </div>
        </div>

        {/* Seção de Plataformas - Botões Neon */}
        {platforms.length > 0 && (
          <div className={styles.platformsSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {isReleased ? 'OUÇA AGORA' : 'PRÉ-SAVE DISPONÍVEL'}
              </span>
            </div>            <div className={styles.platformGrid}>
              {platforms.map((platform: any, index) => {
                const IconComponent = platform.icon;
                
                return (
                  <button
                    key={platform.id || index}
                    className={styles.neonButton}
                    onClick={() => handleLinkClick(platform)}
                    style={{ borderColor: platform.color }}
                  >
                    <div className={styles.buttonIcon}>
                      {IconComponent ? (
                        <IconComponent style={{ color: platform.color }} />
                      ) : platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} />
                      ) : (
                        <span className={styles.iconLetter}>
                          {platform.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className={styles.buttonContent}>
                      <span className={styles.platformName}>
                        {platform.name?.toUpperCase() || 'PLATAFORMA'}
                      </span>                      <span className={styles.platformAction}>
                        {getPlatformAction(platform.name || '')}
                      </span>
                    </div>
                    <div className={styles.neonArrow}>→</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção Social - Estilo Underground */}
        {socials.length > 0 && (
          <div className={styles.socialSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>REDES SOCIAIS</span>
            </div>            <div className={styles.socialGrid}>
              {socials.map((social: any, index) => {
                const IconComponent = social.icon;
                
                return (
                  <a
                    key={social.id || index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialButton}
                    style={{ borderColor: social.color }}
                  >
                    <span className={styles.socialIcon}>
                      {IconComponent ? (
                        <IconComponent style={{ color: social.color }} />
                      ) : (
                        social.platformName?.charAt(0)?.toUpperCase() || 
                        social.platform?.charAt(0)?.toUpperCase() || 
                        social.name?.charAt(0)?.toUpperCase() || 'S'
                      )}
                    </span>
                    <span className={styles.socialName}>
                      {(social.platformName || social.platform || social.name)?.toUpperCase()}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção de Contato */}
        {contacts.length > 0 && (
          <div className={styles.contactSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>CONTATO</span>
            </div>
            <div className={styles.contactGrid}>
              {contacts.map((contact, index) => (
                <a
                  key={contact.id || index}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactChip}
                >
                  {(contact.type || contact.name)?.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer Street */}
        <div className={styles.streetFooter}>
          <div className={styles.footerContent}>
            <span className={styles.footerText}>POWERED BY RAPMARKETING</span>
            <div className={styles.footerNeon}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StreetHoloPresave;
