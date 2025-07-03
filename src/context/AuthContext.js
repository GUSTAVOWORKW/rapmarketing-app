import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

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
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const setupAuth = async () => {
      // 1. Get the current session on initial load
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      }
      // Crucially, set initializing to false after the initial check is done.
      setInitializing(false);

      // 2. Listen for future auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    };

    const unsubscribePromise = setupAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/choose-username' } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null); // Clear profile immediately on sign out
  };

  const value = {
    session,
    user,
    profile,
    initializing,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile: fetchProfile,
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