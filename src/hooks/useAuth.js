import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      console.log('[useAuth] fetchProfile: userId é nulo, definindo profile como nulo.');
      setProfile(null);
      return;
    }
    try {
      console.log(`[useAuth] fetchProfile: Buscando perfil para userId: ${userId}`);
      console.log('[useAuth] fetchProfile: Antes da chamada ao Supabase para perfil.'); // NOVO LOG
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      console.log('[useAuth] fetchProfile: Depois da chamada ao Supabase para perfil.'); // NOVO LOG

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        setProfile(null);
      } else {
        console.log('[useAuth] fetchProfile: Perfil encontrado:', data);
        setProfile(data);
      }
    } catch (e) {
      console.error('Exceção ao buscar perfil:', e);
      setProfile(null);
    } finally {
      console.log('[useAuth] fetchProfile: Finalizando busca de perfil.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    console.log('[useAuth] useEffect: Iniciando listener de autenticação.');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[useAuth] Evento: ${event}`);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('[useAuth] Evento: Usuário na sessão, buscando perfil...');
        await fetchProfile(session.user.id);
      } else {
        console.log('[useAuth] Evento: Nenhum usuário na sessão, limpando perfil.');
        setProfile(null);
      }
      console.log('[useAuth] Evento: Finalizando carregamento do onAuthStateChange.');
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        console.log('[useAuth] Verificação inicial: Sessão encontrada.');
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        console.log('[useAuth] Verificação inicial: Nenhuma sessão encontrada.');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      console.log('[useAuth] Verificação inicial: Finalizando carregamento.');
      setLoading(false);
    }).catch(e => {
      console.error('[useAuth] Erro na verificação inicial da sessão:', e);
      setLoading(false);
    });


    return () => {
      console.log('[useAuth] useEffect: Desinscrevendo listener de autenticação.');
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return { session, user, profile, loading };
};