// utils/platformIcons.js - Gerenciamento centralizado de ícones de plataformas
import { FaSpotify, FaApple, FaAmazon, FaYoutube, FaPlay, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { SiTidal, SiDeezer, SiSoundcloud, SiYoutubemusic } from 'react-icons/si';

// Mapeamento de ícones para plataformas de streaming (usando os IDs que estão sendo salvos no banco)
export const STREAMING_PLATFORM_ICONS = {
  // IDs com hífen (formato que está sendo salvo no banco via presaveService.js)
  'spotify': FaSpotify,
  'apple-music': FaApple,
  'amazon-music': FaAmazon,
  'youtube-music': SiYoutubemusic,
  'youtube': FaYoutube,
  'tidal': SiTidal,
  'deezer': SiDeezer,
  'soundcloud': SiSoundcloud,
};

// Mapeamento de ícones para redes sociais
export const SOCIAL_PLATFORM_ICONS = {
  'instagram': FaInstagram,
  'twitter': FaTwitter,
  'tiktok': FaTiktok,
  'youtube': FaYoutube,
};

// Cores das plataformas de streaming (usando os IDs que estão sendo salvos no banco)
export const STREAMING_PLATFORM_COLORS = {
  'spotify': '#1DB954',
  'apple-music': '#FA243C',
  'amazon-music': '#FF9900',
  'youtube-music': '#FF0000',
  'youtube': '#FF0000',
  'tidal': '#00FFFF',
  'deezer': '#FEAA2D',
  'soundcloud': '#FF5500',
};

// Nomes das plataformas de streaming (usando os IDs que estão sendo salvos no banco)
export const STREAMING_PLATFORM_NAMES = {
  'spotify': 'Spotify',
  'apple-music': 'Apple Music',
  'amazon-music': 'Amazon Music',
  'youtube-music': 'YouTube Music',
  'youtube': 'YouTube',
  'tidal': 'Tidal',
  'deezer': 'Deezer',
  'soundcloud': 'SoundCloud',
};

// Função para obter ícone de plataforma de streaming
export const getStreamingIcon = (platformId) => {
  return STREAMING_PLATFORM_ICONS[platformId] || FaPlay;
};

// Função para obter cor de plataforma de streaming
export const getStreamingColor = (platformId) => {
  return STREAMING_PLATFORM_COLORS[platformId] || '#333';
};

// Função para obter nome de plataforma de streaming
export const getStreamingName = (platformId) => {
  return STREAMING_PLATFORM_NAMES[platformId] || platformId;
};

// Função para obter ícone de rede social
export const getSocialIcon = (platformId) => {
  return SOCIAL_PLATFORM_ICONS[platformId] || FaPlay;
};
