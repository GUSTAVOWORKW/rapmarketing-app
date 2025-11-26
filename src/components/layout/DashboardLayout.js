// src/components/layout/DashboardLayout.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaSpotify, FaUserAlt, FaMusic } from 'react-icons/fa';
import { supabase } from '../../services/supabase';
import SpotifyFollowersCounter from '../dashboard/SpotifyFollowersCounter';
import { useAuth } from '../../context/AuthContext'; // Importar o NOVO hook de contexto
import HeaderBar from '../Common/HeaderBar';
import { spotifyTokenService } from '../../services/spotifyTokenService';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSmartLink, setActiveSmartLink] = useState(null);
    const [showOnboardingCards, setShowOnboardingCards] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading: authLoading, initializing, signOut } = useAuth(); // Obter user, profile, estados de loading e signOut do useAuth

    const [topArtists, setTopArtists] = useState([]);
    const [loadingTopArtists, setLoadingTopArtists] = useState(true);
    const [topTracks, setTopTracks] = useState([]);
    const [loadingTopTracks, setLoadingTopTracks] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // A lógica de fetchSidebarData foi simplificada, pois o profile já vem do contexto
    const fetchSmartLinkData = useCallback(async () => {
        if (!user?.id) {
            setActiveSmartLink(null);
            return;
        }
        try {
            const { data: smartLinkData, error: smartLinkError } = await supabase
                .from('smart_links')
                .select('id, title')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (smartLinkError) {
                console.error("[DashboardLayout] Error fetching smart link for sidebar:", smartLinkError);
                setActiveSmartLink(null);
            } else {
                setActiveSmartLink(smartLinkData);
            }
        } catch (error) {
            console.error('[DashboardLayout] Error fetching smart link data:', error);
            setActiveSmartLink(null);
        }
    }, [user]);

    useEffect(() => {
        fetchSmartLinkData();
    }, [fetchSmartLinkData]);

    useEffect(() => {
      const fetchTopArtists = async () => {
        if (!user?.id) {
          console.log('[DEBUG Dashboard] user.id não disponível para Top Artists.');
          setLoadingTopArtists(false);
          setTopArtists([]);
          return;
        }
        setLoadingTopArtists(true);
        console.log('[DEBUG Dashboard] Buscando Top Artists para userId:', user.id);
        try {
          const response = await spotifyTokenService.makeSpotifyRequest(user.id, '/me/top/artists?limit=5&time_range=long_term');
          if (response.ok) {
            const data = await response.json();
            console.log('[DEBUG Dashboard] Top Artists recebidos:', data.items);
            setTopArtists(data.items);
          } else {
            console.error('[DEBUG Dashboard] Erro ao buscar Top Artists do Spotify:', response.status, await response.text());
            setTopArtists([]);
          }
        } catch (error) {
          // Erros de token ausente/406 são esperados para usuários sem Spotify conectado.
          // Apenas logamos de forma enxuta e seguimos com lista vazia, sem impactar outras métricas.
          console.warn('[DEBUG Dashboard] Falha ao carregar Top Artists (provavelmente sem Spotify conectado):', error?.message || error);
          setTopArtists([]);
        } finally {
          setLoadingTopArtists(false);
        }
      };
      fetchTopArtists();
    }, [user]);

    useEffect(() => {
      const fetchTopTracks = async () => {
        if (!user?.id) {
          console.log('[DEBUG Dashboard] user.id não disponível para Top Tracks.');
          setLoadingTopTracks(false);
          setTopTracks([]);
          return;
        }
        setLoadingTopTracks(true);
        console.log('[DEBUG Dashboard] Buscando Top Tracks para userId:', user.id);
        try {
          const response = await spotifyTokenService.makeSpotifyRequest(user.id, '/me/top/tracks?limit=5&time_range=long_term');
          if (response.ok) {
            const data = await response.json();
            console.log('[DEBUG Dashboard] Top Tracks recebidos:', data.items);
            setTopTracks(data.items);
          } else {
            console.error('[DEBUG Dashboard] Erro ao buscar Top Tracks do Spotify:', response.status, await response.text());
            setTopTracks([]);
          }
        } catch (error) {
          // Mesmo comportamento dos artistas: tratar ausência de token como cenário normal.
          console.warn('[DEBUG Dashboard] Falha ao carregar Top Tracks (provavelmente sem Spotify conectado):', error?.message || error);
          setTopTracks([]);
        } finally {
          setLoadingTopTracks(false);
        }
      };
      fetchTopTracks();
    }, [user]);

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
    };
    const handleNavigateToMetrics = () => {
        console.log('Navegando para /dashboard/metrics');
        navigate('/dashboard/metrics');
    };
    
  const handleNavigateToDashboardHome = () => {
    navigate('/dashboard');
  };

  // Enquanto o contexto de autenticação ainda está inicializando, mostrar apenas uma vez a tela de carregamento global.
  // Depois que `initializing` virar false, o painel não deve mais travar em estado de loading ao trocar de aba.
  if (initializing) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#e9e6ff]">
        <div className="text-2xl font-semibold text-[#3100ff]">Carregando Painel...</div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] flex flex-col font-sans relative overflow-x-hidden h-screen">
        <HeaderBar user={user} avatar={profile?.avatar_url} onLogout={handleSignOut} onToggleSidebar={toggleSidebar} />
        
        {/* Overlay para mobile */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/30 z-30 md:hidden"
                onClick={toggleSidebar}
            ></div>
        )}

        <div className="flex flex-row flex-1 min-h-0 w-full h-0">
          {/* Sidebar */}
          <aside className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] border-r-2 border-[#e9e6ff] text-[#1c1c1c] p-4 space-y-4 shadow-2xl flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col items-center mb-4 group">
              <div className="relative mb-1">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#3100ff] shadow-xl neon-avatar" />
                ) : (
                  <FaUserCircle className="w-16 h-16 rounded-full text-gray-300 border-2 border-[#3100ff] shadow-xl neon-avatar" />
                )}
                <span className="absolute inset-0 rounded-full border-2 border-[#a259ff] animate-pulse pointer-events-none" style={{boxShadow:'0 0 12px 2px #a259ff55'}}></span>
              </div>
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] bg-clip-text text-transparent animate-gradient-x tracking-tight mt-1 mb-0 transition-colors" title={profile?.username || 'Usuário'}>
                {profile?.username || 'Usuário'}
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
                onClick={handleSignOut}
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
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Estatística 2: Novos seguidores (existente) */}
                    <div className="bg-gradient-to-br from-[#a259ff]/90 to-[#3100ff]/80 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-[#e9e6ff] delay-100 h-full flex-grow">
                      <span className="text-white/80 text-lg font-semibold mb-2 flex items-center justify-center w-full text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1db954] mr-2">
                          <svg width="18" height="18" viewBox="0 0 496 512" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M248 8C111 8 0 119 0 256c0 137 111 248 248 248s248-111 248-248C496 119 385 8 248 8zm121.7 365.6c-4.1 0-6.6-1.3-10.4-3.8-62.7-37.3-168.8-45.7-229.8-26.1-4.8 1.5-11.2 3.1-14.7 3.1-8.2 0-14.1-6.4-14.1-15.2 0-9.2 5.2-14.7 16.2-18.1 66.2-20.2 180.1-13.5 249.2 29.5 7.7 4.7 10.1 9.7 10.1 15.3 0 8.7-6.9 15.3-16.5 15.3zm31.5-61.6c-5.2 0-8.5-2-13.1-4.5-71.7-42.5-181.1-54.7-265.1-31.2-5.9 1.6-9.4 3.2-13.9 3.2-10.2 0-17.1-8-17.1-17.1 0-10.2 5.7-16.2 16.5-19.5 30.2-9.2 63.2-15.2 100.8-15.2 82.2 0 163.2 20.7 221.2 59.1 6.2 4.1 9.2 8.7 9.2 15.1 0 9.2-7.5 16.1-18.5 16.1zm34.3-65.8c-4.7 0-7.7-1.3-12.1-3.8-79.5-47.2-211.5-51.7-288.2-29.5-4.6 1.3-7.2 2.6-11.7 2.6-12.1 0-20.2-9.4-20.2-20.2 0-11.2 6.2-18.1 18.5-21.5 35.2-10.1 74.2-15.6 118.2-15.6 89.7 0 176.7 19.1 242.7 55.2 8.1 4.5 12.1 10.1 12.1 18.1 0 11.1-8.9 19.6-19.2 19.6z"/>
                          </svg>
                        </span>
                        Novos Seguidores
                      </span>
                      {/* Spotify Followers */}
                      <SpotifyFollowersCounter />
                    </div>

                    {/* Card de Top Artistas do Spotify (Novo) */}
                    <div className="bg-gradient-to-br from-[#ffb300]/90 to-[#a259ff]/80 rounded-2xl shadow-xl p-8 flex flex-col animate-fade-in-up border border-[#e9e6ff] delay-200 h-full flex-grow">
                      <span className="text-white/80 text-lg font-semibold mb-2 flex items-center justify-center w-full text-center">
                        <FaUserAlt className="text-white text-2xl mr-2" /> Seus Top Artistas
                      </span>
                      {loadingTopArtists ? (
                        <p className="text-white/70 text-center">Carregando artistas...</p>
                      ) : topArtists.length > 0 ? (
                        <ul className="space-y-2 w-full">
                          {topArtists.map((artist) => (
                            <li key={artist.id} className="flex items-center">
                              {artist.images && artist.images.length > 0 && (
                                <img src={artist.images[0].url} alt={artist.name} className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-white" />
                              )}
                              <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline">
                                {artist.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-white/70 text-center">Nenhum artista encontrado. Conecte seu Spotify e ouça mais músicas!</p>
                      )}
                    </div>

                    {/* Card de Top Músicas do Spotify (Novo) */}
                    <div className="bg-gradient-to-br from-[#3100ff]/90 to-[#a259ff]/80 rounded-2xl shadow-xl p-8 flex flex-col animate-fade-in-up border border-[#e9e6ff] delay-300 h-full flex-grow">
                      <span className="text-white/80 text-lg font-semibold mb-2 flex items-center justify-center w-full text-center">
                        <FaMusic className="text-white text-2xl mr-2" /> Suas Top Músicas
                      </span>
                      {loadingTopTracks ? (
                        <p className="text-white/70 text-center">Carregando músicas...</p>
                      ) : topTracks.length > 0 ? (
                        <ul className="space-y-2 w-full">
                          {topTracks.map((track) => (
                            <li key={track.id} className="flex items-center">
                              {track.album.images && track.album.images.length > 0 && (
                                <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded-md mr-3 object-cover border-2 border-white" />
                              )}
                              <div>
                                <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-white font-medium block hover:underline">
                                  {track.name}
                                </a>
                                <span className="text-sm text-white/70">{track.artists.map((artist) => artist.name).join(', ')}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-white/70 text-center">Nenhuma música encontrada. Conecte seu Spotify e ouça mais músicas!</p>
                      )}
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

