// components/dashboard/SmartLinkMetrics.tsx
// Página de métricas refatorada com gráficos Recharts e estilo do dashboard
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaGlobe,
  FaMobile,
  FaDesktop,
  FaTablet,
  FaClock,
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
  FaWhatsapp,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa6';
import { SiTidal } from 'react-icons/si';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import useMetricsData from '../../hooks/useMetricsData';
import Papa from 'papaparse';

// ============================================================================
// CONSTANTES E TIPOS
// ============================================================================

type Period = '7d' | '30d' | '90d' | 'all';

const COLORS = {
  primary: '#3100ff',
  purple: '#a259ff',
  gold: '#ffb300',
  teal: '#00c9a7',
  pink: '#ff6b9d',
  orange: '#ff7c00',
  gradient: ['#3100ff', '#a259ff', '#ffb300', '#00c9a7', '#ff6b9d', '#ff7c00']
};

const PLATFORM_MAPPINGS: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'spotify': { name: 'Spotify', icon: FaSpotify, color: '#1DB954' },
  'apple-music': { name: 'Apple Music', icon: FaApple, color: '#FC3C44' },
  'apple_music': { name: 'Apple Music', icon: FaApple, color: '#FC3C44' },
  'youtube-music': { name: 'YouTube Music', icon: FaYoutube, color: '#FF0000' },
  'youtube_music': { name: 'YouTube Music', icon: FaYoutube, color: '#FF0000' },
  'youtube': { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  'deezer': { name: 'Deezer', icon: FaDeezer, color: '#FF0000' },
  'tidal': { name: 'Tidal', icon: SiTidal, color: '#000000' },
  'amazon': { name: 'Amazon Music', icon: FaAmazon, color: '#FF9900' },
  'amazon-music': { name: 'Amazon Music', icon: FaAmazon, color: '#FF9900' },
  'soundcloud': { name: 'SoundCloud', icon: FaSoundcloud, color: '#FF5500' },
  'napster': { name: 'Napster', icon: FaNapster, color: '#000000' },
  'instagram': { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  'twitter': { name: 'Twitter/X', icon: FaTwitter, color: '#1DA1F2' },
  'facebook': { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  'tiktok': { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  'whatsapp': { name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
  'phone': { name: 'Telefone', icon: FaPhone, color: '#34B7F1' },
  'email': { name: 'Email', icon: FaEnvelope, color: '#EA4335' }
};

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'mobile': FaMobile,
  'desktop': FaDesktop,
  'tablet': FaTablet
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SmartLinkMetrics: React.FC = () => {
  const { id: smartLinkId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'items'>('overview');

  const { data: metrics, loading, error, refetch } = useMetricsData(user?.id, selectedPeriod);

  // Formatadores
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getPlatformData = (platformId: string) => {
    const mapping = PLATFORM_MAPPINGS[platformId?.toLowerCase()] || PLATFORM_MAPPINGS['spotify'];
    return mapping;
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (!metrics) return;

    const csvData = metrics.daily.map(d => ({
      Data: d.date,
      Clicks: d.clicks,
      Visualizações: d.views
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metricas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar métricas</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white px-6 py-2 rounded-xl"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
                  <FaChartBar className="text-white text-xl" />
                </div>
                Métricas
              </h1>
              <p className="text-gray-600">Análise completa de performance</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Seletor de Período */}
            <div className="flex bg-white rounded-xl p-1 shadow-md">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: 'all', label: 'Tudo' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as Period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Botão Exportar */}
            <button
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-[#00c9a7] to-[#3100ff] text-white px-4 py-2.5 rounded-xl flex items-center font-medium shadow-md hover:shadow-lg transition-all"
            >
              <FaDownload className="mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-md w-fit">
          {[
            { id: 'overview', label: 'Visão Geral', icon: FaChartBar },
            { id: 'detailed', label: 'Detalhado', icon: FaEye },
            { id: 'items', label: 'Meus Itens', icon: FaLink }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && metrics && <OverviewTab metrics={metrics} formatNumber={formatNumber} formatDate={formatDate} getPlatformData={getPlatformData} />}
        {activeTab === 'detailed' && metrics && <DetailedTab metrics={metrics} />}
        {activeTab === 'items' && <ItemsTab navigate={navigate} />}
      </div>
    </div>
  );
};

// ============================================================================
// TAB: VISÃO GERAL
// ============================================================================

interface OverviewTabProps {
  metrics: NonNullable<ReturnType<typeof useMetricsData>['data']>;
  formatNumber: (num: number) => string;
  formatDate: (date: string) => string;
  getPlatformData: (id: string) => { name: string; icon: React.ComponentType<{ className?: string }>; color: string };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ metrics, formatNumber, formatDate, getPlatformData }) => {
  const { summary, daily, platforms, countries, hourly, weekdays } = metrics;

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total de Clicks"
          value={formatNumber(summary.total_clicks)}
          icon={FaHandPointer}
          gradient="from-[#3100ff] to-[#a259ff]"
        />
        <MetricCard
          title="Visualizações"
          value={formatNumber(summary.total_views)}
          icon={FaEye}
          gradient="from-[#a259ff] to-[#ffb300]"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${summary.click_rate}%`}
          subtitle={`${summary.total_clicks} / ${summary.total_views}`}
          icon={FaArrowTrendUp}
          gradient="from-[#ffb300] to-[#ff7c00]"
        />
        <MetricCard
          title="Smart Links"
          value={summary.total_smartlinks.toString()}
          icon={FaLink}
          gradient="from-[#00c9a7] to-[#3100ff]"
        />
        <MetricCard
          title="Pré-saves"
          value={summary.total_presaves.toString()}
          icon={FaMusic}
          gradient="from-[#ff6b9d] to-[#a259ff]"
        />
      </div>

      {/* Gráfico de Área - Clicks ao longo do tempo */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
            <FaChartBar className="text-white" />
          </div>
          Evolução de Clicks e Visualizações
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9e6ff" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => formatDate(date)}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                name="Clicks"
                stroke={COLORS.primary} 
                fillOpacity={1} 
                fill="url(#colorClicks)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                name="Visualizações"
                stroke={COLORS.purple} 
                fillOpacity={1} 
                fill="url(#colorViews)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plataformas mais clicadas */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
              <FaUsers className="text-white" />
            </div>
            Top Plataformas
          </h3>
          {platforms.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platforms.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e6ff" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="platform_id" 
                    width={100}
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => getPlatformData(value).name}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="clicks" name="Clicks" radius={[0, 8, 8, 0]}>
                    {platforms.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPlatformData(entry.platform_id).color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="📱" message="Nenhum dado de plataforma disponível" />
          )}
        </div>

        {/* Top Países */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffb300] to-[#ff7c00] flex items-center justify-center mr-3">
              <FaGlobe className="text-white" />
            </div>
            Top Países
          </h3>
          {countries.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countries.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="country"
                    label={({ country, percentage }) => `${country}: ${percentage}%`}
                    labelLine={false}
                  >
                    {countries.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="🌍" message="Nenhum dado de país disponível" />
          )}
        </div>

        {/* Clicks por Hora */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#3100ff] flex items-center justify-center mr-3">
              <FaClock className="text-white" />
            </div>
            Clicks por Hora do Dia
          </h3>
          {hourly.some(h => h.clicks > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e6ff" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickFormatter={(h) => `${h}h`}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="clicks" name="Clicks" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="⏰" message="Nenhum dado de horário disponível" />
          )}
        </div>

        {/* Clicks por Dia da Semana */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff6b9d] to-[#a259ff] flex items-center justify-center mr-3">
              <FaCalendar className="text-white" />
            </div>
            Clicks por Dia da Semana
          </h3>
          {weekdays.some(w => w.clicks > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdays} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e6ff" />
                  <XAxis dataKey="weekday" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="clicks" name="Clicks" fill={COLORS.pink} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="📅" message="Nenhum dado de dia da semana disponível" />
          )}
        </div>
      </div>

      {/* Lista de plataformas detalhada */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance por Plataforma</h3>
        <div className="space-y-3">
          {platforms.slice(0, 10).map((platform, index) => {
            const platformData = getPlatformData(platform.platform_id);
            const IconComponent = platformData.icon;
            const maxClicks = platforms[0]?.clicks || 1;
            
            return (
              <div key={platform.platform_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e9e6ff]/30 to-transparent rounded-xl hover:from-[#e9e6ff]/60 transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white`} style={{ backgroundColor: platformData.color }}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{platformData.name}</div>
                    <div className="text-sm text-gray-500">{platform.percentage}% do total</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-[#e9e6ff] rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(platform.clicks / maxClicks) * 100}%`,
                        backgroundColor: platformData.color
                      }}
                    />
                  </div>
                  <div className="text-lg font-bold text-[#3100ff] w-20 text-right">
                    {platform.clicks}
                  </div>
                </div>
              </div>
            );
          })}
          {platforms.length === 0 && (
            <EmptyState icon="📊" message="Nenhum dado de plataforma disponível ainda" />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TAB: DETALHADO
// ============================================================================

interface DetailedTabProps {
  metrics: NonNullable<ReturnType<typeof useMetricsData>['data']>;
}

const DetailedTab: React.FC<DetailedTabProps> = ({ metrics }) => {
  const { devices, browsers, os, cities, countries } = metrics;

  return (
    <div className="space-y-6">
      {/* Dispositivos, Browsers e OS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Dispositivos */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#a259ff] to-[#ff6b9d] flex items-center justify-center mr-3">
              <FaMobile className="text-white" />
            </div>
            Dispositivos
          </h3>
          {devices.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="device_type"
                  >
                    {devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="📱" message="Nenhum dado disponível" />
          )}
        </div>

        {/* Navegadores */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3100ff] to-[#a259ff] flex items-center justify-center mr-3">
              <FaGlobe className="text-white" />
            </div>
            Navegadores
          </h3>
          {browsers.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browsers.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="browser"
                  >
                    {browsers.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="🌐" message="Nenhum dado disponível" />
          )}
        </div>

        {/* Sistemas Operacionais */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffb300] to-[#ff7c00] flex items-center justify-center mr-3">
              <FaDesktop className="text-white" />
            </div>
            Sistemas
          </h3>
          {os.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={os.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="os"
                  >
                    {os.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="💻" message="Nenhum dado disponível" />
          )}
        </div>
      </div>

      {/* Países e Cidades */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Países */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top 10 Países</h3>
          <div className="space-y-3">
            {countries.slice(0, 10).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-[#ffb300] to-[#ff7c00]' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-[#cd7f32] to-[#a0522d]' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium">{country.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{country.percentage}%</span>
                  <span className="text-[#3100ff] font-bold">{country.count}</span>
                </div>
              </div>
            ))}
            {countries.length === 0 && (
              <EmptyState icon="🌍" message="Nenhum dado disponível" />
            )}
          </div>
        </div>

        {/* Top Cidades */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top 10 Cidades</h3>
          <div className="space-y-3">
            {cities.slice(0, 10).map((city, index) => (
              <div key={`${city.city}-${city.country}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-[#ffb300] to-[#ff7c00]' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-[#cd7f32] to-[#a0522d]' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">{city.city}</span>
                    <span className="text-gray-500 text-sm ml-2">{city.country}</span>
                  </div>
                </div>
                <span className="text-[#a259ff] font-bold">{city.count}</span>
              </div>
            ))}
            {cities.length === 0 && (
              <EmptyState icon="🏙️" message="Nenhum dado disponível" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TAB: MEUS ITENS
// ============================================================================

interface ItemsTabProps {
  navigate: (path: string) => void;
}

const ItemsTab: React.FC<ItemsTabProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchItems() {
      if (!user?.id) return;
      
      try {
        // Buscar smart links
        const { data: smartlinks } = await import('../../services/supabase').then(m => 
          m.supabase.from('smart_links').select('*').eq('user_id', user.id)
        );
        
        // Buscar presaves
        const { data: presaves } = await import('../../services/supabase').then(m => 
          m.supabase.from('presaves').select('*').eq('user_id', user.id)
        );

        const allItems = [
          ...(smartlinks || []).map(s => ({ ...s, type: 'smartlink', title: s.release_title || s.title || 'Sem título' })),
          ...(presaves || []).map(p => ({ ...p, type: 'presave', title: p.track_name || 'Sem título' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setItems(allItems);
      } catch (err) {
        console.error('Erro ao buscar itens:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3100ff] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Meus Itens ({items.length})</h3>
      </div>

      <div className="grid gap-4">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  item.type === 'smartlink' ? 'bg-gradient-to-r from-[#3100ff] to-[#a259ff]' : 'bg-gradient-to-r from-[#a259ff] to-pink-500'
                }`}>
                  {item.type === 'smartlink' ? <FaLink className="text-white" /> : <FaMusic className="text-white" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">
                    {item.type === 'smartlink' ? 'Smart Link' : 'Presave'} • 
                    {item.artist_name && ` ${item.artist_name} • `}
                    Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#3100ff]">{item.view_count || 0}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/metrics/${item.id}`)}
                  className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] hover:from-[#2800d9] hover:to-[#8a4ae0] text-white px-4 py-2 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-600">Você ainda não criou nenhum Smart Link ou Presave.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, gradient }) => (
  <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
    <div className="relative z-10">
      <div className="text-3xl font-bold text-white mb-2 flex items-center">
        <Icon className="mr-2" />
        {value}
      </div>
      <div className="text-sm text-white/80">{title}</div>
      {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
    </div>
  </div>
);

interface EmptyStateProps {
  icon: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
  <div className="text-center py-8">
    <div className="text-4xl mb-2">{icon}</div>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default SmartLinkMetrics;
