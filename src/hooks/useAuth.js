import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Sempre comece carregando

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

      if (error && error.code !== 'PGRST116') { // PGRST116 = nenhuma linha encontrada
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
    // O listener é a fonte de verdade para reagir a mudanças de autenticação.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[useAuth] Evento onAuthStateChange: ${event}`, newSession);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await fetchProfile(newSession?.user?.id);
      // Qualquer evento de autenticação significa que a verificação inicial está concluída.
      setLoading(false);
    });

    // Verifique o hash da URL manualmente. Esta é a chave para corrigir a condição de corrida.
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('refresh_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        console.log('[useAuth] Hash de URL detectado, definindo a sessão manualmente.');
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (error) {
            console.error('[useAuth] Erro ao definir a sessão a partir do hash:', error);
            setLoading(false); // Pare de carregar se o hash for inválido
          } else {
            console.log('[useAuth] Sessão definida a partir do hash com sucesso. onAuthStateChange cuidará do resto.');
            // Limpe o hash da URL para não ficar visível.
            window.history.replaceState(null, '', ' ');
          }
        });
      } else {
        // O hash não continha os tokens esperados, então não é um redirecionamento de login válido.
        setLoading(false);
      }
    } else {
      // Se não houver hash, é um carregamento de página normal. 
      // O evento INITIAL_SESSION do listener cuidará de definir loading como false.
      // Para garantir que não fique preso no carregamento se o evento não disparar, verificamos a sessão.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
           setLoading(false);
        }
      });
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return { session, user, profile, loading };
};
