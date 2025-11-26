import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Refs para evitar chamadas duplicadas
  const lastFetchedUserIdRef = useRef(null);
  const isFetchingRef = useRef(false);

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
        // 1. Obter sessão atual apenas uma vez na inicialização
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, true);
        }
      } catch (error) {
        console.error("Error during initial session setup:", error);
      } finally {
        // Garantir que initializing fique false uma única vez, mesmo em caso de erro
        if (mounted) {
          setInitializing(false);
        }
      }

      // 2. Ouvir mudanças futuras de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;
          
          // Ignora eventos que não mudam realmente o estado de autenticação
          // TOKEN_REFRESHED acontece frequentemente e não precisa re-buscar profile
          if (event === 'TOKEN_REFRESHED') {
            // Apenas atualiza a sessão, não rebusca o profile
            setSession(newSession);
            return;
          }

          const currentUserId = session?.user?.id;
          const newUserId = newSession?.user?.id;

          // Só atualiza se realmente mudou algo significativo
          if (currentUserId !== newUserId || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
              // Força re-fetch apenas em login real
              if (event === 'SIGNED_IN') {
                lastFetchedUserIdRef.current = null;
              }
              await fetchProfile(newSession.user.id, false);
            } else {
              setProfile(null);
              lastFetchedUserIdRef.current = null;
            }
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, []);  // Removido fetchProfile das dependências para evitar loop

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/choose-username' } });
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

  const value = {
    session,
    user,
    profile,
    initializing,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile: forceRefreshProfile,
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