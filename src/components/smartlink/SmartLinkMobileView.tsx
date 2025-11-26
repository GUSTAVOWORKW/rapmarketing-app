// components/smartlink/SmartLinkMobileView.tsx
import React from 'react';
import { useSmartLinkForm } from '../../context/smartlink/SmartLinkFormContext';
import NoiteCarioca from '../Templates/NoiteCarioca';
import PorDoSolNoArpoador from '../Templates/PorDoSolNoArpoador';
import BaileDeFavela from '../Templates/BaileDeFavela';
import BatalhaHolografica from '../Templates/BatalhaHolografica';
import SertaoHolografico from '../Templates/SertaoHolografico';
import Afrofuturismo from '../Templates/Afrofuturismo';
import CircoMagico from '../Templates/CircoMagico';
import ReggaeCosmic from '../Templates/ReggaeCosmic';
import AmazoniaDigital from '../Templates/AmazoniaDigital';
import BailePulsante from '../Templates/BailePulsante';
import SavanaVibrante from '../Templates/SavanaVibrante';
import type { SmartLink } from '../../types';

// Mapeamento de templates para componentes
const templateMap: { [key: string]: React.FC<Partial<SmartLink>> } = {
  noitecarioca: NoiteCarioca,
  pordosolnoarpoador: PorDoSolNoArpoador,
  bailedefavela: BaileDeFavela,
  batalhaholografica: BatalhaHolografica,
  sertaoholografico: SertaoHolografico,
  afrofuturismo: Afrofuturismo,
  circomagico: CircoMagico,  reggaecosmic: ReggaeCosmic,
  amazoniadigital: AmazoniaDigital,
  bailepulsante: BailePulsante,
  savanavibrante: SavanaVibrante,
};

/**
 * SmartLinkMobileView
 * Renderiza apenas o template puro do Smart Link sem containers extras
 * Especificamente projetado para ser usado dentro do mockup do celular
 */
const SmartLinkMobileView: React.FC = () => {
  const { state } = useSmartLinkForm();

  // DEBUG: Log para verificar o estado recebido pelo preview
  // console.log('DEBUG [SmartLinkMobileView]: Template state received:', state.template);

  // Preparar dados do SmartLink para o template, usando Partial<SmartLink> para flexibilidade
  const smartLinkData: Partial<SmartLink> = {
    // Mapeamento direto dos campos do estado do formulário
    template_id: state.template,
    artist_name: state.artistName || 'Artista',
    artist_title: state.artistTitle,
    release_title: state.releaseTitle || 'Nova Música',
    bio: state.bio,
    avatar_url: state.avatarUrl || '/avatars/perfilhomem1.png',
    cover_image_url: state.coverImageUrl || '/assets/defaults/default-cover.png',
    player_url: state.playerUrl,
    
    // Passando os arrays diretamente como esperado pelos templates
    platforms: state.platforms,
    social_links: state.socialLinks,

    contact_button_text: state.contactButtonText || 'Contato',
    contact_button_url: state.contactButtonUrl,
    slug: state.slug,
  };

  const renderTemplate = () => {
    // Acessar o mapa de forma segura
    const TemplateComponent = templateMap[state.template] || NoiteCarioca; // Fallback para NoiteCarioca
    
    // DEBUG: Log para verificar qual componente está sendo renderizado
    // console.log('DEBUG [SmartLinkMobileView]: Rendering template:', TemplateComponent.displayName || TemplateComponent.name);

    return <TemplateComponent {...smartLinkData} />;
  };

  // Renderiza APENAS o template, sem containers extras
  return (
    <div className="w-full h-full bg-gray-800"> 
      {renderTemplate()}
    </div>
  );
};

export default SmartLinkMobileView;
