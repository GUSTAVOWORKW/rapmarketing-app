import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

// Função auxiliar para adicionar timeout a uma Promise
const timeout = (ms, promise) => {
  return new Promise((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve({ data: null, error: { message: 'Timeout: Supabase profile fetch took too long.' } });
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(id);
        resolve(res);
      },
      (err) => {
        clearTimeout(id);
        resolve({ data: null, error: err }); // Resolve with error for consistency
      }
    );
  });
};

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

    // 1. Tenta carregar o perfil do localStorage primeiro
    const cachedProfile = localStorage.getItem(`profile_${userId}`);
    if (cachedProfile) {
      try {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile(parsedProfile);
        console.log('[useAuth] fetchProfile: Perfil carregado do cache:', parsedProfile);
      } catch (parseError) {
        console.error('[useAuth] Erro ao parsear perfil do cache:', parseError);
        localStorage.removeItem(`profile_${userId}`); // Limpa cache inválido
      }
    } else {
      setProfile(null); // Garante que o perfil é nulo se não houver cache
    }

    // 2. Inicia a busca do perfil no Supabase em segundo plano
    // Não usamos 'await' aqui para não bloquear a execução e permitir que o cache seja exibido imediatamente
    (async () => {
      try {
        console.log(`[useAuth] fetchProfile: Buscando perfil atualizado para userId: ${userId}`);
        console.log('[useAuth] fetchProfile: Antes da chamada ao Supabase para perfil.');
        
        const { data, error } = await timeout(
          5000, // 5 segundos
          supabase.from('profiles').select('*').eq('user_id', userId).single()
        );
        
        console.log('[useAuth] fetchProfile: Depois da chamada ao Supabase para perfil.');

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil atualizado:', error);
          // Não limpa o perfil se já foi carregado do cache
        } else if (data) {
          console.log('[useAuth] fetchProfile: Perfil atualizado encontrado:', data);
          setProfile(data); // Atualiza o estado com o perfil mais recente
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data)); // Atualiza o cache
        }
      } catch (e) {
        if (e.message === 'Timeout: Supabase profile fetch took too long.') {
          console.warn('A busca do perfil Supabase excedeu o tempo limite, usando dados em cache se disponíveis.');
        } else {
          console.error('Exceção ao buscar perfil atualizado:', e);
        }
        // Não limpa o perfil se já foi carregado do cache
      } finally {
        console.log('[useAuth] fetchProfile: Finalizando busca de perfil atualizado.');
      }
    })(); // Executa a função imediatamente
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
        fetchProfile(session.user.id); // Não aguarda a conclusão
      } else {
        console.log('[useAuth] Evento: Nenhum usuário na sessão, limpando perfil.');
        setProfile(null);
      }
      console.log('[useAuth] Evento: Finalizando carregamento do onAuthStateChange.');
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[useAuth] Verificação inicial: Sessão encontrada.');
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id); // Não aguarda a conclusão
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

  return { session, user, profile, loading, fetchProfile };
};
