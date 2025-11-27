// components/presave/TemplatePreview.js
import React, { useMemo } from 'react';
import ErrorBoundary from '../ui/ErrorBoundary';

// Template imports - usando as versões refatoradas
import HolographicPresave from '../PresaveTemplates/HolographicPresave';
import RepenteRusticoPresave from '../PresaveTemplates/RepenteRusticoPresave';
import StreetHoloPresave from '../PresaveTemplates/StreetHoloPresave';
import NeonGlow from '../PresaveTemplates/NeonGlow';
import VintageVinyl from '../PresaveTemplates/VintageVinyl';
import ModernCard from '../PresaveTemplates/ModernCard';
import NoiteCariocaPresave from '../PresaveTemplates/NoiteCariocaPresave';

// Template mapping
const TEMPLATE_MAP = {
  holographic: HolographicPresave,
  minimalist: RepenteRusticoPresave,
  'street-holo': StreetHoloPresave,
  'neon-glow': NeonGlow,
  'vintage-vinyl': VintageVinyl,
  'modern-card': ModernCard,
  'noite-carioca': NoiteCariocaPresave,
};

// Error fallback component
const TemplateError = ({ error, templateId }) => (
  <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Erro ao carregar template
      </h3>
      <p className="text-red-600 mb-4">
        Template ID: {templateId}
      </p>
      <details className="text-left">
        <summary className="cursor-pointer text-red-700 font-medium">
          Detalhes do erro
        </summary>
        <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
          {error?.message || 'Erro desconhecido'}
        </pre>
      </details>
    </div>
  </div>
);

// Transform form data to template props - INTERFACE PADRONIZADA
const transformFormDataToTemplateProps = (state) => {
  // Importar dados das plataformas para usar nomes e cores corretas
  const { PLATFORMS } = require('../../data/platforms');

  // Helper function to format platform links
  const formatPlatformLinks = (platformsObject) => {
    return Object.entries(platformsObject || {})
      .filter(([key, url]) => url && url.trim() && url !== '#')
      .map(([key, url]) => {
        const platformData = PLATFORMS.find(p => p.id === key);
        return {
          id: key,
          platform_id: key,
          url: url.trim(),
          name: platformData?.name || key.charAt(0).toUpperCase() + key.slice(1),
          icon_url: platformData?.icon_url,
          brand_color: platformData?.brand_color,
        };
      });
  };
  // Helper function to format social links (handle both array and object formats)
  const formatSocialLinks = (socialObject) => {
    // Se já é um array, usar diretamente
    if (Array.isArray(socialObject)) {
      return socialObject.filter(link => link.url && link.url.trim() && link.url !== '#');
    }
    
    // Se é objeto (formato legacy), converter para array
    return Object.entries(socialObject || {})
      .filter(([key, url]) => url && url.trim() && url !== '#')
      .map(([key, url]) => ({
        id: key,
        platform: key,
        url: url.trim(),
        name: key.charAt(0).toUpperCase() + key.slice(1),
      }));
  };

  // Helper function to format contact links (handle both array and object formats)
  const formatContactLinks = (contactObject) => {
    // Se já é um array, usar diretamente
    if (Array.isArray(contactObject)) {
      return contactObject.filter(link => link.url && link.url.trim() && link.url !== '#');
    }
    
    // Se é objeto (formato legacy), converter para array
    return Object.entries(contactObject || {})
      .filter(([key, url]) => url && url.trim() && url !== '#')
      .map(([key, url]) => ({
        id: key,
        type: key,
        url: url.trim(),
        name: key === 'email' ? 'E-mail' : key.charAt(0).toUpperCase() + key.slice(1),
      }));
  };  // Format all link arrays
  // Usar novo formato platformLinks (array) com fallback para platforms (objeto legado)
  const platformLinksData = (state.platformLinks && state.platformLinks.length > 0) 
    ? state.platformLinks 
    : state.platforms;
  
  const platformLinks = Array.isArray(platformLinksData) 
    ? platformLinksData.filter(link => link.url && link.url.trim() && link.url !== '#')
    : formatPlatformLinks(platformLinksData);
  
  // Para socialLinks, usar socialLinks_legacy como fallback se socialLinks estiver vazio
  const socialLinksData = (state.socialLinks && state.socialLinks.length > 0) 
    ? state.socialLinks 
    : state.socialLinks_legacy;
  const socialLinks = formatSocialLinks(socialLinksData);
  
  const contactLinks = formatContactLinks(state.contactLinks);
  // Determine if released (past release date)
  const isReleased = state.releaseDate ? new Date(state.releaseDate) <= new Date() : false;

  // Return standardized props interface
  return {
    // Basic info (required)
    artistName: state.artistName || 'Artista',
    trackName: state.trackName || 'Faixa',
    releaseDate: state.releaseDate,
    artworkUrl: state.artworkUrl || '/assets/defaults/default-cover.png',
    
    // Template name (editável)
    templateName: state.templateName || state.selectedTemplate?.name || 'Template',
    
    // Structured links (standardized arrays)
    platformLinks,
    socialLinks,
    contactLinks,
    
    // Display settings
    isMobilePreview: false, // Será setado pelo componente principal
    isReleased,
    
    // Visual customization
    backgroundColor: state.templateBackgroundColor || '#000000',
    accentColor: state.accentColor || '#FFFFFF',
    customColors: {
      background: state.templateBackgroundColor || '#000000',
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      accent: state.accentColor || '#FFFFFF',
    },
    
    // Event handlers
    onPlatformClick: (platformId, url) => {
      console.log('🎵 Platform clicked:', platformId, url);
      // Em uma implementação real, isso poderia rastrear analytics
    },

    // LEGACY: Para compatibilidade com templates antigos (será removido)
    streamingLinks: platformLinks,
    socialMediaLinks: socialLinks, 
    contactLinksList: contactLinks,
  };
};

const TemplatePreview = ({ 
  templateId, 
  formState, 
  isMobilePreview = false,
  className = '',
  style = {},
  onError 
}) => {
  // Get template component
  const TemplateComponent = TEMPLATE_MAP[templateId];

  // Memoize template props to avoid unnecessary re-renders
  const templateProps = useMemo(() => {
    try {
      return transformFormDataToTemplateProps(formState);
    } catch (error) {
      console.error('Error transforming form data:', error);
      if (onError) onError(error);
      return null;
    }
  }, [formState, onError]);

  // Handle missing template
  if (!TemplateComponent) {
    const error = new Error(`Template "${templateId}" not found. Available templates: ${Object.keys(TEMPLATE_MAP).join(', ')}`);
    console.error(error);
    if (onError) onError(error);
    return <TemplateError error={error} templateId={templateId} />;
  }

  // Handle transform error
  if (!templateProps) {
    const error = new Error('Failed to transform form data to template props');
    return <TemplateError error={error} templateId={templateId} />;
  }
  return (
    <div className={`template-preview ${className}`} style={style}>
      <ErrorBoundary
        fallback={(error) => <TemplateError error={error} templateId={templateId} />}
        onError={onError}
      >
        <TemplateComponent
          {...templateProps}
          isMobilePreview={isMobilePreview}
        />
      </ErrorBoundary>
    </div>
  );
};

export default TemplatePreview;
