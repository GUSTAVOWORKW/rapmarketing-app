// src/hooks/useUserSmartLinks.ts
import { useState, useEffect, useCallback } from 'react';
import { SmartLink } from '../types';
import { useSmartLink } from './useSmartLink';

export function useUserSmartLink(userId: string | null | undefined) {
  const [smartLink, setSmartLink] = useState<SmartLink | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { fetchSmartLinkByUserId } = useSmartLink(null);

  const fetchUserSmartLink = useCallback(async (currentUserId: string) => {
    if (!currentUserId) {
      setSmartLink(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the existing fetchSmartLinkByUserId from useSmartLink.ts
      const data = await fetchSmartLinkByUserId(currentUserId);
      setSmartLink(data); // data can be SmartLink or null
    } catch (e: any) {
      // Não mostrar erro se for apenas "not found"
      setSmartLink(null);
    } finally {
      setLoading(false);
    }
  }, [fetchSmartLinkByUserId]);

  useEffect(() => {
    if (userId) {
      fetchUserSmartLink(userId);
    } else {
      setSmartLink(null); // Clear if no user ID is provided
    }
  }, [userId, fetchUserSmartLink]);

  // Function to update the local state if needed after creation/update
  const updateUserSmartLinkState = (updatedLink: SmartLink | null) => {
    setSmartLink(updatedLink);
  };

  // Function to clear the link from state after deletion
  const clearUserSmartLinkState = () => {
    setSmartLink(null);
  };

  return { 
    smartLink, 
    loading, 
    error, 
    fetchUserSmartLink, 
    updateUserSmartLinkState, 
    clearUserSmartLinkState 
  };
}