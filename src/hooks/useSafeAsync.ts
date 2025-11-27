import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook utilitário para executar funções assíncronas com segurança.
 * - Controla AbortController
 * - Evita race conditions via requestIdRef
 * - Garante que não atualizaremos estado após desmontar
 */
export function useSafeAsync() {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const nextRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    return { controller, currentRequestId };
  }, []);

  return {
    isMountedRef,
    abortControllerRef,
    requestIdRef,
    nextRequest,
  };
}

export default useSafeAsync;
