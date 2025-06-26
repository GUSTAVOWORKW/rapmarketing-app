import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './services/supabase';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';

// Seus Componentes e Páginas
import Auth from './components/Auth/Auth';
import ChooseUsername from './pages/ChooseUsername';
import LandingPage from './pages/LandingPage';
import UserDashboard from './components/dashboard/UserDashboard.tsx';
import UserSettings from './pages/UserSettings.js';
import DashboardLayout from './components/layout/DashboardLayout';
import CreatePresavePage from './pages/CreatePresavePage';
import PresavePage from './pages/PresavePage';
import CreateSmartLinkPage from './pages/CreateSmartLinkPage.tsx';
import PublicProfileSmartLink from './pages/PublicProfileSmartLink.js';
import SmartLinkMetrics from './components/dashboard/SmartLinkMetrics.tsx';
import SpotifyCallbackHandler from './components/Auth/SpotifyCallbackHandler';

// Seus Contexts
import { PresaveFormProvider } from './context/presave/PresaveFormContext';
import { SmartLinkFormProvider } from './context/smartlink/SmartLinkFormContext';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error, status } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (!isMountedRef.current) return;
      if (error && status !== 406) {
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      if (isMountedRef.current) setProfile(null);
    } finally {
      if (isMountedRef.current) setLoading(false);
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const ProtectedRoutesWithLayout = () => {
    if (!session) return <Navigate to="/login" replace />;
    if (!profile?.username) return <Navigate to="/choose-username" replace />;
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
          <Route path="/" element={session ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/choose-username" element={session ? <ChooseUsername /> : <Navigate to="/login" />} />
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
