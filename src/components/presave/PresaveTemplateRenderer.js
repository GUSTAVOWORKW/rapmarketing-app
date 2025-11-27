// components/presave/PresaveTemplateRenderer.js
import React from 'react';

// Import dos templates
import HolographicPresave from '../PresaveTemplates/HolographicPresave';
import StreetHoloPresave from '../PresaveTemplates/StreetHoloPresave';
import NeonGlow from '../PresaveTemplates/NeonGlow';
import VintageVinyl from '../PresaveTemplates/VintageVinyl';
import ModernCard from '../PresaveTemplates/ModernCard';
import NoiteCariocaPresave from '../PresaveTemplates/NoiteCariocaPresave';
import RepenteRusticoPresave from '../PresaveTemplates/RepenteRusticoPresave';

// Componente padrão para templates não encontrados
const DefaultPresaveTemplate = ({ 
  artistName, 
  trackName, 
  releaseDate, 
  artworkUrl, 
  platformLinks, 
  socialLinks,
  isReleased,
  onPlatformClick 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex flex-col justify-center items-center p-4 text-white">
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <img
          src={artworkUrl || '/assets/defaults/default-cover.png'}
          alt={`${trackName} - Artwork`}
          className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl mx-auto mb-6 object-cover"
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{trackName}</h1>
        <p className="text-xl md:text-2xl opacity-90 mb-3">{artistName}</p>
        <p className="text-sm md:text-base opacity-75">
          {isReleased ? 'Disponível agora' : `Lança em ${releaseDate}`}
        </p>
      </div>      <div className="space-y-4">
        {platformLinks.map((platform) => {
          const IconComponent = platform.icon;
          
          return (
            <button
              key={platform.id}
              onClick={() => onPlatformClick(platform.id, platform.url)}
              className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-white bg-opacity-20 backdrop-blur-md rounded-xl hover:bg-opacity-30 transition-all"
            >
              <IconComponent className="text-2xl" style={{ color: platform.color }} />
              <span className="font-medium text-lg">
                {isReleased ? 'Ouça no' : 'Salve no'} {platform.name}
              </span>
            </button>
          );
        })}
      </div>      {/* Redes sociais */}
      {socialLinks && socialLinks.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white border-opacity-20">
          <h3 className="text-lg font-semibold mb-4 text-center">Siga o artista:</h3>
          <div className="flex justify-center flex-wrap gap-3">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-md rounded-full hover:bg-opacity-30 transition-all"
                  style={{ color: social.color }}
                >
                  <IconComponent className="text-lg" />
                  <span className="text-sm font-medium">{social.platformName}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Mapeamento de templates
const TEMPLATE_COMPONENTS = {
  'holographic': HolographicPresave,
  'street-holo': StreetHoloPresave,
  'neon-glow': NeonGlow,
  'vintage-vinyl': VintageVinyl,
  'modern-card': ModernCard,
  'noite-carioca': NoiteCariocaPresave,
  'minimalist': RepenteRusticoPresave,
  'default': DefaultPresaveTemplate
};

const PresaveTemplateRenderer = ({ 
  templateId, 
  presaveData, 
  platformLinks, 
  socialLinks, 
  isReleased, 
  onPlatformClick 
}) => {
  // Selecionar o componente do template
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || DefaultPresaveTemplate;
  
  // Preparar props para o componente
  const templateProps = {
    artistName: presaveData.artist_name,
    trackName: presaveData.track_name,
    releaseDate: presaveData.release_date,
    artworkUrl: presaveData.artwork_url,
    templateName: presaveData.template_name, // Nome editável do template
    platformLinks: platformLinks,
    socialLinks: socialLinks,
    isReleased: isReleased,
    onPlatformClick: onPlatformClick,
    // Props específicos para alguns templates
    templateBackgroundColor: presaveData.template_background_color,
    backgroundColor: presaveData.template_background_color,
    accentColor: presaveData.accent_color || '#FFFFFF',
    isMobilePreview: false, // Não é preview, é a página real
    // Mapeamento para compatibilidade com props legadas
    streamingLinks: platformLinks,
    socialMediaLinks: socialLinks,
    contactLinksList: []
  };

  return (
    <div className="w-full h-full min-h-screen">
      <TemplateComponent {...templateProps} />
    </div>
  );
};

export default PresaveTemplateRenderer;
