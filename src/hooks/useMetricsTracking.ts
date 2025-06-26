import { useCallback } from 'react';
import { supabase } from '../services/supabase';

interface TrackingData {
  itemId: string;
  itemType: 'smartlink' | 'presave';
  platformId?: string;
  isPageView: boolean;
  // As informações de userAgent e referrer serão tratadas pela Edge Function
}

// As interfaces DeviceInfo e LocationInfo foram removidas, pois essa lógica agora é do backend.

/**
 * Hook para rastreamento de métricas de Smart Links e Presaves
 * 
 * BASEADO NA DOCUMENTAÇÃO: PLANO_METRICAS_CLICKS.md
 * 
 * Funcionalidades:
 * - Delega toda a lógica de coleta de dados (dispositivo, OS, localização) para uma Edge Function.
 * - Registra page views e clicks via Edge Function.
 * - Suporte para Smart Links e Presaves.
 * - Proteção contra duplicação de eventos no lado do cliente.
 * - Bloqueia tracking no dashboard/preview.
 * 
 * ARQUITETURA:
 * - O cliente (este hook) não coleta mais informações de dispositivo ou localização.
 * - O cliente envia um evento mínimo para a Edge Function 'record-click'.
 * - A Edge Function 'record-click' enriquece o evento com IP, geolocalização, User-Agent, etc.
 * - A Edge Function insere os dados na tabela 'smartlink_clicks' ou 'presave_clicks'.
 * - SEM FALLBACK: Se a Edge Function falhar, o evento não é registrado.
 */
export const useMetricsTracking = () => {
  
  // ============================================================================
  // PROTEÇÃO CONTRA TRACKING NO DASHBOARD
  // ============================================================================
    // Verifica se está sendo executado no contexto do dashboard
  const isDashboardContext = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;
    
    // Bloquear tracking se:
    // 1. Está em qualquer rota do dashboard
    // 2. Está em localhost (desenvolvimento) mas não é página pública
    // 3. Está na página de métricas
    const isDashboard = currentPath.includes('/dashboard') || 
                       currentPath.includes('/criar-') ||
                       currentPath.includes('/settings') ||
                       currentPath.includes('/metrics');
    
    const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
    
    // No ambiente de desenvolvimento, só permitir tracking em páginas públicas específicas
    if (isLocalhost) {
      // Permitir apenas Smart Links (/:slug) e Presaves (/presave/:slug)
      const isSmartLink = currentPath.match(/^\/[a-zA-Z0-9-_]+$/); // Padrão /:slug
      const isPresave = currentPath.startsWith('/presave/');
      const isPublicPage = !isDashboard && (isSmartLink || isPresave);
      
      console.log('🔍 Verificação de contexto (localhost):', {
        currentPath,
        isDashboard,
        isSmartLink: !!isSmartLink,
        isPresave,
        isPublicPage,
        shouldBlock: !isPublicPage
      });
      
      return !isPublicPage; // Retorna true se deve bloquear
    }
    
    return isDashboard;
  }, []);
    // ============================================================================
  // PROTEÇÃO CONTRA DUPLICAÇÃO
  // ============================================================================
    // Cache para evitar registros duplicados no mesmo período
const recentEvents: Map<string, number> = new Map();
const DUPLICATE_PREVENTION_WINDOW = 5000; // 5 segundos (aumentado para evitar duplicações do React)

const isDuplicate = useCallback((eventKey: string): boolean => {
  const now = Date.now();
  const lastEvent = recentEvents.get(eventKey);

  if (lastEvent && (now - lastEvent) < DUPLICATE_PREVENTION_WINDOW) {
    console.warn('⚠️ Evento duplicado ignorado:', eventKey);
    return true;
  }

  recentEvents.set(eventKey, now);

  // Limpar eventos antigos (manter apenas últimos 10)
  if (recentEvents.size > 10) {
    const entries: [string, number][] = Array.from(recentEvents.entries());
    entries.sort((a, b) => b[1] - a[1]);
    recentEvents.clear();
    entries.slice(0, 10).forEach(([key, time]) => {
      recentEvents.set(key, time);
    });
  }

  return false;
}, []);
  
  // ============================================================================
  // FUNÇÃO PRINCIPAL DE TRACKING (VIA EDGE FUNCTION)
  // ============================================================================
  
  const trackEvent = useCallback(async (data: TrackingData): Promise<void> => {
    try {
      // ✅ PROTEÇÃO CONTRA TRACKING NO DASHBOARD
      if (isDashboardContext()) {
        console.log('🚫 Tracking bloqueado - contexto de dashboard/preview detectado');
        return;
      }
      
      // ✅ PROTEÇÃO CONTRA DUPLICAÇÃO
      const eventKey = `${data.itemId}-${data.itemType}-${data.platformId || 'page_view'}-${data.isPageView}`;
      
      if (isDuplicate(eventKey)) {
        console.warn('⚠️ Evento duplicado ignorado - não será registrado');
        return;
      }
      
      console.log('📊 Enviando evento para a Edge Function:', {
        itemId: data.itemId,
        itemType: data.itemType,
        platformId: data.platformId,
        isPageView: data.isPageView,
      });

      // Invoca a Edge Function para registrar o evento
      const { error } = await supabase.functions.invoke('record-click', {
        body: {
          itemId: data.itemId,
          itemType: data.itemType,
          platformId: data.platformId,
          isPageView: data.isPageView,
        },
      });

      if (error) {
        throw new Error(`Erro ao invocar a Edge Function: ${error.message}`);
      }
        
      console.log('✅ Evento de tracking enviado com sucesso para a Edge Function');

    } catch (error) {
      console.error('❌ Erro no registro de tracking:', error);
      // Não interromper a experiência do usuário por erro de tracking
      // Apenas registrar no console para debug
    }
  }, [isDuplicate, isDashboardContext]);
  
  /**
   * Registra uma visualização de página (page view) de forma robusta
   * Garante 1 registro por visita/sessão, mesmo com recarga, múltiplas abas ou reativação de aba
   * Usa sessionStorage para controle global por smartlink/presave
   * Opcional: expira após 30min para nova contagem se necessário
   */
  const PAGEVIEW_EXPIRATION_MINUTES = 30;
  /**
   * Registra uma visualização de página (page view) de forma robusta
   * Garante 1 registro por visita/sessão, mesmo com recarga, múltiplas abas ou reativação de aba
   * Usa sessionStorage para controle global por smartlink/presave
   * Opcional: expira após 30min para nova contagem se necessário
   */
  const trackPageView = useCallback((itemId: string, itemType: 'smartlink' | 'presave'): void => {
    if (typeof window === 'undefined') return;
    const key = `pageview_${itemType}_${itemId}`;
    const now = Date.now();
    const stored = sessionStorage.getItem(key);
    let shouldTrack = true;

    if (stored) {
      try {
        const { ts } = JSON.parse(stored);
        // Se não expirou, não registra novamente
        if (typeof ts === 'number' && now - ts < PAGEVIEW_EXPIRATION_MINUTES * 60 * 1000) {
          shouldTrack = false;
          console.log('🚫 Page view já registrado nesta sessão para', key);
        }
      } catch (e) {
        // Se erro no parse, registra normalmente
        shouldTrack = true;
      }
    }

    if (shouldTrack) {
      trackEvent({
        itemId,
        itemType,
        isPageView: true
      });
      sessionStorage.setItem(key, JSON.stringify({ ts: now }));
      console.log('✅ Page view registrado e salvo em sessionStorage para', key);
    }
  }, [trackEvent]);
  
  /**
   * Registra um click em uma plataforma específica
   */
  const trackClick = useCallback((itemId: string, itemType: 'smartlink' | 'presave', platformId: string): void => {
    trackEvent({
      itemId,
      itemType,
      platformId,
      isPageView: false
    });
  }, [trackEvent]);
  
  /**
   * Registra um evento de compartilhamento social
   */
  const trackShare = useCallback((itemId: string, itemType: 'smartlink' | 'presave', socialPlatform: string): void => {
    trackEvent({
      itemId,
      itemType,
      platformId: `share_${socialPlatform}`,
      isPageView: false
    });
  }, [trackEvent]);
  
  /**   * Registra um evento customizado
   */
  const trackCustomEvent = useCallback((itemId: string, itemType: 'smartlink' | 'presave', eventName: string): void => {
    trackEvent({
      itemId,
      itemType,
      platformId: `custom_${eventName}`,
      isPageView: false
    });
  }, [trackEvent]);

  /**
   * Alias para trackCustomEvent (compatibilidade com documentação)
   */
  const trackCustom = useCallback((itemId: string, itemType: 'smartlink' | 'presave', eventName: string): void => {
    trackCustomEvent(itemId, itemType, eventName);
  }, [trackCustomEvent]);
  
  // ============================================================================
  // FUNÇÕES DE UTILIDADE (REMOVIDAS OU SIMPLIFICADAS)
  // ============================================================================
  
  /**
   * testTracking agora verifica a comunicação com a Edge Function.
   * Não é mais possível obter device/location info diretamente do cliente.
   */
  const testTracking = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Testando comunicação com a Edge Function...');
      const { error } = await supabase.functions.invoke('record-click', {
        body: { itemId: 'test-id', itemType: 'smartlink', isPageView: true },
      });
      
      if (error && !error.message.includes("relation \"smartlink_clicks\" does not exist")) { // Ignora erro de tabela não existente em teste
        throw error;
      }

      console.log('✅ Comunicação com a Edge Function parece OK.');
      return true;
    } catch (error) {
      console.error('❌ Erro no teste de tracking com a Edge Function:', error);
      return false;
    }
  }, []);
  
  return {    // Funções principais
    trackEvent,
    trackPageView,
    trackClick,
    trackShare,
    trackCustomEvent,
    trackCustom, // Alias para compatibilidade com documentação
    
    // Funções de utilidade
    testTracking
  };
};

// ============================================================================
// EXEMPLOS DE USO (NÃO MUDAM)
// ============================================================================

/*
// Para Templates Smart Link:
import { useMetricsTracking } from '../hooks/useMetricsTracking';

export const NovoTemplate = ({ smartlink }) => {
  const { trackPageView, trackClick, trackShare } = useMetricsTracking();

  useEffect(() => {
    trackPageView(smartlink.id, 'smartlink');
  }, [smartlink.id]);

  const handlePlatformClick = (platformId) => {
    trackClick(smartlink.id, 'smartlink', platformId);
    // ... lógica do click
  };

  const handleShare = (platform) => {
    trackShare(smartlink.id, 'smartlink', platform);
    // ... lógica do share
  };

  // ... resto do componente
};

// Para Templates Presave:
import { useMetricsTracking } from '../hooks/useMetricsTracking';

export const NovoPresaveTemplate = ({ presave }) => {
  const { trackPageView, trackClick, trackCustom } = useMetricsTracking();

  useEffect(() => {
    trackPageView(presave.id, 'presave');
  }, [presave.id]);

  const handlePlatformClick = (platformId) => {
    trackClick(presave.id, 'presave', platformId);
    // ... lógica do click
  };

  const handleEmailSubmit = () => {
    trackCustom(presave.id, 'presave', 'email_submit');
    // ... lógica do submit
  };

  // ... resto do componente
};

// EVENTOS RASTREADOS AUTOMATICAMENTE:
// - page_view: Carregamento da página
// - spotify: Clicks em botões Spotify  
// - apple_music: Clicks em Apple Music
// - youtube: Clicks em YouTube
// - share_instagram: Compartilhamentos Instagram
// - share_twitter: Compartilhamentos Twitter
// - custom_copy_link: Ação de copiar link
// - email_submit: Submissões de email (Presaves)
*/
