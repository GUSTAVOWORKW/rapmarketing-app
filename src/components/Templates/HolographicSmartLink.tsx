import React from 'react';
import Holographic from './Holographic';
import { SmartLink } from '../../types';

// Props compatíveis com os outros templates de Smart Link
interface HolographicSmartLinkProps extends SmartLink {}

const HolographicSmartLink: React.FC<HolographicSmartLinkProps> = (smartLink) => {
  // Preparar dados das plataformas corretamente - usar platform_id como id
  const platforms = (smartLink.platform_links || [])
    .filter(link => link.url && link.platform_id)
    .map(link => ({
      id: link.platform_id, // Usar platform_id como id para o template encontrar o ícone
      name: link.platform_id, // Será sobrescrito pelo nome correto no template
      url: link.url
    }));
  // Preparar dados das redes sociais (se existir no SmartLink)
  const socialLinks: Array<{ id: string; name: string; url: string }> = []; // Por enquanto vazio, pode ser implementado depois se necessário

  return (
    <Holographic
      artistName={smartLink.artist_name || ''}
      artistTitle={smartLink.title || ''}
      avatarUrl={'/avatars/perfilhomem1.png'} // Avatar padrão por enquanto
      bio={smartLink.description || ''}
      releaseTitle={smartLink.release_title || smartLink.title || ''}
      feat={''} // Não disponível no SmartLink atual
      coverImageUrl={smartLink.cover_image_url || '/assets/defaults/default-cover.png'}
      playerUrl={''} // Não disponível no SmartLink atual
      platforms={platforms}
      socialLinks={socialLinks}
      contactButtonText={'💼 Contato para Shows'}
      contactButtonUrl={'#'}
    />
  );
};

export default HolographicSmartLink;
