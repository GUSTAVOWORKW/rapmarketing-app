// src/components/PresaveTemplates/RepenteRusticoPresave.tsx - REPENTE RÚSTICO
import React, { useState, useEffect } from 'react';
import { PresaveTemplateProps } from '../../types/PresaveTemplate';
import PlatformIcon from '../ui/PlatformIcon';
import styles from './RepenteRusticoPresave.module.css';

const RepenteRusticoPresave: React.FC<PresaveTemplateProps> = ({
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

  // Cor fixa: Verde Cacto
  const accentColor = '#6B7F3A';

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
        setTimeLeft(`${days} dias, ${hours} horas`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} horas, ${minutes} min`);
      } else {
        setTimeLeft(`${minutes} min, ${seconds} seg`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [releaseDate, isReleased]);

  // Handle platform click
  const handlePlatformClick = (platformId: string, url: string) => {
    if (onPlatformClick) {
      onPlatformClick(platformId, url);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  // CSS custom properties para cor de destaque
  const cssCustomProperties = {
    '--accent-color': accentColor,
  } as React.CSSProperties;

  return (
    <div 
      className={`${styles.repenteContainer} ${isMobilePreview ? styles.mobile : ''}`}
      style={{
        ...cssCustomProperties,
        ...(disableInteractions ? { pointerEvents: 'none' } : {}),
      }}
    >
      {/* Background com textura de papel e juta */}
      <div className={styles.textureBackground}>
        <div className={styles.paperTexture}></div>
        <div className={styles.jutaOverlay}></div>
      </div>      {/* Container Principal como Folheto de Cordel */}
      <div className={styles.cordelPage}>
        
        {/* Cabeçalho do Folheto */}
        <div className={styles.cordelHeader}>
          <div className={styles.xilogravuraIcon}>🌵</div>
          <div className={styles.headerText}>
            <div className={styles.templateLabel}>REPENTE RÚSTICO</div>
            <div className={styles.subtitle}>A poesia da rua com a força do sertão</div>
          </div>
        </div>

        {/* Nome do Artista - Estilo Xilogravura */}
        <h1 className={styles.artistName}>
          {artistName || 'CANTADOR DESCONHECIDO'}
        </h1>

        {/* Container da Artwork */}
        <div className={styles.artworkSection}>
          <div className={styles.artworkFrame}>
            <img
              src={artworkUrl || '/assets/defaults/default-artwork.jpg'}
              alt={`${trackName} - ${artistName}`}
              className={styles.artwork}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
              }}
            />
            <div className={styles.artworkBorder}></div>
          </div>
        </div>

        {/* Título da Música - Estilo Cordel */}
        <div className={styles.titleSection}>
          <div className={styles.ornament}>✦ ✦ ✦</div>
          <h2 className={styles.trackName}>
            {trackName || 'História sem nome'}
          </h2>
          <div className={styles.ornament}>✦ ✦ ✦</div>
        </div>        {/* Countdown */}
        {!isReleased && timeLeft && timeLeft !== 'Já no ar!' && (
          <div className={styles.countdown}>
            <div className={styles.countdownLabel}>Faltam:</div>
            <div className={styles.countdownTimer}>{timeLeft}</div>
            <div className={styles.countdownText}>para a estreia</div>
          </div>
        )}

        {/* Informações de Lançamento (somente se já foi lançado) */}
        {isReleased && releaseDate && (
          <div className={styles.releaseSection}>
            <div className={styles.releaseLabel}>Publicado em:</div>
            <div className={styles.releaseDate}>
              {new Date(releaseDate).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} às {new Date(releaseDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}

        {/* Plataformas */}
        {displayPlatformLinks.length > 0 && (
          <div className={styles.platformsSection}>
            <h3 className={styles.sectionTitle}>
              {isReleased ? 'Escute onde quiser' : 'Reserve seu lugar'}
            </h3>
              <div className={styles.platformList}>
              {displayPlatformLinks
                .filter(link => link.url && link.url.trim() && link.url !== '#')
                .map((link: any) => {
                  const IconComponent = link.icon;
                  
                  return (
                    <button
                      key={link.id || link.platform_id}
                      className={styles.platformButton}
                      onClick={() => handlePlatformClick(link.platform_id || link.id, link.url)}
                      style={{ borderColor: link.color }}
                    >
                      <div className={styles.platformIcon}>
                        {IconComponent ? (
                          <IconComponent className="platform-icon" style={{ color: link.color }} />
                        ) : (
                          <span>{link.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className={styles.platformInfo}>
                        <div className={styles.platformName}>
                          {link.name || link.platform_id}
                        </div>                        <div className={styles.platformAction}>
                          {isReleased ? 'Ouvir agora' : 'Pré-salvar'}
                        </div>
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
            <h3 className={styles.sectionTitle}>Siga o cantador</h3>
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
                      style={{ borderColor: link.color }}
                    >
                      <div className={styles.socialIcon}>
                        {IconComponent ? (
                          <IconComponent style={{ color: link.color }} />
                        ) : (
                          <span>{link.platformName?.charAt(0) || link.name?.charAt(0) || '?'}</span>
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

        {/* Rodapé do Cordel */}
        <div className={styles.cordelFooter}>
          <div className={styles.footerOrnament}>※ ※ ※</div>
          <div className={styles.footerText}>
            <div className={styles.attribution}>Literatura digital</div>
            <div className={styles.brand}>RapMarketing</div>
          </div>
          <div className={styles.footerOrnament}>※ ※ ※</div>
        </div>

      </div>
    </div>
  );
};

export default RepenteRusticoPresave;
