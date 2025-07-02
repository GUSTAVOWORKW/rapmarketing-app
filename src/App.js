import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Importa o NOVO hook useAuth do AuthContext
import { useAuth, AuthProvider } from './context/AuthContext';

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
import StreamingCallback from './pages/StreamingCallback';

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
// AGORA USA O CONTEXTO DIRETAMENTE
const ProtectedRoutes = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

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

// O componente App agora apenas define a estrutura dos provedores e rotas
function App() {
  return (
    <AuthProvider>
      <SmartLinkFormProvider>
        <PresaveFormProvider>
          <AppRoutes />
        </PresaveFormProvider>
      </SmartLinkFormProvider>
    </AuthProvider>
  );
}

// Componente separado para as rotas, para que possa acessar o AuthContext
const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/spotify-callback" element={<SpotifyCallbackHandler />} />
      <Route path="/:slug" element={<PublicProfileSmartLink />} />
      <Route path="/presave/:slug" element={<PresavePage />} />
      <Route path="/streaming-callback" element={<StreamingCallback />} />

      {/* Rotas que exigem apenas login (sem perfil completo) */}
      <Route
        path="/choose-username"
        element={session ? <ChooseUsername /> : <Navigate to="/login" />}
      />

      {/* Rotas Protegidas (exigem login e perfil completo) */}
      <Route element={<ProtectedRoutes />}>
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
  );
}

export default App;
