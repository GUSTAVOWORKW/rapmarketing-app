// hooks/common/useCountdown.js - Hook reutilizável para countdown
import { useState, useEffect } from 'react';

/**
 * Hook para countdown reutilizável em todos os templates de presave
 * Centraliza a lógica duplicada encontrada em 6+ templates
 */
export const useCountdown = (releaseDate, isReleased = false) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Se já foi lançado, não mostrar countdown
    if (isReleased) {
      setTimeLeft('');
      setIsExpired(true);
      return;
    }

    const updateCountdown = () => {
      if (!releaseDate) {
        setTimeLeft('');
        return;
      }

      const now = new Date().getTime();
      const release = new Date(releaseDate).getTime();
      const difference = release - now;

      if (difference <= 0) {
        setTimeLeft('DISPONÍVEL AGORA!');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }

      setIsExpired(false);
    };

    // Atualizar imediatamente
    updateCountdown();

    // Atualizar a cada minuto
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [releaseDate, isReleased]);

  return {
    timeLeft,
    isExpired,
    hasCountdown: timeLeft && timeLeft !== ''
  };
};

export default useCountdown;
