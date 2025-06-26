import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaEye, 
  FaHandPointer, 
  FaArrowTrendUp, 
  FaCalendar,
  FaLink,
  FaMusic,
  FaShare,
  FaUsers,
  FaPlay
} from 'react-icons/fa6';

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

  const fetchMetricsSummary = async (period: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaChartBar className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar métricas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaChartBar className="mr-3 text-blue-600" />
                Métricas e Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o desempenho dos seus Smart Links e Pré-saves
              </p>
            </div>
            
            {/* Seletor de período */}
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: 'all', label: 'Todos' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{summary?.totalClicks.toLocaleString()}</p>
              </div>
              <FaHandPointer className="text-3xl text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-3xl font-bold text-gray-900">{summary?.totalViews.toLocaleString()}</p>
              </div>
              <FaEye className="text-3xl text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Clique</p>
                <p className="text-3xl font-bold text-gray-900">{summary?.clickRate.toFixed(1)}%</p>
              </div>
              <FaArrowTrendUp className="text-3xl text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Smart Links</p>
                <p className="text-3xl font-bold text-gray-900">{summary?.totalSmartLinks}</p>
              </div>
              <FaLink className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaArrowTrendUp className="mr-2 text-green-600" />
              Melhor Performance
            </h3>
            <div className="space-y-4">
              {summary?.topPerformingItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.type === 'smartlink' ? 'Smart Link' : 'Pré-save'}
                        • {item.views} visualizações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.clicks}</p>
                    <p className="text-sm text-gray-600">clicks</p>
                  </div>
                </div>
              ))}
              {(!summary?.topPerformingItems || summary.topPerformingItems.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nenhum dado de performance disponível ainda</p>
              )}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaShare className="mr-2 text-blue-600" />
              Clicks por Plataforma
            </h3>
            <div className="space-y-4">
              {summary?.platformStats.slice(0, 8).map((platform, index) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm mr-3"></div>
                    <span className="text-gray-900 capitalize">{platform.platform}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${platform.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {platform.clicks}
                    </span>
                  </div>
                </div>
              ))}
              {(!summary?.platformStats || summary.platformStats.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nenhum dado de plataforma disponível ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Lista de itens do usuário */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FaUsers className="mr-2 text-purple-600" />
            Seus Smart Links e Pré-saves
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Visualizações</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Clicks</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Taxa</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {userItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          Criado em {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'smartlink' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'smartlink' ? (
                          <>
                            <FaLink className="mr-1" />
                            Smart Link
                          </>
                        ) : (
                          <>
                            <FaMusic className="mr-1" />
                            Pré-save
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_public ? 'Público' : 'Privado'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                      {item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0'}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/dashboard/metrics/${item.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaChartBar className="mr-1" />
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userItems.length === 0 && (
              <div className="text-center py-12">
                <FaChartBar className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
                <p className="text-gray-600 mb-6">
                  Crie seus primeiros Smart Links ou Pré-saves para começar a ver suas métricas.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/criar-smart-link"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaLink className="mr-2" />
                    Criar Smart Link
                  </Link>
                  <Link
                    to="/criar-presave"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
