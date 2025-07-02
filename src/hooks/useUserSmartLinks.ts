// src/hooks/useUserSmartLinks.ts
import { useState, useEffect, useCallback } from 'react';
import { SmartLink } from '../types';
import { useSmartLink } from './useSmartLink';
import { useAuth } from '../context/AuthContext';

export function useUserSmartLink() {
  const { user } = useAuth();
  const [smartLink, setSmartLink] = useState<SmartLink | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { fetchSmartLinkByUserId } = useSmartLink(null);

  const fetchUserSmartLink = useCallback(async () => {
    if (!user?.id) {
      setSmartLink(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the existing fetchSmartLinkByUserId from useSmartLink.ts
      const data = await fetchSmartLinkByUserId(user.id);
      setSmartLink(data); // data can be SmartLink or null
    } catch (e: any) {
      // Não mostrar erro se for apenas "not found"
      setSmartLink(null);
    } finally {
      setLoading(false);
    }
  }, [fetchSmartLinkByUserId, user]);

  useEffect(() => {
    if (user?.id) {
      fetchUserSmartLink();
    } else {
      setSmartLink(null); // Clear if no user ID is provided
    }
  }, [user, fetchUserSmartLink]);

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