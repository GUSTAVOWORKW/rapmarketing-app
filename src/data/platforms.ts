// src/data/platforms.ts
import { FaSpotify, FaApple, FaDeezer, FaYoutube, FaAmazon, FaSoundcloud, FaNapster, FaMusic } from 'react-icons/fa';
import { SiTidal } from 'react-icons/si';
import { IconType } from 'react-icons';

export interface Platform {
  id: string;
  name: string;
  icon: IconType;
  placeholder_url: string;
  brand_color: string;
  validation_regex?: RegExp;
  description?: string;
  example_url?: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: FaSpotify,
    placeholder_url: 'https://open.spotify.com/track/...',
    brand_color: '#1DB954',
    validation_regex: new RegExp(
      /^https:\/\/open\.spotify\.com\/(track|album|artist|playlist)\/[a-zA-Z0-9]+(\?si=[a-zA-Z0-9]+)?$/
    ),
    description: 'Streaming mais popular do mundo',
    example_url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    icon: FaApple,
    placeholder_url: 'https://music.apple.com/album/...', // Mantido da PLATFORMS_DATA original
    brand_color: '#000000',
    validation_regex: new RegExp(
      /^https:\/\/music\.apple\.com\/([a-z]{2}\/)?(album|playlist)\/([^/]+)\/([0-9]+|([^/]+)\?i=[0-9]+)$/
    ),
    description: 'Streaming da Apple',
    example_url: 'https://music.apple.com/us/album/abbey-road/1441164426',
  },
  {
    id: 'deezer',
    name: 'Deezer',
    icon: FaDeezer,
    placeholder_url: 'https://www.deezer.com/track/...', // Mantido da PLATFORMS_DATA original
    brand_color: '#FF0000', // Cor da PLATFORMS_DATA original
    validation_regex: new RegExp(/^https:\/\/(www\.)?deezer\.com\/(track|album|artist|playlist)\/[0-9]+$/),
    description: 'Streaming francês',
    example_url: 'https://www.deezer.com/track/3135556',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    icon: FaYoutube,
    placeholder_url: 'https://music.youtube.com/watch?v=...', // Mantido da PLATFORMS_DATA original
    brand_color: '#FF0000', // Cor da PLATFORMS_DATA original
    validation_regex: new RegExp(
      /^https:\/\/music\.youtube\.com\/(watch\?v=|playlist\?list=|channel\/|browse\/)[a-zA-Z0-9_-]+$/
    ),
    description: 'Streaming de música do YouTube',
    example_url: 'https://music.youtube.com/watch?v=L_jWHffIx5E',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: FaSoundcloud,
    placeholder_url: 'https://soundcloud.com/artist/track', // Mantido da PLATFORMS_DATA original
    brand_color: '#FF5500',
    validation_regex: new RegExp(/^https:\/\/soundcloud\.com\/[^/]+\/[^/]+$/),
    description: 'Plataforma para artistas independentes',
    example_url: 'https://soundcloud.com/officialpandaeyes/panda-eyes-colorblind',
  },
  {
    id: 'tidal',
    name: 'Tidal',
    icon: SiTidal,
    placeholder_url: 'https://tidal.com/browse/album/...', // Mantido da PLATFORMS_DATA original
    brand_color: '#000000', // Cor da PLATFORMS_DATA original
    validation_regex: new RegExp(
      /^https:\/\/tidal\.com\/(browse\/)?(track|album|artist|playlist)\/[a-zA-Z0-9/-]+$/
    ),
    description: 'Streaming de alta fidelidade',
    example_url: 'https://tidal.com/browse/album/77063390',
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music',
    icon: FaAmazon,
    placeholder_url: 'https://music.amazon.com/albums/...', // Mantido da PLATFORMS_DATA original
    brand_color: '#5E12E0', // Cor da PLATFORMS_DATA original (era #00A8E1 no platforms.ts, mas a original era #FF9900)
    validation_regex: new RegExp(
      /^https:\/\/music\.amazon\.com\/(albums|tracks|artists|playlists)\/[a-zA-Z0-9]+$/
    ),
    description: 'Streaming da Amazon',
    example_url: 'https://music.amazon.com/albums/B081QVTLS4',
  },
  {
    id: 'youtube',
    name: 'YouTube (Vídeo)',
    icon: FaYoutube,
    placeholder_url: 'https://www.youtube.com/watch?v=...',
    brand_color: '#FF0000',
    validation_regex: new RegExp(/^https:\/\/(www\.)?youtube\.com\/watch\?v=.+$/),
    description: 'Link para vídeo no YouTube',
    example_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'napster',
    name: 'Napster',
    icon: FaNapster,
    placeholder_url: 'https://us.napster.com/artist/...',
    brand_color: '#000000',
    description: 'Streaming Napster',
    example_url: 'https://us.napster.com/artist/artist-name',
  },
  {
    id: 'audiomack',
    name: 'Audiomack',
    icon: FaMusic,
    placeholder_url: 'https://audiomack.com/artist/track',
    brand_color: '#FFA200',
    description: 'Audiomack',
    example_url: 'https://audiomack.com/artist/track',
  },
];

export default PLATFORMS;
