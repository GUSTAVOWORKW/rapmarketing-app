import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  // Usar uma ref para evitar redirecionamentos múltiplos
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Função para redirecionar de forma segura
    const redirectUser = () => {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        console.log('[AuthCallback] Redirecionando para /dashboard...');
        navigate('/dashboard');
      }
    };

    // 1. Verifique ativamente se a sessão já existe. 
    //    Isso resolve a condição de corrida se o evento SIGNED_IN já disparou.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[AuthCallback] Sessão encontrada com getSession().');
        redirectUser();
      }
    });

    // 2. Configure o listener como um fallback, caso a sessão ainda não esteja pronta.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthCallback] Evento onAuthStateChange: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        console.log('[AuthCallback] Evento SIGNED_IN recebido.');
        redirectUser();
      }
    });

    // Limpeza
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
