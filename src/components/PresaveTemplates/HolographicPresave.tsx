// src/components/PresaveTemplates/HolographicPresave.tsx
import React, { useEffect } from 'react';
import { PresaveTemplateProps, PlatformLink, SocialLink, ContactLink } from '../../types/PresaveTemplate';
// Novos hooks reutilizáveis
import useCountdown from '../../hooks/common/useCountdown';
import usePlatformClick from '../../hooks/common/usePlatformClick';
import useCompatibleLinks from '../../hooks/common/useCompatibleLinks';
import { useMetricsTracking } from '../../hooks/useMetricsTracking';
import { formatReleaseDate } from '../../utils/common/dateUtils';

// Estilos inline para substituir o CSS externo
const styles = {
  // Animações usando CSS-in-JS
  '@keyframes holoShift': {
    '0%': { 
      backgroundPosition: '0% 50%',
      filter: 'hue-rotate(0deg)'
    },
    '25%': { 
      backgroundPosition: '100% 50%',
      filter: 'hue-rotate(90deg)'
    },
    '50%': { 
      backgroundPosition: '0% 100%',
      filter: 'hue-rotate(180deg)'
    },
    '75%': { 
      backgroundPosition: '100% 0%',
      filter: 'hue-rotate(270deg)'
    },
    '100%': { 
      backgroundPosition: '0% 50%',
      filter: 'hue-rotate(360deg)'
    }
  },
  
  container: {
    fontFamily: '"Oswald", "Arial Black", sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%)',
    backgroundSize: '400% 400%',
    animation: 'holoShift 8s ease-in-out infinite',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  
  moneyBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    zIndex: 1
  },
  
  moneySymbol: {
    position: 'absolute' as const,
    fontSize: '2rem',
    color: 'rgba(255, 215, 0, 0.3)',
    animation: 'moneyRain linear infinite',
    fontWeight: 'bold'
  },
  
  holoBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.05) 0%, transparent 50%)
    `,
    zIndex: 0
  },
  
  content: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center' as const,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 215, 0, 0.2)
    `
  },
  
  header: {
    marginBottom: '2rem',
    position: 'relative' as const
  },
  
  trapLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  
  dollarIcon: {
    fontSize: '2rem',
    color: '#FFD700',
    animation: 'diamondPulse 2s ease-in-out infinite',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
  },
  
  trapTitle: {
    fontSize: '2rem',
    fontWeight: 900,
    background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700, #FF6B35)',
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'goldShimmer 3s ease-in-out infinite',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    margin: 0
  },
  
  trapSubtitle: {
    color: 'rgba(255, 215, 0, 0.8)',
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginTop: '0.5rem'
  },
  
  artworkSection: {
    marginBottom: '2rem',
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'center'
  },
  
  artworkFrame: {
    position: 'relative' as const,
    width: '200px',
    height: '200px',
    borderRadius: '15px',
    overflow: 'hidden' as const,
    animation: 'holoFloat 4s ease-in-out infinite'
  },
  
  artworkImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '15px',
    position: 'relative' as const,
    zIndex: 1
  },
  
  moneyBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '-10px',
    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
    color: '#000',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)',
    animation: 'trapGlow 2s ease-in-out infinite'
  },
  
  trackInfo: {
    marginBottom: '2rem',
    textAlign: 'center' as const
  },
  
  trackName: {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#FFD700',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
  },
  
  artistName: {
    fontSize: '1.3rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 1rem 0',
    fontWeight: 600,
    textTransform: 'uppercase' as const
  },
  
  releaseInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  
  countdownTimer: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    padding: '0.7rem 1.5rem',
    borderRadius: '25px',
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em'
  },
  
  releaseDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  
  platformsSection: {
    marginBottom: '2rem'
  },
  
  sectionTitle: {
    color: '#FFD700',
    fontSize: '1.3rem',
    fontWeight: 900,
    marginBottom: '1.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
  },
  
  platformsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  
  platformButton: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#fff',
    textDecoration: 'none',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  
  platformIcon: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 215, 0, 0.2)',
    borderRadius: '8px',
    flexShrink: 0
  },
  
  platformName: {
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  
  socialSection: {
    marginBottom: '1.5rem'
  },
  
  socialLinks: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.8rem',
    justifyContent: 'center'
  },
  
  socialLink: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    textDecoration: 'none',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  socialIcon: {
    fontSize: '1rem'
  },
  
  contactSection: {
    marginBottom: '1.5rem'
  },
  
  contactLinks: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.8rem',
    justifyContent: 'center'
  },
  
  contactLink: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    textDecoration: 'none',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  footer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 215, 0, 0.2)',
    textAlign: 'center' as const
  },
  
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em'
  }
};

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
    <>
      {/* Adicionar estilos de animação inline */}
      <style>
        {`
          @keyframes holoShift {
            0% { 
              background-position: 0% 50%;
              filter: hue-rotate(0deg);
            }
            25% { 
              background-position: 100% 50%;
              filter: hue-rotate(90deg);
            }
            50% { 
              background-position: 0% 100%;
              filter: hue-rotate(180deg);
            }
            75% { 
              background-position: 100% 0%;
              filter: hue-rotate(270deg);
            }
            100% { 
              background-position: 0% 50%;
              filter: hue-rotate(360deg);
            }
          }
          
          @keyframes goldShimmer {
            0% { 
              background-position: -200% 0%;
            }
            100% { 
              background-position: 200% 0%;
            }
          }
          
          @keyframes moneyRain {
            0% { 
              transform: translateY(-100vh) rotate(0deg);
              opacity: 0;
            }
            10% { 
              opacity: 1;
            }
            90% { 
              opacity: 1;
            }
            100% { 
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes holoFloat {
            0%, 100% { 
              transform: translateY(0px) scale(1);
            }
            50% { 
              transform: translateY(-20px) scale(1.05);
            }
          }
          
          @keyframes diamondPulse {
            0%, 100% { 
              transform: scale(1) rotate(0deg);
              opacity: 0.8;
            }
            50% { 
              transform: scale(1.2) rotate(45deg);
              opacity: 1;
            }
          }
          
          @keyframes trapGlow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            50% { 
              box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4);
            }
          }
          
          .holographic-money-symbol:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
          .holographic-money-symbol:nth-child(2) { left: 20%; animation-duration: 10s; animation-delay: 2s; }
          .holographic-money-symbol:nth-child(3) { left: 30%; animation-duration: 12s; animation-delay: 4s; }
          .holographic-money-symbol:nth-child(4) { left: 40%; animation-duration: 9s; animation-delay: 1s; }
          .holographic-money-symbol:nth-child(5) { left: 50%; animation-duration: 11s; animation-delay: 3s; }
          .holographic-money-symbol:nth-child(6) { left: 60%; animation-duration: 13s; animation-delay: 5s; }
          .holographic-money-symbol:nth-child(7) { left: 70%; animation-duration: 10s; animation-delay: 6s; }
          .holographic-money-symbol:nth-child(8) { left: 80%; animation-duration: 14s; animation-delay: 2s; }
          .holographic-money-symbol:nth-child(9) { left: 90%; animation-duration: 12s; animation-delay: 4s; }
          
          .holographic-platform-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .holographic-platform-button:hover::before {
            left: 100%;
          }
          
          .holographic-platform-button:hover {
            transform: translateY(-2px);
            border-color: #FFD700;
            box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
          }
          
          .holographic-social-link:hover,
          .holographic-contact-link:hover {
            background: rgba(255, 215, 0, 0.2);
            border-color: #FFD700;
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
          }
          
          .holographic-artwork-frame::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #FFD700, #00FFFF, #FF00FF, #FFD700);
            background-size: 400% 400%;
            animation: holoShift 2s linear infinite;
            border-radius: 17px;
            z-index: -1;
          }
          
          @media (max-width: 768px) {
            .holographic-container {
              padding: 1rem;
            }
            
            .holographic-content {
              padding: 1.5rem;
            }
            
            .holographic-trap-title {
              font-size: 1.5rem;
            }
            
            .holographic-track-name {
              font-size: 1.5rem;
            }
            
            .holographic-artwork-frame {
              width: 160px;
              height: 160px;
            }
            
            .holographic-platforms-grid {
              grid-template-columns: 1fr;
            }
            
            .holographic-release-info {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}
      </style>
      <div style={styles.container} className="holographic-container">
        {/* Background de chuva de dinheiro */}
        <div style={styles.moneyBackground}>
          {moneySymbols.map((symbol, index) => (
            <div 
              key={index} 
              style={styles.moneySymbol} 
              className="holographic-money-symbol"
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Background holográfico */}
        <div style={styles.holoBackground}></div>

        {/* Conteúdo principal */}
        <div style={styles.content} className="holographic-content">
          {/* Header com tema trap */}
          <div style={styles.header}>
            <div style={styles.trapLogo}>
              <span style={styles.dollarIcon}>💰</span>
              <h1 style={styles.trapTitle} className="holographic-trap-title">TRAP FUTURE</h1>
              <span style={styles.dollarIcon}>💎</span>
            </div>
            <p style={styles.trapSubtitle}>MONEY MOVES PRESAVE</p>
          </div>

          {/* Artwork com moldura dourada */}
          <div style={styles.artworkSection}>
            <div style={styles.artworkFrame} className="holographic-artwork-frame">
              <img 
                src={artworkUrl || '/assets/defaults/default-artwork.jpg'} 
                alt={`${trackName} artwork`}
                style={styles.artworkImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/defaults/default-artwork.jpg';
                }}
              />
              {!isReleased && (
                <div style={styles.moneyBadge}>COMING SOON</div>
              )}
            </div>
          </div>

          {/* Informações da track */}
          <div style={styles.trackInfo}>
            <h2 style={styles.trackName} className="holographic-track-name">{trackName || 'NOVA TRACK'}</h2>
            <h3 style={styles.artistName}>{artistName || 'ARTISTA'}</h3>            
            <div style={styles.releaseInfo} className="holographic-release-info">
              {!isReleased && timeLeft && hasCountdown && (
                <div style={styles.countdownTimer}>
                  DROP EM: {timeLeft}
                </div>
              )}
              {isReleased && (
                <div style={styles.releaseDate}>
                  LANÇADO EM: {formatReleaseDate(releaseDate) || 'Data não definida'}
                </div>
              )}
            </div>
          </div>

          {/* Links das plataformas */}
          {platforms.length > 0 && (
            <div style={styles.platformsSection}>
              <h3 style={styles.sectionTitle}>
                {isReleased ? 'STREAM NOW' : 'PRESAVE NOW'}
              </h3>            
              <div style={styles.platformsGrid} className="holographic-platforms-grid">
                {platforms.map((platform: any, index: number) => {
                  const IconComponent = platform.icon;
                  
                  return (                  
                    <button
                      key={platform.id || index}
                      style={{
                        ...styles.platformButton,
                        borderColor: platform.color
                      }}
                      className="holographic-platform-button"
                      onClick={() => {
                        handleLinkClick(platform);
                        if (id && platform.platform_id) {
                          trackClick(id, 'presave', platform.platform_id);
                        }
                      }}
                    >
                      <div style={styles.platformIcon}>
                        {IconComponent ? (
                          <IconComponent style={{ color: platform.color }} />
                        ) : platform.icon_url ? (
                          <img src={platform.icon_url} alt={platform.name} />
                        ) : (
                          <span>{platform.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span style={styles.platformName}>
                        {platform.name || 'PLATAFORMA'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}        

          {/* Links sociais */}
          {socials.length > 0 && (
            <div style={styles.socialSection}>
              <h3 style={styles.sectionTitle}>FOLLOW THE WAVE</h3>
              <div style={styles.socialLinks}>
                {socials.map((social: any, index: number) => {
                  const IconComponent = social.icon;
                  
                  return (                  
                    <a
                      key={social.id || index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...styles.socialLink,
                        color: social.color
                      }}
                      className="holographic-social-link"
                      onClick={() => {
                        if (id && social.platform) {
                          trackShare(id, 'presave', social.platform);
                        }
                      }}
                    >
                      {IconComponent && <IconComponent style={styles.socialIcon} />}
                      <span>{social.platformName || social.platform || social.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Links de contato */}
          {contacts.length > 0 && (
            <div style={styles.contactSection}>
              <h3 style={styles.sectionTitle}>BUSINESS</h3>            
              <div style={styles.contactLinks}>
                {contacts.map((contact: ContactLink, index: number) => (                
                  <a
                    key={contact.id || index}
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.contactLink}
                    className="holographic-contact-link"
                    onClick={() => {
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
          <div style={styles.footer}>
            <p style={styles.footerText}>POWERED BY RAPMARKETING</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolographicPresave;
