// hooks/common/useCompatibleLinks.js - Hook para compatibilidade de props
import { useMemo } from 'react';

/**
 * Hook para compatibilidade entre props novas e legadas
 * Centraliza a lógica duplicada encontrada em todos os templates de presave
 */
export const useCompatibleLinks = (props) => {
  const {
    // Props novas (padrão)
    platformLinks = [],
    socialLinks = [],
    contactLinks = [],
    
    // Props legadas (compatibilidade)
    streamingLinks = [],
    socialMediaLinks = [],
    contactLinksList = []
  } = props;
  const compatiblePlatformLinks = useMemo(() => {
    return platformLinks.length > 0 ? platformLinks : streamingLinks;
  }, [platformLinks, streamingLinks]);

  const compatibleSocialLinks = useMemo(() => {
    return socialLinks.length > 0 ? socialLinks : socialMediaLinks;
  }, [socialLinks, socialMediaLinks]);

  const compatibleContactLinks = useMemo(() => {
    return contactLinks.length > 0 ? contactLinks : contactLinksList;
  }, [contactLinks, contactLinksList]);

  // Filtrar links válidos (com URL não vazia)
  const validPlatformLinks = useMemo(() => {
    return compatiblePlatformLinks.filter(link => 
      link && link.url && link.url.trim() && link.url !== '#'
    );
  }, [compatiblePlatformLinks]);

  const validSocialLinks = useMemo(() => {
    return compatibleSocialLinks.filter(link => 
      link && link.url && link.url.trim() && link.url !== '#'
    );
  }, [compatibleSocialLinks]);

  const validContactLinks = useMemo(() => {
    return compatibleContactLinks.filter(link => 
      link && link.url && link.url.trim() && link.url !== '#'
    );
  }, [compatibleContactLinks]);

  return {
    platformLinks: validPlatformLinks,
    socialLinks: validSocialLinks,
    contactLinks: validContactLinks,
    
    // Para backward compatibility
    displayPlatformLinks: validPlatformLinks,
    displaySocialLinks: validSocialLinks,
    displayContactLinks: validContactLinks,
    
    // Contadores úteis
    hasPlatforms: validPlatformLinks.length > 0,
    hasSocials: validSocialLinks.length > 0,
    hasContacts: validContactLinks.length > 0
  };
};

export default useCompatibleLinks;
