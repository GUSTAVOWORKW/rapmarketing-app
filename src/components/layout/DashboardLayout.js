// src/components/layout/DashboardLayout.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaSpotify, FaUserAlt, FaMusic } from 'react-icons/fa';
import { supabase } from '../../services/supabase';
import SpotifyFollowersCounter from '../dashboard/SpotifyFollowersCounter';
import { useAuth } from '../../context/AuthContext';
import HeaderBar from '../Common/HeaderBar';
import { spotifyTokenService } from '../../services/spotifyTokenService';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSmartLink, setActiveSmartLink] = useState(null);
    const [showOnboardingCards, setShowOnboardingCards] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user, profile, initializing, signOut } = useAuth();

    // Estados com cache do sessionStorage
    const [topArtists, setTopArtists] = useState(() => {
      try {
        const cached = sessionStorage.getItem(`spotify_artists_${user?.id}`);
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    });
    const [loadingTopArtists, setLoadingTopArtists] = useState(() => {
      return !sessionStorage.getItem(`spotify_data_loaded_${user?.id}`);
    });
    const [topTracks, setTopTracks] = useState(() => {
      try {
        const cached = sessionStorage.getItem(`spotify_tracks_${user?.id}`);
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    });
    const [loadingTopTracks, setLoadingTopTracks] = useState(() => {
      return !sessionStorage.getItem(`spotify_data_loaded_${user?.id}`);
    });
    const [spotifyPermanentlyUnavailable, setSpotifyPermanentlyUnavailable] = useState(() => {
      return sessionStorage.getItem(`spotify_unavailable_${user?.id}`) === 'true';
    });

    const handleSignOut = async () => {
        // Limpar cache ao sair
        if (user?.id) {
          sessionStorage.removeItem(`spotify_artists_${user.id}`);
          sessionStorage.removeItem(`spotify_tracks_${user.id}`);
          sessionStorage.removeItem(`spotify_data_loaded_${user.id}`);
          sessionStorage.removeItem(`spotify_unavailable_${user.id}`);
        }
        await signOut();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Buscar SmartLink ativo para sidebar
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
                setActiveSmartLink(null);
            } else {
                setActiveSmartLink(smartLinkData);
            }
        } catch (error) {
            setActiveSmartLink(null);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchSmartLinkData();
    }, [fetchSmartLinkData]);

    // Effect único para buscar dados do Spotify com cache
    useEffect(() => {
      let cancelled = false;

      const fetchSpotifyData = async () => {
        const userId = user?.id;
        if (!userId) {
          setLoadingTopArtists(false);
          setLoadingTopTracks(false);
          return;
        }

        const cacheKey = `spotify_data_loaded_${userId}`;
        
        // Se já carregamos ou Spotify está indisponível, não recarrega
        if (sessionStorage.getItem(cacheKey) || spotifyPermanentlyUnavailable) {
          setLoadingTopArtists(false);
          setLoadingTopTracks(false);
          return;
        }

        // Verificar se tem conexão Spotify válida
        try {
          const hasSpotify = await spotifyTokenService.hasValidSpotifyConnection(userId);
          if (!hasSpotify) {
            setSpotifyPermanentlyUnavailable(true);
            sessionStorage.setItem(`spotify_unavailable_${userId}`, 'true');
            setLoadingTopArtists(false);
            setLoadingTopTracks(false);
            return;
          }
        } catch {
          setSpotifyPermanentlyUnavailable(true);
          sessionStorage.setItem(`spotify_unavailable_${userId}`, 'true');
          setLoadingTopArtists(false);
          setLoadingTopTracks(false);
          return;
        }

        setLoadingTopArtists(true);
        setLoadingTopTracks(true);

        try {
          // Buscar artistas e tracks em paralelo
          const [artistsResponse, tracksResponse] = await Promise.all([
            spotifyTokenService.makeSpotifyRequest(userId, '/me/top/artists?limit=5&time_range=long_term'),
            spotifyTokenService.makeSpotifyRequest(userId, '/me/top/tracks?limit=5&time_range=long_term')
          ]);

          if (!cancelled) {
            if (artistsResponse.ok) {
              const artistsData = await artistsResponse.json();
              setTopArtists(artistsData.items || []);
              sessionStorage.setItem(`spotify_artists_${userId}`, JSON.stringify(artistsData.items || []));
            }

            if (tracksResponse.ok) {
              const tracksData = await tracksResponse.json();
              setTopTracks(tracksData.items || []);
              sessionStorage.setItem(`spotify_tracks_${userId}`, JSON.stringify(tracksData.items || []));
            }

            sessionStorage.setItem(cacheKey, 'true');
          }
        } catch (error) {
          if (!cancelled) {
            setSpotifyPermanentlyUnavailable(true);
            sessionStorage.setItem(`spotify_unavailable_${userId}`, 'true');
          }
        } finally {
          if (!cancelled) {
            setLoadingTopArtists(false);
            setLoadingTopTracks(false);
          }
        }
      };

      fetchSpotifyData();

      return () => {
        cancelled = true;
      };
    }, [user?.id, spotifyPermanentlyUnavailable]);

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
        navigate('/dashboard/metrics');
    };
    
    const handleNavigateToDashboardHome = () => {
      navigate('/dashboard');
    };

  // Enquanto o contexto de autenticação ainda está inicializando
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
              {/* Conteúdo original do dashboard (children) */}
              {children}
            </div>
          </main>
        </div>
      </div>
    );
};

export default DashboardLayout;

