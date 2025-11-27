import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  // Visibilidade global do app
  const [appVisibility, setAppVisibility] = useState(typeof document !== 'undefined' ? document.visibilityState : 'visible');
  const globalRefetchCallbacksRef = useRef(new Set());
  const userRef = useRef(null);
  
  // Refs para evitar chamadas duplicadas
  const lastFetchedUserIdRef = useRef(null);
  const isFetchingRef = useRef(false);
  
  // Ref para evitar múltiplas chamadas de refetch em sequência
  const lastRefetchTimeRef = useRef(0);
  const REFETCH_DEBOUNCE_MS = 2000; // 2 segundos de debounce

  const fetchProfile = useCallback(async (userId, showLoading = true) => {
    if (!userId) return;
    
    // Se já estamos buscando ou já buscamos para este userId, não busca novamente
    if (isFetchingRef.current) return;
    if (lastFetchedUserIdRef.current === userId && profile !== null) return;
    
    isFetchingRef.current = true;
    if (showLoading) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      
      // Só atualiza se o dado realmente mudou (comparação superficial)
      setProfile(prevProfile => {
        if (JSON.stringify(prevProfile) === JSON.stringify(data)) {
          return prevProfile; // Retorna a mesma referência se não mudou
        }
        return data || null;
      });
      
      lastFetchedUserIdRef.current = userId;
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      isFetchingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        console.log('[Auth] setupAuth: iniciando getSession');
        // 1. Obter sessão atual apenas uma vez na inicialização
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

  setSession(initialSession);
  setUser(initialSession?.user ?? null);
  userRef.current = initialSession?.user ?? null;
        console.log('[Auth] getSession:', { hasSession: !!initialSession, userId: initialSession?.user?.id });

        if (initialSession?.user) {
          console.log('[Auth] getSession: user presente, buscando profile');
          await fetchProfile(initialSession.user.id, true);
        }
      } catch (error) {
        console.error("Error during initial session setup:", error);
      } finally {
        // Garantir que initializing fique false uma única vez, mesmo em caso de erro
        if (mounted) {
          console.log('[Auth] setupAuth: finalizando initializing=false');
          setInitializing(false);
        }
      }

      // 2. Ouvir mudanças futuras de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;
          console.log('[Auth] onAuthStateChange:', event, { newUserId: newSession?.user?.id });
          
          // Ignora eventos que não mudam realmente o estado de autenticação
          // TOKEN_REFRESHED acontece frequentemente e não precisa re-buscar profile
          if (event === 'TOKEN_REFRESHED') {
            // Apenas atualiza a sessão, não rebusca o profile
            setSession(newSession);
            console.log('[Auth] TOKEN_REFRESHED: session atualizada, sem re-fetch de profile');
            return;
          }

          const currentUserId = session?.user?.id;
          const newUserId = newSession?.user?.id;

          // Só atualiza se realmente mudou algo significativo
          // Evitar tratar SIGNED_IN redundante quando o usuário não mudou
          if (event === 'SIGNED_IN' && currentUserId === newUserId) {
            console.log('[Auth] SIGNED_IN redundante: mesmo usuário, ignorando');
            setSession(newSession);
            setUser(newSession?.user ?? null);
            userRef.current = newSession?.user ?? null;
            return;
          }

          if (currentUserId !== newUserId || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            userRef.current = newSession?.user ?? null;
            console.log('[Auth] session/user atualizados:', { event, currentUserId, newUserId });

            if (newSession?.user) {
              // Força re-fetch apenas em login real
              if (event === 'SIGNED_IN') {
                lastFetchedUserIdRef.current = null;
                console.log('[Auth] SIGNED_IN: reset lastFetchedUserId, buscando profile');
              }
              await fetchProfile(newSession.user.id, false);
            } else {
              setProfile(null);
              lastFetchedUserIdRef.current = null;
              userRef.current = null;
              console.log('[Auth] SIGNED_OUT: limpando profile');
            }
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    };

    setupAuth();

    // Listener único de visibilitychange - REMOVIDO pois causava múltiplas requisições
    // O Supabase já dispara eventos quando a visibilidade muda, então não precisamos de callbacks adicionais
    const onVisibility = () => {
      const state = document.visibilityState;
      if (!mounted) return;
      setAppVisibility(state);
      const hasUser = !!userRef.current?.id;
      console.log('[Auth] visibilitychange:', state, { hasUser });
      // NÃO dispare refetch callbacks aqui - o Supabase já faz isso via onAuthStateChange
      // Isso estava causando requisições duplicadas e loading infinito
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);  // Removido fetchProfile das dependências para evitar loop

  const signInWithGoogle = async () => {
    // Redireciona para um callback neutro; decisão de rota ficará no App após carregar profile
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } });
  };

  const signOut = async () => {
    lastFetchedUserIdRef.current = null;
    await supabase.auth.signOut();
  };

  // Função para forçar refresh do profile (para uso externo)
  const forceRefreshProfile = useCallback(async (userId) => {
    if (!userId) return;
    lastFetchedUserIdRef.current = null;
    isFetchingRef.current = false;
    await fetchProfile(userId, false);
  }, [fetchProfile]);

  // Registro de callbacks globais de revalidação
  const registerGlobalRefetch = useCallback((cb) => {
    if (typeof cb !== 'function') return () => {};
    globalRefetchCallbacksRef.current.add(cb);
    return () => {
      globalRefetchCallbacksRef.current.delete(cb);
    };
  }, []);

  const unregisterGlobalRefetch = useCallback((cb) => {
    if (typeof cb !== 'function') return;
    globalRefetchCallbacksRef.current.delete(cb);
  }, []);

  const value = {
    session,
    user,
    profile,
    initializing,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile: forceRefreshProfile,
    // App visibility e revalidação global
    appVisibility,
    registerGlobalRefetch,
    unregisterGlobalRefetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helpers para registrar callbacks globais
function registerGlobalRefetch(callback) {
  if (typeof callback !== 'function') return () => {};
  try {
    // this will be bound inside provider via closure, redefined below at runtime
    return () => {};
  } catch {
    return () => {};
  }
}

function unregisterGlobalRefetch(callback) {
  // placeholder, implemented inside provider instance
}