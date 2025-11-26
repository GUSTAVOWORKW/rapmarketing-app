import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async (userId, showLoading = true) => {
    if (!userId) return;
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

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

      // 2. Ouvir mudanças futuras de autenticação sem reativar o estado de initializing
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;

          setSession(session);
          const currentUser = session?.user;
          setUser(currentUser ?? null);

          if (currentUser) {
            // Atualizações de sessão (ex: refresh token, foco na aba) não devem bloquear a UI
            await fetchProfile(currentUser.id, false);
          } else {
            setProfile(null);
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
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/choose-username' } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    initializing,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile: fetchProfile, // Provide the fetchProfile function
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