import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaEye, 
  FaHandPointer, 
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaLink,
  FaMusic,
  FaShare,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaFire,
  FaTrophy,
  FaSpotify,
  FaApple,
  FaDeezer,
  FaYoutube,
  FaSoundcloud,
  FaAmazon
} from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

// Componente de contador animado
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ 
  end, 
  duration = 1500, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Card de estatística estilizado
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgGradient: string;
  trend?: number;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgGradient, trend, suffix = '' }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${bgGradient}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
    
    <div className="relative z-10">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-white/20 backdrop-blur-sm text-white">
        {icon}
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-bold text-white">
          <AnimatedCounter end={value} suffix={suffix} />
        </h3>
        {trend !== undefined && trend !== 0 && (
          <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${
            trend >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
          }`}>
            {trend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

// Ícones das plataformas
const platformIcons: Record<string, React.ReactNode> = {
  spotify: <FaSpotify className="text-[#1DB954]" />,
  apple: <FaApple className="text-[#FA243C]" />,
  apple_music: <FaApple className="text-[#FA243C]" />,
  deezer: <FaDeezer className="text-[#00C7F2]" />,
  youtube: <FaYoutube className="text-[#FF0000]" />,
  youtube_music: <FaYoutube className="text-[#FF0000]" />,
  soundcloud: <FaSoundcloud className="text-[#FF5500]" />,
  amazon: <FaAmazon className="text-[#FF9900]" />,
  amazon_music: <FaAmazon className="text-[#FF9900]" />,
};

interface MetricsSummary {
  totalClicks: number;
  totalViews: number;
  totalSmartLinks: number;
  totalPresaves: number;
  clickRate: number;
  topPerformingItems: Array<{
    id: string;
    title: string;
    type: 'smartlink' | 'presave';
    clicks: number;
    views: number;
    clickRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    type: 'smartlink' | 'presave';
    platform: string;
    timestamp: string;
  }>;
  platformStats: Array<{
    platform: string;
    clicks: number;
    percentage: number;
  }>;
}

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
  clicks: number;
  views: number;
}

const MetricsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMetricsSummary = async (period: string) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Calcular data de início baseada no período
      let startDate: string | undefined;
      if (period !== 'all') {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const date = new Date();
        date.setDate(date.getDate() - days);
        startDate = date.toISOString();
      }

      // Buscar Smart Links do usuário
      const { data: smartLinks, error: smartLinksError } = await supabase
        .from('smart_links')
        .select('id, slug, artist_name, release_title, created_at, is_public')
        .eq('user_id', user.id);

      if (smartLinksError) throw smartLinksError;

      // Buscar Presaves do usuário
      const { data: presaves, error: presavesError } = await supabase
        .from('presaves')
        .select('id, shareable_slug, artist_name, track_name, created_at')
        .eq('user_id', user.id);

      if (presavesError) throw presavesError;

      // Buscar clicks para Smart Links
      let smartLinkClicks: any[] = [];
      if (smartLinks && smartLinks.length > 0) {
        const smartLinkIds = smartLinks.map(sl => sl.id);
        let clicksQuery = supabase
          .from('all_clicks')
          .select('*')
          .eq('type', 'smartlink')
          .in('link_id', smartLinkIds);

        if (startDate) {
          clicksQuery = clicksQuery.gte('clicked_at', startDate);
        }

        const { data: clicksData, error: clicksError } = await clicksQuery;
        if (clicksError) throw clicksError;
        smartLinkClicks = clicksData || [];
      }

      // Buscar clicks para Presaves
      let presaveClicks: any[] = [];
      if (presaves && presaves.length > 0) {
        const presaveIds = presaves.map(p => p.id);
        let presaveClicksQuery = supabase
          .from('all_clicks')
          .select('*')
          .eq('type', 'presave')
          .in('link_id', presaveIds);

        if (startDate) {
          presaveClicksQuery = presaveClicksQuery.gte('clicked_at', startDate);
        }

        const { data: presaveClicksData, error: presaveClicksError } = await presaveClicksQuery;
        if (presaveClicksError) throw presaveClicksError;
        presaveClicks = presaveClicksData || [];
      }

      // Processar dados para criar o resumo
      const allClicks = [...smartLinkClicks, ...presaveClicks];
      const totalClicks = allClicks.length;
      const totalViews = allClicks.filter(click => click.is_page_view).length;      // Estatísticas por plataforma
      const platformStats = allClicks
        .filter(click => !click.is_page_view && click.platform_id)
        .reduce((acc, click) => {
          const platform = click.platform_id || 'Desconhecido';
          acc[platform] = (acc[platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const platformStatsArray = Object.entries(platformStats)
        .map(([platform, clicks]) => ({
          platform,
          clicks: clicks as number,
          percentage: totalClicks > 0 ? ((clicks as number) / totalClicks) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks);

      // Itens com melhor performance
      const itemPerformance = new Map<string, { clicks: number; views: number; item: any; type: 'smartlink' | 'presave' }>();

      // Processar Smart Links
      smartLinks?.forEach(item => {
        const clicks = smartLinkClicks.filter(c => c.link_id === item.id && !c.is_page_view).length;
        const views = smartLinkClicks.filter(c => c.link_id === item.id && c.is_page_view).length;
        itemPerformance.set(item.id, { clicks, views, item, type: 'smartlink' });
      });

      // Processar Presaves
      presaves?.forEach(item => {
        const clicks = presaveClicks.filter(c => c.link_id === item.id && !c.is_page_view).length;
        const views = presaveClicks.filter(c => c.link_id === item.id && c.is_page_view).length;
        itemPerformance.set(item.id, { clicks, views, item, type: 'presave' });
      });

      const topPerformingItems = Array.from(itemPerformance.values())
        .map(({ clicks, views, item, type }) => ({
          id: item.id,
          title: type === 'smartlink' 
            ? `${item.artist_name} - ${item.release_title}`
            : `${item.artist_name} - ${item.track_name}`,
          type,
          clicks,
          views,
          clickRate: views > 0 ? (clicks / views) * 100 : 0
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      // Atividade recente
      const recentActivity = allClicks
        .filter(click => !click.is_page_view)
        .sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
        .slice(0, 10)        .map(click => {
          const item = click.type === 'smartlink' 
            ? smartLinks?.find(sl => sl.id === click.link_id)
            : presaves?.find(p => p.id === click.link_id);
          
          let title = 'Item Desconhecido';
          if (item) {
            if (click.type === 'smartlink') {
              const smartLinkItem = item as any;
              title = `${smartLinkItem.artist_name} - ${smartLinkItem.release_title}`;
            } else {
              const presaveItem = item as any;
              title = `${presaveItem.artist_name} - ${presaveItem.track_name}`;
            }
          }
          
          return {
            id: click.id,
            title,
            type: click.type,
            platform: click.platform_id || 'Desconhecido',
            timestamp: click.clicked_at
          };
        });

      // Preparar lista de itens do usuário
      const items: UserItem[] = [
        ...(smartLinks?.map(sl => ({
          id: sl.id,
          title: `${sl.artist_name} - ${sl.release_title}`,
          slug: sl.slug,
          type: 'smartlink' as const,
          artist_name: sl.artist_name,
          release_title: sl.release_title,
          created_at: sl.created_at,
          is_public: sl.is_public,
          clicks: smartLinkClicks.filter(c => c.link_id === sl.id && !c.is_page_view).length,
          views: smartLinkClicks.filter(c => c.link_id === sl.id && c.is_page_view).length
        })) || []),
        ...(presaves?.map(p => ({
          id: p.id,
          title: `${p.artist_name} - ${p.track_name}`,
          slug: p.shareable_slug,
          type: 'presave' as const,
          artist_name: p.artist_name,
          track_name: p.track_name,
          created_at: p.created_at,
          is_public: true,
          clicks: presaveClicks.filter(c => c.link_id === p.id && !c.is_page_view).length,
          views: presaveClicks.filter(c => c.link_id === p.id && c.is_page_view).length
        })) || [])
      ];

      const summary: MetricsSummary = {
        totalClicks: totalClicks - totalViews, // Excluir visualizações de página
        totalViews,
        totalSmartLinks: smartLinks?.length || 0,
        totalPresaves: presaves?.length || 0,
        clickRate: totalViews > 0 ? ((totalClicks - totalViews) / totalViews) * 100 : 0,
        topPerformingItems,
        recentActivity,
        platformStats: platformStatsArray
      };

      setSummary(summary);
      setUserItems(items);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchMetricsSummary(selectedPeriod)
      .finally(() => setLoading(false));
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#3100ff] font-medium">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
          <FaChartBar className="text-6xl text-[#a259ff] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar métricas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-4">
                  <FaChartLine className="text-white text-xl" />
                </div>
                Métricas e Analytics
              </h1>
              <p className="text-gray-600 mt-2 ml-16">
                Acompanhe o desempenho dos seus Smart Links e Pré-saves
              </p>
            </div>
            
            {/* Seletor de período */}
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: 'all', label: 'Todos' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards de resumo com gradientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Clicks"
            value={summary?.totalClicks || 0}
            icon={<FaHandPointer className="text-xl" />}
            bgGradient="bg-gradient-to-r from-[#3100ff] to-[#a259ff]"
          />
          <StatCard
            title="Visualizações"
            value={summary?.totalViews || 0}
            icon={<FaEye className="text-xl" />}
            bgGradient="bg-gradient-to-r from-[#a259ff] to-[#ffb300]"
          />
          <StatCard
            title="Taxa de Clique"
            value={summary?.clickRate || 0}
            icon={<FaArrowTrendUp className="text-xl" />}
            bgGradient="bg-gradient-to-r from-[#ffb300] to-[#ff7c00]"
            suffix="%"
          />
          <StatCard
            title="Smart Links"
            value={summary?.totalSmartLinks || 0}
            icon={<FaLink className="text-xl" />}
            bgGradient="bg-gradient-to-r from-[#00c9a7] to-[#3100ff]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffb300] to-[#ff7c00] flex items-center justify-center mr-3">
                <FaTrophy className="text-white" />
              </div>
              Melhor Performance
            </h3>
            <div className="space-y-3">
              {summary?.topPerformingItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e9e6ff]/50 to-transparent rounded-xl hover:from-[#e9e6ff] transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold mr-4 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-[#ffb300] to-[#ff7c00]' 
                        : index === 1 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                          : index === 2 
                            ? 'bg-gradient-to-r from-[#cd7f32] to-[#a0522d]' 
                            : 'bg-gradient-to-r from-gray-300 to-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                          item.type === 'smartlink' 
                            ? 'bg-[#3100ff]/10 text-[#3100ff]' 
                            : 'bg-[#a259ff]/10 text-[#a259ff]'
                        }`}>
                          {item.type === 'smartlink' ? 'Smart Link' : 'Pré-save'}
                        </span>
                        {item.views} visualizações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#3100ff]">{item.clicks}</p>
                    <p className="text-xs text-gray-500">clicks</p>
                  </div>
                </div>
              ))}
              {(!summary?.topPerformingItems || summary.topPerformingItems.length === 0) && (
                <div className="text-center py-8">
                  <FaFire className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum dado de performance disponível ainda</p>
                </div>
              )}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
                <FaShare className="text-white" />
              </div>
              Clicks por Plataforma
            </h3>
            <div className="space-y-4">
              {summary?.platformStats.slice(0, 8).map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      {platformIcons[platform.platform.toLowerCase()] || <FaMusic className="text-gray-400" />}
                    </div>
                    <span className="text-gray-900 capitalize truncate">{platform.platform}</span>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="w-32 bg-[#e9e6ff] rounded-full h-2.5 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(platform.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-[#3100ff] w-12 text-right">
                      {platform.clicks}
                    </span>
                  </div>
                </div>
              ))}
              {(!summary?.platformStats || summary.platformStats.length === 0) && (
                <div className="text-center py-8">
                  <FaShare className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum dado de plataforma disponível ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de itens do usuário */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#a259ff] to-[#3100ff] flex items-center justify-center mr-3">
              <FaUsers className="text-white" />
            </div>
            Seus Smart Links e Pré-saves
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-[#e9e6ff]">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Item</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Visualizações</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Clicks</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Taxa</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {userItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-[#e9e6ff]/20 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'smartlink' 
                          ? 'bg-[#3100ff]/10 text-[#3100ff]' 
                          : 'bg-[#a259ff]/10 text-[#a259ff]'
                      }`}>
                        {item.type === 'smartlink' ? (
                          <>
                            <FaLink className="mr-1.5" />
                            Smart Link
                          </>
                        ) : (
                          <>
                            <FaMusic className="mr-1.5" />
                            Pré-save
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_public 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_public ? 'Público' : 'Privado'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-gray-900">{item.views.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-[#3100ff]">{item.clicks.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-medium ${
                        item.views > 0 && (item.clicks / item.views) * 100 >= 10 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`}>
                        {item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/dashboard/metrics/${item.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                      >
                        <FaChartBar className="mr-2" />
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userItems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#e9e6ff] to-[#f0f0f5] flex items-center justify-center mx-auto mb-4">
                  <FaChartBar className="text-4xl text-[#a259ff]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum item encontrado</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Crie seus primeiros Smart Links ou Pré-saves para começar a ver suas métricas.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/criar-smart-link"
                    className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                  >
                    <FaLink className="mr-2" />
                    Criar Smart Link
                  </Link>
                  <Link
                    to="/criar-presave"
                    className="inline-flex items-center px-5 py-3 bg-white text-[#3100ff] border-2 border-[#3100ff] rounded-xl hover:bg-[#e9e6ff] hover:scale-105 transition-all duration-200 font-medium"
                  >
                    <FaMusic className="mr-2" />
                    Criar Pré-save
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
