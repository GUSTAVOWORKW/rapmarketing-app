import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (hasRedirected.current) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log('[AuthCallback] Sessão encontrada, redirecionando para /dashboard...');
        hasRedirected.current = true;
        navigate('/dashboard', { replace: true }); // Use replace para evitar histórico
      } else {
        // Se não houver sessão imediatamente, configure o listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log(`[AuthCallback] Evento onAuthStateChange: ${event}`);
          if (event === 'SIGNED_IN' && session && !hasRedirected.current) {
            console.log('[AuthCallback] Evento SIGNED_IN recebido, redirecionando para /dashboard...');
            hasRedirected.current = true;
            navigate('/dashboard', { replace: true });
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      }
    };

    handleAuth();
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