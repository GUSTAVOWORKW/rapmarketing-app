// Utilitário para validação de URLs de redes sociais
// Baseado nas diretrizes do gemini.md - usar apenas React e Tailwind

export const socialPlatformValidators = {
  instagram: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(url);
  },
  
  twitter: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/.test(url);
  },
  
  facebook: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/.test(url);
  },
  
  tiktok: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/.test(url);
  },
  
  spotify: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/open\.spotify\.com\/(artist|user)\/[a-zA-Z0-9]+(\?.*)?$/.test(url);
  },
  
  youtube: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)[a-zA-Z0-9_-]+\/?$/.test(url);
  },
  
  deezer: (url) => {
    if (!url) return true; // Opcional
    return /^https?:\/\/(www\.)?deezer\.com\/(profile\/|artist\/)[a-zA-Z0-9]+\/?$/.test(url);
  }
};

export const validateSocialLink = (platform, url) => {
  const validator = socialPlatformValidators[platform];
  if (!validator) return true; // Se não há validador, aceita
  
  return validator(url);
};

export const getSocialValidationMessage = (platform) => {
  const messages = {
    instagram: 'URL deve ser no formato: https://instagram.com/seuusuario',
    twitter: 'URL deve ser no formato: https://twitter.com/seuusuario ou https://x.com/seuusuario',
    facebook: 'URL deve ser no formato: https://facebook.com/seuusuario',
    tiktok: 'URL deve ser no formato: https://tiktok.com/@seuusuario',
    spotify: 'URL deve ser no formato: https://open.spotify.com/artist/id ou https://open.spotify.com/user/id',
    youtube: 'URL deve ser no formato: https://youtube.com/c/seucanal ou https://youtube.com/@seucanal',
    deezer: 'URL deve ser no formato: https://deezer.com/profile/id ou https://deezer.com/artist/id'
  };
  
  return messages[platform] || 'URL inválida para esta plataforma';
};
