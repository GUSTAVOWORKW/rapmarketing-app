// src/hooks/useSmartLink.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { SmartLink, PlatformLink } from '../types';

export function useSmartLink(smartLinkId: string | null | undefined) {
  const [smartLink, setSmartLink] = useState<SmartLink | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchSmartLinkById = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('smart_links')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      setSmartLink(data as SmartLink);
    } catch (e) {
      setError(e);
      console.error('Error fetching smart link by ID:', e);
      setSmartLink(null);
    } finally {
      setLoading(false);
    }
  }, []);  const fetchSmartLinkByUserId = useCallback(async (userId: string): Promise<SmartLink | null> => {
    if (!userId) return null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('smart_links')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle pois o usuário pode não ter smart_link
      
      if (fetchError) {
        // Só log se for um erro real, não se simplesmente não encontrou dados
        if (fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.warn('Erro ao buscar smart link por User ID:', fetchError.message);
        }
        return null;
      }
      
      return data as SmartLink | null;
    } catch (e: any) {
      // Evitar logs excessivos de erros esperados
      return null;
    }
  }, []);

  useEffect(() => {
    // Se um smartLinkId é fornecido na inicialização do hook, busca por ele.
    // Caso contrário, a busca será feita por fetchSmartLinkByUserId chamada externamente.
    if (smartLinkId) {
      fetchSmartLinkById(smartLinkId);
    }
  }, [smartLinkId, fetchSmartLinkById]);

  const createSmartLink = async (newLinkData: Omit<SmartLink, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<SmartLink | null> => {
    setLoading(true);
    setError(null);
    try {
      // Adicionar user_id e slug à tabela profiles se ainda não existir, ou garantir que user_id seja único em smart_links
      // A tabela smart_links deve ter uma restrição UNIQUE no user_id se cada usuário só pode ter um link.
      const { data, error: insertError } = await supabase
        .from('smart_links')
        .insert([{
          ...newLinkData,
          // slug é definido para ser o username do perfil, que já deve ser único na tabela profiles
          // e user_id também deve ser único na tabela smart_links
        }])
        .select()
        .single();
      if (insertError) throw insertError;
      setSmartLink(data as SmartLink);
      return data as SmartLink;
    } catch (e) {
      setError(e);
      console.error('Error creating smart link:', e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSmartLink = async (id: string, updates: Partial<Omit<SmartLink, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'user_id'>>): Promise<SmartLink | null> => {
    setLoading(true);
    setError(null);
    try {
      // O slug (username) e user_id não devem ser alterados aqui, pois são fixos.
      const { data, error: updateError } = await supabase
        .from('smart_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      setSmartLink(data as SmartLink);
      return data as SmartLink;
    } catch (e) {
      setError(e);
      console.error('Error updating smart link:', e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSmartLink = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('smart_links')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setSmartLink(null); // Limpa o smart link do estado após a exclusão
      return true;
    } catch (e) {
      setError(e);
      console.error('Error deleting smart link:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { smartLink, loading, error, fetchSmartLinkById, fetchSmartLinkByUserId, createSmartLink, updateSmartLink, deleteSmartLink };
}
