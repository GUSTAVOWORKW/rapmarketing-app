import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth/Auth';
import Dashboard from './pages/Dashboard'; // Importar o novo componente Dashboard
import { supabase } from './services/supabase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Carregando...</div>; // Ou um componente de splash screen
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!session ? <Auth /> : <Navigate to="/dashboard" replace />}
          />
          <Route 
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          {/* Redireciona para /login se nenhuma outra rota corresponder e não houver sessão */}
          <Route 
            path="*" 
            element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
