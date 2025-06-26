// hooks/common/usePlatformClick.js - Hook reutilizável para clicks em plataformas
import { useCallback } from 'react';

/**
 * Hook para padronizar clicks em plataformas
 * Centraliza a lógica duplicada encontrada em todos os templates
 */
export const usePlatformClick = (onPlatformClick) => {
  const handlePlatformClick = useCallback((platform, url) => {
    // Se há callback personalizado, chamar primeiro
    if (onPlatformClick && typeof onPlatformClick === 'function') {
      try {
        onPlatformClick(platform, url);
      } catch (error) {
        console.error('Erro no callback personalizado:', error);
      }
    }

    // Sempre abrir o link
    if (url && url.trim() && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [onPlatformClick]);

  const handleLinkClick = useCallback((linkObject) => {
    const platformId = linkObject.platform_id || linkObject.id || linkObject.platform;
    const url = linkObject.url;
    
    handlePlatformClick(platformId, url);
  }, [handlePlatformClick]);

  return {
    handlePlatformClick,
    handleLinkClick
  };
};

export default usePlatformClick;
