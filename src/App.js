import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Auth from './components/Auth/Auth';
import Dashboard from './pages/Dashboard';
import ChooseUsername from './pages/ChooseUsername';
import TemplateSelectPage from './pages/TemplateSelectPage';
import StreamingSetup from './pages/StreamingSetup';
import PublicProfile from './pages/PublicProfile';
import { supabase } from './services/supabase';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HeaderBar from './components/Common/HeaderBar';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();

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
        console.error("Erro ao buscar perfil:", error.message);
        setProfile(null); // Mantém a limpeza do perfil em caso de erro
        return { success: false, error };
      } else {
        setProfile(data);
        return { success: true, data };
      }
    } catch (e) {
      console.error("Exceção ao buscar perfil:", e.message);
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

  const handleProfileUpdate = useCallback(async () => {
    if (session?.user) {
      return await fetchProfile(session.user.id);
    }
    return { success: false, error: "No user session for profile update" };
  }, [session, fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    navigate('/login');
  };

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMountedRef.current) return;
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentAuthSession) => {
        if (!isMountedRef.current) return;
        setSession(currentAuthSession);
        if (currentAuthSession?.user) {
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

  if (loading && !profile && !session?.user?.id) {
     return <div>Carregando aplicação inicial...</div>;
  }
  
  if (!session) {
    return (
      <Router> {/* Router aqui é um erro se App já está dentro de um Router no index.js. Assumindo que App é o topo. */}
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      </Router>
    );
  }
  
  // Se a sessão existe, mas o perfil ainda está carregando (e não temos um perfil ainda)
  // Isso pode acontecer logo após o login, antes do primeiro fetchProfile completar.
  if (loading && !profile) {
      return <div>Carregando perfil...</div>;
  }

  return (
    <>
      <HeaderBar user={session?.user} avatar={profile?.avatar} onLogout={handleLogout} />
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              !session ? ( // Esta condição é redundante devido ao if(!session) acima, mas mantida por segurança.
                <Auth />
              ) : (
                <Navigate to={profile?.username ? (profile?.template_id ? "/dashboard" : "/choose-template") : "/choose-username"} replace />
              )
            }
          />
          <Route
            path="/choose-username"
            element={
              session?.user ? ( // Simplificado, pois session já é verificado acima
                !profile?.username ? <ChooseUsername currentUserId={session.user.id} onProfileUpdate={handleProfileUpdate}/> : <Navigate to={profile?.template_id ? "/dashboard" : "/choose-template"} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/choose-template"
            element={
              session?.user && profile?.username ? (
                <TemplateSelectPage currentUserId={session.user.id} onProfileUpdate={handleProfileUpdate} hadTemplate={!!profile?.template_id} />
              ) : (
                <Navigate to={!session?.user ? "/login" : "/choose-username"} replace />
              )
            }
          />
          <Route
            path="/streaming-setup"
            element={
              session?.user && profile?.username && profile?.template_id ? (
                <StreamingSetup currentUserId={session.user.id} onProfileUpdate={handleProfileUpdate} />
              ) : (
                <Navigate to={
                  !session?.user ? "/login" : 
                  !profile?.username ? "/choose-username" : 
                  "/choose-template" // Se não tem template_id, volta para choose-template
                } replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              session?.user && profile?.username && profile?.template_id ? (
                <Dashboard />
              ) : (
                <Navigate to={
                  !session?.user ? "/login" : 
                  !profile?.username ? "/choose-username" : 
                  "/choose-template"
                } replace />
              )
            }
          />
          <Route path="/:username" element={<PublicProfile />} />
          <Route
            path="*"
            element={
              <Navigate
                to={
                  session?.user // Se tem sessão
                    ? (profile?.username // E tem username
                        ? (profile?.template_id ? "/dashboard" : "/choose-template") // Decide entre dashboard ou choose-template
                        : "/choose-username") // Se não tem username
                    : "/login" // Se não tem sessão
                }
                replace
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

// Nota: Para que useLocation e useNavigate funcionem em App, 
// o componente App deve ser renderizado dentro de um <BrowserRouter> no index.js.
// Ex: ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
export default App;
