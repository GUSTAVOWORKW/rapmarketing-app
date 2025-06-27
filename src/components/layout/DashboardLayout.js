// src/components/layout/DashboardLayout.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../../services/supabase';
import SpotifyFollowersCounter from '../dashboard/SpotifyFollowersCounter';
import { useAuth } from '../../hooks/useAuth';
import HeaderBar from '../Common/HeaderBar'; // Importar HeaderBar

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Para destacar o link ativo
    const [userProfile, setUserProfile] = useState(null);
    const [activeSmartLink, setActiveSmartLink] = useState(null);
    const [loadingSidebarData, setLoadingSidebarData] = useState(true);
    const [showOnboardingCards, setShowOnboardingCards] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    // const [sidebarData, setSidebarData] = useState({ smartLinks: [], presaves: [] });
    // const [isLoading, setIsLoading] = useState(true);
    const { user, profile } = useAuth(); // Obter profile do useAuth
    const currentUserId = user?.id; // Definir currentUserId a partir do user

    const onSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            navigate('/login'); // Redireciona para a página de login após o logout
        }
    };

    /*
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    */

    const fetchSidebarData = useCallback(async () => {
        if (!user) {
            setLoadingSidebarData(false);
            return;
        }
        setLoadingSidebarData(true);
        try {
            // Buscar perfil do usuário (avatar, username)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, avatar_url') // 'id' aqui é o profile_id
                .eq('user_id', user.id) // user_id é o auth.uid
                .single();

            if (profileError) {
                console.error('[DashboardLayout] Profile fetch error:', profileError);
                throw profileError;
            }
            
            setUserProfile(profileData);

            // Mesmo que profileData seja necessário para o avatar/username,
            // buscamos o smartlink usando user.id (auth.uid) diretamente,
            // para alinhar com a forma como useUserSmartLink funciona.
            if (user.id) { 
                const { data: smartLinkData, error: smartLinkError } = await supabase
                    .from('smart_links')
                    .select('id, title') // Apenas campos necessários
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }) // Pega o mais recente
                    .limit(1) // Garante que teremos apenas um ou nenhum
                    .maybeSingle(); // .maybeSingle() é seguro com .limit(1)

                if (smartLinkError) {
                    // O erro PGRST116 não deve mais acontecer, mas mantemos o log para outros erros.
                    console.error("[DashboardLayout] Error fetching smart link for sidebar:", smartLinkError);
                    setActiveSmartLink(null);
                } else {
                    setActiveSmartLink(smartLinkData);
                }
            } else {
                 setActiveSmartLink(null);
            }
        } catch (error) {
            console.error('[DashboardLayout] Error fetching data for sidebar:', error);
            setUserProfile(null);
            setActiveSmartLink(null);
        } finally {
            setLoadingSidebarData(false);
        }    }, [user]);

    // Chama fetchSidebarData quando user mudar
    useEffect(() => {
        fetchSidebarData();
    }, [user, fetchSidebarData]); // Dependência direta em vez de fetchSidebarData

    useEffect(() => {
        if (window && window.localStorage) {
            const alreadyOnboarded = localStorage.getItem('dashboardOnboardedV2');
            if (!alreadyOnboarded) {
                setShowOnboardingCards(true);
            }
        }
    }, []);

    const handleCloseOnboarding = () => {
        setShowOnboardingCards(false);
        if (window && window.localStorage) {
            localStorage.setItem('dashboardOnboardedV2', 'true');
        }
    };    const handleNavigateToMetrics = () => {
        console.log('Navegando para /dashboard/metrics'); // Debug
        navigate('/dashboard/metrics');
    };
    
    // Função para navegação rápida ao dashboard principal
    const handleNavigateToDashboardHome = () => {
        navigate('/dashboard');
    };
    
    if (loadingSidebarData && !userProfile) { // Mostrar carregando apenas se não houver dados antigos
        return (
            <div className="flex justify-center items-center h-screen bg-[#e9e6ff]">
                <div className="text-2xl font-semibold text-[#3100ff]">Carregando Painel...</div>
            </div>
        );
    }    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] flex flex-col font-sans relative overflow-x-hidden h-screen">
        <HeaderBar user={user} avatar={userProfile?.avatar_url} onLogout={onSignOut} />
        {/* Onboarding Visual com Cards Animados */}
        {showOnboardingCards && location.pathname === '/dashboard' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full relative animate-fade-in pointer-events-auto">{/* Adicionar pointer-events-auto para o modal */}
              <button onClick={handleCloseOnboarding} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8 text-[#3100ff]">Bem-vindo ao seu Dashboard!</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="group relative bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:z-10 border border-[#e9e6ff] animate-card-pop">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#3100ff]/10 mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 3v18m9-9H3" stroke="#3100ff" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#3100ff]">Crie seu Smart Link</h3>
                  <p className="text-gray-600 text-center">Centralize todos os seus lançamentos e redes em um único link personalizado. Clique em "Criar Smart Link" na barra lateral!</p>
                </div>
                {/* Card 2 */}
                <div className="group relative bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:z-10 border border-[#e9e6ff] animate-card-pop delay-100">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#a259ff]/10 mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 00-10 0v2M5 9h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" stroke="#a259ff" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#a259ff]">Ative o Pré-save</h3>
                  <p className="text-gray-600 text-center">Engaje sua audiência antes do lançamento. Use o Pré-save para garantir mais ouvintes no dia do drop!</p>
                </div>
                {/* Card 3 */}
                <div className="group relative bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:z-10 border border-[#e9e6ff] animate-card-pop delay-200">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#ffb300]/10 mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M3 12h18M12 3v18" stroke="#ffb300" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#ffb300]">Acompanhe Resultados</h3>
                  <p className="text-gray-600 text-center">Veja métricas em tempo real, descubra onde sua música está bombando e otimize sua estratégia!</p>
                </div>
                {/* Card 4: Conecte o Spotify */}
                <div className="group relative bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:z-10 border border-[#e9e6ff] animate-card-pop delay-300">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#1db954]/10 mb-4">
                    <svg width="32" height="32" viewBox="0 0 496 512" fill="#1db954" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="248" cy="256" r="160" fill="#1db954" opacity="0.15"/>
                      <path d="M248 8C111 8 0 119 0 256c0 137 111 248 248 248s248-111 248-248C496 119 385 8 248 8zm121.7 365.6c-4.1 0-6.6-1.3-10.4-3.8-62.7-37.3-168.8-45.7-229.8-26.1-4.8 1.5-11.2 3.1-14.7 3.1-8.2 0-14.1-6.4-14.1-15.2 0-9.2 5.2-14.7 16.2-18.1 66.2-20.2 180.1-13.5 249.2 29.5 7.7 4.7 10.1 9.7 10.1 15.3 0 8.7-6.9 15.3-16.5 15.3zm31.5-61.6c-5.2 0-8.5-2-13.1-4.5-71.7-42.5-181.1-54.7-265.1-31.2-5.9 1.6-9.4 3.2-13.9 3.2-10.2 0-17.1-8-17.1-17.1 0-10.2 5.7-16.2 16.5-19.5 30.2-9.2 63.2-15.2 100.8-15.2 82.2 0 163.2 20.7 221.2 59.1 6.2 4.1 9.2 8.7 9.2 15.1 0 9.2-7.5 16.1-18.5 16.1zm34.3-65.8c-4.7 0-7.7-1.3-12.1-3.8-79.5-47.2-211.5-51.7-288.2-29.5-4.6 1.3-7.2 2.6-11.7 2.6-12.1 0-20.2-9.4-20.2-20.2 0-11.2 6.2-18.1 18.5-21.5 35.2-10.1 74.2-15.6 118.2-15.6 89.7 0 176.7 19.1 242.7 55.2 8.1 4.5 12.1 10.1 12.1 18.1 0 11.1-8.9 19.6-19.2 19.6z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#1db954]">Conecte sua conta Spotify</h3>
                  <p className="text-gray-600 text-center">Conecte sua conta do Spotify para liberar o painel de métricas reais de seguidores e engajamento. Assim você acompanha seu crescimento de verdade!</p>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button onClick={handleCloseOnboarding} className="bg-[#3100ff] hover:bg-[#1c1c1c] text-white font-bold py-3 px-8 rounded-lg shadow transition-colors text-lg">Começar</button>
              </div>
            </div>
          </div>
        )}
        {/* Layout principal: sidebar à esquerda, conteúdo à direita */}
        <div className="flex flex-row flex-1 min-h-0 w-full h-0">
          {/* Sidebar */}
          <aside className="w-60 min-w-[180px] max-w-[240px] bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] border-r-2 border-[#e9e6ff] text-[#1c1c1c] p-4 space-y-4 shadow-2xl flex flex-col relative z-30 transition-all duration-300 h-full overflow-y-auto">
            <div className="flex flex-col items-center mb-4 group">
              <div className="relative mb-1">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#3100ff] shadow-xl neon-avatar" />
                ) : (
                  <FaUserCircle className="w-16 h-16 rounded-full text-gray-300 border-2 border-[#3100ff] shadow-xl neon-avatar" />
                )}
                <span className="absolute inset-0 rounded-full border-2 border-[#a259ff] animate-pulse pointer-events-none" style={{boxShadow:'0 0 12px 2px #a259ff55'}}></span>
              </div>
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] bg-clip-text text-transparent animate-gradient-x tracking-tight mt-1 mb-0 transition-colors" title={userProfile?.username || 'Usuário'}>
                {userProfile?.username || 'Usuário'}
              </h2>
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white shadow-md mt-1 animate-bounce">Artista PRO</span>
            </div>
            <div className="bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-xl shadow-lg p-3 flex flex-col items-center mb-3 animate-fade-in-up border border-[#e9e6ff]">
              <span className="text-base font-bold text-[#3100ff] mb-1">Bem-vindo(a)!</span>
              <span className="text-xs text-[#1c1c1c]/70 mb-1 text-center">Pronto para impulsionar sua carreira?</span>
              <button onClick={() => navigate('/criar-smart-link')} className="mt-1 px-3 py-1 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white font-bold rounded-lg shadow hover:scale-105 transition-all text-sm">+ Novo Smart Link</button>
            </div>
            <nav className="space-y-2 flex-grow">
              <button
                type="button"
                onClick={() => navigate('/criar-smart-link')}
                className={`w-full flex items-center py-2 px-3 rounded-lg text-left font-bold text-base transition-all focus:outline-none focus:ring-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-[#1c1c1c] border border-[#e9e6ff] hover:bg-[#f8f6f2] hover:shadow-xl focus:ring-[#3100ff] cursor-pointer relative z-50 ${location.pathname === '/criar-smart-link' ? 'ring-2 ring-[#3100ff] scale-105' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <FaUserCircle className="mr-2 text-lg" /> Criar Smart Link
              </button>
              <button
                type="button"
                onClick={() => navigate('/criar-presave')}
                className={`w-full flex items-center py-2 px-3 rounded-lg text-left font-bold text-base transition-all focus:outline-none focus:ring-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-[#1c1c1c] border border-[#e9e6ff] hover:bg-[#f8f6f2] hover:shadow-xl focus:ring-[#3100ff] cursor-pointer relative z-50 ${location.pathname === '/criar-presave' ? 'ring-2 ring-[#3100ff] scale-105' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <FaCalendarAlt className="mr-2 text-lg" /> Criar Pré-save
              </button>
              <button
                type="button"
                onClick={handleNavigateToMetrics}
                className={`w-full flex items-center py-2 px-3 rounded-lg text-left font-bold text-base transition-all focus:outline-none focus:ring-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-[#1c1c1c] border border-[#e9e6ff] hover:bg-[#f8f6f2] hover:shadow-xl focus:ring-[#3100ff] cursor-pointer ${location.pathname.includes('/dashboard/metrics') ? 'ring-2 ring-[#3100ff] scale-105' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <FaChartBar className="mr-2 text-lg" /> Métricas
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className={`w-full flex items-center py-2 px-3 rounded-lg text-left font-bold text-base transition-all focus:outline-none focus:ring-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-[#1c1c1c] border border-[#e9e6ff] hover:bg-[#f8f6f2] hover:shadow-xl focus:ring-[#3100ff] cursor-pointer ${location.pathname === '/settings' ? 'ring-2 ring-[#3100ff] scale-105' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <FaCog className="mr-2 text-lg" /> Configurações
              </button>
              <button
                type="button"
                onClick={handleNavigateToDashboardHome}
                className={`w-full flex items-center py-2 px-3 rounded-lg text-left font-bold text-base transition-all focus:outline-none focus:ring-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-[#1c1c1c] border border-[#e9e6ff] hover:bg-[#f8f6f2] hover:shadow-xl focus:ring-[#3100ff] cursor-pointer ${location.pathname === '/dashboard' ? 'ring-2 ring-[#3100ff] scale-105' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <FaChartBar className="mr-2 text-lg" /> Dashboard
              </button>
            </nav>
            <div className="mt-auto">
              <button
                type="button"
                onClick={onSignOut}
                className="w-full flex items-center py-2 px-3 rounded-lg text-left bg-gradient-to-r from-[#e9e6ff] to-[#f8f6f2] text-[#1c1c1c] hover:bg-[#e9e6ff] hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#3100ff] cursor-pointer font-bold text-base"
                style={{ pointerEvents: 'auto' }}
              >
                <FaSignOutAlt className="mr-2 text-lg" /> Sair
              </button>
            </div>
          </aside>
          {/* Main Content Area */}
          <main className="flex-1 p-10 md:p-16 bg-transparent overflow-y-auto relative dashboard-main h-full min-h-0">
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Efeito visual de círculos animados no fundo */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#a259ff]/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3100ff]/20 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
            <div className="relative z-20 pointer-events-auto">{/* Aumentar z-index para garantir que esteja acima de outros elementos */}
              {/* Painel de impacto visual: estatísticas, conquistas, gráfico */}
              {location.pathname === '/dashboard' && (
                <section className="mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Estatística 1: Streams totais */}
                    <div className="bg-gradient-to-br from-[#3100ff]/90 to-[#a259ff]/80 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-[#e9e6ff]">
                      <span className="text-white/80 text-lg font-semibold mb-2">Streams Totais</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-white animate-count-up">{(Math.random()*100000+50000).toLocaleString('pt-BR')}</span>
                      <span className="text-[#ffb300] font-bold mt-2 text-sm">+{(Math.random()*1000+100).toFixed(0)} hoje</span>
                    </div>
                    {/* Estatística 2: Novos seguidores */}
                    <div className="bg-gradient-to-br from-[#a259ff]/90 to-[#3100ff]/80 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-[#e9e6ff] delay-100">
                      <span className="text-white/80 text-lg font-semibold mb-2 flex items-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1db954] mr-2">
                          <svg width="18" height="18" viewBox="0 0 496 512" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M248 8C111 8 0 119 0 256c0 137 111 248 248 248s248-111 248-248C496 119 385 8 248 8zm121.7 365.6c-4.1 0-6.6-1.3-10.4-3.8-62.7-37.3-168.8-45.7-229.8-26.1-4.8 1.5-11.2 3.1-14.7 3.1-8.2 0-14.1-6.4-14.1-15.2 0-9.2 5.2-14.7 16.2-18.1 66.2-20.2 180.1-13.5 249.2 29.5 7.7 4.7 10.1 9.7 10.1 15.3 0 8.7-6.9 15.3-16.5 15.3zm31.5-61.6c-5.2 0-8.5-2-13.1-4.5-71.7-42.5-181.1-54.7-265.1-31.2-5.9 1.6-9.4 3.2-13.9 3.2-10.2 0-17.1-8-17.1-17.1 0-10.2 5.7-16.2 16.5-19.5 30.2-9.2 63.2-15.2 100.8-15.2 82.2 0 163.2 20.7 221.2 59.1 6.2 4.1 9.2 8.7 9.2 15.1 0 9.2-7.5 16.1-18.5 16.1zm34.3-65.8c-4.7 0-7.7-1.3-12.1-3.8-79.5-47.2-211.5-51.7-288.2-29.5-4.6 1.3-7.2 2.6-11.7 2.6-12.1 0-20.2-9.4-20.2-20.2 0-11.2 6.2-18.1 18.5-21.5 35.2-10.1 74.2-15.6 118.2-15.6 89.7 0 176.7 19.1 242.7 55.2 8.1 4.5 12.1 10.1 12.1 18.1 0 11.1-8.9 19.6-19.2 19.6z"/>
                          </svg>
                        </span>
                        Novos Seguidores
                      </span>
                      {/* Spotify Followers */}
                      <SpotifyFollowersCounter currentUserId={currentUserId} />
                    </div>
                    {/* Estatística 3: Engajamento nas redes */}
                    <div className="bg-gradient-to-br from-[#ffb300]/90 to-[#a259ff]/80 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-[#e9e6ff] delay-200">
                      <span className="text-white/80 text-lg font-semibold mb-2">Engajamento nas Redes</span>
                      <span className="text-4xl md:text-5xl font-extrabold text-white animate-count-up">{(Math.random()*20000+3000).toLocaleString('pt-BR')}</span>
                      <span className="text-[#3100ff] font-bold mt-2 text-sm">+{(Math.random()*300+30).toFixed(0)} hoje</span>
                    </div>
                  </div>
                  {/* Conquistas e gráfico de performance */}
                  <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    {/* Conquistas */}
                    <div className="flex-1 bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#e9e6ff] animate-fade-in-up">
                      <span className="text-xl font-bold text-[#3100ff] mb-3">Conquistas Recentes</span>
                      <ul className="space-y-3 w-full">
                        <li className="flex items-center gap-3 text-[#1c1c1c] font-medium"><span className="inline-block w-8 h-8 bg-gradient-to-br from-[#3100ff] to-[#a259ff] rounded-full flex items-center justify-center text-white text-lg shadow">🏆</span> 10.000+ streams em um único lançamento</li>
                        <li className="flex items-center gap-3 text-[#1c1c1c] font-medium"><span className="inline-block w-8 h-8 bg-gradient-to-br from-[#ffb300] to-[#a259ff] rounded-full flex items-center justify-center text-white text-lg shadow">🔥</span> Top 50 Viral Brasil no Spotify</li>
                        <li className="flex items-center gap-3 text-[#1c1c1c] font-medium"><span className="inline-block w-8 h-8 bg-gradient-to-br from-[#a259ff] to-[#3100ff] rounded-full flex items-center justify-center text-white text-lg shadow">🚀</span> Crescimento de 200% em seguidores no mês</li>
                      </ul>
                    </div>
                    {/* Gráfico de performance musical fake (placeholder visual) */}
                    <div className="flex-1 bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#e9e6ff] animate-fade-in-up">
                      <span className="text-xl font-bold text-[#3100ff] mb-3">Performance Musical</span>
                      <div className="w-full h-48 flex items-end gap-2">
                        {/* Barras animadas fake para simular gráfico */}
                        {[...Array(12)].map((_,i)=>(
                          <div key={i} className="flex-1 flex flex-col justify-end">
                            <div className={`rounded-t-lg bg-gradient-to-t from-[#3100ff] via-[#a259ff] to-[#ffb300] transition-all duration-700`} style={{height:`${Math.random()*80+40}%`, minHeight:'24px'}}></div>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-[#1c1c1c]/60 mt-4">* Dados ilustrativos para inspiração</span>
                    </div>
                  </div>
                </section>
              )}
              {/* Conteúdo original do dashboard (children) */}
              {children}
            </div>
          </main>
        </div>
      </div>
    );
};

export default DashboardLayout;
