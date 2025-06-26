import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Exception fetching profile:', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const processSession = async (currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      await fetchProfile(currentUser?.id);
    };

    // 1. Tenta pegar a sessão inicial. O Supabase JS pode ter a sessão em memória.
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('[useAuth] Sessão inicial:', initialSession);
      
      // 2. Verifica se o hash da URL contém um token de login (redirecionamento do OAuth)
      const hash = window.location.hash;
      const isOauthRedirect = hash.includes('access_token') && hash.includes('refresh_token');

      // Se NÃO for um redirecionamento OAuth e já tivermos uma sessão, processamos.
      if (!isOauthRedirect && initialSession) {
        await processSession(initialSession);
      }
      
      // Se não for um redirect, e não tiver sessão, o estado de loading pode ser finalizado aqui
      // para evitar que a tela de loading persista indefinidamente.
      // Para redirects, o onAuthStateChange vai lidar com o fim do loading.
      if (!isOauthRedirect) {
         setLoading(false);
      }
    });

    // 3. Escuta por mudanças no estado de autenticação.
    // Isso é CRUCIAL. Ele vai disparar para INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`[useAuth] onAuthStateChange event: ${event}`, newSession);
        
        // O evento SIGNED_IN (ou INITIAL_SESSION com usuário) é o ponto certo para processar a sessão.
        // O Supabase JS já processou o token da URL neste ponto.
        await processSession(newSession);
        
        // Finaliza o carregamento DEPOIS de processar a sessão.
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return { session, user, profile, loading };
};
