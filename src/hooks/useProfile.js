import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { validateSocialLink } from '../utils/socialValidation';

/**
 * Hook customizado para gerenciar operações do perfil do usuário
 * Baseado nas diretrizes do gemini.md - usar apenas React e Supabase
 */
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateProfileData = useCallback((profileData) => {
    const { username, email, social_links } = profileData;
    
    // Validar username
    if (!username || username.length < 3) {
      throw new Error('Username deve ter pelo menos 3 caracteres.');
    }
    
    if (!/^[a-z0-9_]+$/.test(username)) {
      throw new Error('Username: apenas letras (a-z), números (0-9) e underscores (_).');
    }

    // Validar email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Por favor, insira um e-mail válido.');
    }

    // Validar URLs de redes sociais se foram preenchidas
    if (social_links && typeof social_links === 'object') {
      for (const [platform, url] of Object.entries(social_links)) {
        if (url && !validateSocialLink(platform, url)) {
          throw new Error(`URL inválida para ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
        }
      }
    }

    return true;
  }, []);

  const checkUsernameAvailability = useCallback(async (username, currentUserId = null) => {
    setError('');
    
    try {
      let query = supabase
        .from('profiles')
        .select('username, user_id')
        .eq('username', username);
      
      // Se temos um currentUserId, excluir esse usuário da verificação
      if (currentUserId) {
        query = query.neq('user_id', currentUserId);
      }
      
      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar disponibilidade: ${error.message}`);
      }

      // Se encontrou dados, username não está disponível
      return !data;
    } catch (err) {
      console.error('Erro ao verificar username:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const uploadAvatar = useCallback(async (file, userId) => {
    if (!file || !userId) return null;

    setError('');
    
    try {
      // Validar arquivo
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 2MB.');
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Formato de arquivo inválido. Use JPG, PNG ou WEBP.');
      }

      const fileName = `${userId}_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Erro no upload do avatar: ${uploadError.message}`);
      }
      
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do avatar');
      }
      
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Erro no upload do avatar:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const createProfile = useCallback(async (userId, profileData) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Validar dados do perfil
      validateProfileData(profileData);
      
      // Verificar disponibilidade do username
      const isUsernameAvailable = await checkUsernameAvailability(profileData.username);
      if (!isUsernameAvailable) {
        throw new Error(`Username "${profileData.username}" não está disponível.`);
      }

      // Upload do avatar se fornecido
      let avatarUrl = profileData.selectedPredefinedAvatar || null;
      if (profileData.avatarFile) {
        avatarUrl = await uploadAvatar(profileData.avatarFile, userId);
      }

      const dataToInsert = {
        user_id: userId,
        username: profileData.username,
        email: profileData.email,
        avatar_url: avatarUrl,
        social_links: profileData.social_links || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar perfil: ${error.message}`);
      }

      setSuccessMessage('Perfil criado com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao criar perfil:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateProfileData, checkUsernameAvailability, uploadAvatar]);

  const updateProfile = useCallback(async (userId, profileData) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Validar dados do perfil (exceto username se não fornecido)
      if (profileData.username) {
        validateProfileData(profileData);
        
        // Verificar disponibilidade do username se mudou
        const isUsernameAvailable = await checkUsernameAvailability(profileData.username, userId);
        if (!isUsernameAvailable) {
          throw new Error(`Username "${profileData.username}" não está disponível.`);
        }
      } else {
        // Validar apenas email e social_links se username não foi fornecido
        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
          throw new Error('Por favor, insira um e-mail válido.');
        }
        if (profileData.social_links) {
          for (const [platform, url] of Object.entries(profileData.social_links)) {
            if (url && !validateSocialLink(platform, url)) {
              throw new Error(`URL inválida para ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
            }
          }
        }
      }

      // Upload do avatar se fornecido
      let avatarUrl = profileData.currentAvatarUrl;
      if (profileData.avatarFile) {
        avatarUrl = await uploadAvatar(profileData.avatarFile, userId);
      } else if (profileData.selectedPredefinedAvatar) {
        avatarUrl = profileData.selectedPredefinedAvatar;
      }

      const dataToUpdate = {
        updated_at: new Date().toISOString(),
      };

      // Adicionar campos apenas se foram fornecidos
      if (profileData.username) dataToUpdate.username = profileData.username;
      if (profileData.email) dataToUpdate.email = profileData.email;
      if (avatarUrl !== profileData.currentAvatarUrl) dataToUpdate.avatar_url = avatarUrl;
      if (profileData.social_links) dataToUpdate.social_links = profileData.social_links;

      const { data, error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateProfileData, checkUsernameAvailability, uploadAvatar]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMessage('');
  }, []);

  return {
    loading,
    error,
    successMessage,
    checkUsernameAvailability,
    createProfile,
    updateProfile,
    clearMessages,
  };
};
