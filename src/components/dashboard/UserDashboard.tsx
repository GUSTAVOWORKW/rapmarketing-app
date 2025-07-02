// src/components/dashboard/UserDashboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useUserSmartLink } from '../../hooks/useUserSmartLinks'; 
import { useSmartLink } from '../../hooks/useSmartLink';
import { UserProfile, PlatformLink } from '../../types';
import { FaTrash, FaLink, FaMusic, FaThList, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Importar o novo useAuth

const UserDashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth(); // Obter user, profile e loading do contexto

  const [activePresavesCount, setActivePresavesCount] = useState<number | null>(null);
  const [loadingPresavesCount, setLoadingPresavesCount] = useState(true);
  // Estado para contagem de Smart Links (simplificado por enquanto)
  const [smartLinksCount, setSmartLinksCount] = useState<number>(0);
  // Estado para contagem de Smart Bios (placeholder)
  const [smartBiosCount, setSmartBiosCount] = useState<number>(0);
  const [loadingSmartLinksCount, setLoadingSmartLinksCount] = useState(true); // Novo estado de loading

  const { 
    smartLink, 
    loading: loadingLink, 
    error: linkError, 
    clearUserSmartLinkState
  } = useUserSmartLink(); 
  
  const { deleteSmartLink } = useSmartLink(null); 

  

  // Novo useEffect para buscar contagem de pré-saves ativos
  useEffect(() => {
    const fetchActivePresaves = async () => {
      if (!user?.id) {
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
          .eq('user_id', user.id) 
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
  }, [user]);

  // useEffect para buscar contagem de todos os smart links do usuário
  useEffect(() => {
    const fetchSmartLinksCount = async () => {
      if (!user?.id) {
        setLoadingSmartLinksCount(false);
        setSmartLinksCount(0);
        return;
      }
      setLoadingSmartLinksCount(true);
      try {
        const { count, error } = await supabase
          .from('smart_links')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

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
    // Para Smart Bios, manteremos 0 por enquanto e seu loading como false
    setSmartBiosCount(0); 
  }, [user]);


  const handleDeleteLink = async () => {
    if (smartLink && smartLink.id && window.confirm('Tem certeza que deseja excluir seu Smart Link?')) {
      const success = await deleteSmartLink(smartLink.id);
      if (success) {
        clearUserSmartLinkState(); // Update UI by clearing the link
        // Optionally, show a success notification
      } else {
        alert("Falha ao excluir o link.");
      }
    }
  };

  const publicLinkUrl = profile?.username && smartLink?.slug 
    ? `${window.location.origin}/${smartLink.slug}` 
    : null;

  if (authLoading || loadingLink || loadingPresavesCount || loadingSmartLinksCount) { // Adicionado loadingSmartLinksCount
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
