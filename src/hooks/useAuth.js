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
    let isOauthRedirect = false;
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('refresh_token')) {
        isOauthRedirect = true;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[useAuth] Evento: ${event}`, newSession);

      // Se for um redirecionamento OAuth, ignore o primeiro evento INITIAL_SESSION
      // e espere pelo evento SIGNED_IN que contém os dados corretos.
      if (isOauthRedirect && event === 'INITIAL_SESSION') {
        console.log('[useAuth] Redirecionamento OAuth detectado, aguardando SIGNED_IN...');
        return; // Não faça nada, apenas espere
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      await fetchProfile(newSession?.user?.id);
      
      // Limpa o hash da URL após o processamento bem-sucedido
      if (event === 'SIGNED_IN') {
        window.history.replaceState(null, '', ' ');
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return { session, user, profile, loading };
};
