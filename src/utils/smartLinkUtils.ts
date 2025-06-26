// src/utils/smartLinkUtils.ts

// Função utilitária para garantir o caminho correto dos ícones SEMPRE no preview
export const getPlatformIconUrl = (id: string) => `/assets/streaming-icons/${id}.svg`;

// Função utilitária para converter URL do Spotify para URL de incorporação
export const getSpotifyEmbedUrl = (url: string): string | null => {
  if (!url || !url.includes('open.spotify.com')) {
    return null;
  }
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    let type: string | null = null;
    let id: string | null = null;
    const potentialTypeIndex = pathParts.findIndex(part => ['track', 'album', 'playlist'].includes(part));
    if (potentialTypeIndex !== -1 && pathParts.length > potentialTypeIndex + 1) {
      type = pathParts[potentialTypeIndex];
      id = pathParts[potentialTypeIndex + 1];
    }
    if ((type === 'track' || type === 'album' || type === 'playlist') && id) {
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
    }
    return null;
  } catch (error) {
    console.error('Erro ao analisar URL do Spotify para incorporação:', error);
    return null;
  }
};
