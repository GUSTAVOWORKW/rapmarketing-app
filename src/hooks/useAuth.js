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

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Exceção ao buscar perfil:', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const isOauthRedirect = window.location.hash.includes('access_token');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[useAuth] Evento: ${event}`);

      if (event === 'INITIAL_SESSION') {
        // Se for um redirecionamento OAuth, não faça nada. Espere pelo SIGNED_IN.
        if (isOauthRedirect) {
          console.log('[useAuth] Redirecionamento OAuth. Aguardando SIGNED_IN...');
          return;
        }
        // Se for um carregamento normal, processe a sessão (que pode ser nula)
        setSession(session);
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
        // Limpa o hash da URL para uma aparência limpa
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return { session, user, profile, loading };
};
