// src/types/PresaveTemplate.ts

export interface PlatformLink {
  id: string;
  platform_id: string;
  url: string;
  name?: string;
  icon?: any; // React component for Font Awesome icons
  brand_color?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  name?: string;
  platformName?: string;
  color?: string;
  icon?: any; // React component for Font Awesome icons
}

export interface ContactLink {
  id: string;
  type: string;
  url: string;
  name?: string;
}

export interface CustomColors {
  background?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  text?: string;
}

/**
 * Interface padronizada para todos os templates de pré-save.
 * TODOS os templates devem implementar exatamente esta interface.
 */
export interface PresaveTemplateProps {
  // ID para tracking de métricas
  id?: string;
  
  // Informações básicas (obrigatórias)
  artistName: string;
  trackName: string;
  releaseDate: string;
  artworkUrl: string;

  // Links estruturados (arrays padronizados)
  platformLinks: PlatformLink[];
  socialLinks: SocialLink[];
  contactLinks: ContactLink[];

  // Configurações de display
  isMobilePreview?: boolean;
  isReleased?: boolean;
  disableInteractions?: boolean;
  
  // Customização visual
  backgroundColor?: string;
  customColors?: CustomColors;
  
  // Event handlers
  onPlatformClick?: (platformId: string, url: string) => void;
  
  // DEPRECATED: Props legadas (manter para compatibilidade temporária)
  streamingLinks?: PlatformLink[];
  socialMediaLinks?: SocialLink[];
  contactLinksList?: ContactLink[];
}

/**
 * Props para transformação de dados do formulário
 */
export interface FormDataState {
  artistName: string;
  trackName: string;
  releaseDate: string;
  artworkUrl: string;
  templateBackgroundColor?: string;
  platforms: Record<string, string>;
  socialLinks: Record<string, string>;
  contactLinks: Record<string, string>;
}
