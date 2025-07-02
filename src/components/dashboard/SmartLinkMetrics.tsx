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
  
  // Estado principal
  const smartLinkId = routeSmartLinkId === 'default' ? null : routeSmartLinkId || null;
    // Estados otimizados com loading granular
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userMetrics, setUserMetrics] = useState<OptimizedUserMetrics | null>(null);
  const [itemMetrics, setItemMetrics] = useState<OptimizedItemMetrics | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  // Estados para filtros (usando enums)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PeriodType.MONTH);
  const [activeTab, setActiveTab] = useState<TabType>(
    smartLinkId ? TabType.DETAILED : TabType.OVERVIEW
  );
  
  // ============================================================================
  // FUNÇÕES OTIMIZADAS USANDO SQL FUNCTIONS
  // ============================================================================  // Função para buscar métricas gerais do usuário (otimizada)
  const { user } = useAuth();

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
  }, [selectedPeriod]);// Função para buscar métricas detalhadas de um item específico (otimizada)
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
        throw new Error('Usuário não autenticado');
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
      if ((smartLinks?.length || 0) > 200 || (presaves?.length || 0) > 200) {
        console.error('🚨 ALERTA: Números muito altos detectados!', {
          smartLinks: smartLinks?.length,
          presaves: presaves?.length,
          user_id: user.id
        });
      }
      
      setUserItems(allItems);
      
    } catch (err) {
      console.error('❌ Erro na fetchUserItems:', err);
      throw err;
    }
  }, []);
  
  // ============================================================================
  // EFFECTS OTIMIZADOS
  // ============================================================================
    // Effect principal para carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);        
        // Carregar dados em paralelo
        await Promise.all([
          fetchUserMetrics(),
          fetchUserItems()
        ]);
        
      } catch (err: any) {
        console.error('❌ Erro no carregamento de dados:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchUserMetrics, fetchUserItems]);  // Effect para recarregar métricas quando o período é alterado
  useEffect(() => {
    if (!loading) {
      fetchUserMetrics().catch(err => {
        console.error('❌ Erro ao recarregar métricas:', err);
        setError('Erro ao atualizar métricas');
      });
    }
  }, [selectedPeriod, fetchUserMetrics, loading]);
  // Effect para carregar métricas detalhadas quando um item específico é selecionado
  useEffect(() => {
    if (smartLinkId && !loading) {
      fetchItemMetrics(smartLinkId).catch(err => {
        console.error('❌ Erro ao carregar métricas detalhadas:', err);
        setError('Erro ao carregar métricas detalhadas');
      });
    }
  }, [smartLinkId, fetchItemMetrics, loading, selectedPeriod]);

  // Effect para sincronizar a aba ativa com a presença de smartLinkId na URL
  useEffect(() => {
    if (smartLinkId) {
      setActiveTab(TabType.DETAILED);
    } else if (activeTab === TabType.DETAILED) {
      setActiveTab(TabType.OVERVIEW);
    }
  }, [smartLinkId, activeTab]);

  // Effect para ouvir mudanças no banco de dados em tempo real
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">Carregando métricas otimizadas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar dados</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </Link>            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FaChartBar className="mr-3 text-purple-400" />
                Métricas Otimizadas
              </h1>
              <p className="text-gray-300">
                Dashboard de performance com consultas SQL otimizadas
                {userMetrics && (
                  <span className="ml-2 text-sm bg-purple-600 px-2 py-1 rounded">
                    {userMetrics.summary.total_items} itens • {userMetrics.summary.total_clicks} clicks totais
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filtro de período */}            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <FaDownload className="mr-2" />
              Exportar CSV
            </button>
          </div>        </div>
          {/* Tabs de navegação */}
        <div className="flex space-x-1 mb-6">
          {/* Aba Visão Geral - só mostra se não há item específico selecionado */}
          {!smartLinkId && (
            <button
              onClick={() => setActiveTab(TabType.OVERVIEW)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === TabType.OVERVIEW
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === TabType.DETAILED
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaArrowTrendUp className="inline mr-2" />
              Análise Detalhada
            </button>
          )}
          
          {/* Aba Meus Itens - sempre disponível */}
          <button
            onClick={() => setActiveTab(TabType.ITEMS)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === TabType.ITEMS
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Atualizando métricas...</p>
        </div>
      );
    }
    
    if (!userMetrics) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">📊</div>
          <p className="text-gray-300">Carregando métricas gerais...</p>        </div>
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
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              <FaHandPointer className="inline mr-2" />
              {formatNumber(totalClicks)}
            </div>
            <div className="text-sm text-gray-300">Total de Clicks</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              <FaEye className="inline mr-2" />
              {formatNumber(totalViews)}
            </div>
            <div className="text-sm text-gray-300">Visualizações</div>
          </div>          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {clickRate}%
            </div>
            <div className="text-sm text-gray-300">Taxa de Conversão</div>
            <div className="text-xs text-gray-400 mt-1">
              {totalClicks} clicks / {totalViews} views
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              <FaLink className="inline mr-2" />
              {userMetrics.summary.total_smartlinks}
            </div>
            <div className="text-sm text-gray-300">Smart Links</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">
              <FaMusic className="inline mr-2" />
              {userMetrics.summary.total_presaves}
            </div>
            <div className="text-sm text-gray-300">Presaves</div>
          </div>
        </div>        {/* Top Items */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaArrowTrendUp className="mr-2 text-green-400" />
            Top Performers
          </h3>
          <div className="space-y-3">            {(userMetrics.top_items || []).slice(0, 5).map((item, index) => (
              <div key={item.link_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold text-purple-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-white">
                      {item.artist_name || 'Artista'} - {item.title || 'Título'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {item.type === 'smartlink' ? 'Smart Link' : 'Presave'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{item.clicks || 0} clicks</div>
                  <div className="text-sm text-gray-300">{item.views || 0} views</div>                  <div className="text-xs text-yellow-400 font-medium">
                    {item.click_rate || 0}% conversão
                  </div>
                </div>
              </div>
            ))}
            {(!userMetrics.top_items || userMetrics.top_items.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p>Nenhum dado de performance disponível ainda</p>
                <p className="text-sm mt-1">Os dados aparecerão assim que houver interações</p>
              </div>
            )}
          </div>
        </div>        {/* Estatísticas de plataforma */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-400" />
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
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: platformData.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {platformData.name}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {platformData.category === 'streaming' && 'Streaming'}
                        {platformData.category === 'social' && 'Rede Social'}
                        {platformData.category === 'contact' && 'Contato'}
                        {platformData.category === 'action' && 'Ação'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(platform.percentage || 0, 100)}%`,
                          backgroundColor: platformData.color
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-300 w-16 text-right">
                      {platform.clicks || 0} ({platform.percentage || 0}%)
                    </div>
                  </div>
                </div>
              );
            })}
            {(!userMetrics.platform_stats || userMetrics.platform_stats.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📱</div>
                <p>Nenhum dado de plataforma disponível ainda</p>
                <p className="text-sm mt-1">Os dados aparecerão conforme os usuários clicarem nos links</p>
              </div>
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaCalendar className="mr-2 text-yellow-400" />
            Atividade Recente
          </h3>
          <div className="space-y-3">            {(userMetrics.recent_activity || []).slice(0, 10).map((activity, index) => (
              <div key={`${activity.link_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'smartlink' ? 'bg-blue-400' : 'bg-pink-400'
                  }`}></div>
                  <div>
                    <div className="font-medium text-white">
                      {activity.artist_name || 'Artista'} - {activity.title || 'Título'}
                    </div>                    <div className="text-sm text-gray-300">
                      {activity.platform_id ? getPlatformData(activity.platform_id).name : 'Plataforma desconhecida'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDateTime(activity.clicked_at)}
                </div>
              </div>
            ))}
            {(!userMetrics.recent_activity || userMetrics.recent_activity.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">⏰</div>
                <p>Nenhuma atividade recente disponível</p>
                <p className="text-sm mt-1">As atividades mais recentes aparecerão aqui</p>
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
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Selecione um Item</h3>
          <p className="text-gray-300 mb-6">
            Escolha um Smart Link ou Presave na aba "Meus Itens" para ver análises detalhadas
          </p>
        </div>
      );
    }// Loading granular para detalhes de item específico
    if (loadingItemDetails) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando detalhes do item...</p>
        </div>
      );
    }

    if (!itemMetrics) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando análise detalhada...</p>
        </div>
      );
    }    return (
      <div className="space-y-6">
        {/* Breadcrumb e navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/dashboard/metrics')}
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Voltar para Visão Geral</span>
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">Análise Detalhada</span>
          </div>
        </div>

        {/* Informações do item selecionado */}
        {smartLinkId && (() => {
          const itemDetails = getItemDetails(smartLinkId);
          if (itemDetails) {
            return (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    itemDetails.type === 'smartlink' ? 'bg-purple-600' : 'bg-pink-600'
                  }`}>
                    {itemDetails.type === 'smartlink' ? <FaLink className="text-white" /> : <FaMusic className="text-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{itemDetails.title}</h4>
                    <p className="text-sm text-gray-300">
                      {itemDetails.type === 'smartlink' ? 'Smart Link' : 'Presave'} • 
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
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Resumo Detalhado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{itemMetrics.summary.total_clicks}</div>
              <div className="text-sm text-gray-300">Total de Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{itemMetrics.summary.total_views}</div>
              <div className="text-sm text-gray-300">Total de Visualizações</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {calculateClickRate(itemMetrics.summary.total_clicks, itemMetrics.summary.total_views)}%
              </div>
              <div className="text-sm text-gray-300">Taxa de Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {(itemMetrics.platforms || []).length}
              </div>
              <div className="text-sm text-gray-300">Plataformas Ativas</div>
            </div>
          </div>
        </div>        {/* Plataformas detalhadas */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Performance por Plataforma</h3>
          <div className="space-y-3">
            {(itemMetrics.platforms || []).map((platform) => {
              const platformData = getPlatformData(platform.platform_id);
              const IconComponent = platformData.icon;
              
              return (
                <div key={platform.platform_id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: platformData.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{platformData.name}</span>
                      <span className="text-xs text-gray-400 capitalize">
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
                    <div className="w-20 bg-gray-600 rounded-full h-2">
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
              <div className="text-center py-4 text-gray-400">
                <p>Nenhum dado de plataforma disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Países e cidades */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Países</h3>
            <div className="space-y-3">
              {(itemMetrics.countries || []).slice(0, 5).map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <span className="text-white">{country.country}</span>
                  <span className="text-green-400 font-bold">{country.count}</span>
                </div>
              ))}
              {(!itemMetrics.countries || itemMetrics.countries.length === 0) && (
                <div className="text-center py-4 text-gray-400">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Cidades</h3>
            <div className="space-y-3">
              {(itemMetrics.cities || []).slice(0, 5).map((city) => (
                <div key={`${city.city}-${city.country}`} className="flex items-center justify-between">
                  <span className="text-white">{city.city}, {city.country}</span>
                  <span className="text-blue-400 font-bold">{city.count}</span>
                </div>
              ))}
              {(!itemMetrics.cities || itemMetrics.cities.length === 0) && (
                <div className="text-center py-4 text-gray-400">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dispositivos, Browsers e OS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Dispositivos</h3>
            <div className="space-y-3">
              {(itemMetrics.devices || []).map((device) => (
                <div key={device.device_type} className="flex items-center justify-between">
                  <span className="text-white">{device.device_type || 'Desconhecido'}</span>
                  <span className="text-purple-400 font-bold">{device.count}</span>
                </div>
              ))}
              {(!itemMetrics.devices || itemMetrics.devices.length === 0) && (
                <div className="text-center py-4 text-gray-400">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Navegadores</h3>
            <div className="space-y-3">
              {(itemMetrics.browsers || []).map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span className="text-white">{browser.browser || 'Desconhecido'}</span>
                  <span className="text-green-400 font-bold">{browser.count}</span>
                </div>
              ))}
              {(!itemMetrics.browsers || itemMetrics.browsers.length === 0) && (
                <div className="text-center py-4 text-gray-400">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sistemas</h3>
            <div className="space-y-3">
              {(itemMetrics.os_types || []).map((os) => (
                <div key={os.os} className="flex items-center justify-between">
                  <span className="text-white">{os.os || 'Desconhecido'}</span>
                  <span className="text-yellow-400 font-bold">{os.count}</span>
                </div>
              ))}
              {(!itemMetrics.os_types || itemMetrics.os_types.length === 0) && (
                <div className="text-center py-4 text-gray-400">
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
          <h3 className="text-xl font-bold text-white">Meus Itens ({userItems.length})</h3>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm">
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
              <div key={item.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.type === 'smartlink' ? 'bg-purple-600' : 'bg-pink-600'
                    }`}>
                      {item.type === 'smartlink' ? <FaLink className="text-white" /> : <FaMusic className="text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>                      <p className="text-sm text-gray-300">
                        {item.type === 'smartlink' ? 'Smart Link' : 'Presave'} • 
                        Criado em {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {itemData?.clicks || 0}
                      </div>                      <div className="text-xs text-gray-300">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {itemData?.views || 0}
                      </div>
                      <div className="text-xs text-gray-300">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {itemData?.click_rate || 0}%
                      </div>
                      <div className="text-xs text-gray-300">Taxa</div>
                    </div>                    <button
                      onClick={() => {
                        navigate(`/dashboard/metrics/${item.id}`);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-300">
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
