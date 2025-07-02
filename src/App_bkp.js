import React, { useEffect, useRef } from 'react';
import Auth from './components/Auth/Auth';
import ChooseUsername from './pages/ChooseUsername';
import PublicProfile from './pages/PublicProfile';
import LandingPage from './pages/LandingPage';
import { supabase } from './services/supabase';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import UserDashboard from './components/dashboard/UserDashboard.tsx';
import UserSettings from './pages/UserSettings.js';
import DashboardLayout from './components/layout/DashboardLayout';
import CreatePresavePage from './pages/CreatePresavePage';
import PresavePage from './pages/PresavePage';
import CreateSmartLinkPage from './pages/CreateSmartLinkPage.tsx';
import SmartLinkMetrics from './components/dashboard/SmartLinkMetrics.tsx';
import SpotifyCallbackHandler from './components/Auth/SpotifyCallbackHandler';
import { PresaveFormProvider } from './context/presave/PresaveFormContext';
import { SmartLinkFormProvider } = from './context/smartlink/SmartLinkFormContext';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
