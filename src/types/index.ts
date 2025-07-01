// src/types/index.ts

// Definições de tipo para o aplicativo Rapmarketing

// Exemplo de tipo (será expandido com base em templates.md)
export interface UserProfile {
  id?: string;        // ID da tabela profiles
  user_id: string;    // Referência para auth.users(id)
  username: string;
  template_id?: string; // Template ID escolhido
  bio?: string;       // Biografia do usuário
  is_active?: boolean; // Se o perfil está ativo
  updated_at?: string;
  created_at?: string;
  // avatar_url não existe na tabela atual
}

export interface SmartLink {
  id: string;
  user_id: string;
  template_id: string; // e.g., 'urban-legend', 'underground'
  artist_name?: string; // Adicionado
  artist_title?: string; // Adicionado
  release_title?: string; // Adicionado
  title?: string; // Título opcional para SEO/compartilhamento
  description?: string;
  bio?: string; // Adicionado
  avatar_url?: string; // Adicionado para avatar do artista
  cover_image_url?: string;
  cover_image_click_url?: string; // URL para onde a imagem de capa redireciona
  player_url?: string; // URL do player de música (ex: Spotify embed)
  platforms?: PlatformLink[]; // Onde os links são salvos
  platform_links?: PlatformLink[]; // Legado/antigo - manter por enquanto
  social_links?: SocialLink[]; // Adicionado para redes sociais
  contact_button_text?: string; // Adicionado para botão de contato
  contact_button_url?: string; // Adicionado para URL de contato
  custom_colors?: { // Adicionado
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    button_background?: string;
    button_text?: string;
  };
  slug?: string; // Adicionado
  is_public?: boolean; // Adicionado
  view_count?: number; // Adicionado
  created_at?: string;
  updated_at?: string;
}

export interface PlatformLink {
  id?: string; // UUID - Tornando opcional para links ainda não salvos
  platform_id: string; // e.g., 'spotify', 'apple-music'
  url: string;
  name?: string; // Adicionado para exibição no formulário
  title?: string; // Para links customizados
  custom_button_bg_color?: string;
  custom_button_text_color?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview_image_url: string;
  component: string; // Nome do componente React para este template
}

export interface SocialLink {
  id?: string; // Optional for new links
  platform: string;
  url: string;
  platformName?: string; // Optional, for display purposes
}

export interface ContactLink {
  id?: string; // Optional for new links
  type: 'email' | 'phone' | 'website' | 'custom';
  value: string;
  label?: string; // e.g., "My Portfolio", "Business Email"
}

// Update UserProfile to include new link types
export interface UserProfile {
  id?: string;        // ID da tabela profiles
  user_id: string;    // Referência para auth.users(id)
  username: string;
  template_id?: string; // Template ID escolhido
  bio?: string;       // Biografia do usuário
  is_active?: boolean; // Se o perfil está ativo
  updated_at?: string;
  created_at?: string;
  social_links?: SocialLink[];
  streaming_links?: PlatformLink[]; // Assuming PlatformLink is suitable for streaming
  contact_links?: ContactLink[];
}

// Mais tipos serão adicionados aqui
