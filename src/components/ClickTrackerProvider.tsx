import React, { useEffect, useRef } from 'react';
import { useClickTracker } from '../hooks/useClickTracker';

interface ClickTrackerProviderProps {
  children: React.ReactNode;
  linkId?: string;
  linkType?: 'smartlink' | 'presave';
  autoTrackPageView?: boolean;
}

export const ClickTrackerProvider: React.FC<ClickTrackerProviderProps> = ({ 
  children, 
  linkId, 
  linkType, 
  autoTrackPageView = true 
}) => {
  const { trackPageView } = useClickTracker();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (autoTrackPageView && linkId && linkType && !hasTracked.current) {
      trackPageView(linkId, linkType)
        .then(() => {
          hasTracked.current = true;
          console.log(`Page view tracked for ${linkType}: ${linkId}`);
        })
        .catch(error => {
          console.error('Error tracking page view:', error);
        });
    }
  }, [linkId, linkType, autoTrackPageView, trackPageView]);

  return <>{children}</>;
};

interface PlatformLinkProps {
  href: string;
  children: React.ReactNode;
  linkId: string;
  linkType: 'smartlink' | 'presave';
  platformId: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

export const PlatformLink: React.FC<PlatformLinkProps> = ({
  href,
  children,
  linkId,
  linkType,
  platformId,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  onClick
}) => {
  const { trackPlatformClick } = useClickTracker();

  const handleClick = async (e: React.MouseEvent) => {
    // Registrar o click primeiro
    try {
      if (linkId && linkType && platformId) {
        await trackPlatformClick(linkId, linkType, platformId);
      }
    } catch (error) {
      console.error('Error tracking platform click:', error);
      // Não impedir o click mesmo se houver erro no tracking
    }

    // Executar callback personalizado se existir
    if (onClick) {
      onClick();
    }

    // Para links externos, aguardar um pouco antes de navegar
    // para garantir que o tracking seja enviado
    if (target === '_blank' && href.startsWith('http')) {
      e.preventDefault();
      setTimeout(() => {
        window.open(href, target, 'noopener,noreferrer');
      }, 100);
    }
  };

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

// Hook para criar links com tracking automático
export const useTrackedLink = (
  linkId: string,
  linkType: 'smartlink' | 'presave'
) => {
  const { trackPlatformClick } = useClickTracker();

  const createTrackedLink = (platformId: string, url: string, onClick?: () => void) => {
    return {
      href: url,
      onClick: async () => {
        try {
          await trackPlatformClick(linkId, linkType, platformId);
        } catch (error) {
          console.error('Error tracking click:', error);
        }
        if (onClick) {
          onClick();
        }
      }
    };
  };

  return { createTrackedLink };
};

export default ClickTrackerProvider;
