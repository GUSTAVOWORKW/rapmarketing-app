// src/data/platformIcons.ts
import { FaSpotify, FaApple, FaDeezer, FaYoutube, FaAmazon, FaSoundcloud, FaNapster, FaMusic } from 'react-icons/fa';
import { SiTidal } from 'react-icons/si';
import { IconType } from 'react-icons';

export interface PlatformIcon {
  id: string;
  icon: IconType;
  color: string;
}

export const PLATFORM_ICONS: PlatformIcon[] = [
  { id: 'spotify', icon: FaSpotify, color: '#1DB954' },
  { id: 'apple-music', icon: FaApple, color: '#000000' },
  { id: 'deezer', icon: FaDeezer, color: '#FF0000' },
  { id: 'youtube-music', icon: FaYoutube, color: '#FF0000' },
  { id: 'youtube', icon: FaYoutube, color: '#FF0000' },
  { id: 'amazon-music', icon: FaAmazon, color: '#5E12E0' },
  { id: 'soundcloud', icon: FaSoundcloud, color: '#FF5500' },
  { id: 'tidal', icon: SiTidal, color: '#000000' },
  { id: 'napster', icon: FaNapster, color: '#1DB954' },
  { id: 'audiomack', icon: FaMusic, color: '#FF8800' },
];
