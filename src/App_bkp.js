import React, { useState, useEffect, useRef, useCallback } from 'react';
// import './App.css'; // Mantido comentado, pois estamos migrando para Tailwind
import Auth from './components/Auth/Auth';
import ChooseUsername from './pages/ChooseUsername';
import PublicProfile from './pages/PublicProfile';
import LandingPage from './pages/LandingPage'; // Adicionar importação
import { supabase } from './services/supabase';
// Removido BrowserRouter as Router, mantidos os outros imports de react-router-dom
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';

// Novos imports para o editor e dashboard refatorado
import UserDashboard from './components/dashboard/UserDashboard.tsx';
import UserSettings from './pages/UserSettings.js'; // <--- ADICIONAR ESTA LINHA
import DashboardLayout from './components/layout/DashboardLayout'; // Importar o DashboardLayout
import CreatePresavePage from './pages/CreatePresavePage'; // Nova página de pré-save
import PresavePage from './pages/PresavePage'; // Nova página pública de pré-save
import CreateSmartLinkPage from './pages/CreateSmartLinkPage.tsx'; // Nova página de criação de Smart Link
import SmartLinkMetrics from './components/dashboard/SmartLinkMetrics.tsx'; // Componente de métricas
import SpotifyCallbackHandler from './components/Auth/SpotifyCallbackHandler'; // Handler para tokens do Spotify

// Context para estado persistente do presave e smart link
import { PresaveFormProvider } from './context/presave/PresaveFormContext';
import { SmartLinkFormProvider } from './context/smartlink/SmartLinkFormContext';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const location = useLocation(); // Existing: useLocation hook
  const [currentUserId, setCurrentUserId] = useState(null);
  const fetchProfile = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*') // Busca todos os campos do perfil, incluindo mainColor, bgColor, musicLinks, avatar, cover, socials, etc.
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMountedRef.current) return { success: false, error: "Component unmounted" };

      if (error && status !== 406) {
        console.error("❌ Erro ao buscar perfil:", error.message, error);
        setProfile(null); // Mantém a limpeza do perfil em caso de erro
        return { success: false, error };
      } else {
        setProfile(data);
        return { success: true, data };
      }
    } catch (e) {
      console.error("❌ Exceção ao buscar perfil:", e.message, e);
      if (isMountedRef.current) {
        setProfile(null);
      }
      return { success: false, error: e };
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // fetchProfile não deve depender de 'profile' ou 'loading' para evitar loops

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate('/login');
  };
  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (!isMountedRef.current) return;
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUserId(currentSession.user.id);
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    }).catch(err => {
      console.error('❌ Erro ao obter sessão:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentAuthSession) => {
        if (!isMountedRef.current) return;
        setSession(currentAuthSession);
        if (currentAuthSession?.user) {
          setCurrentUserId(currentAuthSession.user.id);
          fetchProfile(currentAuthSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Novo useEffect para capturar tokens do Spotify
  useEffect(() => {
    // Só executar se temos sessão E location
    if (!session?.user?.id) {
      return;
    }
    
    // Verificar se há tokens do Spotify na URL após o redirecionamento
    const captureSpotifyTokens = async () => {
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      // Tokens podem vir como query params ou hash params
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const expiresIn = urlParams.get('expires_in') || hashParams.get('expires_in');
      
      if (accessToken) {
        console.log('🎵 Tokens do Spotify recebidos, salvando...');
        
        try {
          // Calcular data de expiração
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(expiresIn || '3600'));
          
          // Salvar tokens no Supabase
          const { error } = await supabase
            .from('spotify_tokens')
            .upsert({
              user_id: session.user.id,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('Erro ao salvar tokens do Spotify:', error);
          } else {
            console.log('✅ Tokens do Spotify salvos com sucesso');
            
            // Limpar parâmetros da URL
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } catch (error) {
          console.error('Erro ao processar tokens do Spotify:', error);
        }
      }
    };
    
    captureSpotifyTokens();
  }, [session, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  // Componente para rotas protegidas com DashboardLayout
  const ProtectedRoutesWithLayout = () => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    
    if (!profile?.username) {
      return <Navigate to="/choose-username" replace />;
    }

    return (
      <DashboardLayout currentUserId={currentUserId} onSignOut={handleLogout}>
        <Outlet />
      </DashboardLayout>
    );
  };  return (
    <SmartLinkFormProvider>
      <PresaveFormProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Página de login */}
          <Route 
            path="/login" 
            element={session ? <Navigate to="/dashboard" /> : <Auth />} 
          />
            {/* Handler de callback do Spotify */}
          <Route path="/spotify-callback" element={<SpotifyCallbackHandler />} />

          {/* Página pública do pré-save */}
          <Route path="/presave/:slug" element={<PresavePage />} />

          {/* Perfil público - deve vir antes da rota de fallback */}
          {/* 
          IMPORTANTE: Esta rota deve vir DEPOIS das rotas específicas para evitar conflitos
          Por exemplo, se tivermos /dashboard, /login, etc., elas devem vir ANTES desta rota
          */}
          <Route path="/:slug/:smartLinkId" element={<PublicProfile />} />
          
          <Route 
            path="/choose-username"
            element={session ? (profile?.username ? <Navigate to="/dashboard" /> : <ChooseUsername currentUserId={currentUserId} onProfileUpdate={setProfile} />) : <Navigate to="/login" />}
          />

          {/* Rotas Protegidas com DashboardLayout */}
          <Route element={<ProtectedRoutesWithLayout />}>
            <Route path="/dashboard" element={<UserDashboard currentUserId={currentUserId} />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/metrics" element={<SmartLinkMetrics />} />
            <Route path="/dashboard/metrics/:linkId" element={<SmartLinkMetrics />} />
            <Route path="/criar-presave/:presaveId?" element={<CreatePresavePage />} />          <Route path="/criar-smart-link/:smartLinkId?" element={<CreateSmartLinkPage />} />
            {/* Adicione outras rotas que devem usar o DashboardLayout aqui */}
          </Route>
            {/* Rota de fallback ou página não encontrada - pode ser uma página específica ou redirecionar */}
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />          </Routes>
      </PresaveFormProvider>
    </SmartLinkFormProvider>
  );
}

export default App;
