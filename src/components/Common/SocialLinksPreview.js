import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, FaYoutube, FaDeezer, FaLink } from 'react-icons/fa';

const socialIconMapping = {
  instagram: { icon: FaInstagram, color: 'text-pink-500', name: 'Instagram' },
  twitter: { icon: FaTwitter, color: 'text-blue-400', name: 'Twitter/X' },
  facebook: { icon: FaFacebookF, color: 'text-blue-600', name: 'Facebook' },
  tiktok: { icon: FaTiktok, color: 'text-black', name: 'TikTok' },
  spotify: { icon: FaSpotify, color: 'text-green-500', name: 'Spotify' },
  youtube: { icon: FaYoutube, color: 'text-red-600', name: 'YouTube' },
  deezer: { icon: FaDeezer, color: 'text-purple-500', name: 'Deezer' },
  other: { icon: FaLink, color: 'text-gray-500', name: 'Outro' }
};

const SocialLinksPreview = ({ socialLinks, title = "Suas Redes Sociais", showEmptyMessage = true }) => {
  // Validação robusta dos dados de entrada
  if (!socialLinks) {
    return showEmptyMessage ? (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500 text-sm text-center">Nenhuma rede social configurada</p>
      </div>
    ) : null;
  }

  // Converter formato de array para objeto (compatibilidade com dados antigos)
  let normalizedSocialLinks = {};
  
  if (Array.isArray(socialLinks)) {
    // Formato antigo: [{"platform": "instagram", "url": "...", "id": "..."}]
    socialLinks.forEach(item => {
      if (item && typeof item === 'object' && item.platform && item.url) {
        normalizedSocialLinks[item.platform] = item.url;
      }
    });
  } else if (typeof socialLinks === 'object') {
    // Formato atual: {"instagram": "https://..."}
    normalizedSocialLinks = socialLinks;
  } else {
    return showEmptyMessage ? (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500 text-sm text-center">Nenhuma rede social configurada</p>
      </div>
    ) : null;
  }

  // Filtrar apenas entradas válidas (strings não vazias)
  const activeSocialLinks = Object.entries(normalizedSocialLinks).filter(([platform, url]) => {
    // Verificação defensiva para garantir que url é string antes de usar trim
    if (!url || typeof url !== 'string') return false;
    if (!platform || typeof platform !== 'string') return false;
    
    try {
      return url.trim() !== '';
    } catch (e) {
      return false;
    }
  });

  if (activeSocialLinks.length === 0) {
    return showEmptyMessage ? (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500 text-sm text-center">Nenhuma rede social configurada</p>
      </div>
    ) : null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-[#1c1c1c] mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeSocialLinks.map(([platform, url]) => {
          const { icon: Icon, color, name } = socialIconMapping[platform] || socialIconMapping.other;
          
          // Validação adicional para garantir que a URL é válida
          const safeUrl = typeof url === 'string' ? url.trim() : '';
          if (!safeUrl) return null;
          
          return (
            <a
              key={platform}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
            >
              <Icon className={`text-xl ${color} group-hover:scale-110 transition-transform duration-200`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1c1c1c] truncate">{name}</div>
                <div className="text-xs text-gray-500 truncate">{safeUrl}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinksPreview;
