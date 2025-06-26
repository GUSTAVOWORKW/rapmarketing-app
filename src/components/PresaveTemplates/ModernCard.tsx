// src/components/PresaveTemplates/ModernCard.tsx - FUNK MODERNO: BAILE NO PÔR DO SOL CARIOCA
import React, { useEffect, useState } from 'react';
import { PresaveTemplateProps } from '../../types/PresaveTemplate';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import styles from './ModernCard.module.css';

const ModernCard: React.FC<PresaveTemplateProps & { id?: string }> = ({
  id, // Adicionado para tracking
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
}) => {
  const [scrollY, setScrollY] = useState(0);
  
  // Hook de tracking - registra page view automaticamente
  const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();

  // Merge de props novas e legadas para compatibilidade
  const platforms = platformLinks.length > 0 ? platformLinks : streamingLinks;
  const socials = socialLinks.length > 0 ? socialLinks : socialMediaLinks;
  const contacts = contactLinks.length > 0 ? contactLinks : contactLinksList;

  // Efeito de paralaxe para o pôr do sol
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Registrar page view apenas se temos um ID válido
  useEffect(() => {
    if (id) {
      trackPageView(id, 'presave');
    }
  }, [id, trackPageView]);
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
    // Registrar click na plataforma se temos ID válido
    if (id) {
      trackClick(id, 'presave', platform.platform_id || platform.id);
    }
    
    if (onPlatformClick) {
      onPlatformClick(platform.platform_id || platform.id, platform.url);
    } else if (platform.url) {
      window.open(platform.url, '_blank');
    }
  };

  const getPlatformAction = (platformName: string) => {
    if (isReleased) {
      return '🔥 ESCUTA AÍ';
    }
    
    const lowerName = platformName.toLowerCase();
    if (lowerName.includes('spotify') || lowerName.includes('apple') || lowerName.includes('deezer')) {
      return '⚡ PRÉ-SAVE JÁ';
    }
    return '� ACESSA';
  };  return (
    <div className={`${styles.sunsetContainer} ${isMobilePreview ? styles.mobile : ''}`}>
      {/* Background de Pôr do Sol com Paralaxe */}
      <div 
        className={styles.sunsetBackground}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
        <div className={styles.heatWave}></div>
        <div className={styles.sunsetGradient}></div>
      </div>

      {/* Card Principal - Laje do Baile */}
      <div className={styles.baileCard}>
        {/* Header - Vibe da Laje */}
        <div className={styles.lajeHeader}>
          <div className={styles.cityVibe}>
            <span className={styles.locationPin}>📍</span>
            <span className={styles.locationText}>RIO DE JANEIRO • BAILE NA LAJE</span>
          </div>
          <div className={styles.sunsetTime}>
            <span className={styles.timeEmoji}>🌅</span>
            <span className={styles.timeText}>PÔR DO SOL</span>
          </div>
        </div>

        {/* Seção do Artwork - Destaque Principal */}
        <div className={styles.artworkSection}>
          <div className={styles.artworkFrame}>
            <div className={styles.artworkGlow}>
              <img 
                src={artworkUrl || '/assets/defaults/default-artwork.jpg'} 
                alt={`${trackName} artwork`}
                className={styles.artwork}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
                }}
              />
              <div className={styles.artworkReflection}></div>
            </div>
          </div>
          
          <div className={styles.statusVibes}>
            <div className={`${styles.statusBadge} ${isReleased ? styles.released : styles.dropping}`}>
              {isReleased ? '🔥 BOMBANDO' : '⏰ VEM AÍ'}
            </div>
          </div>
        </div>

        {/* Info da Track - Estilo Grafite */}
        <div className={styles.trackSection}>
          <div className={styles.trackHeader}>
            <h1 className={styles.trackTitle}>
              {trackName || 'BATE FORTE O TAMBORZÃO'}
            </h1>
            <h2 className={styles.artistName}>
              {artistName || 'MC DA QUEBRADA'}
            </h2>
          </div>
          
          <div className={styles.releaseInfo}>
            <span className={styles.releaseLabel}>LANÇAMENTO:</span>
            <span className={styles.releaseDate}>
              {formatDate(releaseDate) || 'EM BREVE'}
            </span>
          </div>
        </div>

        {/* Call to Action - "Tá Pronto pro Hit?" */}
        <div className={styles.callToAction}>
          <h3 className={styles.ctaTitle}>TÁ PRONTO PRO HIT?</h3>
          <p className={styles.ctaSubtitle}>
            {isReleased ? 'O som já tá rolando!' : 'Garante já o seu pré-save!'}
          </p>
        </div>

        {/* Plataformas - Botões do Baile */}
        {platforms.length > 0 && (
          <div className={styles.platformsSection}>            <div className={styles.platformsGrid}>
              {platforms.map((platform: any, index) => {
                const IconComponent = platform.icon;
                
                return (
                  <button
                    key={platform.id || index}
                    className={styles.platformButton}
                    onClick={() => handleLinkClick(platform)}
                    style={{ borderColor: platform.color }}
                  >
                    <div className={styles.platformIcon}>
                      {IconComponent ? (
                        <IconComponent style={{ color: platform.color }} />
                      ) : platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} />
                      ) : (
                        <span className={styles.platformInitial}>
                          {platform.name?.charAt(0) || '🎵'}
                        </span>
                      )}
                    </div>
                    <div className={styles.platformContent}>
                      <span className={styles.platformName}>
                        {platform.name || 'PLATAFORMA'}
                      </span>
                      <span className={styles.platformAction}>
                        {getPlatformAction(platform.name || '')}
                      </span>
                    </div>                    <div className={styles.platformArrow}>→</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}        {/* Redes Sociais - Conecta com a Galera */}
        {socials.length > 0 && (
          <div className={styles.socialSection}>
            <h4 className={styles.socialTitle}>CONECTA COM A GALERA</h4>
            <div className={styles.socialGrid}>
              {socials.map((social: any, index) => {
                const IconComponent = social.icon;
                
                return (                  <a
                    key={social.id || index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialButton}
                    style={{ color: social.color }}
                    onClick={() => {
                      // Registrar compartilhamento social se temos ID válido
                      if (id) {
                        trackShare(id, 'presave', social.platform || social.name || 'social');
                      }
                    }}
                  >
                    <span className={styles.socialIcon}>
                      {IconComponent ? (
                        <IconComponent />
                      ) : (
                        social.platform?.charAt(0) || social.name?.charAt(0) || '📱'
                      )}
                    </span>
                    <span className={styles.socialName}>
                      {social.platformName || social.platform || social.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Contatos - Parcerias */}
        {contacts.length > 0 && (
          <div className={styles.contactSection}>
            <h4 className={styles.contactTitle}>PARCERIAS & CONTATOS</h4>
            <div className={styles.contactGrid}>
              {contacts.map((contact, index) => (                <a
                  key={contact.id || index}
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactButton}
                  onClick={() => {
                    // Registrar evento de contato se temos ID válido
                    if (id) {
                      trackCustomEvent(id, 'presave', `contact_${contact.type || contact.name || 'unknown'}`);
                    }
                  }}
                >
                  {contact.type || contact.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Powered by */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <span className={styles.footerText}>
              POWERED BY RAPMARKETING
            </span>
            <span className={styles.footerEmoji}>🚀</span>
          </div>
          <div className={styles.footerWave}></div>
        </div>
      </div>
    </div>
  );
};

export default ModernCard;
