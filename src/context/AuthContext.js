import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
    import { supabase } from '../services/supabase';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
      const [session, setSession] = useState(null);
      const [user, setUser] = useState(null);
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);

      const signInWithSpotify = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'spotify',
                options: {
                    scopes: 'user-read-email user-read-private user-top-read playlist-read-private playlist-read-collaborative',
                    redirectTo: window.location.origin + '/settings' // Redireciona de volta para as configurações
                },
            });
            if (error) {
                console.error('Erro no login com Spotify:', error);
                // Opcional: você pode querer mostrar um erro para o usuário aqui
            }
        } catch (error) {
            console.error('Erro inesperado no login com Spotify:', error);
        }
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

        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
          if (error && error.code !== 'PGRST116') throw error;
          if (data) {
            setProfile(data);
            localStorage.setItem(cacheKey, JSON.stringify(data));
          }
        } catch (error) {
          console.error("Erro ao buscar perfil no AuthProvider:", error);
        }
      }, []);

      useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            const currentUser = session?.user;
            setUser(currentUser ?? null);
            if (currentUser) {
                await fetchProfile(currentUser.id);
            }
            setLoading(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                setSession(session);
                const currentUser = session?.user;
                setUser(currentUser ?? null);
                if (currentUser) {
                    // Força a busca sem cache em eventos de login/conexão
                    await fetchProfile(currentUser.id, true); 
                } else {
                    setProfile(null);
                }
                setLoading(false);
            });

            return () => {
                subscription?.unsubscribe();
            };
        };

        const unsubscribePromise = initializeAuth();

        return () => {
            unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
        };
      }, [fetchProfile]);

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

      const value = {
        user,
        profile,
        loading,
        signInWithGoogle,
        refreshProfile: (userId) => fetchProfile(userId, true),
        signInWithSpotify // Exportar a função
      };

      return (
        <AuthContext.Provider value={value}>
          {!loading && children}
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
