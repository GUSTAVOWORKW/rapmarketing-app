import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      // Still loading auth state, do nothing yet
      return;
    }

    if (hasRedirected.current) {
      return;
    }

    if (user) {
      console.log('[AuthCallback] Usuário autenticado, redirecionando para /dashboard...');
      hasRedirected.current = true;
      navigate('/dashboard', { replace: true });
    } else {
      console.log('[AuthCallback] Nenhum usuário autenticado, redirecionando para /login...');
      hasRedirected.current = true;
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold text-gray-700">Autenticando...</h1>
        <p className="text-gray-500">Aguarde um momento, estamos preparando tudo para você.</p>
      </div>
    </div>
  );
};

export default AuthCallback;