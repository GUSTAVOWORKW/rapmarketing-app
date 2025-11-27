// src/components/dashboard/UserDashboard.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  FaLink, FaMusic, FaCalendarAlt, FaChartLine, FaRocket, 
  FaEye, FaMousePointer, FaUsers, FaSpotify, FaPlus,
  FaCopy, FaExternalLinkAlt, FaArrowUp, FaArrowDown,
  FaLightbulb, FaTrophy, FaBolt, FaFire, FaStar, FaUserAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { spotifyTokenService } from '../../services/spotifyTokenService';

// Constantes para controle de cache
const SPOTIFY_CACHE_PREFIX = 'dashboard_spotify_';
const SPOTIFY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

// Card de estatística
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  trend?: number;
  suffix?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, icon, color, bgGradient, trend, suffix = '', onClick 
}) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${bgGradient}`}
  >
    {/* Decorative circles */}
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
    <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
    
    <div className="relative z-10">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${color} bg-white/20 backdrop-blur-sm`}>
        {icon}
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-bold text-white">
          <AnimatedCounter end={value} suffix={suffix} />
        </h3>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${
            trend >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
          }`}>
            {trend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

// Card de ação rápida
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, description, icon, color, onClick, badge 
}) => (
  <button
    onClick={onClick}
    className="relative w-full text-left bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-100 group"
  >
    {badge && (
      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white rounded-full animate-pulse">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-gray-800 group-hover:text-[#3100ff] transition-colors">{title}</h4>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <FaExternalLinkAlt className="text-gray-300 group-hover:text-[#3100ff] transition-colors" />
    </div>
  </button>
);

// Card de link recente
interface RecentLinkCardProps {
  title: string;
  slug: string;
  views: number;
  clicks: number;
  template: string;
  createdAt: string;
}

const RecentLinkCard: React.FC<RecentLinkCardProps> = ({ 
  title, slug, views, clicks, template, createdAt 
}) => {
  const copyLink = () => {
    navigator.clipboard.writeText(`https://rapmarketing.link/${slug}`);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-gray-800 truncate group-hover:text-[#3100ff] transition-colors">
            {title || 'Smart Link'}
          </h4>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className="truncate">rapmarketing.link/{slug}</span>
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={copyLink}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copiar link"
          >
            <FaCopy className="text-gray-400 hover:text-[#3100ff]" />
          </button>
          <a
            href={`https://rapmarketing.link/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Abrir link"
          >
            <FaExternalLinkAlt className="text-gray-400 hover:text-[#3100ff]" />
          </a>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <FaEye className="text-blue-400" />
          <span>{views || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <FaMousePointer className="text-green-400" />
          <span>{clicks || 0}</span>
        </div>
        <div className="flex-grow" />
        <span className="px-2 py-0.5 bg-gradient-to-r from-[#e9e6ff] to-[#f0f0f5] text-[#3100ff] text-xs rounded-full font-medium">
          {template}
        </span>
      </div>
    </div>
  );
};

// Card de dica
interface TipCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  onClick: () => void;
}

const TipCard: React.FC<TipCardProps> = ({ title, description, icon, action, onClick }) => (
  <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] rounded-xl p-4 border border-amber-200 group hover:shadow-md transition-all duration-300">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
        {icon}
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-amber-900 text-sm">{title}</h4>
        <p className="text-xs text-amber-700 mt-0.5 mb-2">{description}</p>
        <button
          onClick={onClick}
          className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
        >
          {action} <FaExternalLinkAlt size={10} />
        </button>
      </div>
    </div>
  </div>
);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, initializing } = useAuth();

  // Estados
  const [stats, setStats] = useState({
    smartLinks: 0,
    presaves: 0,
    totalViews: 0,
    totalClicks: 0
  });
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAllTips, setShowAllTips] = useState(false);

  // Estados do Spotify
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [spotifyFollowers, setSpotifyFollowers] = useState<number | null>(null);
  const [loadingSpotify, setLoadingSpotify] = useState(true);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [connectingSpotify, setConnectingSpotify] = useState(false);

  // Refs para evitar chamadas duplicadas
  const spotifyFetchedRef = useRef(false);
  const dashboardFetchedRef = useRef(false);

  // Calcular taxa de conversão
  const conversionRate = useMemo(() => {
    if (stats.totalViews === 0) return 0;
    return Math.round((stats.totalClicks / stats.totalViews) * 100);
  }, [stats.totalViews, stats.totalClicks]);

  // Função para conectar com Spotify
  const handleConnectSpotify = async () => {
    if (!user) return;
    setConnectingSpotify(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/spotify-callback`,
          scopes: 'user-read-email user-read-private user-top-read user-read-recently-played',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Erro ao conectar com Spotify:', error);
      }
    } catch (authError) {
      console.error('Erro inesperado ao conectar com Spotify:', authError);
    } finally {
      setConnectingSpotify(false);
    }
  };

  // Carregar dados do Spotify - com cache e proteção contra loops
  useEffect(() => {
    let cancelled = false;
    const userId = user?.id;

    if (!userId || initializing || spotifyFetchedRef.current) {
      if (!userId && !initializing) setLoadingSpotify(false);
      return;
    }

    const fetchSpotifyData = async () => {
      // Verificar cache
      const cacheKey = `${SPOTIFY_CACHE_PREFIX}${userId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < SPOTIFY_CACHE_DURATION) {
            setTopArtists(data.artists || []);
            setTopTracks(data.tracks || []);
            setSpotifyFollowers(data.followers);
            setSpotifyConnected(data.connected);
            setLoadingSpotify(false);
            spotifyFetchedRef.current = true;
            return;
          }
        } catch { /* Cache inválido, continuar */ }
      }

      setLoadingSpotify(true);

      try {
        const hasSpotify = await spotifyTokenService.hasValidSpotifyConnection(userId);
        
        if (!hasSpotify) {
          if (!cancelled) {
            setSpotifyConnected(false);
            setLoadingSpotify(false);
            spotifyFetchedRef.current = true;
            // Cache estado desconectado
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: { connected: false, artists: [], tracks: [], followers: null },
              timestamp: Date.now()
            }));
          }
          return;
        }

        const [artistsResponse, tracksResponse, userResponse] = await Promise.all([
          spotifyTokenService.makeSpotifyRequest(userId, '/me/top/artists?limit=5&time_range=long_term'),
          spotifyTokenService.makeSpotifyRequest(userId, '/me/top/tracks?limit=5&time_range=long_term'),
          spotifyTokenService.makeSpotifyRequest(userId, '/me')
        ]);

        if (!cancelled) {
          const artistsData = artistsResponse.ok ? await artistsResponse.json() : { items: [] };
          const tracksData = tracksResponse.ok ? await tracksResponse.json() : { items: [] };
          const userData = userResponse.ok ? await userResponse.json() : {};

          setTopArtists(artistsData.items || []);
          setTopTracks(tracksData.items || []);
          setSpotifyFollowers(userData.followers?.total ?? null);
          setSpotifyConnected(true);

          // Cache dados
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: {
              connected: true,
              artists: artistsData.items || [],
              tracks: tracksData.items || [],
              followers: userData.followers?.total ?? null
            },
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Spotify:', error);
        if (!cancelled) setSpotifyConnected(false);
      } finally {
        if (!cancelled) {
          setLoadingSpotify(false);
          spotifyFetchedRef.current = true;
        }
      }
    };

    fetchSpotifyData();

    return () => { cancelled = true; };
  }, [user?.id, initializing]);

  // Carregar dados do dashboard
  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      const userId = user?.id;
      if (!userId) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);

      try {
        // Buscar dados em paralelo
        const [
          { count: smartLinksCount },
          { count: presavesCount },
          { data: linksData },
          { data: allLinksForMetrics }
        ] = await Promise.all([
          supabase.from('smart_links').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('presaves').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('smart_links').select('id, artist_name, release_title, slug, template_id, created_at, view_count').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
          supabase.from('smart_links').select('view_count').eq('user_id', userId)
        ]);

        if (!cancelled) {
          // Calcular totais de métricas a partir dos smart_links
          let totalViews = 0;
          
          if (allLinksForMetrics) {
            allLinksForMetrics.forEach((link: any) => {
              totalViews += link.view_count || 0;
            });
          }

          setStats({
            smartLinks: smartLinksCount ?? 0,
            presaves: presavesCount ?? 0,
            totalViews,
            totalClicks: 0 // Coluna click_count não existe na tabela
          });

          setRecentLinks(linksData || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    if (!initializing && user?.id) {
      fetchDashboardData();
    } else if (!initializing) {
      setLoadingData(false);
      setLoadingSpotify(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, initializing]);

  // Dicas do sistema - atualizado para usar handleConnectSpotify
  const tips = [
    {
      title: 'Conecte seu Spotify',
      description: 'Obtenha estatísticas detalhadas conectando sua conta Spotify.',
      icon: <FaSpotify />,
      action: spotifyConnected ? 'Conectado!' : 'Conectar agora',
      onClick: spotifyConnected ? () => {} : handleConnectSpotify
    },
    {
      title: 'Adicione mais plataformas',
      description: 'Quanto mais plataformas, maior alcance para sua música.',
      icon: <FaMusic />,
      action: 'Criar Smart Link',
      onClick: () => navigate('/criar-smart-link')
    },
    {
      title: 'Configure um Pre-Save',
      description: 'Colete saves antes do lançamento e aumente seus streams.',
      icon: <FaRocket />,
      action: 'Criar Pre-Save',
      onClick: () => navigate('/criar-presave')
    },
    {
      title: 'Analise suas métricas',
      description: 'Veja quais links performam melhor e otimize sua estratégia.',
      icon: <FaChartLine />,
      action: 'Ver métricas',
      onClick: () => navigate('/dashboard/metrics')
    }
  ];

  // Loading state
  if (initializing || loadingData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-[#3100ff]/20 border-t-[#3100ff] rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header de boas-vindas */}
      <div className="bg-gradient-to-r from-[#3100ff] via-[#5c3aff] to-[#a259ff] rounded-2xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold flex items-center gap-1">
                <FaTrophy className="text-yellow-300" /> Artista PRO
              </span>
              {stats.smartLinks > 0 && (
                <span className="px-3 py-1 bg-green-400/20 backdrop-blur-sm rounded-full text-xs font-bold flex items-center gap-1">
                  <FaFire className="text-orange-300" /> Ativo
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Olá, {profile?.username || 'Artista'}! 👋
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Bem-vindo ao seu centro de comando musical. Veja suas estatísticas e gerencie seus links.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/criar-smart-link')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#3100ff] rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <FaPlus /> Novo Link
            </button>
          </div>
        </div>
      </div>

      {/* Cards do Spotify */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card compacto de Seguidores Spotify */}
        <div className="md:col-span-3 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <FaSpotify className="text-white text-xl" />
              <span className="text-white/90 font-semibold text-sm">Seguidores</span>
            </div>
            {loadingSpotify ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : spotifyConnected && spotifyFollowers !== null ? (
              <span className="text-3xl font-extrabold text-white">
                {spotifyFollowers.toLocaleString('pt-BR')}
              </span>
            ) : (
              <button
                onClick={handleConnectSpotify}
                disabled={connectingSpotify}
                className="text-xs text-white/80 hover:text-white underline disabled:opacity-50"
              >
                {connectingSpotify ? 'Conectando...' : 'Conectar Spotify'}
              </button>
            )}
          </div>
        </div>

        {/* Card de Top Artistas */}
        <div className="md:col-span-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
          <div className="bg-gradient-to-r from-[#ffb300] to-[#ff8c00] px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FaUserAlt className="text-white text-sm" />
            </div>
            <span className="text-white font-bold text-sm">Top Artistas</span>
          </div>
          <div className="p-3">
            {loadingSpotify ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#ffb300]/20 border-t-[#ffb300] rounded-full animate-spin" />
              </div>
            ) : topArtists.length > 0 ? (
              <ul className="space-y-2">
                {topArtists.slice(0, 5).map((artist: any, index: number) => (
                  <li key={artist.id} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
                    <span className="text-xs font-bold text-gray-400 w-3">{index + 1}</span>
                    {artist.images && artist.images.length > 0 ? (
                      <img src={artist.images[artist.images.length > 1 ? 1 : 0].url} alt={artist.name} className="w-8 h-8 rounded-full object-cover border border-[#ffb300]/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb300] to-[#ff8c00] flex items-center justify-center">
                        <FaUserAlt className="text-white text-xs" />
                      </div>
                    )}
                    <a href={artist.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-medium text-xs hover:text-[#ffb300] transition-colors truncate flex-1">
                      {artist.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-xs">Conecte seu Spotify</p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Top Músicas */}
        <div className="md:col-span-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
          <div className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FaMusic className="text-white text-sm" />
            </div>
            <span className="text-white font-bold text-sm">Top Músicas</span>
          </div>
          <div className="p-3">
            {loadingSpotify ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#3100ff]/20 border-t-[#3100ff] rounded-full animate-spin" />
              </div>
            ) : topTracks.length > 0 ? (
              <ul className="space-y-2">
                {topTracks.slice(0, 5).map((track: any, index: number) => (
                  <li key={track.id} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
                    <span className="text-xs font-bold text-gray-400 w-3">{index + 1}</span>
                    {track.album?.images && track.album.images.length > 0 ? (
                      <img src={track.album.images[track.album.images.length > 1 ? 1 : 0].url} alt={track.name} className="w-8 h-8 rounded object-cover border border-[#3100ff]/30" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-[#3100ff] to-[#a259ff] flex items-center justify-center">
                        <FaMusic className="text-white text-xs" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <a href={track.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-medium text-xs hover:text-[#3100ff] transition-colors truncate block">
                        {track.name}
                      </a>
                      <span className="text-[10px] text-gray-400 truncate block">{track.artists?.map((a: any) => a.name).join(', ')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-xs">Conecte seu Spotify</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Smart Links"
          value={stats.smartLinks}
          icon={<FaLink className="text-xl text-white" />}
          color="text-white"
          bgGradient="bg-gradient-to-br from-[#3100ff] to-[#5c3aff]"
          onClick={() => navigate('/dashboard/metrics')}
        />
        <StatCard
          title="Pre-Saves"
          value={stats.presaves}
          icon={<FaCalendarAlt className="text-xl text-white" />}
          color="text-white"
          bgGradient="bg-gradient-to-br from-[#a259ff] to-[#d946ef]"
          onClick={() => navigate('/criar-presave')}
        />
        <StatCard
          title="Total de Views"
          value={stats.totalViews}
          icon={<FaEye className="text-xl text-white" />}
          color="text-white"
          bgGradient="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]"
          onClick={() => navigate('/dashboard/metrics')}
        />
        <StatCard
          title="Taxa de Conversão"
          value={conversionRate}
          suffix="%"
          icon={<FaChartLine className="text-xl text-white" />}
          color="text-white"
          bgGradient="bg-gradient-to-br from-[#10b981] to-[#34d399]"
          trend={conversionRate > 5 ? 12 : -3}
          onClick={() => navigate('/dashboard/metrics')}
        />
      </div>

      {/* Conteúdo principal em grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ações rápidas */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBolt className="text-[#3100ff]" /> Ações Rápidas
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickAction
                title="Criar Smart Link"
                description="Compartilhe sua música em todas plataformas"
                icon={<FaLink className="text-xl text-white" />}
                color="bg-gradient-to-br from-[#3100ff] to-[#5c3aff]"
                onClick={() => navigate('/criar-smart-link')}
                badge="Popular"
              />
              <QuickAction
                title="Criar Pre-Save"
                description="Colete saves antes do lançamento"
                icon={<FaCalendarAlt className="text-xl text-white" />}
                color="bg-gradient-to-br from-[#a259ff] to-[#d946ef]"
                onClick={() => navigate('/criar-presave')}
              />
              <QuickAction
                title="Ver Métricas"
                description="Analise a performance dos seus links"
                icon={<FaChartLine className="text-xl text-white" />}
                color="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]"
                onClick={() => navigate('/dashboard/metrics')}
              />
              <QuickAction
                title={spotifyConnected ? "Spotify Conectado" : "Conectar Spotify"}
                description={spotifyConnected ? "Sua conta está sincronizada" : "Sincronize seus dados do Spotify"}
                icon={<FaSpotify className="text-xl text-white" />}
                color="bg-gradient-to-br from-[#1db954] to-[#1ed760]"
                onClick={spotifyConnected ? () => {} : handleConnectSpotify}
                badge={spotifyConnected ? "✓" : undefined}
              />
            </div>
          </div>

          {/* Links recentes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaStar className="text-[#ffb300]" /> Seus Links Recentes
              </h2>
              {recentLinks.length > 0 && (
                <button
                  onClick={() => navigate('/dashboard/metrics')}
                  className="text-sm text-[#3100ff] hover:underline font-medium"
                >
                  Ver todos →
                </button>
              )}
            </div>
            
            {recentLinks.length > 0 ? (
              <div className="grid gap-3">
                {recentLinks.map((link) => (
                  <RecentLinkCard
                    key={link.id}
                    title={link.release_title || link.artist_name}
                    slug={link.slug}
                    views={link.view_count || 0}
                    clicks={0}
                    template={link.template_id}
                    createdAt={link.created_at}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-[#e9e6ff] to-[#f0f0f5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLink className="text-3xl text-[#3100ff]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum link criado ainda</h3>
                <p className="text-gray-500 mb-4">Crie seu primeiro Smart Link e comece a compartilhar sua música!</p>
                <button
                  onClick={() => navigate('/criar-smart-link')}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <FaPlus className="inline mr-2" /> Criar Primeiro Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Card de progresso */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUsers className="text-[#a259ff]" /> Seu Alcance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Views este mês</span>
                  <span className="font-bold text-[#3100ff]">{stats.totalViews}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#3100ff] to-[#a259ff] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.totalViews / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Meta: 1.000 views</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Links criados</span>
                  <span className="font-bold text-[#a259ff]">{stats.smartLinks}/10</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a259ff] to-[#d946ef] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.smartLinks / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLightbulb className="text-amber-500" /> Dicas para você
            </h3>
            <div className="space-y-3">
              {(showAllTips ? tips : tips.slice(0, 2)).map((tip, index) => (
                <TipCard key={index} {...tip} />
              ))}
              {tips.length > 2 && (
                <button
                  onClick={() => setShowAllTips(!showAllTips)}
                  className="w-full text-center text-sm text-[#3100ff] hover:underline font-medium py-2"
                >
                  {showAllTips ? 'Ver menos' : `Ver mais ${tips.length - 2} dicas`}
                </button>
              )}
            </div>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-br from-[#3100ff] to-[#a259ff] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <FaRocket className="text-3xl mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-2">Impulsione sua carreira!</h3>
            <p className="text-sm text-white/80 mb-4">
              Use todos os recursos da plataforma para maximizar seu alcance.
            </p>
            <button
              onClick={() => navigate('/criar-smart-link')}
              className="w-full py-2.5 bg-white text-[#3100ff] rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Começar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
