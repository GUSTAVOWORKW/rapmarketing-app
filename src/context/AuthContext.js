import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Para carregamentos de perfil, etc.
  const [initializing, setInitializing] = useState(true); // Para o carregamento inicial da sessão

  const signInWithGoogle = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/choose-username'
            },
        });
        if (error) {
            console.error('Erro no login com Google:', error);
        }
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
                redirectTo: window.location.origin + '/settings'
            },
        });
        if (error) {
            console.error('Erro no login com Spotify:', error);
        }
    } catch (error) {
        console.error('Erro inesperado no login com Spotify:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.clear(); // Limpa todo o cache local no logout
  };

  const fetchProfile = useCallback(async (userId, noCache = false) => {
    if (!userId) {
      setProfile(null);
      localStorage.removeItem('profile');
      return;
    }

    const cacheKey = `profile_${userId}`;

    if (!noCache) {
      const cachedProfile = localStorage.getItem(cacheKey);
      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile));
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setProfile(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erro ao buscar perfil no AuthProvider:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInitializing(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
            await fetchProfile(currentUser.id, event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED');
        } else {
            setProfile(null);
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
    refreshProfile: (userId) => fetchProfile(userId, true),
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
