import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Hook de autenticação centralizado
import { useAuth } from './hooks/useAuth';

// Seus Componentes e Páginas
import Auth from './components/Auth/Auth';
import AuthCallback from './pages/AuthCallback';
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

// Componente para exibir tela de carregamento
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
  </div>
);

// Componente para proteger rotas que exigem autenticação
// Recebe session e profile como props
const ProtectedRoutes = ({ session, profile }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.username) {
    return <Navigate to="/choose-username" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

function App() {
  const { session, loading, profile } = useAuth(); // Chame useAuth apenas uma vez aqui

  // Mostra a tela de carregamento enquanto o hook de autenticação processa a sessão.
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SmartLinkFormProvider>
      <PresaveFormProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={session ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/spotify-callback" element={<SpotifyCallbackHandler />} />
          <Route path="/:slug" element={<PublicProfileSmartLink />} />
          <Route path="/presave/:slug" element={<PresavePage />} />

          {/* Rotas que exigem apenas login (sem perfil completo) */}
          <Route path="/choose-username" element={session ? <ChooseUsername /> : <Navigate to="/login" />} />

          {/* Rotas Protegidas (exigem login e perfil completo) */}
          {/* Passe session e profile como props para ProtectedRoutes */}
          <Route element={<ProtectedRoutes session={session} profile={profile} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/dashboard/metrics" element={<SmartLinkMetrics />} />
            <Route path="/dashboard/metrics/:linkId" element={<SmartLinkMetrics />} />
            <Route path="/criar-presave/:presaveId?" element={<CreatePresavePage />} />
            <Route path="/criar-smart-link/:smartLinkId?" element={<CreateSmartLinkPage />} />
          </Route>

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
        </Routes>
      </PresaveFormProvider>
    </SmartLinkFormProvider>
  );
}

export default App;