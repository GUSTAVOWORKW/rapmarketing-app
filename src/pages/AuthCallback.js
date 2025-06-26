import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Assim que o login for confirmado, redirecione para o dashboard.
        navigate('/dashboard');
      }
    });

    // Limpeza: cancele a inscrição quando o componente for desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

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
