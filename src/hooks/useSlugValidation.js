// hooks/useSlugValidation.js
import { useState, useEffect, useCallback } from 'react';
import { checkSlugAvailability } from '../services/presaveService';

const useSlugValidation = (slug, debounceMs = 500) => {
  const [validation, setValidation] = useState({
    checking: false,
    available: true,
    message: ''
  });

  const checkSlug = useCallback(async (slugToCheck) => {
    if (!slugToCheck || slugToCheck.trim() === '') {
      setValidation({
        checking: false,
        available: true,
        message: ''
      });
      return;
    }

    setValidation(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await checkSlugAvailability(slugToCheck);
      setValidation({
        checking: false,
        available: result.available,
        message: result.message
      });
    } catch (error) {
      setValidation({
        checking: false,
        available: false,
        message: 'Erro ao verificar disponibilidade'
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkSlug(slug);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [slug, checkSlug, debounceMs]);

  return validation;
};

export default useSlugValidation;
