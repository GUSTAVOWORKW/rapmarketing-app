import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Papa from 'papaparse';
import { 
  FaChartBar, 
  FaArrowLeft, 
  FaEye, 
  FaHandPointer, 
  FaArrowTrendUp, 
  FaLink,
  FaMusic,
  FaUsers,
  FaDownload,
  FaCalendar,
  FaFilter,
  // Ícones das plataformas
  FaSpotify,
  FaApple,
  FaDeezer,
  FaYoutube,
  FaAmazon,
  FaSoundcloud,
  FaNapster,
  // Ícones sociais
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,  // Ícones de contato
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaCopy,
  FaCircleUser
} from 'react-icons/fa6';
import { SiTidal } from 'react-icons/si';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// MAPEAMENTO DE PLATAFORMAS E EVENTOS
// ============================================================================

interface PlatformMapping {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: 'streaming' | 'social' | 'contact' | 'action';
}

const PLATFORM_MAPPINGS: Record<string, PlatformMapping> = {
  // Plataformas de streaming
  'spotify': {
    name: 'Spotify',
    icon: FaSpotify,
    color: '#1DB954',
    category: 'streaming'
  },
  'apple-music': {
    name: 'Apple Music',
    icon: FaApple,
    color: '#000000',
    category: 'streaming'
  },
  'apple_music': {
    name: 'Apple Music',
    icon: FaApple,
    color: '#000000',
    category: 'streaming'
  },
  'youtube-music': {
    name: 'YouTube Music',
    icon: FaYoutube,
    color: '#FF0000',
    category: 'streaming'
  },
  'youtube_music': {
    name: 'YouTube Music',
    icon: FaYoutube,
    color: '#FF0000',
    category: 'streaming'
  },
  'youtube': {
    name: 'YouTube',
    icon: FaYoutube,
    color: '#FF0000',
    category: 'streaming'
  },
  'deezer': {
    name: 'Deezer',
    icon: FaDeezer,
    color: '#FF0000',
    category: 'streaming'
  },
  'tidal': {
    name: 'Tidal',
    icon: SiTidal,
    color: '#000000',
    category: 'streaming'
  },
  'amazon-music': {
    name: 'Amazon Music',
    icon: FaAmazon,
    color: '#5E12E0',
    category: 'streaming'
  },
  'amazon_music': {
    name: 'Amazon Music',
    icon: FaAmazon,
    color: '#5E12E0',
    category: 'streaming'
  },
  'soundcloud': {
    name: 'SoundCloud',
    icon: FaSoundcloud,
    color: '#FF5500',
    category: 'streaming'
  },
  'napster': {
    name: 'Napster',
    icon: FaNapster,
    color: '#1DB954',
    category: 'streaming'
  },
  'audiomack': {
    name: 'Audiomack',
    icon: FaMusic,
    color: '#FF8800',
    category: 'streaming'
  },
  
  // Redes sociais - compartilhamentos
  'share_instagram': {
    name: 'Compartilhar no Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    category: 'social'
  },
  'share_twitter': {
    name: 'Compartilhar no Twitter',
    icon: FaTwitter,
    color: '#1DA1F2',
    category: 'social'
  },
  'share_facebook': {
    name: 'Compartilhar no Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    category: 'social'
  },
  'share_tiktok': {
    name: 'Compartilhar no TikTok',
    icon: FaTiktok,
    color: '#000000',
    category: 'social'
  },
  'share_whatsapp': {
    name: 'Compartilhar no WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    category: 'social'
  },
  
  // Redes sociais - perfis
  'instagram': {
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    category: 'social'
  },
  'twitter': {
    name: 'Twitter',
    icon: FaTwitter,
    color: '#1DA1F2',
    category: 'social'
  },
  'facebook': {
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    category: 'social'
  },
  'tiktok': {
    name: 'TikTok',
    icon: FaTiktok,
    color: '#000000',
    category: 'social'
  },
  'whatsapp': {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    category: 'social'
  },
  
  // Contatos
  'contact_click': {
    name: 'Botão de Contato',
    icon: FaPhone,
    color: '#10B981',
    category: 'contact'
  },
  'contact_phone': {
    name: 'Contato - Telefone',
    icon: FaPhone,
    color: '#10B981',
    category: 'contact'
  },
  'contact_email': {
    name: 'Contato - Email',
    icon: FaEnvelope,
    color: '#3B82F6',
    category: 'contact'
  },
  'contact_website': {
    name: 'Contato - Website',
    icon: FaGlobe,
    color: '#6366F1',
    category: 'contact'
  },
  'contact_whatsapp': {
    name: 'Contato - WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    category: 'contact'
  },
  'contact_unknown': {
    name: 'Contato Personalizado',
    icon: FaPhone,
    color: '#6B7280',
    category: 'contact'
  },
    // Ações especiais
  'custom_copy_link': {
    name: 'Copiar Link',
    icon: FaCopy,
    color: '#8B5CF6',
    category: 'action'
  },
  'copy_link': {
    name: 'Link Copiado',  
    icon: FaCopy,
    color: '#8B5CF6',
    category: 'action'
  },
  'avatar_click': {
    name: 'Clique no Avatar',
    icon: FaCircleUser,
    color: '#F59E0B',
    category: 'action'
  },
  'profile_view': {
    name: 'Visualização de Perfil',
    icon: FaCircleUser,
    color: '#F59E0B',
    category: 'action'
  },
  'email_submit': {
    name: 'Envio de Email',
    icon: FaEnvelope,
    color: '#059669',
    category: 'action'
  },
  'page_view': {
    name: 'Visualização de Página',
    icon: FaEye,
    color: '#6B7280',
    category: 'action'
  },
  'share': {
    name: 'Compartilhamento',
    icon: FaCopy,
    color: '#3B82F6',
    category: 'action'
  }
};

// Função para obter dados da plataforma
const getPlatformData = (platformId: string): PlatformMapping => {
  const mapping = PLATFORM_MAPPINGS[platformId];
  if (mapping) {
    return mapping;
  }
  
  // Fallback para plataformas não mapeadas
  const name = platformId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
    
  return {
    name: name,
    icon: FaGlobe,
    color: '#6B7280',
    category: 'streaming'
  };
};

// ============================================================================
// ENUMS E TIPOS PADRONIZADOS
// ============================================================================

enum TabType {
  OVERVIEW = 'overview',
  DETAILED = 'detailed',
  ITEMS = 'items'
}

enum PeriodType {
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d'
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS CENTRALIZADAS
// ============================================================================

// Função para calcular período de datas
const calculatePeriodDates = (selectedPeriod: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(selectedPeriod.replace('d', '')));
  return { startDate, endDate };
};

// Função para formatar números
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Função para formatar data
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Data inválida';
  }
};

// Função para formatar data e hora
const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Data inválida';
  }
};

// Função para calcular taxa de conversão (padronizada)
const calculateClickRate = (clicks: number, views: number): number => {
  const validClicks = Number.isFinite(clicks) && clicks >= 0 ? clicks : 0;
  const validViews = Number.isFinite(views) && views >= 0 ? views : 0;
  
  if (validViews === 0) return 0;
  
  const rate = (validClicks / validViews) * 100;
  return Math.round(rate * 10) / 10;
};

// ============================================================================
// INTERFACES OTIMIZADAS PARA FUNÇÕES SQL
// ============================================================================

// Estrutura retornada pela função get_user_metrics_summary()
interface OptimizedUserMetrics {
  summary: {
    total_clicks: number;
    total_views: number;
    total_items: number;
    total_smartlinks: number;
    total_presaves: number;
  };
  platform_stats: Array<{
    platform_id: string;
    clicks: number;
    percentage: number;
  }>;
  top_items: Array<{
    link_id: string;
    type: 'smartlink' | 'presave';
    artist_name: string;
    title: string;
    clicks: number;
    views: number;
    click_rate: number;
  }>;
  recent_activity: Array<{
    link_id: string;
    type: 'smartlink' | 'presave';
    artist_name: string;
    title: string;
    platform_id: string;
    clicked_at: string;
  }>;
}

// Estrutura retornada pela função get_item_detailed_metrics()
interface OptimizedItemMetrics {
  summary: {
    total_clicks: number;
    total_views: number;
  };
  platforms: Array<{
    platform_id: string;
    clicks: number;
  }>;
  countries: Array<{
    country: string;
    count: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    count: number;
  }>;
  daily_evolution: Array<{
    date: string;
    clicks: number;
    views: number;
  }>;
  devices: Array<{
    device_type: string;
    count: number;
  }>;
  browsers: Array<{
    browser: string;
    count: number;
  }>;
  os_types: Array<{
    os: string;
    count: number;
  }>;
  peak_hours: Array<{
    hour: number;
    clicks: number;
  }>;
}

// Interface para itens do usuário (Smart Links e Presaves)
interface UserItem {
  id: string;
  title: string;
  slug: string;
  type: 'smartlink' | 'presave';
  artist_name?: string;
  release_title?: string;
  track_name?: string;
  created_at: string;
  is_public: boolean;
}

// ============================================================================
// ============================================================================
// COMPONENTE OTIMIZADO
// ============================================================================

const SmartLinkMetrics: React.FC = () => {
  const { linkId: routeSmartLinkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  
  // Estado principal
  const smartLinkId = routeSmartLinkId === 'default' ? null : routeSmartLinkId || null;
  
  // Estados otimizados com loading granular
  const [loading, setLoading] = useState<boolean>(() => {
    // Se já temos dados em cache, não mostrar loading
    const cacheKey = `metrics_loaded_${user?.id}`;
    return !sessionStorage.getItem(cacheKey);
  });
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userMetrics, setUserMetrics] = useState<OptimizedUserMetrics | null>(() => {
    // Tentar recuperar do cache
    try {
      const cached = sessionStorage.getItem(`metrics_data_${user?.id}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [itemMetrics, setItemMetrics] = useState<OptimizedItemMetrics | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>(() => {
    // Tentar recuperar do cache
    try {
      const cached = sessionStorage.getItem(`metrics_items_${user?.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  // Estados para filtros (usando enums)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PeriodType.MONTH);
  const [activeTab, setActiveTab] = useState<TabType>(
    smartLinkId ? TabType.DETAILED : TabType.OVERVIEW
  );
  
  // ============================================================================
  // FUNÇÕES OTIMIZADAS USANDO SQL FUNCTIONS
  // ============================================================================  // Função para buscar métricas gerais do usuário (otimizada)
  // Já obtemos user acima com initializing

  const fetchUserMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      
      // Obter usuário autenticado
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      
      // Calcular datas usando função utilitária
      const { startDate, endDate } = calculatePeriodDates(selectedPeriod);
      
      // Chamar função SQL otimizada
      const { data, error } = await supabase.rpc('get_user_metrics_summary', {
        p_user_id: user.id,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      });
      
      if (error) {
        console.error('❌ Erro ao buscar métricas gerais:', error);
        throw new Error(`Erro na consulta: ${error.message}`);
      }
        // Validar estrutura dos dados retornados
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Dados retornados não estão no formato esperado:', data);
        // Criar estrutura vazia se não houver dados
        const emptyData = {
          summary: {
            total_clicks: 0,
            total_views: 0,
            total_items: 0,
            total_smartlinks: 0,
            total_presaves: 0
          },
          platform_stats: [],
          top_items: [],
          recent_activity: []
        };
        setUserMetrics(emptyData);
        return;
      }
      
      // Validar e sanitizar dados críticos
      const sanitizedData = {
        ...data,
        summary: {
          total_clicks: Math.max(0, Number(data.summary?.total_clicks) || 0),
          total_views: Math.max(0, Number(data.summary?.total_views) || 0),
          total_items: Math.max(0, Number(data.summary?.total_items) || 0),
          total_smartlinks: Math.max(0, Number(data.summary?.total_smartlinks) || 0),
          total_presaves: Math.max(0, Number(data.summary?.total_presaves) || 0)
        },
        platform_stats: Array.isArray(data.platform_stats) ? data.platform_stats : [],        top_items: Array.isArray(data.top_items) ? data.top_items.map((item: any) => ({
          ...item,
          clicks: Math.max(0, Number(item.clicks) || 0),
          views: Math.max(0, Number(item.views) || 0),
          // Usar sempre o click_rate calculado SQL (padronizado)
          click_rate: Number(item.click_rate) || 0
        })) : [],
        recent_activity: Array.isArray(data.recent_activity) ? data.recent_activity : []      };
      
      setUserMetrics(sanitizedData);
      
    } catch (err: any) {
      console.error('❌ Erro na fetchUserMetrics:', err);
      throw new Error(err.message || 'Erro ao buscar métricas do usuário');
    } finally {
      setLoadingMetrics(false);
    }
  }, [selectedPeriod, user?.id]);// Função para buscar métricas detalhadas de um item específico (otimizada)
  const fetchItemMetrics = useCallback(async (itemId: string) => {
    try {
      setLoadingItemDetails(true);
      
      // Calcular datas usando função utilitária
      const { startDate, endDate } = calculatePeriodDates(selectedPeriod);
      
      // Chamar função SQL otimizada
      const { data, error } = await supabase.rpc('get_item_detailed_metrics', {
        p_link_id: itemId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      });
      
      if (error) {
        console.error('❌ Erro ao buscar métricas detalhadas:', error);
        throw new Error(`Erro na consulta detalhada: ${error.message}`);
      }
      
      // Validar estrutura dos dados retornados
      if (!data || typeof data !== 'object') {
        // Criar estrutura vazia se não houver dados
        const emptyData = {
          summary: {
            total_clicks: 0,
            total_views: 0
          },
          platforms: [],
          countries: [],
          cities: [],
          daily_evolution: [],
          devices: [],
          browsers: [],
          os_types: [],
          peak_hours: []
        };
        setItemMetrics(emptyData);
        return;
      }
      
      setItemMetrics(data);
      
    } catch (err: any) {
      console.error('❌ Erro na fetchItemMetrics:', err);
      throw new Error(err.message || 'Erro ao buscar métricas detalhadas');
    } finally {
      setLoadingItemDetails(false);
    }
  }, [selectedPeriod]);  // Função para buscar lista de itens do usuário (Smart Links e Presaves)
  const fetchUserItems = useCallback(async () => {
    try {
      if (!user?.id) {
        console.warn('⚠️ fetchUserItems chamado sem user.id, retornando lista vazia.');
        setUserItems([]);
        return;
      }
      
      // Buscar Smart Links
      const { data: smartLinks, error: smartLinksError } = await supabase
        .from('smart_links')
        .select('id, artist_name, release_title, slug, created_at, is_public')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (smartLinksError) {
        console.error('❌ Erro ao buscar Smart Links:', smartLinksError);
        throw new Error(`Erro ao buscar Smart Links: ${smartLinksError.message}`);
      }      
      // Buscar Presaves
      const { data: presaves, error: presavesError } = await supabase
        .from('presaves')
        .select('id, artist_name, track_name, shareable_slug, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (presavesError) {
        console.error('❌ Erro ao buscar Presaves:', presavesError);
        throw new Error(`Erro ao buscar Presaves: ${presavesError.message}`);
      }
      
      // Combinar dados
      const allItems: UserItem[] = [
        ...(smartLinks || []).map(item => ({
          id: item.id,
          title: `${item.artist_name || 'Artista'} - ${item.release_title || 'Título'}`,
          slug: item.slug,
          type: 'smartlink' as const,
          artist_name: item.artist_name,
          release_title: item.release_title,
          created_at: item.created_at,
          is_public: item.is_public || false
        })),
        ...(presaves || []).map(item => ({
          id: item.id,
          title: `${item.artist_name || 'Artista'} - ${item.track_name || 'Faixa'}`,
          slug: item.shareable_slug,
          type: 'presave' as const,
          artist_name: item.artist_name,
          track_name: item.track_name,
          created_at: item.created_at,
          is_public: true
        }))
      ];
      
      // Validação crítica: verificar se os números fazem sentido
      // if ((smartLinks?.length || 0) > 200 || (presaves?.length || 0) > 200) {
      //   console.error('🚨 ALERTA: Números muito altos detectados!', {
      //     smartLinks: smartLinks?.length,
      //     presaves: presaves?.length,
      //     user_id: user.id
      //   });
      // }
      
      setUserItems(allItems);
      
    } catch (err: any) {
      console.error('❌ Erro na fetchUserItems:', err);
      // Em caso de erro, registra e continua com lista vazia para não travar o loading geral
      setUserItems([]);
    }
  }, [user?.id]);
  
  // ============================================================================
  // EFFECTS OTIMIZADOS
  // ============================================================================
  
  // Effect principal para carregar dados - usa sessionStorage como cache
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      const userId = user?.id;
      
      // Se não tem usuário, não faz nada
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const cacheKey = `metrics_loaded_${userId}`;
      const dataCacheKey = `metrics_data_${userId}`;
      const itemsCacheKey = `metrics_items_${userId}`;
      
      // Se já carregamos para este userId (verificar sessionStorage), não recarrega
      if (sessionStorage.getItem(cacheKey) && userMetrics !== null) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);        
        
        // Carregar dados em paralelo
        const { startDate, endDate } = calculatePeriodDates(selectedPeriod);
        
        // Buscar métricas do usuário diretamente
        const { data: metricsData, error: metricsError } = await supabase.rpc('get_user_metrics_summary', {
          p_user_id: userId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });
        
        if (metricsError) throw new Error(metricsError.message);
        
        // Buscar Smart Links
        const { data: smartLinks } = await supabase
          .from('smart_links')
          .select('id, artist_name, release_title, slug, created_at, is_public')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        // Buscar Presaves
        const { data: presaves } = await supabase
          .from('presaves')
          .select('id, artist_name, track_name, shareable_slug, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (cancelled) return;
        
        // Processar métricas
        let processedMetrics: OptimizedUserMetrics;
        if (metricsData && typeof metricsData === 'object') {
          processedMetrics = {
            ...metricsData,
            summary: {
              total_clicks: Math.max(0, Number(metricsData.summary?.total_clicks) || 0),
              total_views: Math.max(0, Number(metricsData.summary?.total_views) || 0),
              total_items: Math.max(0, Number(metricsData.summary?.total_items) || 0),
              total_smartlinks: Math.max(0, Number(metricsData.summary?.total_smartlinks) || 0),
              total_presaves: Math.max(0, Number(metricsData.summary?.total_presaves) || 0)
            },
            platform_stats: Array.isArray(metricsData.platform_stats) ? metricsData.platform_stats : [],
            top_items: Array.isArray(metricsData.top_items) ? metricsData.top_items.map((item: any) => ({
              ...item,
              clicks: Math.max(0, Number(item.clicks) || 0),
              views: Math.max(0, Number(item.views) || 0),
              click_rate: Number(item.click_rate) || 0
            })) : [],
            recent_activity: Array.isArray(metricsData.recent_activity) ? metricsData.recent_activity : []
          };
        } else {
          processedMetrics = {
            summary: { total_clicks: 0, total_views: 0, total_items: 0, total_smartlinks: 0, total_presaves: 0 },
            platform_stats: [],
            top_items: [],
            recent_activity: []
          };
        }
        
        // Processar itens
        const allItems: UserItem[] = [
          ...(smartLinks || []).map(item => ({
            id: item.id,
            title: `${item.artist_name || 'Artista'} - ${item.release_title || 'Título'}`,
            slug: item.slug,
            type: 'smartlink' as const,
            artist_name: item.artist_name,
            release_title: item.release_title,
            created_at: item.created_at,
            is_public: item.is_public || false
          })),
          ...(presaves || []).map(item => ({
            id: item.id,
            title: `${item.artist_name || 'Artista'} - ${item.track_name || 'Faixa'}`,
            slug: item.shareable_slug,
            type: 'presave' as const,
            artist_name: item.artist_name,
            track_name: item.track_name,
            created_at: item.created_at,
            is_public: true
          }))
        ];
        
        // Salvar no cache e no estado
        sessionStorage.setItem(cacheKey, 'true');
        sessionStorage.setItem(dataCacheKey, JSON.stringify(processedMetrics));
        sessionStorage.setItem(itemsCacheKey, JSON.stringify(allItems));
        
        setUserMetrics(processedMetrics);
        setUserItems(allItems);
        
      } catch (err: any) {
        if (!cancelled) {
          console.error('❌ Erro no carregamento de dados:', err);
          setError(err.message || 'Erro ao carregar dados');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Só carrega se não estiver inicializando e tiver usuário
    if (!initializing && user?.id) {
      loadData();
    } else if (!initializing && !user) {
      navigate('/login');
    } else if (initializing) {
      // Ainda inicializando - mantém loading
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [initializing, user?.id, navigate]); // Removido userMetrics e selectedPeriod para evitar loops

  // Effect para recarregar métricas quando o período é alterado (não no mount inicial)
  const [periodChanged, setPeriodChanged] = React.useState(false);
  
  useEffect(() => {
    if (periodChanged && user?.id && !loading) {
      const loadPeriodData = async () => {
        try {
          setLoadingMetrics(true);
          const { startDate, endDate } = calculatePeriodDates(selectedPeriod);
          
          const { data, error } = await supabase.rpc('get_user_metrics_summary', {
            p_user_id: user.id,
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString()
          });
          
          if (!error && data) {
            const sanitizedData = {
              ...data,
              summary: {
                total_clicks: Math.max(0, Number(data.summary?.total_clicks) || 0),
                total_views: Math.max(0, Number(data.summary?.total_views) || 0),
                total_items: Math.max(0, Number(data.summary?.total_items) || 0),
                total_smartlinks: Math.max(0, Number(data.summary?.total_smartlinks) || 0),
                total_presaves: Math.max(0, Number(data.summary?.total_presaves) || 0)
              },
              platform_stats: Array.isArray(data.platform_stats) ? data.platform_stats : [],
              top_items: Array.isArray(data.top_items) ? data.top_items.map((item: any) => ({
                ...item,
                clicks: Math.max(0, Number(item.clicks) || 0),
                views: Math.max(0, Number(item.views) || 0),
                click_rate: Number(item.click_rate) || 0
              })) : [],
              recent_activity: Array.isArray(data.recent_activity) ? data.recent_activity : []
            };
            setUserMetrics(sanitizedData);
          }
        } catch (err) {
          console.error('Erro ao recarregar métricas:', err);
        } finally {
          setLoadingMetrics(false);
          setPeriodChanged(false);
        }
      };
      loadPeriodData();
    }
  }, [periodChanged, user?.id, loading, selectedPeriod]);

  // Effect para carregar métricas detalhadas quando um item específico é selecionado
  useEffect(() => {
    if (smartLinkId && !loading) {
      fetchItemMetrics(smartLinkId).catch(err => {
        console.error('❌ Erro ao carregar métricas detalhadas:', err);
        setError('Erro ao carregar métricas detalhadas');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartLinkId]); // Apenas smartLinkId - evita loop com loading e selectedPeriod

  // Effect para sincronizar a aba ativa com a presença de smartLinkId na URL
  useEffect(() => {
    if (smartLinkId) {
      setActiveTab(TabType.DETAILED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartLinkId]); // Removeu activeTab para evitar loop

  // Effect para ouvir mudanças no banco de dados em tempo real
  // DESABILITADO temporariamente para evitar possíveis loops de realtime
  /*
  useEffect(() => {
    // Se estamos na visão detalhada, ouvimos eventos apenas para aquele item
    if (smartLinkId) {
      const itemChannel = supabase
        .channel(`item-metrics-changes-${smartLinkId}`) // Canal único por item
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'smartlink_clicks', filter: `link_id=eq.${smartLinkId}`}, () => fetchItemMetrics(smartLinkId))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presave_clicks', filter: `presave_id=eq.${smartLinkId}`}, () => fetchItemMetrics(smartLinkId))
        .subscribe();

      return () => {
        supabase.removeChannel(itemChannel);
      };
    }
    // Se estamos na visão geral, ouvimos todos os eventos do usuário
    else {
      const overviewChannel = supabase
        .channel('user-metrics-overview-changes') // Canal único para a visão geral
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'smartlink_clicks' }, () => fetchUserMetrics())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presave_clicks' }, () => fetchUserMetrics())
        .subscribe();

      return () => {
        supabase.removeChannel(overviewChannel);
      };
    }
  }, [smartLinkId, fetchUserMetrics, fetchItemMetrics]);
  */

  // ============================================================================
  // HOOKS PERSONALIZADOS E CACHES OTIMIZADOS
  // ============================================================================
  
  // Cache de mapeamento de itens para busca otimizada (substituindo busca linear)
  const userItemsMap = React.useMemo(() => {
    const map = new Map<string, UserItem>();
    userItems.forEach(item => map.set(item.id, item));
    return map;
  }, [userItems]);
    // Cache de mapeamento de top_items para busca otimizada
  const topItemsMap = React.useMemo(() => {
    const map = new Map<string, any>();
    userMetrics?.top_items?.forEach(item => map.set(item.link_id, item));
    return map;
  }, [userMetrics?.top_items]);
    // Função otimizada para buscar dados de um item específico
  const getItemDetails = useCallback((linkId: string): UserItem | null => {
    return userItemsMap.get(linkId) || null;
  }, [userItemsMap]);
  
  // Função otimizada para buscar dados de performance de um item
  const getItemPerformance = useCallback((linkId: string) => {
    return topItemsMap.get(linkId) || null;
  }, [topItemsMap]);
  
  // ============================================================================
  // FUNÇÕES DE UTILIDADE (AGORA USANDO AS FUNÇÕES EXTERNAS)
  // ============================================================================
    // Função para exportar dados (aprimorada com validações)
  const exportToCSV = useCallback(() => {
    if (!userMetrics || !userMetrics.top_items || userMetrics.top_items.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    try {
      const csvData = userMetrics.top_items.map(item => ({
        'Tipo': item.type === 'smartlink' ? 'Smart Link' : 'Presave',
        'Artista': item.artist_name || 'N/A',
        'Título': item.title || 'N/A',
        'Clicks': item.clicks || 0,
        'Visualizações': item.views || 0,
        'Taxa de Conversão': `${item.click_rate || 0}%`
      }));
      
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);      link.download = `metricas-rapmarketing-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  }, [userMetrics]);
  
  // ============================================================================
  // RENDER CONDICIONAL
  // ============================================================================
  
  if (initializing || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#3100ff] text-lg font-medium">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#3100ff] text-lg font-medium">Carregando métricas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] hover:shadow-lg text-white px-6 py-2 rounded-xl transition-all font-medium"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-500 hover:text-[#3100ff] transition-colors p-2 hover:bg-white rounded-lg"
            >
              <FaArrowLeft className="text-xl" />
            </Link>            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-4">
                  <FaChartBar className="text-white text-xl" />
                </div>
                Métricas e Analytics
              </h1>
              <p className="text-gray-600 ml-16">
                Acompanhe o desempenho dos seus Smart Links e Pré-saves
                {userMetrics && (
                  <span className="ml-2 text-sm bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white px-3 py-1 rounded-full">
                    {userMetrics.summary.total_items} itens • {userMetrics.summary.total_clicks} clicks
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filtro de período */}            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setPeriodChanged(true);
              }}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3100ff] shadow-sm"
            >
              <option value={PeriodType.WEEK}>Últimos 7 dias</option>
              <option value={PeriodType.MONTH}>Últimos 30 dias</option>
              <option value={PeriodType.QUARTER}>Últimos 90 dias</option>
              <option value={PeriodType.YEAR}>Último ano</option>
            </select>
            
            {/* Botão de exportar */}
            <button
              onClick={exportToCSV}
              disabled={!userMetrics}
              className="bg-gradient-to-r from-[#00c9a7] to-[#3100ff] hover:shadow-lg disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-all flex items-center font-medium"
            >
              <FaDownload className="mr-2" />
              Exportar CSV
            </button>
          </div>        </div>
          {/* Tabs de navegação */}
        <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm w-fit">
          {/* Aba Visão Geral - só mostra se não há item específico selecionado */}
          {!smartLinkId && (
            <button
              onClick={() => setActiveTab(TabType.OVERVIEW)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === TabType.OVERVIEW
                  ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Visão Geral
            </button>
          )}
          
          {/* Aba Análise Detalhada - só mostra se há item específico selecionado */}
          {smartLinkId && (
            <button
              onClick={() => setActiveTab(TabType.DETAILED)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === TabType.DETAILED
                  ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaArrowTrendUp className="inline mr-2" />
              Análise Detalhada
            </button>
          )}
          
          {/* Aba Meus Itens - sempre disponível */}
          <button
            onClick={() => setActiveTab(TabType.ITEMS)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === TabType.ITEMS
                ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaLink className="inline mr-2" />
            Meus Itens
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === TabType.OVERVIEW && renderOverviewTab()}
        {activeTab === TabType.DETAILED && renderDetailedTab()}
        {activeTab === TabType.ITEMS && renderItemsTab()}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  function renderOverviewTab() {
    // Loading granular para métricas
    if (loadingMetrics) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Atualizando métricas...</p>
        </div>
      );
    }
    
    if (!userMetrics) {
      return (
        <div className="text-center py-12">
          <div className="text-[#a259ff] text-xl mb-4">📊</div>
          <p className="text-gray-600">Carregando métricas gerais...</p>        </div>
      );
    }
    
    const totalClicks = userMetrics.summary.total_clicks;
    const totalViews = userMetrics.summary.total_views;
    // Usar função padronizada para calcular a taxa
    const clickRate = calculateClickRate(totalClicks, totalViews);

    return (
      <div className="space-y-6">
        {/* Cards de métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#3100ff] to-[#a259ff] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white mb-2 flex items-center">
                <FaHandPointer className="mr-2" />
                {formatNumber(totalClicks)}
              </div>
              <div className="text-sm text-white/80">Total de Clicks</div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-r from-[#a259ff] to-[#ffb300] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white mb-2 flex items-center">
                <FaEye className="mr-2" />
                {formatNumber(totalViews)}
              </div>
              <div className="text-sm text-white/80">Visualizações</div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-r from-[#ffb300] to-[#ff7c00] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white mb-2">
                {clickRate}%
              </div>
              <div className="text-sm text-white/80">Taxa de Conversão</div>
              <div className="text-xs text-white/60 mt-1">
                {totalClicks} / {totalViews}
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-r from-[#00c9a7] to-[#3100ff] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white mb-2 flex items-center">
                <FaLink className="mr-2" />
                {userMetrics.summary.total_smartlinks}
              </div>
              <div className="text-sm text-white/80">Smart Links</div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-r from-[#ff6b9d] to-[#a259ff] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="text-3xl font-bold text-white mb-2 flex items-center">
                <FaMusic className="mr-2" />
                {userMetrics.summary.total_presaves}
              </div>
              <div className="text-sm text-white/80">Pré-saves</div>
            </div>
          </div>
        </div>        {/* Top Items */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffb300] to-[#ff7c00] flex items-center justify-center mr-3">
              <FaArrowTrendUp className="text-white" />
            </div>
            Top Performers
          </h3>
          <div className="space-y-3">            {(userMetrics.top_items || []).slice(0, 5).map((item, index) => (
              <div key={item.link_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e9e6ff]/50 to-transparent rounded-xl hover:from-[#e9e6ff] transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 
                      ? 'bg-gradient-to-r from-[#ffb300] to-[#ff7c00]' 
                      : index === 1 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                        : index === 2 
                          ? 'bg-gradient-to-r from-[#cd7f32] to-[#a0522d]' 
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                  }`}>#{index + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.artist_name || 'Artista'} - {item.title || 'Título'}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'smartlink' 
                          ? 'bg-[#3100ff]/10 text-[#3100ff]' 
                          : 'bg-[#a259ff]/10 text-[#a259ff]'
                      }`}>
                        {item.type === 'smartlink' ? 'Smart Link' : 'Pré-save'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#3100ff]">{item.clicks || 0} clicks</div>
                  <div className="text-sm text-gray-500">{item.views || 0} views</div>                  <div className="text-xs text-[#ffb300] font-medium">
                    {item.click_rate || 0}% conversão
                  </div>
                </div>
              </div>
            ))}
            {(!userMetrics.top_items || userMetrics.top_items.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600">Nenhum dado de performance disponível ainda</p>
                <p className="text-sm mt-1 text-gray-500">Os dados aparecerão assim que houver interações</p>
              </div>
            )}
          </div>
        </div>        {/* Estatísticas de plataforma */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
              <FaUsers className="text-white" />
            </div>
            Plataformas Mais Clicadas
          </h3>
          <div className="space-y-3">
            {(userMetrics.platform_stats || []).slice(0, 8).map((platform) => {
              const platformData = getPlatformData(platform.platform_id);
              const IconComponent = platformData.icon;
              
              return (
                <div key={platform.platform_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: platformData.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {platformData.name}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {platformData.category === 'streaming' && 'Streaming'}
                        {platformData.category === 'social' && 'Rede Social'}
                        {platformData.category === 'contact' && 'Contato'}
                        {platformData.category === 'action' && 'Ação'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-[#e9e6ff] rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(platform.percentage || 0, 100)}%`,
                          backgroundColor: platformData.color
                        }}
                      ></div>
                    </div>
                    <div className="text-sm font-bold text-[#3100ff] w-16 text-right">
                      {platform.clicks || 0}
                    </div>
                  </div>
                </div>
              );
            })}
            {(!userMetrics.platform_stats || userMetrics.platform_stats.length === 0) && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-gray-600">Nenhum dado de plataforma disponível ainda</p>
                <p className="text-sm mt-1 text-gray-500">Os dados aparecerão conforme os usuários clicarem nos links</p>
              </div>
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffb300] to-[#ff7c00] flex items-center justify-center mr-3">
              <FaCalendar className="text-white" />
            </div>
            Atividade Recente
          </h3>
          <div className="space-y-3">            {(userMetrics.recent_activity || []).slice(0, 10).map((activity, index) => (
              <div key={`${activity.link_id}-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e9e6ff]/30 to-transparent rounded-xl hover:from-[#e9e6ff]/60 transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'smartlink' ? 'bg-[#3100ff]' : 'bg-[#a259ff]'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {activity.artist_name || 'Artista'} - {activity.title || 'Título'}
                    </div>                    <div className="text-sm text-gray-500">
                      {activity.platform_id ? getPlatformData(activity.platform_id).name : 'Plataforma desconhecida'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDateTime(activity.clicked_at)}
                </div>
              </div>
            ))}
            {(!userMetrics.recent_activity || userMetrics.recent_activity.length === 0) && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏰</div>
                <p className="text-gray-600">Nenhuma atividade recente disponível</p>
                <p className="text-sm mt-1 text-gray-500">As atividades mais recentes aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  function renderDetailedTab() {
    if (!smartLinkId) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-[#a259ff] text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione um Item</h3>
          <p className="text-gray-600 mb-6">
            Escolha um Smart Link ou Pré-save na aba "Meus Itens" para ver análises detalhadas
          </p>
        </div>
      );
    }// Loading granular para detalhes de item específico
    if (loadingItemDetails) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do item...</p>
        </div>
      );
    }

    if (!itemMetrics) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise detalhada...</p>
        </div>
      );
    }    return (
      <div className="space-y-6">
        {/* Breadcrumb e navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/dashboard/metrics')}
              className="text-[#3100ff] hover:text-[#a259ff] flex items-center space-x-1 font-medium"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Voltar para Visão Geral</span>
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Análise Detalhada</span>
          </div>
        </div>

        {/* Informações do item selecionado */}
        {smartLinkId && (() => {
          const itemDetails = getItemDetails(smartLinkId);
          if (itemDetails) {
            return (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    itemDetails.type === 'smartlink' ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff]' : 'bg-gradient-to-r from-[#a259ff] to-[#ff6b9d]'
                  }`}>
                    {itemDetails.type === 'smartlink' ? <FaLink className="text-white" /> : <FaMusic className="text-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{itemDetails.title}</h4>
                    <p className="text-sm text-gray-600">
                      {itemDetails.type === 'smartlink' ? 'Smart Link' : 'Pré-save'} • 
                      Criado em {formatDate(itemDetails.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Resumo do item */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo Detalhado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">            <div className="text-center p-4 bg-gradient-to-r from-[#e9e6ff]/50 to-transparent rounded-xl">
              <div className="text-3xl font-bold text-[#3100ff]">{itemMetrics.summary.total_clicks}</div>
              <div className="text-sm text-gray-600">Total de Clicks</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-[#e9e6ff]/50 to-transparent rounded-xl">
              <div className="text-3xl font-bold text-[#a259ff]">{itemMetrics.summary.total_views}</div>
              <div className="text-sm text-gray-600">Total de Visualizações</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-[#e9e6ff]/50 to-transparent rounded-xl">
              <div className="text-3xl font-bold text-[#ffb300]">
                {calculateClickRate(itemMetrics.summary.total_clicks, itemMetrics.summary.total_views)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ffb300]">
                {(itemMetrics.platforms || []).length}
              </div>
              <div className="text-sm text-gray-600">Plataformas Ativas</div>
            </div>
          </div>
        </div>        {/* Plataformas detalhadas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance por Plataforma</h3>
          <div className="space-y-3">
            {(itemMetrics.platforms || []).map((platform) => {
              const platformData = getPlatformData(platform.platform_id);
              const IconComponent = platformData.icon;
              
              return (
                <div key={platform.platform_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: platformData.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{platformData.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {platformData.category === 'streaming' && 'Streaming'}
                        {platformData.category === 'social' && 'Rede Social'}
                        {platformData.category === 'contact' && 'Contato'}
                        {platformData.category === 'action' && 'Ação'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold" style={{ color: platformData.color }}>
                      {platform.clicks} clicks
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (platform.clicks / Math.max(...(itemMetrics.platforms || []).map(p => p.clicks))) * 100)}%`,
                          backgroundColor: platformData.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!itemMetrics.platforms || itemMetrics.platforms.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                <p>Nenhum dado de plataforma disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Países e cidades */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Países</h3>
            <div className="space-y-3">
              {(itemMetrics.countries || []).slice(0, 5).map((country) => (
                <div key={country.country} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{country.country}</span>
                  <span className="text-[#3100ff] font-bold">{country.count}</span>
                </div>
              ))}
              {(!itemMetrics.countries || itemMetrics.countries.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Cidades</h3>
            <div className="space-y-3">
              {(itemMetrics.cities || []).slice(0, 5).map((city) => (
                <div key={`${city.city}-${city.country}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{city.city}, {city.country}</span>
                  <span className="text-[#a259ff] font-bold">{city.count}</span>
                </div>
              ))}
              {(!itemMetrics.cities || itemMetrics.cities.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dispositivos, Browsers e OS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dispositivos</h3>
            <div className="space-y-3">
              {(itemMetrics.devices || []).map((device) => (
                <div key={device.device_type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{device.device_type || 'Desconhecido'}</span>
                  <span className="text-[#a259ff] font-bold">{device.count}</span>
                </div>
              ))}
              {(!itemMetrics.devices || itemMetrics.devices.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Navegadores</h3>
            <div className="space-y-3">
              {(itemMetrics.browsers || []).map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{browser.browser || 'Desconhecido'}</span>
                  <span className="text-[#3100ff] font-bold">{browser.count}</span>
                </div>
              ))}
              {(!itemMetrics.browsers || itemMetrics.browsers.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sistemas</h3>
            <div className="space-y-3">
              {(itemMetrics.os_types || []).map((os) => (
                <div key={os.os} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{os.os || 'Desconhecido'}</span>
                  <span className="text-[#ffb300] font-bold">{os.count}</span>
                </div>
              ))}
              {(!itemMetrics.os_types || itemMetrics.os_types.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderItemsTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Meus Itens ({userItems.length})</h3>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <select className="bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3100ff]/20 focus:border-[#3100ff]">
              <option value="all">Todos os tipos</option>
              <option value="smartlink">Smart Links</option>
              <option value="presave">Presaves</option>
            </select>
          </div>
        </div>        <div className="grid gap-4">
          {userItems.length > 0 ? userItems.map((item) => {
            // Usar busca otimizada ao invés de find() linear
            const itemData = getItemPerformance(item.id);
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.type === 'smartlink' ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff]' : 'bg-gradient-to-r from-[#a259ff] to-pink-500'
                    }`}>
                      {item.type === 'smartlink' ? <FaLink className="text-white" /> : <FaMusic className="text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>                      <p className="text-sm text-gray-600">
                        {item.type === 'smartlink' ? 'Smart Link' : 'Presave'} • 
                        Criado em {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#a259ff]">
                        {itemData?.clicks || 0}
                      </div>                      <div className="text-xs text-gray-600">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#3100ff]">
                        {itemData?.views || 0}
                      </div>
                      <div className="text-xs text-gray-600">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#ffb300]">
                        {itemData?.click_rate || 0}%
                      </div>
                      <div className="text-xs text-gray-600">Taxa</div>
                    </div>                    <button
                      onClick={() => {
                        navigate(`/dashboard/metrics/${item.id}`);
                      }}
                      className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] hover:from-[#2800d9] hover:to-[#8a4ae0] text-white px-4 py-2 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-600">
                Você ainda não criou nenhum Smart Link ou Presave.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default SmartLinkMetrics;
