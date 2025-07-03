import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // For discrete loading states (e.g., profile fetch)
  const [initializing, setInitializing] = useState(true); // For the initial auth check

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/choose-username',
        },
      });
      if (error) console.error('Erro no login com Google:', error);
    } catch (error) {
      console.error('Erro inesperado no login com Google:', error);
    }
  };

  const signInWithSpotify = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes: 'user-read-email user-read-private user-top-read playlist-read-private playlist-read-collaborative',
          redirectTo: window.location.origin + '/settings',
        },
      });
      if (error) console.error('Erro no login com Spotify:', error);
    } catch (error) {
      console.error('Erro inesperado no login com Spotify:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.clear();
  };

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data || null);
    } catch (error) {
      console.error("Erro ao buscar perfil no AuthProvider:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInitializing(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setInitializing(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    initializing,
    signInWithGoogle,
    signInWithSpotify,
    signOut,
    refreshProfile: fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};