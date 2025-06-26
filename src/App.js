import React, { useState, useEffect, useRef, useCallback } from 'react';
import Auth from './components/Auth/Auth';
import ChooseUsername from './pages/ChooseUsername';
import LandingPage from './pages/LandingPage';
import { supabase } from './services/supabase';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';

// Seus outros imports de componentes e contextos
import UserDashboard from './components/dashboard/UserDashboard.tsx';
import UserSettings from './pages/UserSettings.js';
import DashboardLayout from './components/layout/DashboardLayout';
import CreatePresavePage from './pages/CreatePresavePage';
import PresavePage from './pages/PresavePage';
import CreateSmartLinkPage from './pages/CreateSmartLinkPage.tsx';
import PublicProfileSmartLink from './pages/PublicProfileSmartLink.js';
import SmartLinkMetrics from './components/dashboard/SmartLinkMetrics.tsx';
import SpotifyCallbackHandler from './components/Auth/SpotifyCallbackHandler';
import { PresaveFormProvider } from './context/presave/PresaveFormContext';
import { SmartLinkFormProvider } from './context/smartlink/SmartLinkFormContext';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState(null);

  // LOG DE DEBUG 1: Rastreia cada renderização do componente
  console.log('--- Renderização do App ---', { 
    loading: loading, 
    temSessao: !!session, 
    temPerfil: !!profile 
  });

  const fetchProfile = useCallback(async (userId) => {
    // LOG DE DEBUG 2: Confirma que a busca de perfil foi iniciada
    console.log(`[fetchProfile] Buscando perfil para o usuário: ${userId}`);
    try {
      const { data, error, status } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (!isMountedRef.current) return { success: false, error: "Component unmounted" };
      if (error && status !== 406) {
        setProfile(null);
        return { success: false, error };
      } else {
        setProfile(data);
        return { success: true, data };
      }
    } catch (e) {
      if (isMountedRef.current) { setProfile(null); }
      return { success: false, error: e };
    } finally {
      // LOG DE DEBUG 3: Confirma que a busca de perfil terminou e o loading será desativado
      console.log('[fetchProfile] FINALIZADO. Setando loading para false.');
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate('/login');
  };

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // LOG DE DEBUG 4: O log mais importante. Mostra se a autenticação foi detectada.
        console.log(`[onAuthStateChange] Disparado! Evento: ${_event}`, session);

        if (!isMountedRef.current) return;
        setSession(session);
        setCurrentUserId(session?.user?.id || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
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

  useEffect(() => {
    if (!session?.user?.id) return;
    const captureSpotifyTokens = async () => {
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const expiresIn = urlParams.get('expires_in') || hashParams.get('expires_in');
      if (accessToken) {
        try {
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(expiresIn || '3600'));
          const { error } = await supabase.from('spotify_tokens').upsert({ user_id: session.user.id, access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt.toISOString(), updated_at: new Date().toISOString() });
          if (!error) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } catch (error) {}
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

  const ProtectedRoutesWithLayout = () => {
    if (!session) { return <Navigate to="/login" replace />; }
    if (!profile?.username) { return <Navigate to="/choose-username" replace />; }
    return (
      <DashboardLayout currentUserId={currentUserId} onSignOut={handleLogout}>
        <Outlet />
      </DashboardLayout>
    );
  };

  return (
    <SmartLinkFormProvider>
      <PresaveFormProvider>
        <Routes>
          <Route 
            path="/" 
            element={session ? <Navigate to="/dashboard" /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/dashboard" /> : <Auth />} 
          />
          <Route 
            path="/choose-username" 
            element={session ? <ChooseUsername /> : <Navigate to="/login" />} 
          />
          <Route path="/spotify-callback" element={<SpotifyCallbackHandler />} />
          <Route path="/:slug" element={<PublicProfileSmartLink />} />
          <Route path="/presave/:slug" element={<PresavePage />} />
          <Route element={<ProtectedRoutesWithLayout />}>
            <Route path="/dashboard" element={<UserDashboard currentUserId={currentUserId} />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/dashboard/metrics" element={<SmartLinkMetrics />} />
            <Route path="/dashboard/metrics/:linkId" element={<SmartLinkMetrics />} />
            <Route path="/criar-presave/:presaveId?" element={<CreatePresavePage />} />
            <Route path="/criar-smart-link/:smartLinkId?" element={<CreateSmartLinkPage />} />
          </Route>
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
        </Routes>
      </PresaveFormProvider>
    </SmartLinkFormProvider>
  );
}

export default App;