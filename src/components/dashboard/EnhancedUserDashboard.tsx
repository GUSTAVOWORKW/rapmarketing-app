// src/components/dashboard/EnhancedUserDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useUserSmartLink } from '../../hooks/useUserSmartLinks'; 
import { useSmartLink } from '../../hooks/useSmartLink';
import { UserProfile, SmartLink as SmartLinkType, PlatformLink } from '../../types';
import { 
  FaEdit, 
  FaTrash, 
  FaLink, 
  FaPlus, 
  FaEye, 
  FaMusic, 
  FaThList, 
  FaUserCircle, 
  FaChartBar, 
  FaCalendarAlt, 
  FaGlobe, 
  FaFilter, 
  FaSort, 
  FaDownload, 
  FaSearch,
  FaBell,
  FaExclamationTriangle,
  FaSpotify,
  FaUserAlt
} from 'react-icons/fa'; 
import { PLATFORMS as platforms } from '../../data/platforms';
import { spotifyTokenService } from '../../services/spotifyTokenService';

// Comentado temporariamente até instalar as dependências
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

interface UserDashboardProps {
  currentUserId: string;
}

const EnhancedUserDashboard: React.FC<UserDashboardProps> = ({ currentUserId }) => {
  const navigate = useNavigate();
  const [userProfileForContent, setUserProfileForContent] = useState<UserProfile | null>(null);
  const [loadingProfileForContent, setLoadingProfileForContent] = useState(true);

  const [activePresavesCount, setActivePresavesCount] = useState<number | null>(null);
  const [loadingPresavesCount, setLoadingPresavesCount] = useState(true);
  const [smartLinksCount, setSmartLinksCount] = useState<number>(0);
  const [smartBiosCount, setSmartBiosCount] = useState<number>(0);
  const [loadingSmartLinksCount, setLoadingSmartLinksCount] = useState(true);
  
  // Novos estados para métricas agregadas
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [loadingTotalClicks, setLoadingTotalClicks] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingRecentActivity, setLoadingRecentActivity] = useState(true);
  const [topPerformingLinks, setTopPerformingLinks] = useState<any[]>([]);
  const [loadingTopLinks, setLoadingTopLinks] = useState(true);

  // Novos estados para Top Artists e Top Tracks do Spotify
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [loadingTopArtists, setLoadingTopArtists] = useState(true);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(true);
  
  // Estados para a lista de smart links
  const [allSmartLinks, setAllSmartLinks] = useState<SmartLinkType[]>([]);
  const [filteredSmartLinks, setFilteredSmartLinks] = useState<SmartLinkType[]>([]);
  const [loadingAllLinks, setLoadingAllLinks] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const { 
    smartLink, 
    loading: loadingLink, 
    error: linkError, 
    clearUserSmartLinkState
  } = useUserSmartLink(currentUserId); 
  
  const { deleteSmartLink } = useSmartLink(null); 

  useEffect(() => {
    const fetchUserProfileForContent = async () => {
      if (!currentUserId) {
        setLoadingProfileForContent(false);
        return;
      }
      setLoadingProfileForContent(true);      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, username')
          .eq('user_id', currentUserId)
          .single();
        if (error) throw error;
        setUserProfileForContent(data as UserProfile);
      } catch (error) {
        console.error('Error fetching user profile for dashboard content:', error);
      } finally {
        setLoadingProfileForContent(false);
      }
    };

    fetchUserProfileForContent();
  }, [currentUserId]);

  // Buscar contagem de pré-saves ativos
  useEffect(() => {
    const fetchActivePresaves = async () => {
      if (!currentUserId) {
        setLoadingPresavesCount(false);
        setActivePresavesCount(0);
        return;
      }
      setLoadingPresavesCount(true);
      try {
        const currentDate = new Date().toISOString();
        const { count, error } = await supabase
          .from('presaves') 
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId) 
          .gt('release_date', currentDate); 

        if (error) throw error;
        setActivePresavesCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching active presaves count:', error);
        setActivePresavesCount(0); 
      } finally {
        setLoadingPresavesCount(false);
      }
    };

    fetchActivePresaves();
  }, [currentUserId]);

  // Buscar contagem de smart links
  useEffect(() => {
    const fetchSmartLinksCount = async () => {
      if (!currentUserId) {
        setLoadingSmartLinksCount(false);
        setSmartLinksCount(0);
        return;
      }
      setLoadingSmartLinksCount(true);
      try {
        const { count, error } = await supabase
          .from('smart_links')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId);

        if (error) throw error;
        setSmartLinksCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching smart links count:', error);
        setSmartLinksCount(0);
      } finally {
        setLoadingSmartLinksCount(false);
      }
    };

    fetchSmartLinksCount();
    // Para Smart Bios, manteremos 0 por enquanto
    setSmartBiosCount(0); 
  }, [currentUserId]);

  // Buscar todos os smart links do usuário
  useEffect(() => {
    const fetchAllSmartLinks = async () => {
      if (!currentUserId) {
        setLoadingAllLinks(false);
        setAllSmartLinks([]);
        return;
      }
      setLoadingAllLinks(true);
      try {
        const { data, error } = await supabase
          .from('smart_links')
          .select('*')
          .eq('user_id', currentUserId)
          .order(sortField, { ascending: sortDirection === 'asc' });

        if (error) throw error;
        setAllSmartLinks(data || []);
        setFilteredSmartLinks(data || []);
      } catch (error) {
        console.error('Error fetching all smart links:', error);
        setAllSmartLinks([]);
        setFilteredSmartLinks([]);
      } finally {
        setLoadingAllLinks(false);
      }
    };

    fetchAllSmartLinks();
  }, [currentUserId, sortField, sortDirection]);

  // Buscar métricas agregadas (total de cliques)
  useEffect(() => {
    const fetchTotalClicks = async () => {
      if (!currentUserId) {
        setLoadingTotalClicks(false);
        setTotalClicks(0);
        return;
      }
      setLoadingTotalClicks(true);
      try {
        // Simulando uma chamada de API para obter o total de cliques
        // Em um ambiente real, você teria uma função RPC ou endpoint específico
        setTimeout(() => {
          // Valor simulado para demonstração
          setTotalClicks(Math.floor(Math.random() * 10000));
          setLoadingTotalClicks(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching total clicks:', error);
        setTotalClicks(0);
        setLoadingTotalClicks(false);
      }
    };

    fetchTotalClicks();
  }, [currentUserId]);

  // Buscar atividade recente
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!currentUserId) {
        setLoadingRecentActivity(false);
        setRecentActivity([]);
        return;
      }
      setLoadingRecentActivity(true);
      try {
        // Simulando dados de atividade recente
        setTimeout(() => {
          const mockActivity = [
            { id: 1, type: 'click', smartLinkId: 'sl-123', platform: 'Spotify', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, type: 'view', smartLinkId: 'sl-456', timestamp: new Date(Date.now() - 7200000).toISOString() },
            { id: 3, type: 'click', smartLinkId: 'sl-789', platform: 'Apple Music', timestamp: new Date(Date.now() - 10800000).toISOString() },
            { id: 4, type: 'view', smartLinkId: 'sl-123', timestamp: new Date(Date.now() - 14400000).toISOString() },
            { id: 5, type: 'click', smartLinkId: 'sl-456', platform: 'YouTube Music', timestamp: new Date(Date.now() - 18000000).toISOString() },
          ];
          setRecentActivity(mockActivity);
          setLoadingRecentActivity(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setRecentActivity([]);
        setLoadingRecentActivity(false);
      }
    };

    fetchRecentActivity();
  }, [currentUserId]);

  // Buscar top links
  useEffect(() => {
    const fetchTopPerformingLinks = async () => {
      if (!currentUserId) {
        setLoadingTopLinks(false);
        setTopPerformingLinks([]);
        return;
      }
      setLoadingTopLinks(true);
      try {
        // Simulando dados de top links
        setTimeout(() => {
          const mockTopLinks = [
            { id: 'sl-123', title: 'Novo Single - Verão', clicks: 1245, views: 2500 },
            { id: 'sl-456', title: 'EP Completo', clicks: 987, views: 1800 },
            { id: 'sl-789', title: 'Colaboração Especial', clicks: 756, views: 1200 },
          ];
          setTopPerformingLinks(mockTopLinks);
          setLoadingTopLinks(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching top performing links:', error);
        setTopPerformingLinks([]);
        setLoadingTopLinks(false);
      }
    };

    fetchTopPerformingLinks();
  }, [currentUserId]);

  // Buscar Top Artists do Spotify
  useEffect(() => {
    const fetchTopArtists = async () => {
      if (!currentUserId) {
        setLoadingTopArtists(false);
        setTopArtists([]);
        return;
      }
      setLoadingTopArtists(true);
      try {
        const response = await spotifyTokenService.makeSpotifyRequest(currentUserId, '/me/top/artists?limit=5&time_range=medium_term');
        if (response.ok) {
          const data = await response.json();
          setTopArtists(data.items);
        } else {
          console.error('Erro ao buscar Top Artists do Spotify:', response.status, await response.text());
          setTopArtists([]);
        }
      } catch (error) {
        console.error('Erro ao buscar Top Artists do Spotify:', error);
        setTopArtists([]);
      } finally {
        setLoadingTopArtists(false);
      }
    };
    fetchTopArtists();
  }, [currentUserId]);

  // Buscar Top Tracks do Spotify
  useEffect(() => {
    const fetchTopTracks = async () => {
      if (!currentUserId) {
        setLoadingTopTracks(false);
        setTopTracks([]);
        return;
      }
      setLoadingTopTracks(true);
      try {
        const response = await spotifyTokenService.makeSpotifyRequest(currentUserId, '/me/top/tracks?limit=5&time_range=medium_term');
        if (response.ok) {
          const data = await response.json();
          setTopTracks(data.items);
        } else {
          console.error('Erro ao buscar Top Tracks do Spotify:', response.status, await response.text());
          setTopTracks([]);
        }
      } catch (error) {
        console.error('Erro ao buscar Top Tracks do Spotify:', error);
        setTopTracks([]);
      } finally {
        setLoadingTopTracks(false);
      }
    };
    fetchTopTracks();
  }, [currentUserId]);

  // Filtrar smart links com base no termo de pesquisa e filtros
  useEffect(() => {
    if (allSmartLinks.length === 0) {
      setFilteredSmartLinks([]);
      return;
    }

    let filtered = [...allSmartLinks];

    // Aplicar filtro de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(link => 
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de status (ativo/inativo)
    if (filterActive !== null) {
      filtered = filtered.filter(link => link.is_public === filterActive);
    }

    setFilteredSmartLinks(filtered);
  }, [allSmartLinks, searchTerm, filterActive]);

  const handleDeleteLink = async (linkId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este Smart Link?')) {
      const success = await deleteSmartLink(linkId);
      if (success) {
        // Atualizar a lista de links após exclusão
        setAllSmartLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
        
        // Se o link excluído for o link principal, limpar o estado
        if (smartLink && smartLink.id === linkId) {
          clearUserSmartLinkState();
        }
        
        // Atualizar contagem
        setSmartLinksCount(prev => Math.max(0, (prev || 0) - 1));
      } else {
        alert("Falha ao excluir o link.");
      }
    }
  };
  const handleViewMetrics = (linkId: string) => {
    navigate(`/dashboard/metrics/${linkId}`);
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // Inverter direção se o mesmo campo for clicado novamente
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, definir como padrão desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (isActive: boolean | null) => {
    setFilterActive(isActive);
  };

  const handleExportData = () => {
    alert('Funcionalidade de exportação de dados será implementada em breve!');
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Usando formatação nativa em vez de date-fns
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const publicLinkUrl = userProfileForContent?.username && smartLink?.slug 
    ? `${window.location.origin}/${smartLink.slug}` 
    : null;

  if (loadingProfileForContent || loadingLink || loadingPresavesCount || loadingSmartLinksCount || loadingTotalClicks) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-lg text-gray-700">Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-[#1c1c1c] mb-8">Seu Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card de Seguidores do Spotify */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <FaSpotify className="text-green-500 text-4xl" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Seguidores do Spotify</h2>
            <p className="text-gray-600">{/* Aqui você colocaria o contador de seguidores */}</p>
          </div>
        </div>

        {/* Card de Top Artistas do Spotify */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
            <FaUserAlt className="text-blue-500 text-2xl mr-2" /> Seus Top Artistas
          </h2>
          {loadingTopArtists ? (
            <p className="text-gray-500">Carregando artistas...</p>
          ) : topArtists.length > 0 ? (
            <ul className="space-y-2">
              {topArtists.map((artist: any) => (
                <li key={artist.id} className="flex items-center">
                  {artist.images && artist.images.length > 0 && (
                    <img src={artist.images[0].url} alt={artist.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                  )}
                  <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 font-medium">
                    {artist.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum artista encontrado. Conecte seu Spotify e ouça mais músicas!</p>
          )}
        </div>

        {/* Card de Top Músicas do Spotify */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
            <FaMusic className="text-purple-500 text-2xl mr-2" /> Suas Top Músicas
          </h2>
          {loadingTopTracks ? (
            <p className="text-gray-500">Carregando músicas...</p>
          ) : topTracks.length > 0 ? (
            <ul className="space-y-2">
              {topTracks.map((track: any) => (
                <li key={track.id} className="flex items-center">
                  {track.album.images && track.album.images.length > 0 && (
                    <img src={track.album.images[0].url} alt={track.name} className="w-8 h-8 rounded-md mr-3 object-cover" />
                  )}
                  <div>
                    <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-600 font-medium block">
                      {track.name}
                    </a>
                    <span className="text-sm text-gray-500">{track.artists.map((artist: any) => artist.name).join(', ')}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhuma música encontrada. Conecte seu Spotify e ouça mais músicas!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserDashboard;
