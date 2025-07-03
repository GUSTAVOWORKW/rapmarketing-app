'''import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/choose-username'
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
          redirectTo: window.location.origin + '/settings'
        },
      });
      if (error) console.error('Erro no login com Spotify:', error);
    } catch (error) {
      console.error('Erro inesperado no login com Spotify:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Reset all states on sign out
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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      
      setProfile(data || null); // Set profile to data or null if not found
      if (data) {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
      } else {
        localStorage.removeItem(`profile_${userId}`);
      }

    } catch (error) {
      console.error("Erro ao buscar perfil no AuthProvider:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // This useEffect is the single source of truth for auth state.
  useEffect(() => {
    setInitializing(true);
    
    // Immediately get the current session and set it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        fetchProfile(currentUser.id);
      }
    });

    // Listen for future auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        
        if (currentUser) {
          // On sign-in or token refresh, force a fresh profile fetch.
          await fetchProfile(currentUser.id);
        } else {
          // On sign-out, clear the profile.
          setProfile(null);
        }
        
        // The first time this runs, the app is no longer initializing.
        setInitializing(false);
      }
    );

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
    refreshProfile: (userId) => fetchProfile(userId),
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
''
