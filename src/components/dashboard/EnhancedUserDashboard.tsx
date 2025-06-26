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
  FaExclamationTriangle
} from 'react-icons/fa'; 
import { PLATFORMS as platforms } from '../../data/platforms';

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <h1 className="text-3xl font-bold text-[#3100ff] mb-4">Bem-vindo ao seu novo Dashboard!</h1>
      <p className="text-lg text-gray-700 text-center max-w-xl">
        Aqui você encontra o novo painel de impacto visual, conquistas e estatísticas animadas. Use a barra lateral para navegar pelas funções principais.
      </p>
    </div>
  );
};

export default EnhancedUserDashboard;
