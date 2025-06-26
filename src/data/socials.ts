// src/data/socials.ts
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { IconType } from 'react-icons';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  placeholder: string;
  description: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    placeholder: 'https://instagram.com/seuusuario',
    description: 'Essencial para artistas',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    color: '#000000',
    placeholder: 'https://tiktok.com/@seuusuario',
    description: 'Para alcançar novos fãs',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    color: '#FF0000',
    placeholder: 'https://youtube.com/channel/seucanal',
    description: 'Para vídeos e clipes',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: FaTwitter,
    color: '#1DA1F2',
    placeholder: 'https://twitter.com/seuusuario',
    description: 'Atualizações rápidas',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    placeholder: 'https://facebook.com/suapagina',
    description: 'Página do artista',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    placeholder: 'https://wa.me/5511999999999',
    description: 'Contato direto',
  },
];
