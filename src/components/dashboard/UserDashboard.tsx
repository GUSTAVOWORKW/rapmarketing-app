// src/components/dashboard/UserDashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { useUserSmartLink } from '../../hooks/useUserSmartLinks'; 
import { useSmartLink } from '../../hooks/useSmartLink';
import { UserProfile, PlatformLink } from '../../types';
import { FaTrash, FaLink, FaMusic, FaThList, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const { user, profile, initializing } = useAuth();

  // Estados com cache de sessionStorage para evitar re-fetch ao trocar abas
  const [activePresavesCount, setActivePresavesCount] = useState<number | null>(() => {
    try {
      const cached = sessionStorage.getItem(`dashboard_presaves_${user?.id}`);
      return cached !== null ? parseInt(cached, 10) : null;
    } catch {
      return null;
    }
  });
  const [smartLinksCount, setSmartLinksCount] = useState<number>(() => {
    try {
      const cached = sessionStorage.getItem(`dashboard_smartlinks_${user?.id}`);
      return cached !== null ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [smartBiosCount] = useState<number>(0);
  
  // Loading inicial baseado no cache
  const [loadingData, setLoadingData] = useState<boolean>(() => {
    const cached = sessionStorage.getItem(`dashboard_loaded_${user?.id}`);
    return !cached;
  });

  const { 
    smartLink, 
    loading: loadingLink, 
    error: linkError, 
    clearUserSmartLinkState
  } = useUserSmartLink(); 
  
  const { deleteSmartLink } = useSmartLink(null); 

  // Effect único para carregar dados do dashboard com cache
  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      const userId = user?.id;
      if (!userId) {
        setLoadingData(false);
        return;
      }

      const cacheKey = `dashboard_loaded_${userId}`;
      
      // Se já carregamos, não recarrega
      if (sessionStorage.getItem(cacheKey)) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);

      try {
        // Buscar presaves ativos
        const currentDate = new Date().toISOString();
        const { count: presavesCount } = await supabase
          .from('presaves')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gt('release_date', currentDate);

        // Buscar smart links count
        const { count: linksCount } = await supabase
          .from('smart_links')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (!cancelled) {
          const presaves = presavesCount ?? 0;
          const links = linksCount ?? 0;
          
          setActivePresavesCount(presaves);
          setSmartLinksCount(links);
          
          // Salvar no cache
          sessionStorage.setItem(`dashboard_presaves_${userId}`, String(presaves));
          sessionStorage.setItem(`dashboard_smartlinks_${userId}`, String(links));
          sessionStorage.setItem(cacheKey, 'true');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (!cancelled) {
          setActivePresavesCount(0);
          setSmartLinksCount(0);
        }
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
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, initializing]);


  const handleDeleteLink = async () => {
    if (smartLink && smartLink.id && window.confirm('Tem certeza que deseja excluir seu Smart Link?')) {
      const success = await deleteSmartLink(smartLink.id);
      if (success) {
        clearUserSmartLinkState();
      } else {
        alert("Falha ao excluir o link.");
      }
    }
  };

  const publicLinkUrl = profile?.username && smartLink?.slug 
    ? `${window.location.origin}/${smartLink.slug}` 
    : null;

  // Mostrar loading apenas se ainda estamos inicializando ou carregando dados
  if (initializing || loadingData) {
    return <div className="flex justify-center items-center h-screen"><p>Carregando dados do dashboard...</p></div>;
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

export default UserDashboard;
